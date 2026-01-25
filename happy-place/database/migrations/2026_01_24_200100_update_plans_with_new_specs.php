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
        // Add max_stock_items column to plan_limits table
        if (!Schema::hasColumn('plan_limits', 'max_stock_items')) {
            Schema::table('plan_limits', function (Blueprint $table) {
                $table->integer('max_stock_items')->nullable()->after('max_units');
            });
        }

        // Update Gratuito plan - All features EXCEPT ÓoBot and ÓoMotoboy
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update([
                'max_products' => 100,
                'max_orders_per_month' => 3000,
                'max_stock_items' => 25,
                'features' => json_encode([
                    'digital_menu',
                    'whatsapp_orders',
                    'auto_print', // ÓoPrint
                    'basic_reports',
                    'loyalty_basic',
                    'multiple_payments',
                    'delivery_zones',
                    'tables',
                    'customer_history',
                    'advanced_coupons',
                    'full_reports',
                    'stock_management',
                    'advanced_reports',
                    // NOT included: 'whatsapp_bot' (ÓoBot), 'motoboy_management' (ÓoMotoboy)
                    // NOT included: 'integrations', 'api_access', 'multi_unit', 'custom_domain', 'priority_support', 'advanced_themes', 'remove_watermark'
                ]),
                'show_watermark' => true,
            ]);

        // Ensure Básico plan has all features
        DB::table('plan_limits')
            ->where('plan', 'basic')
            ->update([
                'features' => json_encode([
                    'digital_menu',
                    'whatsapp_orders',
                    'whatsapp_bot', // ÓoBot
                    'auto_print', // ÓoPrint
                    'motoboy_management', // ÓoMotoboy
                    'whatsapp_integration', // ÓoBot WhatsApp
                    'basic_reports',
                    'loyalty_basic',
                    'multiple_payments',
                    'delivery_zones',
                    'tables',
                    'customer_history',
                    'advanced_coupons',
                    'full_reports',
                ]),
            ]);

        // Ensure Pro plan has all features
        DB::table('plan_limits')
            ->where('plan', 'pro')
            ->update([
                'features' => json_encode([
                    'digital_menu',
                    'whatsapp_orders',
                    'whatsapp_bot', // ÓoBot
                    'auto_print', // ÓoPrint
                    'motoboy_management', // ÓoMotoboy
                    'whatsapp_integration', // ÓoBot WhatsApp
                    'basic_reports',
                    'loyalty_basic',
                    'multiple_payments',
                    'delivery_zones',
                    'tables',
                    'customer_history',
                    'advanced_coupons',
                    'full_reports',
                    'integrations',
                    'api_access',
                    'stock_management',
                    'advanced_reports',
                    'multi_unit',
                    'custom_domain',
                    'priority_support',
                    'advanced_themes',
                    'remove_watermark',
                ]),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert Gratuito plan to original specs
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update([
                'max_products' => 15,
                'max_orders_per_month' => 50,
                'max_stock_items' => null,
                'features' => json_encode([
                    'digital_menu',
                    'whatsapp_orders',
                    'basic_reports',
                ]),
            ]);

        // Remove max_stock_items column
        if (Schema::hasColumn('plan_limits', 'max_stock_items')) {
            Schema::table('plan_limits', function (Blueprint $table) {
                $table->dropColumn('max_stock_items');
            });
        }
    }
};
