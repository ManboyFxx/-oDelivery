<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    /**
     * Display a listing of all tenants with trial/subscription info
     */
    public function tenants()
    {
        // Only allow super_admin role
        if (auth()->user()->role !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        $tenants = Tenant::with([
            'users' => function ($query) {
                $query->where('role', 'admin')->limit(1);
            }
        ])
            ->withCount(['products', 'users', 'orders', 'motoboys'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('SuperAdmin/Tenants/Index', [
            'tenants' => $tenants->through(fn($tenant) => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'email' => $tenant->email,
                'plan' => $tenant->plan,
                'subscription_status' => $tenant->subscription_status,
                'trial_ends_at' => $tenant->trial_ends_at?->format('Y-m-d H:i:s'),
                'trial_days_remaining' => $tenant->trialDaysRemaining(),
                'is_trial_active' => $tenant->isTrialActive(),
                'is_trial_expired' => $tenant->isTrialExpired(),
                'is_suspended' => $tenant->is_suspended,
                'created_at' => $tenant->created_at->format('d/m/Y'),
                'usage' => [
                    'products' => $tenant->products_count,
                    'users' => $tenant->users_count,
                    'orders' => $tenant->orders_count,
                    'motoboys' => $tenant->motoboys_count,
                ],
                'limits' => [
                    'products' => $tenant->getLimit('max_products'),
                    'users' => $tenant->getLimit('max_users'),
                    'motoboys' => $tenant->getLimit('max_motoboys'),
                ],
            ]),
            'links' => $tenants->linkCollection(),
        ]);
    }

    /**
     * Extend trial for a tenant
     */
    public function extendTrial(Request $request, string $tenantId)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'days' => 'required|integer|min:1|max:90',
        ]);

        $tenant = Tenant::findOrFail($tenantId);

        $currentExpiry = $tenant->trial_ends_at ?? now();
        $newExpiry = $currentExpiry->addDays($request->days);

        $tenant->update([
            'trial_ends_at' => $newExpiry,
            'subscription_status' => 'trial',
        ]);

        return back()->with('success', "Trial estendido por {$request->days} dias");
    }

    /**
     * Force upgrade tenant to a plan
     */
    public function forceUpgrade(Request $request, string $tenantId)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'plan' => 'required|in:free,pro,custom',
        ]);

        $tenant = Tenant::findOrFail($tenantId);

        $tenant->update([
            'plan' => $request->plan,
            'subscription_status' => 'active',
            'trial_ends_at' => null,
        ]);

        return back()->with('success', "Tenant atualizado para plano {$request->plan}");
    }

    /**
     * Reset trial for a tenant
     */
    public function resetTrial(string $tenantId)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        $tenant = Tenant::findOrFail($tenantId);

        $tenant->update([
            'trial_ends_at' => now()->addDays(14),
            'subscription_status' => 'trial',
            'plan' => 'pro', // Give them pro features during trial
        ]);

        return back()->with('success', 'Trial resetado para 14 dias');
    }

    /**
     * Suspend a tenant
     */
    public function suspend(Request $request, string $tenantId)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $tenant = Tenant::findOrFail($tenantId);
        $tenant->suspend($request->reason);

        return back()->with('success', 'Tenant suspenso');
    }

    /**
     * Restore a suspended tenant
     */
    public function restore(string $tenantId)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        $tenant = Tenant::findOrFail($tenantId);
        $tenant->restore();

        return back()->with('success', 'Tenant restaurado');
    }
}
