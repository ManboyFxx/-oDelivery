<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Channels\OneSignalChannel;

class NewOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return [\App\Channels\DatabaseChannel::class, 'broadcast', OneSignalChannel::class];
    }

    public function toArray($notifiable)
    {
        return [
            'title' => "Novo Pedido #{$this->order->order_number}",
            'message' => "Você recebeu um novo pedido de {$this->order->customer_name} no valor de R$ " . number_format((float) ($this->order->total ?? 0), 2, ',', '.'),
            'type' => 'new_order',
            'order_id' => $this->order->id,
            'action_url' => "/orders/{$this->order->id}",
        ];
    }

    public function toOneSignal($notifiable)
    {
        return [
            'title' => "Novo Pedido!",
            'message' => "Pedido #{$this->order->order_number} - R$ " . number_format((float) ($this->order->total ?? 0), 2, ',', '.'),
            'url' => "/orders/{$this->order->id}",
            'data' => [
                'order_id' => $this->order->id,
                'type' => 'new_order',
            ],
        ];
    }
}
