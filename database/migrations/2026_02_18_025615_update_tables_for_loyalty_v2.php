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
            $table->decimal('loyalty_points_multiplier', 5, 2)->default(1.0)->after('price');
        });

        Schema::table('store_settings', function (Blueprint $table) {
            $table->integer('loyalty_expiry_days')->nullable()->after('loyalty_tiers');
            $table->integer('referral_bonus_points')->default(0)->after('loyalty_expiry_days');
            $table->integer('referral_reward_points')->default(0)->after('referral_bonus_points');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->string('referral_code')->unique()->nullable()->after('loyalty_points');
            $table->uuid('referred_by')->nullable()->after('referral_code');
            $table->foreign('referred_by')->references('id')->on('customers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('loyalty_points_multiplier');
        });

        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn(['loyalty_expiry_days', 'referral_bonus_points', 'referral_reward_points']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['referred_by']);
            $table->dropColumn(['referral_code', 'referred_by']);
        });
    }
};
