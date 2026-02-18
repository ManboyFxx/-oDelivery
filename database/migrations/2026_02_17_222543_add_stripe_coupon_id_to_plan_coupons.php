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
        Schema::table('plan_coupons', function (Blueprint $table) {
            $table->string('stripe_coupon_id')->nullable()->after('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_coupons', function (Blueprint $table) {
            $table->dropColumn('stripe_coupon_id');
        });
    }
};
