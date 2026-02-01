<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LocationUpdateNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $orderId;
    protected $distance;
    protected $estimatedTime;

    public function __construct($orderId, $distance, $estimatedTime)
    {
        $this->orderId = $orderId;
        $this->distance = $distance;
        $this->estimatedTime = $estimatedTime;
    }

    public function via($notifiable)
    {
        return ['broadcast'];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title' => "Localização Atualizada",
            'message' => "Motoboy a {$this->distance} km de distância",
            'type' => 'location',
            'order_id' => $this->orderId,
            'distance' => $this->distance,
            'estimated_time' => $this->estimatedTime,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
