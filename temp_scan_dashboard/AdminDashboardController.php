<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\EvolutionApiService;
use App\Models\WhatsAppInstance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function __construct(
        private EvolutionApiService $evolutionApi
    ) {
    }

    public function index()
    {
        // Calculate Metrics
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('is_active', true)->where('plan', '!=', 'free')->count(); // Active paid/trial tenants? Or just active status?
        // Usually active tenants means those who can access. Let's stick to 'is_active' = true.
        // But for dashboard stats, "Active Tenants" often implies paying or valid ones.
        // Let's keep it simple: is_active = true.
        $activeTenants = Tenant::where('is_active', true)->count();

        $newTenants = Tenant::where('created_at', '>=', now()->subDays(30))->count();

        // Total Global Orders (ignoring tenant scope)
        $totalOrders = \App\Models\Order::withoutGlobalScope(\App\Scopes\TenantScope::class)->count();

        $trialTenants = Tenant::where(function ($q) {
            $q->where('plan', 'trial')
                ->orWhere(function ($sub) {
                    $sub->whereNotNull('trial_ends_at')
                        ->where('trial_ends_at', '>', now());
                });
        })->where('is_active', true)->count();

        // Calculate MRR (Monthly Recurring Revenue)
        // We need to sum up the valid subscriptions
        $plans = \App\Models\PlanLimit::all()->keyBy('plan');

        $mrr = Tenant::where('is_active', true)
            ->where('plan', '!=', 'free')
            ->where(function ($q) {
                // Only count if subscription is active or in trial (if we count trial value? usually no)
                // MRR usually only counts PAYING customers.
                $q->where('subscription_status', 'active')
                    ->orWhere('subscription_status', 'trialing'); // Stripe status
            })
            ->get()
            ->sum(function ($tenant) use ($plans) {
                $plan = $plans[$tenant->plan] ?? null;
                if (!$plan)
                    return 0;

                // Removed trial check as unified plan has no trial
    
                if ($tenant->billing_cycle === 'yearly') {
                    return $plan->price_yearly / 12;
                }

                return $plan->price_monthly;
            });

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

        // --- System Health Checks ---
        // ... (Keep existing health checks)

        // 1. Evolution API (WhatsApp)
        $evolutionStatus = 'disconnected';
        $evolutionLatency = 'N/A';
        try {
            $instance = WhatsAppInstance::where('instance_type', 'shared')->first();
            if ($instance) {
                $start = microtime(true);
                $state = $this->evolutionApi->getInstanceStatus($instance->instance_name);
                $end = microtime(true);
                $evolutionLatency = round(($end - $start) * 1000) . 'ms';

                if (($state['state'] ?? '') === 'open') {
                    $evolutionStatus = 'connected';
                }
            }
        } catch (\Exception $e) {
            $evolutionStatus = 'error';
        }

        // 2. Painel Motoboy (Integrity Check)
        $motoboyStatus = 'calibration_needed';
        $motoboyLatency = 'N/A';
        try {
            $start = microtime(true);
            DB::table('users')->where('role', 'motoboy')->exists();
            $end = microtime(true);
            $motoboyLatency = round(($end - $start) * 1000) . 'ms';
            $motoboyStatus = 'active';
        } catch (\Exception $e) {
            $motoboyStatus = 'error';
        }

        // 3. Sistema de Impressão (OoPrint)
        $printStatus = 'idle';
        $printLatency = 'N/A';
        try {
            $start = microtime(true);
            DB::table('jobs')->exists();
            $end = microtime(true);
            $printLatency = round(($end - $start) * 1000) . 'ms';
            $printStatus = 'active';
        } catch (\Exception $e) {
            $printStatus = 'error';
        }

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_tenants' => $totalTenants,
                'active_tenants' => $activeTenants,
                'new_tenants' => $newTenants,
                'total_orders' => $totalOrders,
                'trial_tenants' => $trialTenants,
                'mrr' => $mrr,
            ],
            'recent_tenants' => $recentTenants,
            'system_health' => [
                'evolution' => [
                    'status' => $evolutionStatus,
                    'latency' => $evolutionLatency
                ],
                'motoboy' => [
                    'status' => $motoboyStatus,
                    'latency' => $motoboyLatency
                ],
                'print' => [
                    'status' => $printStatus,
                    'latency' => $printLatency
                ]
            ]
        ]);
    }
}
