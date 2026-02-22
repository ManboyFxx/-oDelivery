<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ArrivedAtDestinationNotification extends Notification implements ShouldQueue
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
        return ['database', 'broadcast', \App\Channels\OneSignalChannel::class];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => "Motoboy Chegou",
            'message' => "{$this->motoboy->name} chegou no local de entrega!",
            'type' => 'arrived',
            'icon' => 'Navigation',
            'color' => '#8b5cf6',
            'action_url' => "/orders/{$this->order->id}",
            'data' => [
                'order_id' => $this->order->id,
                'motoboy_name' => $this->motoboy->name,
            ],
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title' => "Motoboy Chegou",
            'message' => "{$this->motoboy->name} chegou no local de entrega!",
            'type' => 'arrived',
            'order_id' => $this->order->id,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
    public function toOneSignal($notifiable)
    {
        return [
            'title' => "Motoboy Chegou",
            'message' => "{$this->motoboy->name} chegou no local de entrega!",
            'url' => "/orders/{$this->order->id}",
            'data' => [
                'order_id' => $this->order->id,
                'type' => 'motoboy_arrived',
            ],
        ];
    }
}
