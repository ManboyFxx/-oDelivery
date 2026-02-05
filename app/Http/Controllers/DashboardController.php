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

        // 1. Faturamento do Dia
        $todayRevenue = Order::where('tenant_id', $tenantId)
            ->whereDate('created_at', today())
            ->where('status', 'completed') // Assumindo 'completed' como status final
            ->sum('total');

        // 2. Pedidos Realizados Hoje
        $todayOrdersCount = Order::where('tenant_id', $tenantId)
            ->whereDate('created_at', today())
            ->count();

        // 3. Ticket Médio (Geral ou do dia? Vamos fazer do dia para consistência, ou geral para mais dados)
        // Vamos fazer do dia para bater com os outros cards, mas se for 0, pegamos geral.
        $averageTicket = 0;
        if ($todayOrdersCount > 0) {
            $averageTicket = $todayRevenue / $todayOrdersCount;
        }

        // 4. Novos Clientes Hoje
        // Assumindo que temos relação de clientes ou que orders tem customer_id
        // Vamos contar orders unicos por customer_phone ou id se houver
        // Simplificação: Contar clientes criados hoje se houver model Customer
        $newCustomersCount = \App\Models\Customer::where('tenant_id', $tenantId)
            ->whereDate('created_at', today())
            ->count();

        // 5. Gráfico de Vendas por Hora (Hoje)
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

        // Normalize keys to integers for SQLite (returns '01', '02' strings)
        if ($isSqlite) {
            $keys = array_keys($hourlySales);
            $values = array_values($hourlySales);
            $newKeys = array_map('intval', $keys);
            $hourlySales = array_combine($newKeys, $values);
        }

        // Preencher horas vazias com 0
        $chartData = [];
        for ($i = 0; $i < 24; $i++) {
            $chartData[] = $hourlySales[$i] ?? 0;
        }

        // 6. Últimos Pedidos
        $recentOrders = Order::where('tenant_id', $tenantId)
            ->with(['customer', 'items']) // Assumindo relacionamentos
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => substr($order->id, -4), // Usar últimos 4 chars do UUID ou ID curto
                    'customer' => $order->customer_name ?? 'Cliente', // Ajustar conforme model
                    'items' => $order->items_count . ' itens', // Simplificação
                    'total' => 'R$ ' . number_format($order->total, 2, ',', ('.')),
                    'status' => $order->status,
                    'time' => $order->created_at->diffForHumans(),
                ];
            });

        // 7. Status em Tempo Real (Contadores)
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
            // Fix: Use 'product_name' and 'subtotal' (or unit_price * quantity)
            ->select('order_items.product_name as name', DB::raw('count(*) as total_sales'), DB::raw('sum(order_items.subtotal) as revenue'))
            ->groupBy('order_items.product_name')
            ->orderByDesc('total_sales')
            ->limit(3)
            ->get();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'todayRevenue' => $todayRevenue,
                'todayOrders' => $todayOrdersCount,
                'averageTicket' => $averageTicket,
                'newCustomers' => $newCustomersCount,
                'chartData' => $chartData,
                'recentOrders' => $recentOrders,
                'orderStats' => $orderStats,
                'topProducts' => $topProducts
            ]
        ]);
    }
}
