<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update([
                'max_products' => 20,              // ⬇️ De 100 para 20
                'max_users' => 2,                  // ⬇️ De 3 para 2
                'max_orders_per_month' => 200,     // ⬇️ De 3000 para 200
                'max_categories' => 5,             // 🆕 De null para 5
                'max_coupons' => 3,                // 🆕 De null para 3
                'max_storage_mb' => 50,            // ⬇️ De 100 para 50
                'max_stock_items' => 10,           // ⬇️ De 25 para 10
                'features' => json_encode([
                    'digital_menu',
                    'whatsapp_orders',
                    'basic_reports',
                    'loyalty_basic',
                    'multiple_payments',
                    'delivery_zones',
                    'tables',
                    'customer_history'
                    // ❌ REMOVIDOS: auto_print, advanced_coupons, full_reports, stock_management, advanced_reports
                ]),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update([
                'max_products' => 100,
                'max_users' => 3,
                'max_orders_per_month' => 3000,
                'max_categories' => null,
                'max_coupons' => null,
                'max_storage_mb' => 100,
                'max_stock_items' => 25,
                'features' => json_encode([
                    'digital_menu',
                    'whatsapp_orders',
                    'auto_print',
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
                ]),
            ]);
    }
};
