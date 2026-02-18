<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\EvolutionApiService;
use App\Models\WhatsAppInstance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class AdminDashboardController extends Controller
{
    public function __construct(
        private EvolutionApiService $evolutionApi
    ) {
    }

    public function index()
    {
        // ✅ Cache Metrics (30 minutes)
        // High cost calculations: MRR, Global Orders, Active Tenants
        $metrics = Cache::remember('admin_dashboard_metrics', 1800, function () {
            $totalTenants = Tenant::count();
            $activeTenants = Tenant::where('is_active', true)->count();
            $newTenants = Tenant::where('created_at', '>=', now()->subDays(30))->count();

            // Total Global Orders
            $totalOrders = \App\Models\Order::withoutGlobalScope(\App\Scopes\TenantScope::class)->count();

            $trialTenants = Tenant::where(function ($q) {
                $q->where('plan', 'trial')
                    ->orWhere(function ($sub) {
                        $sub->whereNotNull('trial_ends_at')
                            ->where('trial_ends_at', '>', now());
                    });
            })->where('is_active', true)->count();

            // Calculate MRR
            $plans = \App\Models\PlanLimit::all()->keyBy('plan');

            $mrr = Tenant::where('is_active', true)
                ->where('plan', '!=', 'free')
                ->where(function ($q) {
                    $q->where('subscription_status', 'active')
                        ->orWhere('subscription_status', 'trialing');
                })
                ->get()
                ->sum(function ($tenant) use ($plans) {
                    $plan = $plans[$tenant->plan] ?? null;
                    if (!$plan)
                        return 0;

                    if ($tenant->billing_cycle === 'yearly') {
                        return $plan->price_yearly / 12;
                    }

                    return $plan->price_monthly;
                });

            return [
                'total_tenants' => $totalTenants,
                'active_tenants' => $activeTenants,
                'new_tenants' => $newTenants,
                'total_orders' => $totalOrders,
                'trial_tenants' => $trialTenants,
                'mrr' => $mrr,
            ];
        });

        // ✅ Cache Recent Tenants (5 minutes)
        // Fast query, but good to cache for high traffic
        $recentTenants = Cache::remember('admin_dashboard_recent_tenants', 300, function () {
            return Tenant::latest()
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
        });

        // ✅ Cache Health Checks (2 minutes)
        // Critical for performance. Prevents blocking if external API (Evolution) is slow.
        $systemHealth = Cache::remember('admin_dashboard_health', 120, function () {
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
                // Keep 'disconnected' or set to 'error' but don't crash
                $evolutionStatus = 'error';
            }

            // 2. Painel Motoboy
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

            // 3. Sistema de Impressão
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

            return [
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
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
            'recent_tenants' => $recentTenants,
            'system_health' => $systemHealth
        ]);
    }
}
