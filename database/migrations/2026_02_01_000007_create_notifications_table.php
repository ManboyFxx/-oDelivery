<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id');
                $table->string('title');
                $table->text('message');
                $table->string('type')->default('system'); // order, delivery, location, arrived, system
                $table->string('icon')->nullable();
                $table->string('color')->nullable();
                $table->json('data')->nullable();
                $table->string('action_url')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->index(['user_id', 'read_at']);
                $table->index(['user_id', 'created_at']);
                $table->index('type');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
