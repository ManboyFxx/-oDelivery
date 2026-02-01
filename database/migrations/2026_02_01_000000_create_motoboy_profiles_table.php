<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('motoboy_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('user_id')->unique();
            $table->enum('vehicle_type', ['motorcycle', 'bicycle', 'car', 'other'])->default('motorcycle');
            $table->string('vehicle_brand')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('plate_number')->nullable();
            $table->boolean('documents_verified')->default(false);
            $table->text('cpf')->nullable();
            $table->text('rg')->nullable();
            $table->text('cnh')->nullable();
            $table->date('cnh_validity')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_agency')->nullable();
            $table->text('bank_account')->nullable();
            $table->enum('bank_account_type', ['checking', 'savings'])->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('total_deliveries')->default(0);
            $table->decimal('acceptance_rate', 5, 2)->default(100);
            $table->decimal('total_earnings', 12, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->index('tenant_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('motoboy_profiles');
    }
};
