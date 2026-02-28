<?php

namespace App\Modules\Billing\Actions;

use App\Models\User;
use App\Services\AuditLogService;
use App\Services\PaymentGatewayService;
use Illuminate\Support\Facades\Log;

/**
 * FASE 3 – ARQUITETURA EVOLUTIVA
 * @module Billing
 * @agent @dev
 * 
 * Action Class responsável pelo processamento de pagamento Stripe com idempotência.
 * Extrai a lógica de pagamento de SubscriptionController.
 */
class ProcessStripePaymentAction
{
    public function __construct(
        private readonly PaymentGatewayService $paymentGateway
    ) {
    }

    public function execute(User $user, string $priceId, string $idempotencyKey): array
    {
        Log::info('ProcessStripePaymentAction: iniciando', [
            'user_id' => $user->id,
            'tenant_id' => $user->tenant_id,
            'price_id' => $priceId,
            'idempotency_key' => $idempotencyKey,
        ]);

        try {
            $result = $this->paymentGateway->createSubscription(
                $user,
                $priceId,
                $idempotencyKey
            );

            AuditLogService::record($user, 'billing.subscription_created', $user->tenant, [
                'price_id' => $priceId,
                'idempotency_key' => $idempotencyKey,
            ]);

            return ['success' => true, 'data' => $result];

        } catch (\Throwable $e) {
            Log::error('ProcessStripePaymentAction: falha no pagamento', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
