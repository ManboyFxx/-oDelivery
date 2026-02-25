<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class OrderAcceptedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;
    protected $motoboy;

    public function __construct(Order $order, $motoboy)
    {
        $this->order = $order;
        $this->motoboy = $motoboy;
    }

    public function via($notifiable)
    {
        return [\App\Channels\DatabaseChannel::class, 'broadcast', \App\Channels\OneSignalChannel::class];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => "Pedido Aceito",
            'message' => "{$this->motoboy->name} aceitou seu pedido #{$this->order->order_number}",
            'type' => 'order',
            'icon' => 'CheckCircle',
            'color' => '#3b82f6',
            'action_url' => "/orders/{$this->order->id}",
            'data' => [
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'motoboy_id' => $this->motoboy->id,
                'motoboy_name' => $this->motoboy->name,
            ],
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title' => "Pedido Aceito",
            'message' => "{$this->motoboy->name} aceitou seu pedido #{$this->order->order_number}",
            'type' => 'order',
            'order_id' => $this->order->id,
            'motoboy_id' => $this->motoboy->id,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function toOneSignal($notifiable)
    {
        return [
            'title' => "Pedido Aceito",
            'message' => "{$this->motoboy->name} aceitou seu pedido #{$this->order->order_number}",
            'url' => "/orders/{$this->order->id}",
            'data' => [
                'order_id' => $this->order->id,
                'type' => 'order_accepted',
            ],
        ];
    }
}
