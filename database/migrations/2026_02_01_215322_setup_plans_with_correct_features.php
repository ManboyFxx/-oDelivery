<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Configura os planos conforme @sugestao_planos.md:
     * - Start (Gratuito): 300 pedidos/mês, 50 produtos, SEM motoboy/whatsapp
     * - Pro (Profissional): Ilimitado, 200 produtos, COM motoboy/whatsapp
     * - Custom (Enterprise): Configurável
     */
    public function up(): void
    {
        // PLANO START (Gratuito)
        DB::table('plan_limits')->upsert([
            [
                'id' => $this->getOrCreatePlanId('start'),
                'plan' => 'start',
                'display_name' => 'Plano Start',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_products' => 50,
                'max_users' => 3,
                'max_orders_per_month' => 300,
                'max_categories' => null, // Ilimitado
                'max_coupons' => 5,
                'max_motoboys' => 0, // Bloqueado
                'max_storage_mb' => 1024,
                'max_units' => 1,
                'features' => json_encode([
                    'auto_print' => true,
                    'loyalty_basic' => true,
                    'multiple_payments' => true,
                    'delivery_zones' => true,
                    'customer_history' => true,
                ]),
                'show_watermark' => false,
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $this->getOrCreatePlanId('pro'),
                'plan' => 'pro',
                'display_name' => 'Plano Pro',
                'price_monthly' => 99.90,
                'price_yearly' => 1099.00,
                'max_products' => 200,
                'max_users' => 8,
                'max_orders_per_month' => null, // Ilimitado
                'max_categories' => null,
                'max_coupons' => 50,
                'max_motoboys' => 3,
                'max_storage_mb' => 10240,
                'max_units' => 5,
                'features' => json_encode([
                    'motoboy_management' => true,
                    'whatsapp_integration' => true,
                    'auto_print' => true,
                    'loyalty_basic' => true,
                    'multiple_payments' => true,
                    'delivery_zones' => true,
                    'tables' => true,
                    'customer_history' => true,
                    'advanced_coupons' => true,
                    'full_reports' => true,
                    'api_access' => true,
                    'stock_management' => true,
                ]),
                'show_watermark' => false,
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $this->getOrCreatePlanId('custom'),
                'plan' => 'custom',
                'display_name' => 'Plano Custom',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_products' => null,
                'max_users' => null,
                'max_orders_per_month' => null,
                'max_categories' => null,
                'max_coupons' => null,
                'max_motoboys' => null,
                'max_storage_mb' => 102400,
                'max_units' => 999,
                'features' => json_encode([
                    'motoboy_management' => true,
                    'whatsapp_integration' => true,
                    'auto_print' => true,
                    'loyalty_basic' => true,
                    'multiple_payments' => true,
                    'delivery_zones' => true,
                    'tables' => true,
                    'customer_history' => true,
                    'advanced_coupons' => true,
                    'full_reports' => true,
                    'api_access' => true,
                    'stock_management' => true,
                    'multi_unit' => true,
                    'custom_domain' => true,
                    'priority_support' => true,
                    'advanced_themes' => true,
                ]),
                'show_watermark' => false,
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['plan'], ['display_name', 'price_monthly', 'price_yearly', 'max_products', 'max_users',
             'max_orders_per_month', 'max_categories', 'max_coupons', 'max_motoboys', 'max_storage_mb',
             'max_units', 'features', 'show_watermark', 'is_active', 'sort_order', 'updated_at']);
    }

    /**
     * Get existing plan UUID or generate a new one
     */
    private function getOrCreatePlanId(string $planName): string
    {
        $existing = DB::table('plan_limits')
            ->where('plan', $planName)
            ->value('id');

        return $existing ?? Str::uuid()->toString();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Apenas rollback, não deletamos os planos
        DB::table('plan_limits')->whereIn('plan', ['start', 'pro', 'custom'])->delete();
    }
};
