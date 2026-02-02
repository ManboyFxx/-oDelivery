<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasIndex('products', 'products_tenant_available_index')) {
                $table->index(['tenant_id', 'is_available'], 'products_tenant_available_index');
            }
            if (!Schema::hasIndex('products', 'products_tenant_featured_index')) {
                $table->index(['tenant_id', 'is_featured'], 'products_tenant_featured_index');
            }
            if (!Schema::hasIndex('products', 'products_category_index')) {
                $table->index(['category_id'], 'products_category_index');
            }
        });

        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasIndex('customers', 'customers_tenant_phone_index')) {
                $table->index(['tenant_id', 'phone'], 'customers_tenant_phone_index');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasIndex('order_items', 'order_items_order_id_index')) {
                $table->index('order_id', 'order_items_order_id_index');
            }
        });

        Schema::table('motoboy_location_history', function (Blueprint $table) {
            if (!Schema::hasIndex('motoboy_location_history', 'location_history_motoboy_time_index')) {
                $table->index(['user_id', 'created_at'], 'location_history_motoboy_time_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_tenant_available_index');
            $table->dropIndex('products_tenant_featured_index');
            $table->dropIndex('products_category_index');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('customers_tenant_phone_index');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('order_items_order_id_index');
        });

        Schema::table('motoboy_location_history', function (Blueprint $table) {
            $table->dropIndex('location_history_motoboy_time_index');
        });
    }
};
