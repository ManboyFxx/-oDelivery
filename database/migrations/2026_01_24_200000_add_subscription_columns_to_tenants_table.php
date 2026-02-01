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
        Schema::table('tenants', function (Blueprint $table) {
            // Subscription status
            if (!Schema::hasColumn('tenants', 'subscription_status')) {
                $table->enum('subscription_status', ['trialing', 'active', 'past_due', 'canceled', 'expired'])
                    ->default('trialing')
                    ->after('plan');
            }

            // Billing info
            if (!Schema::hasColumn('tenants', 'billing_cycle')) {
                $table->enum('billing_cycle', ['monthly', 'yearly'])->default('monthly')->after('subscription_status');
            }
            if (!Schema::hasColumn('tenants', 'next_billing_date')) {
                $table->timestamp('next_billing_date')->nullable()->after('billing_cycle');
            }

            // Stripe integration
            if (!Schema::hasColumn('tenants', 'stripe_customer_id')) {
                $table->string('stripe_customer_id')->nullable()->after('next_billing_date');
            }
            if (!Schema::hasColumn('tenants', 'stripe_subscription_id')) {
                $table->string('stripe_subscription_id')->nullable()->after('stripe_customer_id');
            }

            // Plan limits (can override plan_limits table)
            if (!Schema::hasColumn('tenants', 'max_users')) {
                $table->integer('max_users')->nullable()->after('stripe_subscription_id');
            }
            if (!Schema::hasColumn('tenants', 'max_products')) {
                $table->integer('max_products')->nullable()->after('max_users');
            }
            if (!Schema::hasColumn('tenants', 'max_orders_per_month')) {
                $table->integer('max_orders_per_month')->nullable()->after('max_products');
            }
            if (!Schema::hasColumn('tenants', 'max_categories')) {
                $table->integer('max_categories')->nullable()->after('max_orders_per_month');
            }
            if (!Schema::hasColumn('tenants', 'max_motoboys')) {
                $table->integer('max_motoboys')->nullable()->after('max_categories');
            }
            if (!Schema::hasColumn('tenants', 'max_storage_mb')) {
                $table->integer('max_storage_mb')->nullable()->after('max_motoboys');
            }

            // Features and customization
            if (!Schema::hasColumn('tenants', 'features')) {
                $table->json('features')->nullable()->after('max_storage_mb');
            }
            if (!Schema::hasColumn('tenants', 'custom_domain')) {
                $table->string('custom_domain')->nullable()->after('features');
            }
            if (!Schema::hasColumn('tenants', 'show_watermark')) {
                $table->boolean('show_watermark')->default(true)->after('custom_domain');
            }

            // Indexes
            if (!Schema::hasColumn('tenants', 'subscription_status_index')) { // Check index existence simplified
                try {
                    $table->index('subscription_status');
                } catch (\Exception $e) {
                }
            }
            if (!Schema::hasColumn('tenants', 'stripe_customer_id_index')) {
                try {
                    $table->index('stripe_customer_id');
                } catch (\Exception $e) {
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex(['subscription_status']);
            $table->dropIndex(['stripe_customer_id']);

            $table->dropColumn([
                'subscription_status',
                'billing_cycle',
                'next_billing_date',
                'stripe_customer_id',
                'stripe_subscription_id',
                'max_orders_per_month',
                'max_categories',
                'max_motoboys',
                'max_storage_mb',
                'features',
                'custom_domain',
                'show_watermark',
            ]);
        });
    }
};
