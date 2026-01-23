<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('employee_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('employee_id');
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['salary', 'advance', 'bonus', 'commission']);
            $table->text('description')->nullable();
            $table->date('reference_date');
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('employee_id')->references('id')->on('users');
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_payments');
    }
};
