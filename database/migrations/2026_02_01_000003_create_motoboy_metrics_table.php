<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('motoboy_metrics')) {
            Schema::create('motoboy_metrics', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('tenant_id');
                $table->uuid('user_id');
                $table->enum('period', ['daily', 'weekly', 'monthly'])->default('daily');
                $table->date('metric_date');
                $table->integer('deliveries_completed')->default(0);
                $table->integer('deliveries_failed')->default(0);
                $table->decimal('average_rating', 3, 2)->default(0);
                $table->decimal('total_earnings', 12, 2)->default(0);
                $table->decimal('distance_traveled_km', 10, 2)->default(0);
                $table->integer('average_time_minutes')->default(0);
                $table->timestamps();

                $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

                $table->unique(['user_id', 'period', 'metric_date']);
                $table->index('tenant_id');
                $table->index('user_id');
                $table->index('metric_date');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('motoboy_metrics');
    }
};
