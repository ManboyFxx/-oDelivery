<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Notification;
use Illuminate\Http\Request;

class CustomerNotificationController extends Controller
{
    /**
     * List customer notifications
     */
    public function index()
    {
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $notifications = Notification::where('customer_id', $customerId)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $unreadCount = Notification::where('customer_id', $customerId)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $notification = Notification::where('id', $id)
            ->where('customer_id', $customerId)
            ->first();

        if ($notification) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        Notification::where('customer_id', $customerId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}
