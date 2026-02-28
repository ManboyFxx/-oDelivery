<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * FASE 1 – BLINDAGEM: Upgrade audit_logs
 * 
 * O trait Auditable já grava ip_address e user_agent no AuditLog::create(),
 * mas a migration original não tinha essas colunas, causando writes silenciosos.
 * Esta migration adiciona as colunas faltantes com segurança (hasColumn guard).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('audit_logs', 'ip_address')) {
                $table->string('ip_address', 45)->nullable()->after('new_values');
            }
            if (!Schema::hasColumn('audit_logs', 'user_agent')) {
                $table->text('user_agent')->nullable()->after('ip_address');
            }
            // Índice composto para queries por tenant + período
            if (!Schema::hasIndex('audit_logs', 'audit_logs_tenant_id_created_at_index')) {
                $table->index(['tenant_id', 'created_at'], 'audit_logs_tenant_id_created_at_index');
            }
            // Índice para busca por entidade auditada dentro do tenant
            if (!Schema::hasIndex('audit_logs', 'audit_logs_tenant_id_action_index')) {
                $table->index(['tenant_id', 'action'], 'audit_logs_tenant_id_action_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn(['ip_address', 'user_agent']);
            $table->dropIndex('audit_logs_tenant_id_created_at_index');
            $table->dropIndex('audit_logs_tenant_id_action_index');
        });
    }
};
