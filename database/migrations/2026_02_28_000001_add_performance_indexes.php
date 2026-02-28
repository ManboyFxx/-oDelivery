<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * FASE 4 – Produção-Grade: Indexes de performance
 * 
 * Impacto: As queries mais executadas do sistema (listagem de pedidos por tenant,
 * produtos ativos, clientes recentes) ganham índices compostos para eliminar
 * full table scans em bancos com milhares de registros.
 */
return new class extends Migration {
    public function up(): void
    {
        // ORDERS: tenant + status (Query mais crítica do Kanban Board)
        Schema::table('orders', function (Blueprint $table) {
            if (!$this->indexExists('orders', 'idx_orders_tenant_status')) {
                $table->index(['tenant_id', 'status'], 'idx_orders_tenant_status');
            }
            if (!$this->indexExists('orders', 'idx_orders_tenant_created')) {
                $table->index(['tenant_id', 'created_at'], 'idx_orders_tenant_created');
            }
        });

        // PRODUCTS: tenant + disponibilidade (Query do menu público)
        Schema::table('products', function (Blueprint $table) {
            if (!$this->indexExists('products', 'idx_products_tenant_available')) {
                $table->index(['tenant_id', 'is_available'], 'idx_products_tenant_available');
            }
        });

        // CUSTOMERS: tenant + data de criação (Query de relatórios)
        Schema::table('customers', function (Blueprint $table) {
            if (!$this->indexExists('customers', 'idx_customers_tenant_created')) {
                $table->index(['tenant_id', 'created_at'], 'idx_customers_tenant_created');
            }
        });

        // AUDIT LOGS: tenant + action (Queries de compliance)
        Schema::table('audit_logs', function (Blueprint $table) {
            if (!$this->indexExists('audit_logs', 'idx_audit_tenant_action')) {
                $table->index(['tenant_id', 'action'], 'idx_audit_tenant_action');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndexIfExists('idx_orders_tenant_status');
            $table->dropIndexIfExists('idx_orders_tenant_created');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndexIfExists('idx_products_tenant_available');
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndexIfExists('idx_customers_tenant_created');
        });
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndexIfExists('idx_audit_tenant_action');
        });
    }

    private function indexExists(string $table, string $index): bool
    {
        return collect(\Illuminate\Support\Facades\DB::select(
            "SHOW INDEX FROM `{$table}` WHERE Key_name = ?",
            [$index]
        ))->isNotEmpty();
    }
};
