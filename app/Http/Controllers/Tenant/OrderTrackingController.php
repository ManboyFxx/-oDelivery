<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderTrackingController extends Controller
{
    /**
     * Track order status and timeline
     * 
     * @param string $id Order ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function track($id)
    {
        $order = Order::with(['customer', 'items.product', 'deliveryZone', 'motoboy'])
            ->findOrFail($id);

        // Build status timeline
        $timeline = $this->buildTimeline($order);

        // Calculate estimated delivery time
        $estimatedTime = $this->calculateEstimatedTime($order);

        return response()->json([
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'total' => $order->total,
                'delivery_fee' => $order->delivery_fee,
                'customer_name' => $order->customer_name,
                'delivery_address' => $order->delivery_address,
                'created_at' => $order->created_at->format('d/m/Y H:i'),
                'items' => $order->items->map(function ($item) {
                    return [
                        'name' => $item->product_name,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                    ];
                }),
            ],
            'status' => $order->status,
            'estimated_time' => $estimatedTime,
            'timeline' => $timeline,
        ]);
    }

    /**
     * Build status timeline with timestamps
     */
    private function buildTimeline(Order $order): array
    {
        $statuses = [
            'pending' => ['label' => 'Pedido Recebido', 'icon' => '📝', 'completed' => false],
            'confirmed' => ['label' => 'Confirmado', 'icon' => '✅', 'completed' => false],
            'preparing' => ['label' => 'Em Preparo', 'icon' => '👨‍🍳', 'completed' => false],
            'ready' => ['label' => 'Pronto', 'icon' => '🎉', 'completed' => false],
            'out_for_delivery' => ['label' => 'Saiu para Entrega', 'icon' => '🏍️', 'completed' => false],
            'delivered' => ['label' => 'Entregue', 'icon' => '✨', 'completed' => false],
        ];

        $currentStatusIndex = array_search($order->status, array_keys($statuses));

        foreach ($statuses as $key => $status) {
            $statusIndex = array_search($key, array_keys($statuses));

            if ($statusIndex <= $currentStatusIndex) {
                $statuses[$key]['completed'] = true;
            }

            if ($key === $order->status) {
                $statuses[$key]['current'] = true;
                $statuses[$key]['timestamp'] = $order->updated_at->format('H:i');
            }
        }

        return array_values($statuses);
    }

    /**
     * Calculate estimated delivery time in minutes
     */
    private function calculateEstimatedTime(Order $order): int
    {
        if ($order->status === 'delivered') {
            return 0;
        }

        // Base time from delivery zone
        $baseTime = $order->deliveryZone->estimated_time_min ?? 30;

        // Adjust based on current status
        $adjustments = [
            'pending' => $baseTime,
            'confirmed' => $baseTime - 5,
            'preparing' => $baseTime - 10,
            'ready' => 15,
            'out_for_delivery' => 10,
        ];

        return max(0, $adjustments[$order->status] ?? $baseTime);
    }
}
