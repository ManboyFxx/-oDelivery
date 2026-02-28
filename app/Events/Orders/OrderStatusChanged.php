<?php

namespace App\Events\Orders;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * FASE 2 – ESCALA REAL: Domain Event para mudança de status do pedido.
 *
 * Substitui o `switch/case` monolítico do `OrderObserver::updated()`.
 * Cada efeito colateral (WhatsApp, broadcast, loyalty, poll) é tratado
 * por um Listener independente, isolado e testável.
 *
 * Agente: @architect
 */
class OrderStatusChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly string $oldStatus,
        public readonly string $newStatus,
    ) {
    }
}
