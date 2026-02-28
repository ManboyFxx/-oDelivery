<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * FASE 2 – ESCALA REAL: Agregação de analytics por tenant.
 *
 * Agente: @data-engineer
 *
 * Rode manualmente:
 *   php artisan analytics:aggregate
 *   php artisan analytics:aggregate --date=2026-02-26
 *
 * Agendado em Kernel.php para rodar toda noite às 01:00.
 */
class AggregateTenantsAnalytics extends Command
{
    protected $signature = 'analytics:aggregate {--date= : Data no formato Y-m-d (padrão: ontem)}';
    protected $description = 'Agrega métricas de pedidos por tenant na tabela daily_tenant_revenues';

    public function handle(): int
    {
        $date = $this->option('date')
            ? Carbon::parse($this->option('date'))->toDateString()
            : Carbon::yesterday()->toDateString();

        $this->info("Agregando analytics para: {$date}");

        $tenants = Tenant::where('is_active', true)->pluck('id');

        $bar = $this->output->createProgressBar($tenants->count());
        $bar->start();

        foreach ($tenants as $tenantId) {
            try {
                $this->aggregateForTenant($tenantId, $date);
            } catch (\Throwable $e) {
                Log::error('AggregateTenantsAnalytics: falha para tenant', [
                    'tenant_id' => $tenantId,
                    'date' => $date,
                    'error' => $e->getMessage(),
                ]);
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('✅ Agregação concluída!');

        return self::SUCCESS;
    }

    private function aggregateForTenant(string $tenantId, string $date): void
    {
        $orders = DB::table('orders')
            ->where('tenant_id', $tenantId)
            ->whereDate('created_at', $date)
            ->whereNull('deleted_at')
            ->select([
                DB::raw('COUNT(*) as total_orders'),
                DB::raw("SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders"),
                DB::raw("SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders"),
                DB::raw("SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END) as total_revenue"),
                DB::raw("AVG(CASE WHEN status = 'delivered' THEN total ELSE NULL END) as avg_ticket"),
                DB::raw('SUM(discount) as total_discounts'),
                DB::raw('SUM(delivery_fee) as delivery_fees_total'),
                DB::raw("SUM(CASE WHEN mode = 'delivery' THEN 1 ELSE 0 END) as delivery_orders"),
                DB::raw("SUM(CASE WHEN mode = 'pickup'   THEN 1 ELSE 0 END) as pickup_orders"),
                DB::raw("SUM(CASE WHEN mode = 'table'    THEN 1 ELSE 0 END) as table_orders"),
                DB::raw('SUM(loyalty_points_earned) as loyalty_points_awarded'),
            ])
            ->first();

        if (!$orders || $orders->total_orders === 0) {
            return;
        }

        DB::table('daily_tenant_revenues')->upsert(
            [
                'id' => \Illuminate\Support\Str::uuid(),
                'tenant_id' => $tenantId,
                'date' => $date,
                'total_orders' => $orders->total_orders ?? 0,
                'cancelled_orders' => $orders->cancelled_orders ?? 0,
                'delivered_orders' => $orders->delivered_orders ?? 0,
                'total_revenue' => $orders->total_revenue ?? 0,
                'avg_ticket' => round($orders->avg_ticket ?? 0, 2),
                'total_discounts' => $orders->total_discounts ?? 0,
                'delivery_fees_total' => $orders->delivery_fees_total ?? 0,
                'delivery_orders' => $orders->delivery_orders ?? 0,
                'pickup_orders' => $orders->pickup_orders ?? 0,
                'table_orders' => $orders->table_orders ?? 0,
                'loyalty_points_awarded' => $orders->loyalty_points_awarded ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Conflito = atualiza no lugar (upsert por tenant+date)
            ['tenant_id', 'date'],
            [
                'total_orders',
                'cancelled_orders',
                'delivered_orders',
                'total_revenue',
                'avg_ticket',
                'total_discounts',
                'delivery_fees_total',
                'delivery_orders',
                'pickup_orders',
                'table_orders',
                'loyalty_points_awarded',
                'updated_at',
            ]
        );
    }
}
