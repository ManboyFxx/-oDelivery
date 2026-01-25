<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppInstance;
use App\Services\EvolutionApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsAppInstanceController extends Controller
{
    public function __construct(
        private EvolutionApiService $evolutionApi
    ) {
    }

    /**
     * Display WhatsApp instances management page
     */
    public function index()
    {
        $tenant = auth()->user()->tenant;

        $instances = WhatsAppInstance::where('tenant_id', $tenant->id)
            ->latest()
            ->get();

        return Inertia::render('Settings/WhatsAppInstances', [
            'instances' => $instances,
        ]);
    }

    /**
     * Create a new WhatsApp instance
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'instance_name' => 'required|string|max:255|unique:whatsapp_instances,instance_name',
        ]);

        $tenant = auth()->user()->tenant;

        try {
            // Create instance in Evolution API
            $response = $this->evolutionApi->createInstance($validated['instance_name']);

            // Save to database
            $instance = WhatsAppInstance::create([
                'tenant_id' => $tenant->id,
                'instance_name' => $validated['instance_name'],
                'instance_type' => 'custom',
                'status' => 'connecting',
                'settings' => [],
            ]);

            return redirect()->back()->with('success', 'Instância criada! Escaneie o QR Code para conectar.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Erro ao criar instância: ' . $e->getMessage()]);
        }
    }

    /**
     * Get QR code for instance connection
     */
    public function getQrCode(Request $request, WhatsAppInstance $instance)
    {
        try {
            $qrCode = $this->evolutionApi->getQrCode($instance->instance_name);

            if ($qrCode) {
                $instance->update(['qr_code' => $qrCode]);

                return response()->json([
                    'qr_code' => $qrCode,
                ]);
            }

            return response()->json(['error' => 'QR Code não disponível'], 404);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Check instance connection status
     */
    public function checkStatus(Request $request, WhatsAppInstance $instance)
    {
        try {
            $status = $this->evolutionApi->getInstanceStatus($instance->instance_name);

            // Update status in database
            if ($status['state'] === 'open') {
                $phoneNumber = $status['instance']['owner'] ?? '';
                $instance->markAsConnected($phoneNumber);
            } else {
                $instance->update(['status' => 'disconnected']);
            }

            return response()->json([
                'status' => $instance->fresh()->status,
                'phone_number' => $instance->phone_number,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Disconnect instance
     */
    public function disconnect(Request $request, WhatsAppInstance $instance)
    {
        try {
            $this->evolutionApi->deleteInstance($instance->instance_name);
            $instance->markAsDisconnected();

            return redirect()->back()->with('success', 'Instância desconectada!');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Erro ao desconectar: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete instance
     */
    public function destroy(Request $request, WhatsAppInstance $instance)
    {
        try {
            $this->evolutionApi->deleteInstance($instance->instance_name);
            $instance->delete();

            return redirect()->back()->with('success', 'Instância removida!');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Erro ao remover: ' . $e->getMessage()]);
        }
    }
}
