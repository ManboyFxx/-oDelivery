<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * FASE 2 – ESCALA REAL: Evento broadcast para novo pedido recebido.
 *
 * Dispara o som e notificação visual no dashboard do parceiro
 * assim que um pedido chega, sem precisar de polling.
 */
class NewOrderReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $orderData;

    public function __construct(Order $order)
    {
        $this->orderData = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'total' => $order->total,
            'mode' => $order->mode,
            'customer_name' => $order->customer_name,
            'tenant_id' => $order->tenant_id,
            'created_at' => $order->created_at?->toIso8601String(),
        ];
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel("tenant.{$this->orderData['tenant_id']}");
    }

    public function broadcastAs(): string
    {
        return 'order.new';
    }

    public function broadcastWith(): array
    {
        return $this->orderData;
    }
}
