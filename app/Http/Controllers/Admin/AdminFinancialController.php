<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminFinancialController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'real');

        // Helper to apply the tab filter
        $applyTabFilter = function ($query) use ($tab) {
            $query->whereHas('tenant', function ($q) use ($tab) {
                if ($tab === 'demo') {
                    $q->demo();
                } else {
                    $q->real();
                }
            });
            return $query;
        };

        // Static for Tenant model since it doesn't have a 'tenant' relation to itself
        $applyTenantTabFilter = function ($query) use ($tab) {
            if ($tab === 'demo') {
                $query->demo();
            } else {
                $query->real();
            }
            return $query;
        };

        // 1. Métricas Globais (Ignorando Scopes de Tenant)
        $globalOrders = Order::withoutGlobalScope(\App\Scopes\TenantScope::class);
        $globalOrders = $applyTabFilter($globalOrders);

        $totalRevenue = $globalOrders->clone()->where('status', 'delivered')->sum('total');
        $totalOrdersCount = $globalOrders->clone()->count();
        $completedOrdersCount = $globalOrders->clone()->where('status', 'delivered')->count();

        $avgOrderValue = $completedOrdersCount > 0 ? $totalRevenue / $completedOrdersCount : 0;

        // 2. Crescimento Mensal (Últimos 6 meses)
        $monthlyRevenue = Order::withoutGlobalScope(\App\Scopes\TenantScope::class)
            ->where('status', 'delivered')
            ->where('created_at', '>=', now()->subMonths(6));

        $monthlyRevenue = $applyTabFilter($monthlyRevenue)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw("SUM(total) as total")
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // 3. Top Tenants por Receita
        $topTenantsQuery = Tenant::query();
        $topTenantsQuery = $applyTenantTabFilter($topTenantsQuery);

        $topTenants = $topTenantsQuery->withCount([
            'orders' => function ($query) {
                $query->withoutGlobalScope(\App\Scopes\TenantScope::class)
                    ->where('status', 'delivered');
            }
        ])
            ->get()
            ->map(function ($tenant) {
                $revenue = Order::withoutGlobalScope(\App\Scopes\TenantScope::class)
                    ->where('tenant_id', $tenant->id)
                    ->where('status', 'delivered')
                    ->sum('total');

                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'revenue' => (float) $revenue,
                    'orders_count' => $tenant->orders_count,
                    'plan' => ucfirst($tenant->plan),
                ];
            })
            ->sortByDesc('revenue')
            ->take(5)
            ->values();

        // 4. Transações Recentes
        $recentTransactionsQuery = Order::withoutGlobalScope(\App\Scopes\TenantScope::class)
            ->with('tenant:id,name')
            ->latest();

        $recentTransactions = $applyTabFilter($recentTransactionsQuery)
            ->take(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'tenant_name' => $order->tenant->name ?? 'N/A',
                    'customer' => $order->customer_name,
                    'amount' => $order->total,
                    'status' => $order->status,
                    'payment_method' => $order->payment_method,
                    'created_at' => $order->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/Financial/Index', [
            'metrics' => [
                'total_revenue' => (float) $totalRevenue,
                'total_orders' => $totalOrdersCount,
                'avg_order_value' => (float) $avgOrderValue,
                'success_rate' => $totalOrdersCount > 0 ? round(($completedOrdersCount / $totalOrdersCount) * 100, 1) : 0,
            ],
            'chartData' => $monthlyRevenue,
            'topTenants' => $topTenants,
            'recentTransactions' => $recentTransactions,
            'filters' => [
                'tab' => $tab
            ]
        ]);
    }
}
