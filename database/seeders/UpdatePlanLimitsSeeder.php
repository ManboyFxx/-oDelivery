<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UpdatePlanLimitsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Plano Start (Gratuito)
        \App\Models\PlanLimit::updateOrCreate(
            ['plan' => 'free'], // Using 'free' as the standard key now
            [
                'display_name' => 'Plano Start',
                'price_monthly' => 0.00,
                'price_yearly' => 0.00,
                'max_users' => 3, // 1 Admin + 2 Funcionários
                'max_products' => 50,
                'max_orders_per_month' => 300,
                'max_motoboys' => 0,
                'max_coupons' => 2,
                'max_stock_items' => 25, // New limit
                'show_watermark' => true,
                'is_active' => true,
                'sort_order' => 1,
                'features' => [
                    'auto_print' => true,
                    'motoboy_management' => false,
                    'whatsapp_integration' => false,
                    'loyalty_basic' => true, // User said "Fidelidade ilimitado"
                    'digital_menu' => true,
                    'kanban_view' => true,
                    'support_level' => 'community',
                ]
            ]
        );

        // 2. Plano Pro (Intermediário)
        \App\Models\PlanLimit::updateOrCreate(
            ['plan' => 'pro'],
            [
                'display_name' => 'Plano Pro',
                'price_monthly' => 79.90, // Updated price
                'price_yearly' => 799.00,
                'max_users' => 8, // 3 Admin + 5 Func (Total 8)
                'max_products' => null, // Unlimited
                'max_orders_per_month' => null, // Unlimited
                'max_stock_items' => null, // Unlimited
                'max_motoboys' => 6,
                'max_coupons' => null, // Unlimited
                'show_watermark' => false,
                'is_active' => true,
                'sort_order' => 2,
                'features' => [
                    'auto_print' => true,
                    'motoboy_management' => true,
                    'whatsapp_integration' => true,
                    'loyalty_basic' => true,
                    'digital_menu' => true,
                    'kanban_view' => true,
                    'support_level' => 'priority', // Priority support mentioned
                    'api_access' => true,
                ]
            ]
        );

        // 3. Plano Personalizado (Enterprise)
        \App\Models\PlanLimit::updateOrCreate(
            ['plan' => 'custom'],
            [
                'display_name' => 'Plano Personalizado',
                'price_monthly' => 149.90,
                'price_yearly' => 1499.00,
                'max_users' => null, // Unlimited
                'max_products' => null,
                'max_orders_per_month' => null,
                'max_stock_items' => null,
                'max_motoboys' => null, // Unlimited
                'max_coupons' => null, // Unlimited
                'show_watermark' => false,
                'is_active' => true,
                'sort_order' => 3,
                'features' => [
                    'auto_print' => true,
                    'motoboy_management' => true,
                    'whatsapp_integration' => true,
                    'loyalty_basic' => true,
                    'digital_menu' => true,
                    'kanban_view' => true,
                    'support_level' => 'vip', // Priority + Private Group + Marketing
                    'custom_integration' => true,
                    'custom_domain' => true, // "Em breve" but listed
                ]
            ]
        );
    }
}
