<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PlanLimit;

class SubscriptionController extends Controller
{
    public function index()
    {
        $tenant = auth()->user()->tenant;
        $activePlans = PlanLimit::where('is_active', true)->orderBy('sort_order')->get();

        $plans = $activePlans->map(function ($plan) use ($tenant) {
            return [
                'id' => match ($plan->plan) {
                    'free' => 'free',
                    'pro' => 'price_basic',
                    'start' => 'free',
                    'custom' => 'price_pro',
                    default => $plan->plan,
                },
                'original_id' => $plan->plan, // Useful for strict comparison if needed
                'name' => $plan->display_name,
                'price' => $plan->price_monthly,
                'interval' => 'mês',
                'features' => $plan->formatted_features,
                'limits' => [
                    'products' => $plan->max_products,
                    'users' => $plan->max_users,
                    'orders' => $plan->max_orders_per_month,
                    'motoboys' => $plan->max_motoboys,
                    'stock_items' => $plan->max_stock_items,
                    'coupons' => $plan->max_coupons,
                ],
                'current' => $tenant->plan === $plan->plan,
            ];
        })->values();

        // Calculate Usage - STRICTLY SCOPED VIA TENANT RELATIONSHIP
        $usage = [
            'products' => $tenant->products()->count(),
            'users' => $tenant->users()->count(),
            'orders' => $tenant->orders()->whereMonth('created_at', now()->month)->count(),
            'motoboys' => $tenant->users()->where('role', 'motoboy')->count(),
            'coupons' => $tenant->coupons()->where('is_active', true)->count(),
            'stock_items' => 0,
        ];

        // Try to count ingredients (Stock Items) via relationship checking
        // Assuming Ingredient model has tenant_id or is related to tenant
        if (class_exists(\App\Models\Ingredient::class)) {
            // If Ingredient doesn't have a direct relationship in Tenant model yet, we can try direct query with tenant_id if column exists
            // Or better, add the relationship to Tenant.php if missing.
            // For now, let's assume global scope or direct query if relationship missing.
            // Best practice: $tenant->ingredients()->count() if relation exists.
            // Checking Tenant.php from previous turn... ID 772 shows it DOES NOT have ingredients() relationship visible in lines 51-150.
            // However, it has 'users', 'products', 'orders'.
            // Let's use direct scoped query as fallback safe method.
            $usage['stock_items'] = \App\Models\Ingredient::where('tenant_id', $tenant->id)->count();
        }

        return Inertia::render('Subscription/Index', [
            'plans' => $plans,
            'usage' => $usage,
        ]);
    }

    // Private formatFeatures method removed as logic is now in Model


    public function checkout(string $plan)
    {
        // Mock Checkout: Directly upgrade for now to test flow
        $tenant = auth()->user()->tenant;

        // Simulating logic
        if ($plan === 'free') {
            return $this->downgradeToFree(new Request());
        }

        return Inertia::render('Subscription/Checkout', [
            'plan' => $plan,
            'price' => $plan === 'price_basic' ? 79.90 : 0 // Ajustado para refletir preço real do básico
        ]);
    }

    public function upgrade(Request $request)
    {
        $tenant = auth()->user()->tenant;
        $requestedPlan = $request->input('plan');

        // Validate that the plan is allowed for self-service upgrade
        if (!in_array($requestedPlan, ['free', 'basic'])) {
            return back()->withErrors([
                'plan' => 'O plano Personalizado requer contato com nossa equipe. Entre em contato via WhatsApp.'
            ]);
        }

        // Prevent downgrade from custom/pro to basic/free via this method
        if (in_array($tenant->plan, ['custom', 'pro'])) {
            return back()->withErrors([
                'plan' => 'Para alterar seu plano Personalizado, entre em contato com o suporte.'
            ]);
        }

        // TODO: Integrate with Stripe payment here
        // For now, just update the plan (mock) with intelligent date calculation
        try {
            $tenant->upgradeTo($requestedPlan);
        } catch (\Exception $e) {
            return back()->withErrors(['plan' => $e->getMessage()]);
        }

        return redirect()->route('dashboard')->with('success', "Plano atualizado para {$requestedPlan} com sucesso! (Modo de Teste)");
    }

    public function downgradeToFree(Request $request)
    {
        $tenant = auth()->user()->tenant;
        $force = $request->input('force', false);

        try {
            $tenant->downgradeToFree($force);
        } catch (\Exception $e) {
            return back()->withErrors(['downgrade' => $e->getMessage()]);
        }

        return redirect()->route('dashboard')->with('success', 'Plano alterado para Gratuito.');
    }

    public function expired()
    {
        $tenant = auth()->user()->tenant;
        $activePlans = PlanLimit::where('is_active', true)->orderBy('sort_order')->get();

        $plans = $activePlans->map(function ($plan) {
            return [
                'id' => $plan->plan, // simplified mapping for this view
                'plan' => $plan->plan,
                'name' => $plan->display_name,
                'price' => $plan->price_monthly,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'interval' => 'mês',
                'features' => $plan->formatted_features,
                'max_products' => $plan->max_products,
                'max_users' => $plan->max_users,
                'current' => auth()->user()->tenant->plan === $plan->plan,
            ];
        })->values();

        // Check if downgrade is possible or needs warnings
        $downgradeRisks = $tenant->canDowngradeTo('free');

        return Inertia::render('Subscription/Expired', [
            'tenant' => $tenant,
            'plans' => $plans,
            'downgradeRisks' => $downgradeRisks
        ]);
    }

    public function status()
    {
        return redirect()->route('subscription.index');
    }
}
