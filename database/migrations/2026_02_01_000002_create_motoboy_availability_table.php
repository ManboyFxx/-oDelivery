<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('motoboy_availability')) {
            Schema::create('motoboy_availability', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id')->unique();
                $table->boolean('is_online')->default(false);
                $table->enum('availability_status', ['available', 'on_delivery', 'break', 'offline'])->default('offline');
                $table->timestamp('last_activity_at')->nullable();
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

                $table->index('is_online');
                $table->index('availability_status');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('motoboy_availability');
    }
};
