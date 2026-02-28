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
 * FASE 2 – ESCALA REAL: Evento broadcast para atualização de pedido.
 *
 * Transmitido via Laravel Reverb (WebSocket) para o canal privado do tenant.
 * O frontend escuta em `tenant.{tenantId}` via Laravel Echo.
 *
 * Agente: @devops + @dev
 */
class OrderUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $orderData;

    public function __construct(Order $order)
    {
        // Serializar apenas os dados necessários para o frontend
        // Evita enviar relações pesadas pelo WebSocket
        $this->orderData = [
            'id' => $order->id,
            'status' => $order->status,
            'order_number' => $order->order_number,
            'total' => $order->total,
            'mode' => $order->mode,
            'tenant_id' => $order->tenant_id,
            'updated_at' => $order->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Canal privado por tenant — TenantB nunca vê eventos do TenantA.
     */
    public function broadcastOn(): Channel
    {
        return new PrivateChannel("tenant.{$this->orderData['tenant_id']}");
    }

    public function broadcastAs(): string
    {
        return 'order.updated';
    }

    /**
     * Reduz payload: só os campos que o frontend realmente usa.
     */
    public function broadcastWith(): array
    {
        return $this->orderData;
    }
}
