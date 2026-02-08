<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        if (Auth::user()->isMotoboy()) {
            return redirect()->route('motoboy.dashboard');
        }

        if (Auth::user()->isSuperAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        $tenantId = Auth::user()->tenant_id;

        // ✅ Cache Stats (5 minutes)
        $cacheKey = "dashboard_stats_{$tenantId}";
        $stats = \Illuminate\Support\Facades\Cache::remember($cacheKey, 5 * 60, function () use ($tenantId) {
            // 1. Faturamento do Dia
            $todayRevenue = Order::where('tenant_id', $tenantId)
                ->whereDate('created_at', today())
                ->where('status', 'completed')
                ->sum('total');

            // 2. Pedidos Realizados Hoje
            $todayOrdersCount = Order::where('tenant_id', $tenantId)
                ->whereDate('created_at', today())
                ->count();

            // 3. Ticket Médio
            $averageTicket = 0;
            if ($todayOrdersCount > 0) {
                $averageTicket = $todayRevenue / $todayOrdersCount;
            }

            // 4. Novos Clientes Hoje
            $newCustomersCount = \App\Models\Customer::where('tenant_id', $tenantId)
                ->whereDate('created_at', today())
                ->count();

            // 5. Gráfico de Vendas por Hora
            $isSqlite = DB::connection()->getDriverName() === 'sqlite';
            $hourExtract = $isSqlite ? "strftime('%H', created_at)" : "HOUR(created_at)";

            $hourlySales = Order::where('tenant_id', $tenantId)
                ->whereDate('created_at', today())
                ->where('status', 'completed')
                ->select(
                    DB::raw("$hourExtract as hour"),
                    DB::raw('SUM(total) as total')
                )
                ->groupBy('hour')
                ->pluck('total', 'hour')
                ->toArray();

            if ($isSqlite) {
                $keys = array_keys($hourlySales);
                $values = array_values($hourlySales);
                $newKeys = array_map('intval', $keys);
                $hourlySales = array_combine($newKeys, $values);
            }

            $chartData = [];
            for ($i = 0; $i < 24; $i++) {
                $chartData[] = $hourlySales[$i] ?? 0;
            }

            // 7. Status em Tempo Real
            $orderStats = Order::where('tenant_id', $tenantId)
                ->whereDate('created_at', today())
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status')
                ->toArray();

            // 8. Top 3 Produtos
            $topProducts = DB::table('order_items')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->where('orders.tenant_id', $tenantId)
                ->whereDate('orders.created_at', today())
                ->select('order_items.product_name as name', DB::raw('count(*) as total_sales'), DB::raw('sum(order_items.subtotal) as revenue'))
                ->groupBy('order_items.product_name')
                ->orderByDesc('total_sales')
                ->limit(3)
                ->get();

            return compact('todayRevenue', 'todayOrdersCount', 'averageTicket', 'newCustomersCount', 'chartData', 'orderStats', 'topProducts');
        });

        // 6. Últimos Pedidos (Real-time)
        $recentOrders = Order::where('tenant_id', $tenantId)
            ->with(['customer', 'items'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => substr($order->id, -4),
                    'customer' => $order->customer_name ?? 'Cliente',
                    'items' => $order->items_count . ' itens',
                    'total' => 'R$ ' . number_format($order->total, 2, ',', '.'),
                    'status' => $order->status,
                    'time' => $order->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Dashboard', [
            'metrics' => [
                'todayRevenue' => $stats['todayRevenue'],
                'todayOrders' => $stats['todayOrdersCount'],
                'averageTicket' => $stats['averageTicket'],
                'newCustomers' => $stats['newCustomersCount'],
                'chartData' => $stats['chartData'],
                'recentOrders' => $recentOrders,
                'orderStats' => $stats['orderStats'],
                'topProducts' => $stats['topProducts']
            ]
        ]);
    }
}
