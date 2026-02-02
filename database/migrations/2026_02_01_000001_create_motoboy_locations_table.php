<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('motoboy_locations')) {
            Schema::create('motoboy_locations', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id');
                $table->decimal('latitude', 10, 8);
                $table->decimal('longitude', 11, 8);
                $table->decimal('accuracy', 10, 2)->nullable();
                $table->decimal('speed', 5, 2)->nullable();
                $table->integer('heading')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

                $table->index('user_id');
                $table->index('created_at');
                $table->index(['user_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('motoboy_locations');
    }
};
