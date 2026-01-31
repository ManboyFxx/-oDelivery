<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppMessageLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsAppController extends Controller
{
    /**
     * Display WhatsApp management page
     */
    public function index()
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings;

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
}
