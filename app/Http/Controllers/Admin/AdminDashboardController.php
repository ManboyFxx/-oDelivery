<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // Calculate Metrics
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('is_active', true)->count();
        $trialTenants = Tenant::where('plan', 'trial')->where('is_active', true)->count();

        // Mocking MRR for now until Stripe is fully integrated
        $mrr = 0; // Placeholder

        // Recent Tenants
        $recentTenants = Tenant::latest()
            ->take(5)
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'plan' => ucfirst($tenant->plan),
                    'status' => $tenant->is_active ? 'Ativo' : 'Inativo',
                    'created_at' => $tenant->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_tenants' => $totalTenants,
                'active_tenants' => $activeTenants,
                'trial_tenants' => $trialTenants,
                'mrr' => $mrr,
            ],
            'recent_tenants' => $recentTenants,
        ]);
    }
}
