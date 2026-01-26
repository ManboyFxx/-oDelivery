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

        // 1. Total Revenue (Completed & Paid orders this month)
        $totalRevenue = Order::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', ['completed', 'delivered']) // Assuming these are final statuses
            ->sum('total');

        // 2. Orders Count
        $ordersCount = Order::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // 3. Average Ticket
        $averageTicket = $ordersCount > 0 ? $totalRevenue / $ordersCount : 0;

        // 4. Growth (Compare with last month same period)
        // Simplified: Compare total revenue vs last month total
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
            $growth = 100; // 100% growth if started from 0
        }

        // 5. Chart Data (Last 7 Days)
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayRevenue = Order::where('tenant_id', $tenantId)
                ->whereDate('created_at', $date)
                ->whereIn('status', ['completed', 'delivered'])
                ->sum('total');

            $chartData[] = [
                'date' => $date->format('d/m'),
                'value' => (float) $dayRevenue
            ];
        }

        // 6. Recent Transactions
        $transactions = Order::where('tenant_id', $tenantId)
            ->with(['payments']) // Assuming relation
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($order) {
                // Determine main payment method
                $methodStr = 'Outros';
                $payment = $order->payments->first(); // Get first payment
                if ($payment) {
                    $methods = [
                        'credit_card' => 'Cartão de Crédito',
                        'debit_card' => 'Cartão de Débito',
                        'pix' => 'PIX',
                        'cash' => 'Dinheiro'
                    ];
                    $methodStr = $methods[$payment->method] ?? $payment->method;
                }

                return [
                    'id' => $order->order_number, // User friendly ID
                    'customer' => $order->customer_name,
                    'amount' => (float) $order->total,
                    'status' => $order->status,
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
