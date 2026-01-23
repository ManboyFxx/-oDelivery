<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo_url')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->json('address')->nullable();
            $table->json('operating_hours')->nullable();
            $table->string('timezone')->default('America/Sao_Paulo');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_open')->default(true);
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
            $table->string('plan')->default('free');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
