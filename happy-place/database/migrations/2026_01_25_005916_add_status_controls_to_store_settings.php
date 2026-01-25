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
            $table->string('status_override')->nullable()->comment('open, closed, or null (auto)');
            $table->boolean('is_delivery_paused')->default(false);
            $table->timestamp('paused_until')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn(['status_override', 'is_delivery_paused', 'paused_until']);
        });
    }
};
