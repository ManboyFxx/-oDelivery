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
        Schema::create('plan_coupons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->enum('discount_type', ['percentage', 'fixed']);
            $table->decimal('discount_value', 10, 2);
            $table->integer('max_uses')->nullable(); // Null = unlimited
            $table->integer('current_uses')->default(0);
            $table->timestamp('valid_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('plan_restriction')->nullable(); // Null = all plans
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_coupons');
    }
};
