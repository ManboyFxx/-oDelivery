<?php

namespace App\Services;

use App\Events\ArrivedAtDestinationEvent;
use App\Events\LocationUpdatedEvent;
use App\Events\OrderAcceptedEvent;
use App\Events\OrderDeliveredEvent;
use App\Events\OrderStatusChangedEvent;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\Order;
use App\Models\User;
use App\Notifications\ArrivedAtDestinationNotification;
use App\Notifications\LocationUpdateNotification;
use App\Notifications\OrderAcceptedNotification;
use App\Notifications\OrderDeliveredNotification;
use App\Notifications\OrderStatusChangedNotification;

class NotificationService
{
    /**
     * Notificar que motoboy aceitou pedido
     */
    public function sendOrderAccepted(Order $order, User $motoboy): void
    {
        if ($order->customer) {
            $order->customer->notify(new OrderAcceptedNotification($order, $motoboy));
        }

        event(new OrderAcceptedEvent($order, $motoboy));
    }

    /**
     * Notificar que pedido foi entregue
     */
    public function sendOrderDelivered(Order $order): void
    {
        if ($order->customer) {
            $order->customer->notify(new OrderDeliveredNotification($order));
        }

        if ($order->motoboy) {
            $order->motoboy->notify(new OrderDeliveredNotification($order));
        }

        event(new OrderDeliveredEvent($order));
    }

    /**
     * Notificar atualização de localização
     */
    public function sendLocationUpdate(User $motoboy, Order $order, float $distance, int $estimatedTime): void
    {
        if ($order->customer) {
            $order->customer->notify(new LocationUpdateNotification($order->id, $distance, $estimatedTime));
        }

        event(new LocationUpdatedEvent(
            $motoboy->id,
            $order->id,
            0, // latitude - será preenchido no event listener
            0, // longitude - será preenchido no event listener
            null,
            $distance
        ));
    }

    /**
     * Notificar chegada ao destino
     */
    public function sendArrivedAtDestination(Order $order, User $motoboy): void
    {
        if ($order->customer) {
            $order->customer->notify(new ArrivedAtDestinationNotification($order, $motoboy));
        }

        event(new ArrivedAtDestinationEvent($order, $motoboy));
    }

    /**
     * Notificar mudança de status
     */
    public function sendOrderStatusChanged(Order $order, string $oldStatus, string $newStatus): void
    {
        if ($order->customer) {
            $order->customer->notify(new OrderStatusChangedNotification($order, $oldStatus, $newStatus));
        }

        if ($order->motoboy) {
            $order->motoboy->notify(new OrderStatusChangedNotification($order, $oldStatus, $newStatus));
        }

        event(new OrderStatusChangedEvent($order, $oldStatus, $newStatus));
    }

    /**
     * Criar notificação customizada
     */
    public function createNotification(
        User $user,
        string $title,
        string $message,
        string $type = 'system',
        ?array $data = null,
        ?string $actionUrl = null,
        ?string $icon = null,
        ?string $color = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
            'action_url' => $actionUrl,
            'icon' => $icon,
            'color' => $color,
        ]);
    }

    /**
     * Marcar notificação como lida
     */
    public function markAsRead(Notification $notification): bool
    {
        return $notification->markAsRead();
    }

    /**
     * Marcar todas as notificações de um usuário como lidas
     */
    public function markAllAsRead(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * Obter contagem de não lidas
     */
    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Obter notificações recentes
     */
    public function getRecentNotifications(User $user, int $limit = 10)
    {
        return Notification::where('user_id', $user->id)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Obter notificações por tipo
     */
    public function getNotificationsByType(User $user, string $type, int $limit = 10)
    {
        return Notification::where('user_id', $user->id)
            ->where('type', $type)
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Deletar notificação
     */
    public function deleteNotification(Notification $notification): bool
    {
        return $notification->delete();
    }

    /**
     * Deletar notificações antigas (30+ dias)
     */
    public function deleteOldNotifications(int $daysOld = 30): int
    {
        return Notification::where('created_at', '<', now()->subDays($daysOld))
            ->delete();
    }

    /**
     * Enviar para múltiplos usuários
     */
    public function sendToMultipleUsers(array $userIds, string $title, string $message, string $type = 'system'): void
    {
        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if ($user) {
                $this->createNotification($user, $title, $message, $type);
            }
        }
    }

    /**
     * Verificar preferência de notificação
     */
    public function isChannelEnabled(User $user, string $channel = 'push'): bool
    {
        return NotificationPreference::isEnabled($user->id, $channel);
    }

    /**
     * Atualizar preferência de notificação
     */
    public function updateChannelPreference(User $user, string $channel, bool $enabled): NotificationPreference
    {
        return NotificationPreference::updateOrCreate(
            [
                'user_id' => $user->id,
                'channel' => $channel,
            ],
            [
                'enabled' => $enabled,
            ]
        );
    }

    /**
     * Obter preferências do usuário
     */
    public function getUserPreferences(User $user)
    {
        return NotificationPreference::where('user_id', $user->id)->get();
    }

    /**
     * Inicializar preferências padrão para novo usuário
     */
    public function initializeDefaultPreferences(User $user): void
    {
        $channels = ['push', 'email', 'database'];

        foreach ($channels as $channel) {
            NotificationPreference::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'channel' => $channel,
                ],
                [
                    'enabled' => $channel === 'database' ? true : false,
                ]
            );
        }
    }
}
