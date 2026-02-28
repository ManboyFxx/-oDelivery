<?php

namespace App\Services;

use App\Models\IntegrationEvent;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * FASE 1 – BLINDAGEM: Serviço formal de cancelamento de pedidos.
 *
 * Antes desta implementação, Order::cancel() apenas atualizava o status.
 * O CancellationService orquestra as responsabilidades colaterais do cancelamento:
 *
 *  1. Transição de status do pedido (Order::cancel).
 *  2. Registro automático em AuditLog (via trait Auditable no Order).
 *  3. Reversão de pontos de fidelidade se usados no pedido.
 *  4. Registro em integration_events para rastreabilidade e eventual estorno.
 *
 * NOTA: O estorno financeiro via Stripe NÃO é executado aqui nesta Fase 1.
 * Será implementado na Fase 2 via Event Bus (Domain Events) para evitar
 * efeitos colaterais indesejados nesta etapa de blindagem inicial.
 */
class CancellationService
{
    public function __construct(
        private readonly LoyaltyService $loyaltyService
    ) {
    }

    /**
     * Cancela um pedido de forma orquestrada e segura.
     *
     * @param  Order  $order   O pedido a ser cancelado (já carregado com relações necessárias)
     * @param  string $reason  Motivo do cancelamento (exibido ao cliente e gravado no log)
     * @return void
     */
    public function cancel(Order $order, string $reason): void
    {
        // Validação de estado: apenas pedidos ainda não entregues ou já cancelados podem ser cancelados
        if (in_array($order->status, ['delivered', 'cancelled'])) {
            Log::warning('CancellationService: attempt to cancel order in terminal state', [
                'order_id' => $order->id,
                'status' => $order->status,
            ]);
            return;
        }

        DB::transaction(function () use ($order, $reason) {
            // 1. Transição de status — dispara Auditable automaticamente via Observer
            $order->cancel($reason);

            // 2. Reverter pontos de fidelidade usados no pedido (se houver)
            $this->revertLoyaltyIfNeeded($order);

            // 3. Registrar em integration_events para rastreabilidade e processamento futuro
            IntegrationEvent::record(
                source: 'internal',
                eventType: 'order.cancelled',
                payload: [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'tenant_id' => $order->tenant_id,
                    'cancellation_reason' => $reason,
                    'payment_status' => $order->payment_status,
                    'total' => $order->total,
                    // Flag para o Event Bus da Fase 2 saber se precisa estornar
                    'refund_required' => $order->payment_status === 'paid',
                ],
                tenantId: $order->tenant_id,
                idempotencyKey: "order.cancelled.{$order->id}",
                related: $order,
            );

            Log::info('CancellationService: order cancelled successfully', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'reason' => $reason,
                'had_loyalty' => $order->loyalty_points_used > 0,
                'paid' => $order->payment_status === 'paid',
            ]);
        });
    }

    /**
     * Reverte pontos de fidelidade gastos no pedido, caso existam.
     */
    private function revertLoyaltyIfNeeded(Order $order): void
    {
        if (!$order->loyalty_points_used || $order->loyalty_points_used <= 0) {
            return;
        }

        if (!$order->customer_id) {
            return;
        }

        try {
            $this->loyaltyService->revertPoints(
                customerId: $order->customer_id,
                tenantId: $order->tenant_id,
                points: $order->loyalty_points_used,
                reason: "Estorno por cancelamento do pedido #{$order->order_number}",
                orderId: $order->id,
            );

            Log::info('CancellationService: loyalty points reverted', [
                'order_id' => $order->id,
                'points' => $order->loyalty_points_used,
                'customer_id' => $order->customer_id,
            ]);
        } catch (\Throwable $e) {
            // Queda de loyalty não pode impedir o cancelamento — loga e continua
            Log::error('CancellationService: failed to revert loyalty points', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
