<?php

namespace App\Listeners\Orders;

use App\Events\Orders\OrderStatusChanged;
use App\Services\LoyaltyService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * FASE 2 – ESCALA REAL: Concessão de pontos de fidelidade pelo Domain Event.
 *
 * Antes estava embutida no case 'delivered' do switch do OrderObserver.
 * Agora é um Listener independente, enfileirado na queue 'default'.
 *
 * Agente: @dev
 */
class AwardLoyaltyOnDelivery implements ShouldQueue
{
    public $queue = 'default';

    public function __construct(
        private readonly LoyaltyService $loyaltyService
    ) {
    }

    public function handle(OrderStatusChanged $event): void
    {
        // Só concede pontos quando o pedido é marcado como entregue
        if ($event->newStatus !== 'delivered') {
            return;
        }

        $order = $event->order;

        // Evita duplicate award se já foi creditado
        if ($order->loyalty_points_earned && $order->loyalty_points_earned > 0) {
            return;
        }

        if (!$order->customer_id) {
            return;
        }

        try {
            $this->loyaltyService->awardPointsForOrder($order);
        } catch (\Throwable $e) {
            Log::error('AwardLoyaltyOnDelivery: falha ao conceder pontos', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
