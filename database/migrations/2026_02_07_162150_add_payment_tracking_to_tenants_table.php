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
            // Payment method tracking
            $table->enum('payment_method', ['credit_card', 'pix', 'boleto', 'none'])->default('none')->after('subscription_status');

            // Payment retry tracking
            $table->integer('payment_retry_count')->default(0)->after('payment_method');
            $table->timestamp('last_payment_attempt_at')->nullable()->after('payment_retry_count');

            // Checkout abandonment tracking
            $table->timestamp('checkout_abandoned_at')->nullable()->after('last_payment_attempt_at');
            $table->string('checkout_abandoned_plan')->nullable()->after('checkout_abandoned_at');

            // Additional payment metadata
            $table->text('payment_failure_reason')->nullable()->after('checkout_abandoned_plan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'payment_retry_count',
                'last_payment_attempt_at',
                'checkout_abandoned_at',
                'checkout_abandoned_plan',
                'payment_failure_reason',
            ]);
        });
    }
};
