<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppInstance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    /**
     * Handle incoming webhook from Evolution API
     */
    public function handle(Request $request)
    {
        $data = $request->all();

        // Log webhook event for debugging
        Log::info('WhatsApp Webhook Received', [
            'event' => $data['event'] ?? null,
            'instance' => $data['instance'] ?? null,
            'timestamp' => now(),
        ]);

        // Process different types of events
        match($data['event'] ?? null) {
            'connection.update' => $this->handleConnectionUpdate($data),
            'messages.upsert' => $this->handleNewMessage($data),
            'qrcode.updated' => $this->handleQrCodeUpdate($data),
            default => null,
        };

        return response()->json(['status' => 'ok']);
    }

    /**
     * Handle connection status updates
     */
    private function handleConnectionUpdate(array $data): void
    {
        $instanceName = $data['instance'] ?? null;
        $state = $data['data']['state'] ?? null;

        if (!$instanceName) {
            return;
        }

        $instance = WhatsAppInstance::where('instance_name', $instanceName)->first();

        if (!$instance) {
            return;
        }

        Log::info('WhatsApp Connection Update', [
            'instance' => $instanceName,
            'state' => $state,
        ]);

        if ($state === 'open') {
            // Instance is connected
            $phoneNumber = $data['data']['instance']['owner'] ?? '';
            $instance->markAsConnected($phoneNumber);

            Log::info('WhatsApp Instance Connected', [
                'instance' => $instanceName,
                'phone' => $phoneNumber,
            ]);
        } else {
            // Instance is disconnected
            $instance->markAsDisconnected();

            Log::warning('WhatsApp Instance Disconnected', [
                'instance' => $instanceName,
            ]);
        }
    }

    /**
     * Handle incoming messages (future chatbot functionality)
     */
    private function handleNewMessage(array $data): void
    {
        $instanceName = $data['instance'] ?? null;

        if (!$instanceName) {
            return;
        }

        Log::info('New WhatsApp Message Received', [
            'instance' => $instanceName,
            'from' => $data['data']['key']['remoteJid'] ?? null,
            'message' => $data['data']['message']['conversation'] ?? null,
            'timestamp' => now(),
        ]);

        // Future implementation: Process message for chatbot
        // - Check if customer exists
        // - Parse message intent
        // - Send auto-reply or forward to admin
    }

    /**
     * Handle QR code updates
     */
    private function handleQrCodeUpdate(array $data): void
    {
        $instanceName = $data['instance'] ?? null;
        $qrCode = $data['data']['qrcode']['base64'] ?? null;

        if (!$instanceName || !$qrCode) {
            return;
        }

        $instance = WhatsAppInstance::where('instance_name', $instanceName)->first();

        if ($instance) {
            $instance->update(['qr_code' => $qrCode]);

            Log::info('WhatsApp QR Code Updated', [
                'instance' => $instanceName,
            ]);
        }
    }
}
