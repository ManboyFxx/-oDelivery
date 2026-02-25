<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Channels\DatabaseChannel as IlluminateDatabaseChannel;

class DatabaseChannel extends IlluminateDatabaseChannel
{
    /**
     * Build an array payload for the DatabaseNotification Model.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return array
     */
    protected function buildPayload($notifiable, Notification $notification)
    {
        $payload = parent::buildPayload($notifiable, $notification);

        $data = $this->getData($notifiable, $notification);

        // Add all custom columns required by the OoDelivery notifications schema
        $payload['title'] = $data['title'] ?? 'Notificação';
        $payload['message'] = $data['message'] ?? 'Você tem uma nova mensagem.';
        $payload['type'] = $data['type'] ?? 'system';
        $payload['action_url'] = $data['action_url'] ?? null;
        $payload['icon'] = $data['icon'] ?? null;
        $payload['color'] = $data['color'] ?? null;

        if ($notifiable instanceof \App\Models\User) {
            $payload['user_id'] = $notifiable->id;
        } elseif ($notifiable instanceof \App\Models\Customer) {
            $payload['customer_id'] = $notifiable->id;
        }

        return $payload;
    }
}
