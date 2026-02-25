<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class OrderDeliveredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return [\App\Channels\DatabaseChannel::class, 'broadcast', \App\Channels\OneSignalChannel::class];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => "Entrega Concluída",
            'message' => "Seu pedido #{$this->order->order_number} foi entregue!",
            'type' => 'delivery',
            'icon' => 'CheckCircle',
            'color' => '#10b981',
            'action_url' => "/orders/{$this->order->id}",
            'data' => [
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'delivered_at' => $this->order->delivered_at?->toIso8601String(),
            ],
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title' => "Entrega Concluída",
            'message' => "Seu pedido #{$this->order->order_number} foi entregue!",
            'type' => 'delivery',
            'order_id' => $this->order->id,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
    public function toOneSignal($notifiable)
    {
        return [
            'title' => "Entrega Concluída",
            'message' => "Seu pedido #{$this->order->order_number} foi entregue!",
            'url' => "/orders/{$this->order->id}",
            'data' => [
                'order_id' => $this->order->id,
                'type' => 'order_delivered',
            ],
        ];
    }
}
