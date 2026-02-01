<?php

namespace App\Services;

use App\Models\Order;
use App\Models\MotoboyAvailability;
use App\Models\MotoboyRating;
use Carbon\Carbon;

class MotoboySummaryService
{
    /**
     * Retorna resumo do dia do motoboy
     */
    public function getSummary(string $userId): array
    {
        $today = Carbon::today();

        // Entregas de hoje
        $deliveriesToday = Order::where('motoboy_id', $userId)
            ->where('status', 'delivered')
            ->whereDate('motoboy_delivered_at', $today)
            ->count();

        // Ganho do dia (soma de delivery_fee dos pedidos entregues)
        $earningsToday = Order::where('motoboy_id', $userId)
            ->where('status', 'delivered')
            ->whereDate('motoboy_delivered_at', $today)
            ->sum('delivery_fee');

        // Avaliação média
        $averageRating = MotoboyRating::where('motoboy_id', $userId)
            ->avg('rating');

        // Status de disponibilidade
        $availability = MotoboyAvailability::where('user_id', $userId)->first();
        $status = $availability?->availability_status ?? 'offline';
        $isOnline = $availability?->is_online ?? false;

        // Pedidos pendentes (não entregues)
        $pendingOrdersCount = Order::where('motoboy_id', $userId)
            ->whereIn('status', ['waiting_motoboy', 'motoboy_accepted', 'out_for_delivery'])
            ->count();

        return [
            'deliveries_today' => $deliveriesToday,
            'earnings_today' => $earningsToday ?? 0,
            'average_rating' => round($averageRating ?? 0, 2),
            'status' => $status,
            'is_online' => $isOnline,
            'pending_orders_count' => $pendingOrdersCount,
        ];
    }

    /**
     * Retorna estatísticas de um período específico
     */
    public function getPeriodSummary(string $userId, string $period = 'week'): array
    {
        $startDate = match ($period) {
            'today' => Carbon::today(),
            'week' => Carbon::now()->startOfWeek(),
            'month' => Carbon::now()->startOfMonth(),
            'year' => Carbon::now()->startOfYear(),
            default => Carbon::today(),
        };

        $endDate = Carbon::now();

        $deliveries = Order::where('motoboy_id', $userId)
            ->where('status', 'delivered')
            ->whereBetween('motoboy_delivered_at', [$startDate, $endDate])
            ->count();

        $earnings = Order::where('motoboy_id', $userId)
            ->where('status', 'delivered')
            ->whereBetween('motoboy_delivered_at', [$startDate, $endDate])
            ->sum('delivery_fee');

        $averageTime = Order::where('motoboy_id', $userId)
            ->where('status', 'delivered')
            ->whereBetween('motoboy_delivered_at', [$startDate, $endDate])
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, motoboy_accepted_at, motoboy_delivered_at)) as avg_time')
            ->first()
            ->avg_time ?? 0;

        return [
            'period' => $period,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'deliveries' => $deliveries,
            'earnings' => $earnings ?? 0,
            'average_delivery_time_minutes' => round($averageTime, 0),
        ];
    }
}
