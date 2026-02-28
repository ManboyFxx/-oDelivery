<?php

namespace App\Listeners\Orders;

use App\Events\Orders\OrderStatusChanged;
use App\Events\OrderUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * FASE 2 – ESCALA REAL: Broadcast do evento via Reverb (WebSocket).
 *
 * Liga o Domain Event ao sistema de broadcast.
 * Se o Reverb não estiver disponível, o erro é silenciado — o frontend
 * usa o polling como fallback automático.
 *
 * Agente: @dev
 */
class BroadcastOrderUpdate implements ShouldQueue
{
    public $queue = 'broadcasting';

    public function handle(OrderStatusChanged $event): void
    {
        try {
            broadcast(new OrderUpdated($event->order))->toOthers();
        } catch (\Throwable $e) {
            // Falha silenciosa — o polling serve de fallback
            Log::warning('BroadcastOrderUpdate: broadcast falhou (Reverb offline?)', [
                'order_id' => $event->order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
