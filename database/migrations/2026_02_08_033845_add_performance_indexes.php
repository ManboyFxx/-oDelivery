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
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasIndex('orders', 'orders_tenant_id_created_at_index')) {
                $table->index(['tenant_id', 'created_at'], 'orders_tenant_id_created_at_index');
            }
            if (!Schema::hasIndex('orders', 'orders_tenant_id_status_index')) {
                $table->index(['tenant_id', 'status'], 'orders_tenant_id_status_index');
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasIndex('products', 'products_tenant_id_is_available_index')) {
                $table->index(['tenant_id', 'is_available'], 'products_tenant_id_is_available_index');
            }
            if (!Schema::hasIndex('products', 'products_tenant_id_category_id_index')) {
                $table->index(['tenant_id', 'category_id'], 'products_tenant_id_category_id_index');
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasIndex('categories', 'categories_tenant_id_is_active_index')) {
                $table->index(['tenant_id', 'is_active'], 'categories_tenant_id_is_active_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'created_at']);
            $table->dropIndex(['tenant_id', 'status']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'is_available']);
            $table->dropIndex(['tenant_id', 'category_id']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'is_active']);
        });
    }
};
