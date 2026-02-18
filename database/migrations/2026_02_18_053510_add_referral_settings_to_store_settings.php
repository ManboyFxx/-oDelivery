<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('store_settings', 'referral_enabled')) {
                $table->boolean('referral_enabled')->default(false)->after('referral_reward_points');
                $table->unsignedInteger('referral_referrer_points')->default(50)->after('referral_enabled');
                $table->unsignedInteger('referral_referred_points')->default(20)->after('referral_referrer_points');
                $table->unsignedInteger('referral_max_per_customer')->default(10)->after('referral_referred_points');
                $table->unsignedInteger('referral_code_expiry_days')->nullable()->after('referral_max_per_customer');
                $table->decimal('referral_min_order_value', 10, 2)->nullable()->after('referral_code_expiry_days');
            }
        });
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn([
                'referral_enabled',
                'referral_referrer_points',
                'referral_referred_points',
                'referral_max_per_customer',
                'referral_code_expiry_days',
                'referral_min_order_value',
            ]);
        });
    }
};
