<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * FASE 3 – PBAC
 * Model para permissões granulares por tenant e role.
 */
class TenantRolePermission extends Model
{
    protected $fillable = [
        'tenant_id',
        'role',
        'permission',
        'enabled',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];
}
