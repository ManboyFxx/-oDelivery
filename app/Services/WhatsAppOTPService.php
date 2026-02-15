<?php

namespace App\Services;

use App\Models\WhatsAppInstance;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppOTPService
{
    public function __construct(
        private \App\Services\EvolutionApiService $evolutionApi
    ) {
    }

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
        // 1. Tentar instância exclusiva do Tenant
        $instance = WhatsAppInstance::where('tenant_id', $tenantId)
            ->where('status', 'connected')
            ->first();

        // 2. Fallback para instância compartilhada (Master) se não houver exclusiva
        if (!$instance) {
            $instance = WhatsAppInstance::getSharedInstance();
        }

        if (!$instance) {
            Log::error('ÓoBot OTP - Nenhuma instância de WhatsApp disponível para envio.', [
                'tenant_id' => $tenantId,
                'phone' => $phone
            ]);
            return false;
        }

        $message = $this->formatOTPMessage($code);

        try {
            $result = $this->evolutionApi->sendTextMessage(
                $instance->instance_name,
                $phone,
                $message
            );

            if ($result['success']) {
                Log::info('ÓoBot OTP - Enviado com sucesso', [
                    'phone' => $phone,
                    'tenant_id' => $tenantId,
                    'instance' => $instance->instance_name
                ]);
                return true;
            }

            Log::error('ÓoBot OTP - Falha no envio Evolution API', [
                'phone' => $phone,
                'tenant_id' => $tenantId,
                'error' => $result['error'] ?? 'Erro desconhecido'
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('ÓoBot OTP - Exceção no serviço de OTP', [
                'phone' => $phone,
                'error' => $e->getMessage(),
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
