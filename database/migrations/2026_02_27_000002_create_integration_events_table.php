<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * FASE 1 – BLINDAGEM: Tabela integration_events
 * 
 * Desacopla o log de falhas de webhook externo da tabela principal de Orders.
 * Permite retentativas isoladas sem poluir o domínio core do pedido.
 * 
 * Fontes suportadas: stripe, evolution, ooprint
 * Status: pending -> processed | failed
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('integration_events', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Tenant owner (nullable para eventos de plataforma como webhooks Stripe de assinatura)
            $table->uuid('tenant_id')->nullable();

            // Origem do evento
            $table->string('source', 50); // stripe | evolution | ooprint | internal

            // Tipo do evento (ex: order.status_changed, payment.invoice.paid)
            $table->string('event_type', 100);

            // Payload completo do evento (JSON imutável)
            $table->json('payload')->nullable();

            // Chave de idempotência para evitar processamento duplo
            $table->string('idempotency_key', 255)->unique()->nullable();

            // Controle de processamento
            $table->enum('status', ['pending', 'processing', 'processed', 'failed'])
                ->default('pending');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->text('error_message')->nullable();

            // Referência opcional ao modelo relacionado
            $table->string('related_type', 100)->nullable(); // ex: App\Models\Order
            $table->uuid('related_id')->nullable();

            $table->timestamps();

            // Índices para queries frequentes
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('set null');

            $table->index(['tenant_id', 'status'], 'ie_tenant_status');
            $table->index(['source', 'event_type'], 'ie_source_event');
            $table->index(['status', 'attempts'], 'ie_status_attempts'); // Para reprocessamento
            $table->index(['related_type', 'related_id'], 'ie_related');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_events');
    }
};
