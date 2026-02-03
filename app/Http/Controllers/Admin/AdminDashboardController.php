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

        // --- System Health Checks ---

        // 1. Evolution API (WhatsApp)
        $evolutionStatus = 'disconnected';
        $evolutionLatency = 'N/A';
        try {
            $instance = WhatsAppInstance::where('instance_type', 'shared')->first();
            if ($instance) {
                $start = microtime(true);
                // We just check purely if we can get status, assuming 'open' means healthy
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
        // Check if we have active motoboys or recent location updates
        // For now, simple DB check if table exists and is accessible
        $motoboyStatus = 'calibration_needed';
        $motoboyLatency = 'N/A';
        try {
            $start = microtime(true);
            // Just a lightweight query to check module health
            DB::table('users')->where('role', 'motoboy')->exists();
            $end = microtime(true);
            $motoboyLatency = round(($end - $start) * 1000) . 'ms';
            $motoboyStatus = 'active';
        } catch (\Exception $e) {
            $motoboyStatus = 'error';
        }

        // 3. Sistema de Impressão (OoPrint)
        // Check for recent polling or heartbeat if available. 
        // For now, check if we have print jobs in queue
        $printStatus = 'idle';
        $printLatency = 'N/A';
        try {
            $start = microtime(true);
            // Simple check on jobs table or similar
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
                'trial_tenants' => $trialTenants,
                'mrr' => $mrr,
            ],
            'recent_tenants' => $recentTenants,
            'system_health' => [
                'evolution' => [
                    'status' => $evolutionStatus, // connected, disconnected, error
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
