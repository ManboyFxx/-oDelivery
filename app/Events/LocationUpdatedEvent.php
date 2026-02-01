<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LocationUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $orderId;
    public $latitude;
    public $longitude;
    public $accuracy;
    public $distance;

    public function __construct($userId, $orderId, $latitude, $longitude, $accuracy = null, $distance = null)
    {
        $this->userId = $userId;
        $this->orderId = $orderId;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->accuracy = $accuracy;
        $this->distance = $distance;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("order.{$this->orderId}"),
            new PrivateChannel("motoboy.{$this->userId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'location.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'order_id' => $this->orderId,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'accuracy' => $this->accuracy,
            'distance_to_customer' => $this->distance,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
