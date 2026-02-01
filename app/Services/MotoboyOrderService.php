<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Pagination\Paginator;

class MotoboyOrderService
{
    /**
     * Obter pedidos disponíveis para o motoboy (não atribuídos ainda)
     */
    public function getAvailableOrders(string $userId, int $limit = 5)
    {
        return Order::where('mode', 'delivery')
            ->where('status', 'ready')
            ->whereNull('motoboy_id')
            ->with(['customer', 'items'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer?->name ?? $order->customer_name,
                    'customer_phone' => $order->customer?->phone ?? $order->customer_phone,
                    'delivery_address' => $order->delivery_address,
                    'total' => $order->total,
                    'delivery_fee' => $order->delivery_fee ?? 0,
                    'items_count' => $order->items->count(),
                    'estimated_time_minutes' => $order->estimated_time_minutes ?? 30,
                    'created_at' => $order->created_at->format('H:i'),
                ];
            });
    }

    /**
     * Obter pedidos em entrega (atribuídos ao motoboy)
     */
    public function getPendingOrders(string $userId)
    {
        return Order::where('motoboy_id', $userId)
            ->whereIn('status', ['waiting_motoboy', 'motoboy_accepted', 'out_for_delivery'])
            ->with(['customer', 'items'])
            ->orderBy('motoboy_accepted_at', 'desc')
            ->get()
            ->map(function ($order) {
                $status = match ($order->status) {
                    'waiting_motoboy' => 'Aguardando Aceitação',
                    'motoboy_accepted' => 'Aceito - Coletando',
                    'out_for_delivery' => 'Em Rota',
                    default => $order->status,
                };

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer?->name ?? $order->customer_name,
                    'customer_phone' => $order->customer?->phone ?? $order->customer_phone,
                    'delivery_address' => $order->delivery_address,
                    'status' => $status,
                    'status_code' => $order->status,
                    'items_count' => $order->items->count(),
                    'accepted_at' => $order->motoboy_accepted_at?->format('H:i'),
                ];
            });
    }

    /**
     * Obter entregas recentes (últimas 5)
     */
    public function getRecentDeliveries(string $userId, int $limit = 5)
    {
        return Order::where('motoboy_id', $userId)
            ->where('status', 'delivered')
            ->with(['customer', 'motoboyRating'])
            ->orderBy('motoboy_delivered_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($order) {
                $rating = $order->motoboyRating;
                $rating_stars = $rating?->rating ? str_repeat('★', $rating->rating) . str_repeat('☆', 5 - $rating->rating) : '---';

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer?->name ?? $order->customer_name,
                    'delivered_at' => $order->motoboy_delivered_at?->format('H:i'),
                    'delivery_fee' => $order->delivery_fee ?? 0,
                    'rating' => $rating?->rating,
                    'rating_stars' => $rating_stars,
                ];
            });
    }

    /**
     * Aceitar pedido
     */
    public function acceptOrder(string $orderId, string $motoboyId): Order
    {
        $order = Order::findOrFail($orderId);

        $order->update([
            'motoboy_id' => $motoboyId,
            'status' => 'motoboy_accepted',
            'motoboy_accepted_at' => now(),
        ]);

        return $order;
    }

    /**
     * Iniciar entrega
     */
    public function startDelivery(string $orderId): Order
    {
        $order = Order::findOrFail($orderId);

        $order->update([
            'status' => 'out_for_delivery',
            'motoboy_delivery_started_at' => now(),
        ]);

        return $order;
    }

    /**
     * Confirmar entrega
     */
    public function deliverOrder(string $orderId, ?string $proofPhoto = null): Order
    {
        $order = Order::findOrFail($orderId);

        $order->update([
            'status' => 'delivered',
            'motoboy_delivered_at' => now(),
            'delivery_proof_photo' => $proofPhoto,
        ]);

        return $order;
    }

    /**
     * Recusar pedido
     */
    public function rejectOrder(string $orderId): Order
    {
        $order = Order::findOrFail($orderId);

        $order->update([
            'motoboy_id' => null,
            'status' => 'waiting_motoboy',
            'motoboy_accepted_at' => null,
        ]);

        return $order;
    }

    /**
     * Obter detalhe completo de um pedido
     */
    public function getOrderDetail(string $orderId)
    {
        $order = Order::with(['customer', 'items', 'motoboyRating'])
            ->findOrFail($orderId);

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'customer' => [
                'id' => $order->customer?->id,
                'name' => $order->customer?->name ?? $order->customer_name,
                'phone' => $order->customer?->phone ?? $order->customer_phone,
                'email' => $order->customer?->email,
            ],
            'delivery_address' => $order->delivery_address,
            'items' => $order->items->map(fn($item) => [
                'name' => $item->product_name,
                'quantity' => $item->quantity,
                'price' => $item->price,
            ]),
            'total' => $order->total,
            'delivery_fee' => $order->delivery_fee ?? 0,
            'payment_status' => $order->payment_status,
            'created_at' => $order->created_at->format('d/m/Y H:i'),
        ];
    }
}
