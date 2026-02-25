<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OneSignalChannel
{
    /**
     * Send the given notification.
     */
    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toOneSignal')) {
            return;
        }

        $onesignalId = $notifiable->onesignal_id;

        if (!$onesignalId) {
            return;
        }

        $data = $notification->toOneSignal($notifiable);

        $appId = config('services.onesignal.app_id');
        $apiKey = config('services.onesignal.rest_api_key');

        if (!$appId || !$apiKey) {
            Log::warning('OneSignal configuration missing');
            return;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://onesignal.com/api/v1/notifications', [
                        'app_id' => $appId,
                        'include_player_ids' => [$onesignalId],
                        'headings' => ['en' => $data['title'], 'pt' => $data['title']],
                        'contents' => ['en' => $data['message'], 'pt' => $data['message']],
                        'data' => $data['data'] ?? [],
                        'url' => $data['url'] ?? null,
                    ]);

            if ($response->failed()) {
                Log::error('OneSignal Notification Failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'notifiable_id' => $notifiable->id,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('OneSignal Notification Error', [
                'error' => $e->getMessage(),
                'notifiable_id' => $notifiable->id,
            ]);
        }
    }
}
