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
        Schema::table('store_settings', function (Blueprint $table) {
            // Add missing fields if they don't exist
            if (!Schema::hasColumn('store_settings', 'email')) {
                $table->string('email')->nullable()->after('whatsapp');
            }
            if (!Schema::hasColumn('store_settings', 'estimated_delivery_time')) {
                $table->integer('estimated_delivery_time')->default(30)->after('fixed_delivery_fee');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn(['email', 'estimated_delivery_time']);
        });
    }
};
