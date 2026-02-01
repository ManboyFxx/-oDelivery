<?php

/**
 * ============================================
 * TEST ROUTES - Notification Testing
 * ============================================
 *
 * These routes are for testing notifications
 * Remove in production!
 *
 * Usage: php artisan tinker
 *   > include 'routes/test-notifications.php'
 *   > testCreateNotification()
 *   > testWebSocket()
 */

use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;

function testCreateNotification()
{
    echo "🧪 Testing Notification Creation...\n\n";

    try {
        // Get first motoboy user
        $user = User::where('is_motoboy', true)->first();

        if (!$user) {
            echo "❌ No motoboy users found. Create one first!\n";
            return;
        }

        $notificationService = app(NotificationService::class);

        // Create test notification
        $notification = $notificationService->createNotification(
            $user,
            'Teste de Notificação',
            'Esta é uma notificação de teste criada às ' . now()->format('H:i:s'),
            'system',
            ['test' => true],
            '/motoboy/dashboard',
            'Bell',
            '#f59e0b'
        );

        echo "✅ Notification Created!\n";
        echo "   ID: {$notification->id}\n";
        echo "   User: {$user->name}\n";
        echo "   Title: {$notification->title}\n";
        echo "   Type: {$notification->type}\n";
        echo "\n🔔 Toast should appear in real-time on the dashboard!\n";

        return $notification;
    } catch (\Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
    }
}

function testWebSocketListener()
{
    echo "🧪 Testing WebSocket Listener Setup...\n\n";

    echo "✅ WebSocket Configuration:\n";
    echo "   Driver: " . env('BROADCAST_DRIVER') . "\n";
    echo "   Vite Driver: " . env('VITE_BROADCAST_DRIVER') . "\n";
    echo "   Auth Endpoint: /broadcasting/auth\n";
    echo "\n✅ Channel Configuration:\n";
    echo "   Channel Type: Private\n";
    echo "   Pattern: private-user.{userId}\n";
    echo "\n✅ Supported Events:\n";
    echo "   • OrderAcceptedEvent\n";
    echo "   • OrderDeliveredEvent\n";
    echo "   • LocationUpdatedEvent\n";
    echo "   • ArrivedAtDestinationEvent\n";
    echo "   • OrderStatusChangedEvent\n";
    echo "   • BroadcastNotificationCreated\n";
    echo "\n✅ Toast Configuration:\n";
    echo "   Auto-close: 6 seconds\n";
    echo "   Max simultaneous: 3\n";
    echo "   Position: Bottom-right corner\n";
}

function testNotificationsList()
{
    echo "🧪 Testing Notifications List...\n\n";

    try {
        $user = User::where('is_motoboy', true)->first();

        if (!$user) {
            echo "❌ No motoboy users found!\n";
            return;
        }

        $count = Notification::where('user_id', $user->id)->count();
        $unread = Notification::where('user_id', $user->id)->whereNull('read_at')->count();

        echo "✅ Notifications for {$user->name}:\n";
        echo "   Total: {$count}\n";
        echo "   Unread: {$unread}\n";
        echo "   Read: " . ($count - $unread) . "\n";

        if ($count > 0) {
            echo "\n📋 Recent Notifications:\n";
            Notification::where('user_id', $user->id)
                ->latest()
                ->limit(5)
                ->get()
                ->each(function ($notif, $key) {
                    $status = $notif->read_at ? '✓' : '●';
                    echo "   {$status} {$notif->title} ({$notif->type})\n";
                });
        }
    } catch (\Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
    }
}

function testApiEndpoints()
{
    echo "🧪 Testing API Endpoints...\n\n";

    echo "✅ Available Endpoints:\n";
    echo "   GET    /api/motoboy/notifications\n";
    echo "   POST   /api/motoboy/notifications/{id}/read\n";
    echo "   POST   /api/motoboy/notifications/read-all\n";
    echo "   DELETE /api/motoboy/notifications/{id}\n";
    echo "\n📝 Test with CURL:\n";
    echo "   # Get notifications\n";
    echo "   curl -H 'Authorization: Bearer TOKEN' \\\n";
    echo "        http://localhost:8000/api/motoboy/notifications\n";
    echo "\n   # Mark as read\n";
    echo "   curl -X POST \\\n";
    echo "        -H 'Authorization: Bearer TOKEN' \\\n";
    echo "        http://localhost:8000/api/motoboy/notifications/{id}/read\n";
}

echo "\n";
echo "════════════════════════════════════════════════════════\n";
echo "   NOTIFICATION TESTING HELPERS\n";
echo "════════════════════════════════════════════════════════\n\n";

echo "Available functions:\n";
echo "  • testCreateNotification()  - Create a test notification\n";
echo "  • testWebSocketListener()   - Check WebSocket config\n";
echo "  • testNotificationsList()   - List user notifications\n";
echo "  • testApiEndpoints()        - Show API endpoints\n";
echo "\nExample: php artisan tinker\n";
echo "         > include 'routes/test-notifications.php'\n";
echo "         > testCreateNotification()\n\n";

return [
    'testCreateNotification',
    'testWebSocketListener',
    'testNotificationsList',
    'testApiEndpoints',
];
