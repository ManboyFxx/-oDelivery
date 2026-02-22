<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PushNotificationController extends Controller
{
    /**
     * Store the OneSignal player ID for the authenticated user/customer.
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'player_id' => 'required|string',
        ]);

        $playerId = $request->player_id;

        // 1. Check if it's a User (Admin/Employee/Motoboy)
        if (Auth::check()) {
            $user = Auth::user();
            $user->update(['onesignal_id' => $playerId]);
            return response()->json(['message' => 'User subscription successful']);
        }

        // 2. Check if it's a Customer (Session-based)
        if ($customerId = session('customer_id')) {
            $customer = \App\Models\Customer::find($customerId);
            if ($customer) {
                $customer->update(['onesignal_id' => $playerId]);
                return response()->json(['message' => 'Customer subscription successful']);
            }
        }

        return response()->json(['message' => 'No authenticated user or customer found'], 401);
    }
}
