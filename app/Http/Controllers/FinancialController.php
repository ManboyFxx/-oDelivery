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
        $user = Auth::user();
        $tenantId = $user->tenant_id;
        $tenant = $user->tenant;

        // Plan Logic: Check if user is restricted (unified plan = always full access)
        $isRestricted = $tenant->plan === 'free' && !$tenant->onTrial() && $tenant->plan !== 'unified';

        // Parse dates or default to current month
        if ($isRestricted) {
            // Free plan is locked to last 7 days vs previous 7 days
            $endDate = Carbon::now()->endOfDay();
            $startDate = Carbon::now()->subDays(6)->startOfDay();
        } else {
            // Pro/Custom/Trial can choose dates
            $startDate = $request->input('start_date')
                ? Carbon::parse($request->input('start_date'))->startOfDay()
                : Carbon::now()->startOfMonth();

            $endDate = $request->input('end_date')
                ? Carbon::parse($request->input('end_date'))->endOfDay()
                : Carbon::now()->endOfMonth();
        }

        // 1. Total Revenue (Completed & Delivered orders in period)
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

        // 4. Growth logic (Compare with previous period of same duration)
        $daysDiff = $startDate->diffInDays($endDate) + 1;
        $previousStartDate = $startDate->copy()->subDays($daysDiff);
        $previousEndDate = $startDate->copy()->subDays(1)->endOfDay();

        $previousRevenue = Order::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
            ->whereIn('status', ['completed', 'delivered'])
            ->sum('total');

        $growth = 0;
        if ($previousRevenue > 0) {
            $growth = (($totalRevenue - $previousRevenue) / $previousRevenue) * 100;
        } else if ($totalRevenue > 0) {
            $growth = 100;
        }

        // 5. Chart Data (Dynamic Range)
        $chartData = [];

        // Pre-fetch data
        $dailyRevenues = Order::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('status', ['completed', 'delivered'])
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Generate period dates
        $period = \Carbon\CarbonPeriod::create($startDate, $endDate);

        foreach ($period as $date) {
            $dateString = $date->format('Y-m-d');
            $revenue = isset($dailyRevenues[$dateString]) ? $dailyRevenues[$dateString]->total : 0;

            $chartData[] = [
                'date' => $date->format('d/m'),
                'value' => (float) $revenue
            ];
        }

        // 6. Recent Transactions (filtered by date)
        $transactions = Order::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with(['payments'])
            ->latest()
            ->take(20) // Increased limit since it's now a filtered list
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
                    'id' => substr($order->id, -6),
                    'customer' => $order->customer_name ?? 'Cliente Balcão',
                    'amount' => (float) $order->total,
                    'status' => $status,
                    'payment_method' => $methodStr,
                    'date' => $order->created_at->format('H:i - d/m')
                ];
            });


        // 7. Advanced Reports Data (PRO only)
        // If plan is 'free', we don't calculate these to save performance
        $topProducts = [];
        $paymentMethods = [];

        if ($tenant->plan === 'pro' || $tenant->plan === 'custom' || $tenant->plan === 'unified' || $tenant->onTrial()) {
            // Top Products
            $topProducts = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->where('orders.tenant_id', $tenantId)
                ->whereBetween('orders.created_at', [$startDate, $endDate])
                ->whereIn('orders.status', ['completed', 'delivered'])
                ->select(
                    'products.name',
                    DB::raw('SUM(order_items.quantity) as quantity'),
                    DB::raw('SUM(order_items.subtotal) as total')
                )
                ->groupBy('products.id', 'products.name')
                ->orderByDesc('quantity')
                ->limit(5)
                ->get();

            // Payment Methods stats
            $paymentMethods = DB::table('payments')
                ->join('orders', 'payments.order_id', '=', 'orders.id')
                ->where('orders.tenant_id', $tenantId)
                ->whereBetween('orders.created_at', [$startDate, $endDate])
                ->whereIn('orders.status', ['completed', 'delivered'])
                ->select(
                    'payments.method',
                    DB::raw('SUM(payments.amount) as total'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('payments.method')
                ->get()
                ->map(function ($item) {
                    $label = match ($item->method) {
                        'credit_card' => 'Crédito',
                        'debit_card' => 'Débito',
                        'pix' => 'PIX',
                        'cash' => 'Dinheiro',
                        default => ucfirst($item->method),
                    };
                    return [
                        'name' => $label,
                        'method' => $item->method,
                        'total' => (float) $item->total,
                        'count' => $item->count
                    ];
                });
        }

        return Inertia::render('Financial/Index', [
            'metrics' => [
                'total_revenue' => (float) $totalRevenue,
                'orders_count' => $ordersCount,
                'average_ticket' => (float) $averageTicket,
                'growth' => round($growth, 1)
            ],
            'chart_data' => $chartData,
            'transactions' => $transactions,
            'top_products' => $topProducts,
            'payment_methods_stats' => $paymentMethods,
            'current_plan' => $tenant->plan,
            'is_trial' => $tenant->onTrial(),
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ]
        ]);
    }
}
