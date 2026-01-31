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
            $table->timestamp('preparation_started_at')->nullable()->after('status');
            $table->timestamp('estimated_ready_at')->nullable()->after('preparation_started_at');
            $table->integer('preparation_time_minutes')->default(30)->after('estimated_ready_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['preparation_started_at', 'estimated_ready_at', 'preparation_time_minutes']);
        });
    }
};
