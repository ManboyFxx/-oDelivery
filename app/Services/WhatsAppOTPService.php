<?php

namespace App\Services;

use App\Models\WhatsAppInstance;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppOTPService
{
    /**
     * Send OTP code via WhatsApp using Evolution API
     *
     * @param string $phone Phone number (with country code)
     * @param string $code 6-digit OTP code
     * @param string $tenantId Tenant ID for instance lookup
     * @return bool Success status
     */
    public function sendOTP(string $phone, string $code, string $tenantId): bool
    {
        $instance = WhatsAppInstance::where('tenant_id', $tenantId)
            ->where('status', 'connected')
            ->first();

        if (!$instance) {
            Log::error('WhatsApp instance not connected for OTP', [
                'tenant_id' => $tenantId,
                'phone' => $phone
            ]);
            return false;
        }

        $message = $this->formatOTPMessage($code);

        try {
            $response = Http::withHeaders([
                'apikey' => config('services.evolution.api_key'),
            ])->post(
                    config('services.evolution.base_url') . "/message/sendText/{$instance->instance_name}",
                    [
                        'number' => $this->formatPhoneNumber($phone),
                        'text' => $message,
                    ]
                );

            if ($response->successful()) {
                Log::info('OTP sent successfully via WhatsApp', [
                    'phone' => $phone,
                    'tenant_id' => $tenantId
                ]);
                return true;
            }

            Log::error('Failed to send OTP via WhatsApp', [
                'phone' => $phone,
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('Exception while sending OTP via WhatsApp', [
                'phone' => $phone,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Format OTP message template
     */
    private function formatOTPMessage(string $code): string
    {
        return "🔐 *Código de Verificação*\n\n" .
            "Seu código é: *{$code}*\n\n" .
            "Válido por 5 minutos.\n\n" .
            "_Não compartilhe este código com ninguém._";
    }

    /**
     * Format phone number for Evolution API
     * Ensures format: 5511999999999@s.whatsapp.net
     */
    private function formatPhoneNumber(string $phone): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/\D/', '', $phone);

        // Add @s.whatsapp.net if not present
        if (!str_contains($phone, '@')) {
            $phone .= '@s.whatsapp.net';
        }

        return $phone;
    }
}
