<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ArrivedAtDestinationEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;
    public $motoboy;

    public function __construct(Order $order, $motoboy)
    {
        $this->order = $order;
        $this->motoboy = $motoboy;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("order.{$this->order->id}"),
            new PrivateChannel("user.{$this->order->customer_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'motoboy.arrived';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'motoboy_id' => $this->motoboy->id,
            'motoboy_name' => $this->motoboy->name,
            'message' => "{$this->motoboy->name} chegou no local de entrega!",
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
