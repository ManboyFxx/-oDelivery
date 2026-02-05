<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ApiCredential;

class EvolutionApiService
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $credential = ApiCredential::where('service', 'evolution')
            ->whereNull('tenant_id')
            ->where('is_active', true)
            ->latest()
            ->first();

        $credentialValue = $credential ? $credential->decrypted_value : null;

        // Extract URL from credential if available
        if (is_array($credentialValue)) {
            $this->baseUrl = rtrim($credentialValue['url'] ?? config('services.evolution.url') ?? '', '/');
            $this->apiKey = (string) ($credentialValue['apikey'] ?? config('services.evolution.api_key') ?? '');
        } else {
            $this->baseUrl = rtrim(config('services.evolution.url') ?? '', '/');
            $this->apiKey = (string) ($credentialValue ?? config('services.evolution.api_key') ?? '');
        }
    }

    /**
     * Create a new WhatsApp instance
     */
    public function createInstance(string $instanceName): array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
            ])->post("{$this->baseUrl}/instance/create", [
                        'instanceName' => $instanceName,
                        'qrcode' => true,
                    ]);

            if ($response->successful()) {
                return $response->json();
            }

            throw new \Exception("Failed to create instance: " . $response->body());
        } catch (\Exception $e) {
            Log::error('Evolution API - Create Instance Error', [
                'instance' => $instanceName,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Delete an instance
     */
    public function deleteInstance(string $instanceName): bool
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
            ])->delete("{$this->baseUrl}/instance/delete/{$instanceName}");

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Evolution API - Delete Instance Error', [
                'instance' => $instanceName,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get QR code for instance connection
     */
    public function getQrCode(string $instanceName): ?string
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
            ])->get("{$this->baseUrl}/instance/connect/{$instanceName}");

            if ($response->successful()) {
                $data = $response->json();
                return $data['base64'] ?? $data['qrcode']['base64'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Evolution API - Get QR Code Error', [
                'instance' => $instanceName,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get instance connection status
     */
    public function getInstanceStatus(string $instanceName): array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
            ])->get("{$this->baseUrl}/instance/connectionState/{$instanceName}");

            if ($response->successful()) {
                return $response->json();
            }

            return ['state' => 'disconnected'];
        } catch (\Exception $e) {
            Log::error('Evolution API - Get Status Error', [
                'instance' => $instanceName,
                'error' => $e->getMessage(),
            ]);
            return ['state' => 'disconnected'];
        }
    }

    /**
     * Send a text message
     */
    public function sendTextMessage(string $instanceName, string $phone, string $message): array
    {
        try {
            // Format phone number (remove non-digits, ensure country code)
            $phone = preg_replace('/\D/', '', $phone);
            if (!str_starts_with($phone, '55')) {
                $phone = '55' . $phone; // Add Brazil country code if missing
            }

            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
            ])->post("{$this->baseUrl}/message/sendText/{$instanceName}", [
                        'number' => $phone,
                        'text' => $message,
                    ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('Evolution API - Send Message Error', [
                'instance' => $instanceName,
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
