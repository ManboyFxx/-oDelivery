<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plan_limits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('plan', 50)->unique();
            $table->string('display_name', 100);
            $table->decimal('price_monthly', 10, 2);
            $table->decimal('price_yearly', 10, 2);
            $table->integer('max_products')->nullable();
            $table->integer('max_users')->nullable();
            $table->integer('max_orders_per_month')->nullable();
            $table->integer('max_categories')->nullable();
            $table->integer('max_coupons')->nullable();
            $table->integer('max_motoboys')->nullable();
            $table->integer('max_storage_mb');
            $table->integer('max_units')->default(1);
            $table->json('features');
            $table->boolean('show_watermark')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed default plans
        $this->seedPlans();
    }

    /**
     * Seed the default plans.
     */
    private function seedPlans(): void
    {
        $plans = [
            [
                'id' => Str::uuid()->toString(),
                'plan' => 'free',
                'display_name' => 'Gratuito',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_products' => 15,
                'max_users' => 1,
                'max_orders_per_month' => 50,
                'max_categories' => 5,
                'max_coupons' => 1,
                'max_motoboys' => 0,
                'max_storage_mb' => 100,
                'max_units' => 1,
                'features' => json_encode([
                    'digital_menu',
                    'whatsapp_orders',
                    'basic_reports',
                ]),
                'show_watermark' => true,
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'plan' => 'basic',
                'display_name' => 'Básico',
                'price_monthly' => 79.90,
                'price_yearly' => 838.80,
                'max_products' => 100,
                'max_users' => 5,
                'max_orders_per_month' => null, // unlimited
                'max_categories' => 20,
                'max_coupons' => 10,
                'max_motoboys' => 5,
                'max_storage_mb' => 1024,
                'max_units' => 1,
                'features' => json_encode([
                    'digital_menu',
                    'whatsapp_orders',
                    'basic_reports',
                    'auto_print',
                    'loyalty_basic',
                    'multiple_payments',
                    'motoboy_management',
                    'delivery_zones',
                    'tables',
                    'customer_history',
                    'advanced_coupons',
                    'full_reports',
                ]),
                'show_watermark' => true,
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'plan' => 'pro',
                'display_name' => 'Pro',
                'price_monthly' => 199.90,
                'price_yearly' => 2158.80,
                'max_products' => null, // unlimited
                'max_users' => null, // unlimited
                'max_orders_per_month' => null, // unlimited
                'max_categories' => null, // unlimited
                'max_coupons' => null, // unlimited
                'max_motoboys' => null, // unlimited
                'max_storage_mb' => 10240,
                'max_units' => 10,
                'features' => json_encode([
                    'digital_menu',
                    'whatsapp_orders',
                    'basic_reports',
                    'auto_print',
                    'loyalty_basic',
                    'multiple_payments',
                    'motoboy_management',
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
                'show_watermark' => false,
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('plan_limits')->insert($plans);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_limits');
    }
};
