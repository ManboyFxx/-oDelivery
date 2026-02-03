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
            ->with(['whatsAppInstances'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Tenants/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tenants,slug',
            'email' => 'required|email|max:255|unique:tenants,email',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'plan' => 'required|string|in:free,starter,basic,pro,custom',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
            // 1. Create Tenant
            $tenant = Tenant::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'email' => $validated['email'],
                'plan' => $validated['plan'],
                'is_active' => true,
                'subscription_status' => 'active',
                'features' => [], // Default features can be set here
            ]);

            // 2. Create Owner User
            $user = \App\Models\User::create([
                'tenant_id' => $tenant->id,
                'name' => $validated['owner_name'],
                'email' => $validated['owner_email'],
                'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                'role' => 'admin', // Tenant Admin
                'is_active' => true,
            ]);

            // Assign role if using Spatie permissions (optional, but good practice)
            // $user->assignRole('admin'); 
        });

        return redirect()->route('admin.tenants.index')->with('success', 'Loja criada com sucesso!');
    }

    public function suspend(Request $request, Tenant $tenant)
    {
        $tenant->update([
            'is_active' => false,
            'suspension_reason' => $request->input('reason', null),
        ]);
        return back()->with('success', 'Loja suspensa com sucesso.');
    }

    public function restore(Tenant $tenant)
    {
        $tenant->update([
            'is_active' => true,
            'suspension_reason' => null
        ]);
        return back()->with('success', 'Loja reativada com sucesso.');
    }

    public function updatePlan(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'plan' => 'required|string|in:free,basic,pro,trial,enterprise'
        ]);

        $tenant->update([
            'plan' => $validated['plan']
        ]);

        return back()->with('success', 'Plano atualizado com sucesso.');
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
    public function edit(string $id)
    {
        $tenant = Tenant::with(['users'])->findOrFail($id);

        // Load plan limits for reference
        $plans = \App\Models\PlanLimit::where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('Admin/Tenants/Edit', [
            'tenant' => $tenant,
            'plans' => $plans,
            'currentLimits' => [
                'max_products' => $tenant->getLimit('max_products'),
                'max_users' => $tenant->getLimit('max_users'),
                'max_orders_per_month' => $tenant->getLimit('max_orders_per_month'),
                'max_motoboys' => $tenant->getLimit('max_motoboys'),
                'max_storage_mb' => $tenant->getLimit('max_storage_mb'),
            ]
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tenants,slug,' . $tenant->id,
            'is_active' => 'boolean',
            'plan' => 'required|string',
            // Custom Override Fields
            'is_custom' => 'boolean',
            'max_products' => 'nullable|integer',
            'max_users' => 'nullable|integer',
            'max_orders_per_month' => 'nullable|integer',
            'max_motoboys' => 'nullable|integer',
            'subscription_status' => 'required|string|in:active,inactive,past_due,canceled,trialing',
            'subscription_ends_at' => 'nullable|date',
            'trial_ends_at' => 'nullable|date',
        ]);

        // If not custom, we clear the overrides to respect the plan limits
        if (!$request->boolean('is_custom')) {
            $validated['max_products'] = null;
            $validated['max_users'] = null;
            $validated['max_orders_per_month'] = null;
            $validated['max_motoboys'] = null;
        }

        $tenant->update($validated);

        return \Illuminate\Support\Facades\Redirect::route('admin.tenants.index')->with('success', 'Loja atualizada com sucesso!');
    }
}
