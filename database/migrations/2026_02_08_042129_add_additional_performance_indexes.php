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
            // Composite index for filtering by tenant and customer
            if (!Schema::hasIndex('orders', 'idx_orders_customer_tenant')) {
                $table->index(['customer_id', 'tenant_id'], 'idx_orders_customer_tenant');
            }

            // Index for payment queries
            if (!Schema::hasIndex('orders', 'idx_orders_payment_status')) {
                $table->index(['tenant_id', 'payment_status'], 'idx_orders_payment_status');
            }
        });

        Schema::table('customers', function (Blueprint $table) {
            // Index for phone lookup (used in authentication)
            if (!Schema::hasIndex('customers', 'idx_customers_phone')) {
                $table->index('phone', 'idx_customers_phone');
            }

            // Index for loyalty queries
            if (!Schema::hasIndex('customers', 'idx_customers_loyalty')) {
                $table->index(['tenant_id', 'loyalty_tier'], 'idx_customers_loyalty');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            // Index for order items lookup
            if (!Schema::hasIndex('order_items', 'idx_order_items_order_product')) {
                $table->index(['order_id', 'product_id'], 'idx_order_items_order_product');
            }
        });

        Schema::table('customer_addresses', function (Blueprint $table) {
            // Index for customer addresses
            if (!Schema::hasIndex('customer_addresses', 'idx_customer_addresses_customer')) {
                $table->index('customer_id', 'idx_customer_addresses_customer');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_customer_tenant');
            $table->dropIndex('idx_orders_payment_status');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('idx_customers_phone');
            $table->dropIndex('idx_customers_loyalty');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_product');
        });

        Schema::table('customer_addresses', function (Blueprint $table) {
            $table->dropIndex('idx_customer_addresses_customer');
        });
    }
};
