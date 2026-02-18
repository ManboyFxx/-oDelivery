<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UnifiedPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verifica se o plano unified já existe
        $exists = DB::table('plan_limits')
            ->where('plan', 'unified')
            ->exists();

        if ($exists) {
            $this->command->info('Plano Unificado já existe. Atualizando...');

            DB::table('plan_limits')
                ->where('plan', 'unified')
                ->update([
                    'display_name' => 'Plano Único',
                    'price_monthly' => 129.90,
                    'price_yearly' => 1299.00,
                    'max_products' => null,
                    'max_users' => null,
                    'max_orders_per_month' => null,
                    'max_categories' => null,
                    'max_coupons' => null,
                    'max_motoboys' => null,
                    'max_stock_items' => null,
                    'max_storage_mb' => 999999, // Ilimitado na prática
                    'max_units' => 999999, // Ilimitado na prática
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
                    'updated_at' => now(),
                ]);

            $this->command->info('✅ Plano Unificado atualizado com sucesso!');
            return;
        }

        // Cria o plano unificado
        DB::table('plan_limits')->insert([
            'id' => Str::uuid()->toString(),
            'plan' => 'unified',
            'display_name' => 'Plano Único',
            'price_monthly' => 129.90,
            'price_yearly' => 1299.00,

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
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('✅ Plano Unificado criado com sucesso!');

        // Estatísticas
        $totalTenants = DB::table('tenants')->count();
        $this->command->info("📊 Total de tenants no sistema: {$totalTenants}");
    }
}
