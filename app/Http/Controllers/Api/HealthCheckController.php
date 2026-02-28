<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

/**
 * FASE 4 – Produção-Grade: Health Check Endpoint
 * 
 * Permite monitorar o estado dos componentes críticos da aplicação:
 * - Banco de dados
 * - Cache (Redis/File)
 * - Queue (se configurada)
 * - Pusher (broadcast)
 * 
 * Endpoint: GET /api/health
 * 
 * Usado por: uptime monitors, load balancers, dashboards de infra.
 */
class HealthCheckController extends Controller
{
    public function index(): JsonResponse
    {
        $checks = [];
        $startTime = microtime(true);
        $overallStatus = 'ok';

        // ── 1. Database ──────────────────────────────
        try {
            $dbStart = microtime(true);
            DB::select('SELECT 1');
            $checks['database'] = [
                'status' => 'ok',
                'latency_ms' => round((microtime(true) - $dbStart) * 1000, 2),
            ];
        } catch (\Throwable $e) {
            $checks['database'] = ['status' => 'error', 'message' => 'Database unreachable'];
            $overallStatus = 'degraded';
        }

        // ── 2. Cache ──────────────────────────────────
        try {
            $cacheKey = 'health_check_' . time();
            Cache::put($cacheKey, true, 10);
            $cacheOk = Cache::get($cacheKey) === true;
            Cache::forget($cacheKey);
            $checks['cache'] = ['status' => $cacheOk ? 'ok' : 'error'];
        } catch (\Throwable $e) {
            $checks['cache'] = ['status' => 'warning', 'message' => 'Cache may be unavailable'];
        }

        // ── 3. Pusher / Broadcast ─────────────────────
        $pusherKey = config('broadcasting.connections.pusher-http.key');
        $checks['broadcast'] = [
            'status' => $pusherKey ? 'configured' : 'not_configured',
            'driver' => config('broadcasting.default', 'log'),
        ];

        // ── 4. Queue ──────────────────────────────────
        try {
            $failedJobs = DB::table('failed_jobs')->count();
            $checks['queue'] = [
                'status' => $failedJobs > 50 ? 'warning' : 'ok',
                'failed_jobs' => $failedJobs,
            ];
        } catch (\Throwable) {
            $checks['queue'] = ['status' => 'unknown'];
        }

        // ── 5. Free disk space ───────────────────────
        $disk = disk_free_space(storage_path());
        $checks['storage'] = [
            'status' => $disk > (100 * 1024 * 1024) ? 'ok' : 'warning',
            'free_mb' => $disk ? round($disk / 1024 / 1024) : 0,
        ];

        $totalMs = round((microtime(true) - $startTime) * 1000, 2);

        return response()->json([
            'status' => $overallStatus,
            'version' => config('app.version', '1.0.0'),
            'environment' => config('app.env'),
            'timestamp' => now()->toIso8601String(),
            'response_ms' => $totalMs,
            'checks' => $checks,
        ], $overallStatus === 'ok' ? 200 : 503);
    }
}
