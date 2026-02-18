<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Remove planos antigos (free, pro, custom)
        DB::table('plan_limits')
            ->whereIn('plan', ['free', 'pro', 'custom'])
            ->delete();

        // 2. Cria ou atualiza o plano único unificado
        $unifiedPlan = DB::table('plan_limits')->where('plan', 'unified')->first();

        $planData = [
            'display_name' => 'Plano Único',
            'price_monthly' => 129.90,
            'price_yearly' => 1299.00, // 10 meses (economize 2 meses)

            // TODOS OS LIMITES COMO NULL = ILIMITADO
            // Exceção: campos que não aceitam NULL recebem valores muito altos
            'max_products' => null,
            'max_users' => null,
            'max_orders_per_month' => null,
            'max_categories' => null,
            'max_coupons' => null,
            'max_motoboys' => null,
            'max_stock_items' => null,
            'max_storage_mb' => 999999, // Ilimitado na prática (999GB)
            'max_units' => 999999, // Ilimitado na prática

            // TODAS AS FEATURES LIBERADAS
            'features' => json_encode([
                'motoboy_management' => true,
                'whatsapp_integration' => true,
                'auto_print' => true,
                'loyalty_basic' => true,
                'digital_menu' => true,
                'api_access' => true,
                'custom_domain' => true,
                'kanban_view' => true,
                'custom_integration' => true,
                'support_level' => 'priority',
            ]),

            'show_watermark' => false,
            'is_active' => true,
            'sort_order' => 1,
            'updated_at' => now(),
        ];

        if ($unifiedPlan) {
            DB::table('plan_limits')->where('id', $unifiedPlan->id)->update($planData);
        } else {
            $planData['id'] = \Illuminate\Support\Str::uuid()->toString();
            $planData['plan'] = 'unified';
            $planData['created_at'] = now();
            DB::table('plan_limits')->insert($planData);
        }

        // 3. Migra todos os tenants existentes para o plano unificado
        DB::table('tenants')->update([
            'plan' => 'unified',
            'trial_ends_at' => null, // Remove trial
            'subscription_status' => 'active',
            'show_watermark' => false,
            // Limpa limites personalizados (agora todos seguem o plano)
            'max_products' => null,
            'max_users' => null,
            'max_orders_per_month' => null,
            'max_categories' => null,
            'max_motoboys' => null,
            'max_storage_mb' => null,
            'max_stock_items' => null,
        ]);

        // 4. Limpa histórico de trial/downgrade (se a coluna event_type existir)
        // DB::table('subscription_history')
        //     ->whereIn('event_type', ['trial_started', 'trial_ended', 'downgrade'])
        //     ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Não há como reverter completamente, mas podemos recriar os planos antigos
        DB::table('plan_limits')
            ->where('plan', 'unified')
            ->delete();

        // Nota: Os dados dos tenants não serão revertidos
        // É necessário um backup do banco para restauração completa
    }
};
