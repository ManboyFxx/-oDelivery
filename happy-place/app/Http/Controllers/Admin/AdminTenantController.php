<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTenantController extends Controller
{
    public function index(Request $request)
    {
        $tenants = Tenant::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search']),
        ]);
    }

    public function suspend(Tenant $tenant)
    {
        $tenant->update(['is_active' => false]);
        return back()->with('success', 'Loja suspensa com sucesso.');
    }

    public function restore(Tenant $tenant)
    {
        $tenant->update(['is_active' => true]);
        return back()->with('success', 'Loja reativada com sucesso.');
    }

    public function metrics(Tenant $tenant)
    {
        // Carregar estatísticas do tenant
        // Como o escopo global pode filtrar pelo tenant logado (o admin),
        // precisamos garantir que estamos consultando os dados deste tenant específico.
        // Assumindo que os modelos têm tenant_id e não usamos um escopo global "cego" no admin panel.

        // Count products via relationships if defined, or raw query
        $productsCount = \App\Models\Product::where('tenant_id', $tenant->id)->count();

        // Count orders
        $ordersCount = \App\Models\Order::where('tenant_id', $tenant->id)->count();

        // Orders today
        $ordersToday = \App\Models\Order::where('tenant_id', $tenant->id)
            ->whereDate('created_at', today())
            ->count();

        // Revenue (Total de pedidos pagos/entregues)
        $revenue = \App\Models\Order::where('tenant_id', $tenant->id)
            ->where('status', 'delivered') // ou concluido
            ->sum('total');

        $metrics = [
            'total_products' => $productsCount,
            'total_orders' => $ordersCount,
            'orders_today' => $ordersToday,
            'total_revenue' => $revenue,
            'plan_name' => ucfirst($tenant->plan),
            'subscription_status' => $tenant->subscription_status,
            'joined_date' => $tenant->created_at->format('d/m/Y'),
        ];

        return Inertia::render('Admin/Tenants/Metrics', [
            'tenant' => $tenant,
            'metrics' => $metrics,
        ]);
    }
}
