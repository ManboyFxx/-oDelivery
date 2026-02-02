<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class FinancialController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = Auth::user()->tenant_id;
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        // 1. Total Revenue (Completed & Delivered orders this month)
        $totalRevenue = Order::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', ['completed', 'delivered'])
            ->sum('total');

        // 2. Orders Count
        $ordersCount = Order::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', ['completed', 'delivered'])
            ->count();

        // 3. Average Ticket
        $averageTicket = $ordersCount > 0 ? $totalRevenue / $ordersCount : 0;

        // 4. Growth logic
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        $lastMonthRevenue = Order::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->whereIn('status', ['completed', 'delivered'])
            ->sum('total');

        $growth = 0;
        if ($lastMonthRevenue > 0) {
            $growth = (($totalRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100;
        } else if ($totalRevenue > 0) {
            $growth = 100;
        }

        // 5. Chart Data (Last 30 Days)
        // Group by date to show trend
        $chartData = [];
        $queryDate = Carbon::now()->subDays(29); // Start 30 days ago

        // Pre-fetch data for efficiency
        $dailyRevenues = Order::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $queryDate->startOfDay())
            ->whereIn('status', ['completed', 'delivered'])
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        for ($i = 0; $i < 30; $i++) {
            $date = Carbon::now()->subDays(29 - $i);
            $dateString = $date->format('Y-m-d');
            $revenue = isset($dailyRevenues[$dateString]) ? $dailyRevenues[$dateString]->total : 0;

            $chartData[] = [
                'date' => $date->format('d/m'),
                'value' => (float) $revenue
            ];
        }

        // 6. Recent Transactions
        $transactions = Order::where('tenant_id', $tenantId)
            ->with(['payments'])
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($order) {
                // Determine payment method from relation or fallback
                $methodStr = 'Outros';
                $payment = $order->payments->first();
                if ($payment) {
                    $methodStr = match ($payment->method) {
                        'credit_card' => 'Cartão de Crédito',
                        'debit_card' => 'Cartão de Débito',
                        'pix' => 'PIX',
                        'cash' => 'Dinheiro',
                        default => ucfirst($payment->method),
                    };
                }

                // Check status map
                $status = match ($order->status) {
                    'delivered', 'completed' => 'completed',
                    'cancelled' => 'refunded',
                    default => 'pending'
                };

                return [
                    'id' => substr($order->id, -6), // Short ID
                    'customer' => $order->customer_name ?? 'Cliente Balcão',
                    'amount' => (float) $order->total,
                    'status' => $status,
                    'payment_method' => $methodStr,
                    'date' => $order->created_at->format('H:i - d/m')
                ];
            });

        return Inertia::render('Financial/Index', [
            'metrics' => [
                'total_revenue' => (float) $totalRevenue,
                'orders_count' => $ordersCount,
                'average_ticket' => (float) $averageTicket,
                'growth' => round($growth, 1)
            ],
            'chart_data' => $chartData,
            'transactions' => $transactions
        ]);
    }
}
