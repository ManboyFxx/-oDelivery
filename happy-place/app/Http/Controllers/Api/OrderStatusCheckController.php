<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Carbon\Carbon;

class OrderStatusCheckController extends Controller
{
    public function __invoke(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        // Return IDs of recent orders instead of just boolean
        // This allows frontend to deduplicate alerts

        $newOrderIds = Order::where('tenant_id', $tenantId)
            ->where('status', 'new')
            ->where('created_at', '>=', Carbon::now()->subSeconds(20))
            ->pluck('id');

        $readyOrderIds = Order::where('tenant_id', $tenantId)
            ->where('status', 'ready')
            ->where('updated_at', '>=', Carbon::now()->subSeconds(20))
            ->pluck('id');

        $canceledOrderIds = Order::where('tenant_id', $tenantId)
            ->where('status', 'canceled')
            ->where('updated_at', '>=', Carbon::now()->subSeconds(20))
            ->pluck('id');

        return response()->json([
            'newOrderIds' => $newOrderIds,
            'readyOrderIds' => $readyOrderIds,
            'canceledOrderIds' => $canceledOrderIds,
            'hasNewOrders' => $newOrderIds->isNotEmpty(),
            'hasReadyOrders' => $readyOrderIds->isNotEmpty(),
            'hasCanceledOrders' => $canceledOrderIds->isNotEmpty(),
        ]);
    }
}
