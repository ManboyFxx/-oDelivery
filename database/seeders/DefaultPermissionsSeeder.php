<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\TenantRolePermission;
use Illuminate\Database\Seeder;

/**
 * FASE 3 – PBAC: Permissões padrão por role
 * 
 * Popula permissões atômicas para cada tenant existente.
 * Idempotente: usa updateOrCreate para evitar duplicatas.
 * 
 * Para rodar: php artisan db:seed --class=DefaultPermissionsSeeder
 */
class DefaultPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $adminPermissions = [
            'orders.view',
            'orders.cancel',
            'orders.update_status',
            'financial.view',
            'financial.export',
            'products.create',
            'products.delete',
            'customers.view',
            'employees.manage',
        ];

        $employeePermissions = [
            'orders.view' => 1,
            'orders.update_status' => 1,
            'products.create' => 1,
            // Desabilitadas por padrão para employee
            'orders.cancel' => 0,
            'financial.view' => 0,
            'financial.export' => 0,
            'products.delete' => 0,
            'customers.view' => 0,
            'employees.manage' => 0,
        ];

        Tenant::all()->each(function (Tenant $tenant) use ($adminPermissions, $employeePermissions) {
            // Admin: tudo habilitado
            foreach ($adminPermissions as $permission) {
                TenantRolePermission::updateOrCreate(
                    ['tenant_id' => $tenant->id, 'role' => 'admin', 'permission' => $permission],
                    ['enabled' => 1]
                );
            }

            // Employee: permissões granulares
            foreach ($employeePermissions as $permission => $enabled) {
                TenantRolePermission::updateOrCreate(
                    ['tenant_id' => $tenant->id, 'role' => 'employee', 'permission' => $permission],
                    ['enabled' => $enabled]
                );
            }

            $this->command->info("✓ Permissões configuradas para tenant: {$tenant->slug}");
        });
    }
}
