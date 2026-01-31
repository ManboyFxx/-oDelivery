<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('motoboy_location_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('motoboy_id');
            $table->uuid('order_id')->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->timestamps();

            $table->foreign('motoboy_id')->references('id')->on('users');
            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();

            $table->index(['motoboy_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('motoboy_location_history');
    }
};
