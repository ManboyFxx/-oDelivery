<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * FASE 2 – ESCALA REAL: Analytics por Tenant.
 *
 * Tabela agregadora populada por `php artisan analytics:aggregate` toda noite.
 * Permite dashboards instantâneos sem varrer a tabela `orders` completa.
 *
 * Agente: @data-engineer
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('daily_tenant_revenues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->date('date');

            // Métricas do dia
            $table->unsignedInteger('total_orders')->default(0);
            $table->unsignedInteger('cancelled_orders')->default(0);
            $table->unsignedInteger('delivered_orders')->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->decimal('avg_ticket', 10, 2)->default(0);
            $table->decimal('total_discounts', 10, 2)->default(0);
            $table->decimal('delivery_fees_total', 10, 2)->default(0);

            // Breakdown por modalidade
            $table->unsignedInteger('delivery_orders')->default(0);
            $table->unsignedInteger('pickup_orders')->default(0);
            $table->unsignedInteger('table_orders')->default(0);

            // Pontos de fidelidade do dia
            $table->unsignedInteger('loyalty_points_awarded')->default(0);

            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // Índice único — garante um registro por (tenant + dia)
            $table->unique(['tenant_id', 'date'], 'dtr_tenant_date_unique');
            $table->index(['date'], 'dtr_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_tenant_revenues');
    }
};
