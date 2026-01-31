<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Subscription status
            $table->enum('subscription_status', ['trialing', 'active', 'past_due', 'canceled', 'expired'])
                ->default('trialing')
                ->after('plan');

            // Billing info
            $table->enum('billing_cycle', ['monthly', 'yearly'])->default('monthly')->after('subscription_status');
            $table->timestamp('next_billing_date')->nullable()->after('billing_cycle');

            // Stripe integration
            $table->string('stripe_customer_id')->nullable()->after('next_billing_date');
            $table->string('stripe_subscription_id')->nullable()->after('stripe_customer_id');

            // Plan limits (can override plan_limits table)
            $table->integer('max_users')->nullable()->after('stripe_subscription_id');
            $table->integer('max_products')->nullable()->after('max_users');
            $table->integer('max_orders_per_month')->nullable()->after('max_products');
            $table->integer('max_categories')->nullable()->after('max_orders_per_month');
            $table->integer('max_motoboys')->nullable()->after('max_categories');
            $table->integer('max_storage_mb')->nullable()->after('max_motoboys');

            // Features and customization
            $table->json('features')->nullable()->after('max_storage_mb');
            $table->string('custom_domain')->nullable()->after('features');
            $table->boolean('show_watermark')->default(true)->after('custom_domain');

            // Indexes
            $table->index('subscription_status');
            $table->index('stripe_customer_id');
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
