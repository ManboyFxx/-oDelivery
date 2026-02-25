<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class OrderStatusChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;
    protected $oldStatus;
    protected $newStatus;

    public function __construct(Order $order, $oldStatus, $newStatus)
    {
        $this->order = $order;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function via($notifiable)
    {
        return [\App\Channels\DatabaseChannel::class, 'broadcast', \App\Channels\OneSignalChannel::class];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => "Status Atualizado",
            'message' => "Pedido #{$this->order->order_number} agora está {$this->newStatus}",
            'type' => 'order',
            'icon' => 'AlertCircle',
            'color' => '#f59e0b',
            'action_url' => "/orders/{$this->order->id}",
            'data' => [
                'order_id' => $this->order->id,
                'old_status' => $this->oldStatus,
                'new_status' => $this->newStatus,
            ],
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title' => "Status Atualizado",
            'message' => "Pedido #{$this->order->order_number} agora está {$this->newStatus}",
            'type' => 'order',
            'order_id' => $this->order->id,
            'new_status' => $this->newStatus,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
    public function toOneSignal($notifiable)
    {
        return [
            'title' => "Status Atualizado",
            'message' => "Pedido #{$this->order->order_number} agora está {$this->newStatus}",
            'url' => "/orders/{$this->order->id}",
            'data' => [
                'order_id' => $this->order->id,
                'type' => 'status_changed',
            ],
        ];
    }
}
