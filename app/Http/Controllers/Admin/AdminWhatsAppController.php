<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppInstance;
use App\Models\ApiCredential;
use App\Services\EvolutionApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminWhatsAppController extends Controller
{
    public function __construct(
        private EvolutionApiService $evolutionApi
    ) {
    }

    public function index()
    {
        // Get the shared instance
        $instance = WhatsAppInstance::where('instance_type', 'shared')->first();
        $logs = \App\Models\WhatsAppMessageLog::with('tenant:id,name')
            ->latest()
            ->take(10)
            ->get();

        // Check if global credentials exist and get them
        $credential = \App\Models\ApiCredential::where('service', 'evolution')
            ->whereNull('tenant_id')
            ->where('is_active', true)
            ->latest()
            ->first();

        $config = [
            'url' => '',
            'apikey' => '',
        ];

        if ($credential) {
            $val = $credential->decrypted_value;
            if (is_array($val)) {
                $config['url'] = $val['url'] ?? '';
                $config['apikey'] = $val['apikey'] ?? ''; // In frontend we might mask this
            } else {
                $config['apikey'] = $val; // Legacy string format
                $config['url'] = config('services.evolution.url') ?? '';
            }
        } else {
            $config['url'] = config('services.evolution.url') ?? '';
            // Don't send config api key for security if possible, or send masked
        }

        $tenantId = auth()->user()->tenant_id;
        $enableOtpVerification = true; // Default to true

        if ($tenantId) {
            $enableOtpVerification = \App\Models\StoreSetting::where('tenant_id', $tenantId)->value('enable_otp_verification') ?? true;
        }

        return Inertia::render('Admin/WhatsApp/Index', [
            'instance' => $instance,
            'logs' => $logs,
            'currentConfig' => $config,
            'enableOtpVerification' => $enableOtpVerification,
        ]);
    }

    public function connect(Request $request)
    {
        $validated = $request->validate([
            'instance_name' => 'required|string|max:255',
            'evolution_url' => 'nullable|string|url',
            'evolution_apikey' => 'nullable|string',
        ]);

        $instanceName = $validated['instance_name'];
        $evolutionUrl = $validated['evolution_url'];
        $evolutionApiKey = $validated['evolution_apikey'];

        try {
            // Save Evolution credentials if provided
            if ($evolutionUrl && $evolutionApiKey) {
                $credential = ApiCredential::where('service', 'evolution')
                    ->whereNull('tenant_id')
                    ->where('is_active', true)
                    ->first();

                $credentialData = [
                    'url' => $evolutionUrl,
                    'apikey' => $evolutionApiKey,
                ];

                if ($credential) {
                    $credential->update(['encrypted_value' => $credentialData]);
                } else {
                    ApiCredential::create([
                        'service' => 'evolution',
                        'tenant_id' => null,
                        'key_name' => 'master_connection',
                        'encrypted_value' => $credentialData,
                        'is_active' => true,
                    ]);
                }
            }

            // Check if exists in DB
            $instance = WhatsAppInstance::where('instance_type', 'shared')->first();

            // Try to sync status from API immediately
            $apiStatus = $this->evolutionApi->getInstanceStatus($instanceName);
            $isAlreadyConnected = isset($apiStatus['instance']['state']) && $apiStatus['instance']['state'] === 'open';
            $owerPhone = $apiStatus['instance']['owner'] ?? null;

            if ($instance) {
                // Update name if changed
                $updates = ['instance_name' => $instanceName];

                if ($isAlreadyConnected) {
                    $updates['status'] = 'connected';
                    $updates['phone_number'] = $owerPhone;
                    $updates['last_connected_at'] = now();
                    $updates['qr_code'] = null; // Clear any old QR code
                }

                $instance->update($updates);
            } else {
                // Determine initial status based on API reality
                $initialStatus = $isAlreadyConnected ? 'connected' : 'connecting';

                // Only try to create if NOT connected and NOT exists in API (implied by create failure usually, but here we just try if not connected)
                if (!$isAlreadyConnected) {
                    try {
                        $this->evolutionApi->createInstance($instanceName);
                    } catch (\Exception $e) {
                        // Ignore if already exists
                    }
                }

                $instance = WhatsAppInstance::create([
                    'instance_name' => $instanceName,
                    'instance_type' => 'shared',
                    'status' => $initialStatus,
                    'phone_number' => $owerPhone,
                    'last_connected_at' => $isAlreadyConnected ? now() : null,
                ]);
            }

            return back()->with('success', 'Instância inicializada. Escaneie o QR Code.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erro ao conectar: ' . $e->getMessage()]);
        }
    }

    public function getQrCode()
    {
        $instance = WhatsAppInstance::where('instance_type', 'shared')->first();
        if (!$instance)
            return response()->json(['error' => 'Instância não encontrada'], 404);

        try {
            $qrCode = $this->evolutionApi->getQrCode($instance->instance_name);

            if ($qrCode) {
                $instance->update(['qr_code' => $qrCode]);
                return response()->json(['qr_code' => $qrCode]);
            }

            return response()->json(['error' => 'QR Code indisponível'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function checkStatus()
    {
        $instance = WhatsAppInstance::where('instance_type', 'shared')->first();
        if (!$instance)
            return response()->json(['status' => 'disconnected']);

        try {
            $status = $this->evolutionApi->getInstanceStatus($instance->instance_name);

            if (isset($status['instance']['state']) && $status['instance']['state'] === 'open') {
                $instance->markAsConnected($status['instance']['owner'] ?? '');
            } else {
                // Always update to disconnected when state is not 'open'
                $instance->markAsDisconnected();
            }

            return response()->json([
                'status' => $instance->fresh()->status,
                'phone_number' => $instance->phone_number
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'enable_otp_verification' => 'required|boolean',
        ]);

        $user = auth()->user();
        $tenantId = $user->tenant_id;

        if (!$tenantId && $user->role !== 'super_admin') {
            return back()->with('error', 'Configuração disponível apenas para lojistas ou administradores.');
        }

        // Se for Super Admin sem tenant, podemos salvar como uma configuração "global" 
        // ou simplesmente aplicar a todos os tenants. Para agora, vamos salvar no primeiro 
        // ou criar um registro master se o model permitir null.

        $storeSetting = \App\Models\StoreSetting::firstOrCreate(
            ['tenant_id' => $tenantId] // Se for null, verifica se o banco aceita
        );

        $storeSetting->update([
            'enable_otp_verification' => $validated['enable_otp_verification']
        ]);

        return back()->with('success', 'Configurações atualizadas com sucesso.');
    }

    public function disconnect()
    {
        $instance = WhatsAppInstance::where('instance_type', 'shared')->first();
        if (!$instance)
            return back()->with('error', 'Instância não encontrada');

        try {
            $this->evolutionApi->deleteInstance($instance->instance_name);
            $instance->delete(); // Or just mark as disconnected
            return back()->with('success', 'Instância desconectada.');
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao desconectar: ' . $e->getMessage());
        }
    }
}
