<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->bigInteger('order_number');
            $table->enum('mode', ['delivery', 'pickup', 'table']);
            $table->enum('status', ['new', 'confirmed', 'preparing', 'ready', 'waiting_motoboy', 'motoboy_accepted', 'out_for_delivery', 'delivered', 'ready_for_pickup', 'completed', 'cancelled'])->default('new');
            $table->uuid('customer_id')->nullable();
            $table->uuid('address_id')->nullable();
            $table->uuid('table_id')->nullable();
            $table->uuid('motoboy_id')->nullable();
            $table->uuid('coupon_id')->nullable();
            $table->uuid('created_by')->nullable();

            // Valores
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->decimal('service_fee', 10, 2)->default(0);
            $table->decimal('tip', 10, 2)->default(0);
            $table->decimal('total', 10, 2);

            // Pagamento
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'cancelled'])->default('pending');
            $table->decimal('change_for', 10, 2)->nullable();

            // Detalhes
            $table->text('notes')->nullable();
            $table->text('customer_name')->nullable();
            $table->text('customer_phone')->nullable();
            $table->text('delivery_address')->nullable();
            $table->integer('estimated_time_minutes')->nullable();

            // Fidelidade
            $table->integer('loyalty_points_earned')->default(0);
            $table->integer('loyalty_points_used')->default(0);

            // Timestamps especiais
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
            $table->foreign('table_id')->references('id')->on('tables')->nullOnDelete();
            $table->foreign('coupon_id')->references('id')->on('coupons')->nullOnDelete();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
