<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->enum('method', ['cash', 'credit_card', 'debit_card', 'pix', 'loyalty_points']);
            $table->decimal('amount', 10, 2);
            $table->decimal('change_amount', 10, 2)->nullable();
            $table->string('external_id')->nullable();
            $table->text('qr_code')->nullable();
            $table->text('qr_code_base64')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
