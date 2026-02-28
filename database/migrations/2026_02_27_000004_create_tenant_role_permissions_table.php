<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * FASE 3 – PBAC: Permissões Granulares por Tenant/Role
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenant_role_permissions', function (Blueprint $table) {
            $table->id();
            $table->char('tenant_id', 36); // UUID
            $table->string('role', 50);           // 'admin', 'employee'
            $table->string('permission', 100);    // 'orders.cancel', 'financial.view'
            $table->tinyInteger('enabled')->default(1);
            $table->timestamps();

            $table->index(['tenant_id', 'role']);
            $table->unique(['tenant_id', 'role', 'permission']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_role_permissions');
    }
};
