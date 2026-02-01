<?php

namespace App\Http\Controllers\Api\Motoboy;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * GET /api/motoboy/notifications
     * Obter notificações do usuário autenticado
     */
    public function index(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 10);
        $type = $request->query('type', null); // Opcional: filtrar por tipo

        $user = auth()->user();

        if ($type) {
            $notifications = $this->notificationService->getNotificationsByType($user, $type, $limit);
        } else {
            $notifications = $this->notificationService->getRecentNotifications($user, $limit);
        }

        $unreadCount = $this->notificationService->getUnreadCount($user);

        return response()->json([
            'success' => true,
            'data' => $notifications->map(fn($notification) => [
                'id' => $notification->id,
                'user_id' => $notification->user_id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type,
                'icon' => $notification->icon,
                'color' => $notification->color,
                'data' => $notification->data ?? [],
                'action_url' => $notification->action_url,
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at->toIso8601String(),
                'created_at_display' => $notification->created_at->diffForHumans(),
            ]),
            'unread_count' => $unreadCount,
            'total' => Notification::where('user_id', $user->id)->count(),
        ]);
    }

    /**
     * POST /api/motoboy/notifications/{id}/read
     * Marcar notificação como lida
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $user = auth()->user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notificação não encontrada',
            ], 404);
        }

        $this->notificationService->markAsRead($notification);

        return response()->json([
            'success' => true,
            'message' => 'Notificação marcada como lida',
            'data' => [
                'id' => $notification->id,
                'read_at' => $notification->read_at,
            ],
        ]);
    }

    /**
     * POST /api/motoboy/notifications/read-all
     * Marcar todas as notificações como lidas
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $user = auth()->user();

        $updatedCount = $this->notificationService->markAllAsRead($user);

        return response()->json([
            'success' => true,
            'message' => sprintf('%d notificações marcadas como lidas', $updatedCount),
            'data' => [
                'updated_count' => $updatedCount,
                'unread_count' => 0,
            ],
        ]);
    }

    /**
     * DELETE /api/motoboy/notifications/{id}
     * Deletar notificação
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = auth()->user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notificação não encontrada',
            ], 404);
        }

        $this->notificationService->deleteNotification($notification);

        $unreadCount = $this->notificationService->getUnreadCount($user);

        return response()->json([
            'success' => true,
            'message' => 'Notificação deletada com sucesso',
            'data' => [
                'unread_count' => $unreadCount,
            ],
        ]);
    }
}
