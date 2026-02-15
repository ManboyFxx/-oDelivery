<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppMessageLog;
use App\Models\WhatsAppTemplate;
use App\Services\EvolutionApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsAppController extends Controller
{
    /**
     * Display WhatsApp management page
     */
    public function __construct(
        private EvolutionApiService $evolutionApi
    ) {
    }

    /**
     * Display WhatsApp management page
     */
    public function index()
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings;

        // Fetch Global Templates
        $globalTemplates = WhatsAppTemplate::whereNull('tenant_id')->get()->keyBy('key');

        // Fetch Tenant Templates (Overrides)
        $tenantTemplates = WhatsAppTemplate::where('tenant_id', $tenant->id)->get()->keyBy('key');

        // Merge: Tenant overrides Global
        $templates = $globalTemplates->map(function ($globalTemplate) use ($tenantTemplates) {
            $tenantOverride = $tenantTemplates->get($globalTemplate->key);

            return [
                'key' => $globalTemplate->key,
                'name' => $globalTemplate->name,
                'message' => $tenantOverride ? $tenantOverride->message : $globalTemplate->message,
                'is_active' => $tenantOverride ? $tenantOverride->is_active : $globalTemplate->is_active,
                'is_custom' => !!$tenantOverride,
            ];
        })->values();

        // Get recent message logs
        $logs = WhatsAppMessageLog::where('tenant_id', $tenant->id)
            ->with('order')
            ->recent(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'phone_number' => $log->phone_number,
                    'template_key' => $log->template_key,
                    'message_sent' => $log->message_sent,
                    'status' => $log->status,
                    'error_message' => $log->error_message,
                    'order_number' => $log->order?->order_number ?? $log->order_id,
                    'created_at' => $log->created_at->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('WhatsApp/Index', [
            'autoMessagesEnabled' => $settings->whatsapp_auto_messages_enabled ?? false,
            'logs' => $logs,
            'plan' => $tenant->plan,
            'templates' => $templates,
        ]);
    }

    /**
     * Toggle auto-messages on/off
     */
    public function toggleAutoMessages(Request $request)
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings;

        $enabled = $request->boolean('enabled');

        $settings->update([
            'whatsapp_auto_messages_enabled' => $enabled,
        ]);

        return back()->with('success', $enabled
            ? 'Mensagens automáticas ativadas com sucesso!'
            : 'Mensagens automáticas desativadas.');
    }

    /**
     * Get message logs (for AJAX refresh)
     */
    public function getLogs()
    {
        $tenant = auth()->user()->tenant;

        $logs = WhatsAppMessageLog::where('tenant_id', $tenant->id)
            ->with('order')
            ->recent(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'phone_number' => $log->phone_number,
                    'template_key' => $log->template_key,
                    'message_sent' => $log->message_sent,
                    'status' => $log->status,
                    'error_message' => $log->error_message,
                    'order_number' => $log->order?->order_number ?? $log->order_id,
                    'created_at' => $log->created_at->format('d/m/Y H:i'),
                ];
            });

        return response()->json(['logs' => $logs]);
    }

    /**
     * Update/Override Templates
     */
    public function updateTemplates(Request $request)
    {
        $tenant = auth()->user()->tenant;
        $templates = $request->input('templates'); // Array of { key, message, is_active }

        foreach ($templates as $data) {
            WhatsAppTemplate::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'key' => $data['key'],
                ],
                [
                    'name' => $data['name'] ?? 'Template', // Should ideally come from global template name
                    'message' => $data['message'],
                    'is_active' => $data['is_active'],
                ]
            );
        }

        return back()->with('success', 'Modelos de mensagem atualizados!');
    }

    /**
     * Send Test Message
     */
    public function testSend(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string',
        ]);

        $tenant = auth()->user()->tenant;

        // Determine instance (Shared or Custom) logic from OoBotService
        // Ideally we should reuse OoBotService logic, but for simplicity/direct test:
        // We need to know which instance to use.

        // Let's instantiate OoBotService to reuse logic
        $ooBot = app(\App\Services\OoBotService::class);
        // Reflection/Accessibility is hard, so let's replicate logic simply:

        $instance = null;
        if ($tenant->plan === 'personalizado') {
            $instance = \App\Models\WhatsAppInstance::where('tenant_id', $tenant->id)
                ->where('instance_type', 'custom')
                ->where('status', 'connected')
                ->first();
        }

        if (!$instance) {
            $instance = \App\Models\WhatsAppInstance::getSharedInstance();
        }

        if (!$instance) {
            return back()->withErrors(['error' => 'Nenhuma instância do WhatsApp conectada.']);
        }

        $result = $this->evolutionApi->sendTextMessage(
            $instance->instance_name,
            $request->phone,
            $request->message
        );

        if ($result['success']) {
            return back()->with('success', 'Mensagem de teste enviada!');
        } else {
            return back()->withErrors(['error' => 'Falha ao enviar: ' . ($result['error'] ?? 'Erro desconhecido')]);
        }
    }
}
