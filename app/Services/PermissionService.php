<?php

namespace App\Services;

use App\Models\TenantRolePermission;
use Illuminate\Support\Facades\Cache;

/**
 * FASE 3 – ARQUITETURA EVOLUTIVA: PBAC (Permission-Based Access Control)
 * @agent @architect + @dev
 * 
 * Verifica se um usuário possui uma permissão específica dentro do tenant.
 * As permissões são cacheadas por 5 minutos para performance.
 * 
 * Permissões padrão:
 *   - orders.view, orders.cancel, orders.update_status
 *   - financial.view, financial.export
 *   - products.create, products.delete
 *   - customers.view, employees.manage
 * 
 * Uso: PermissionService::can($user, 'orders.cancel')
 *      PermissionService::flush($user) // Limpa cache ao alterar permissões
 */
class PermissionService
{
    private const CACHE_TTL = 300; // 5 minutos

    /**
     * Verifica se o usuário tem a permissão no contexto do seu tenant.
     * Super admins têm todas as permissões automaticamente.
     */
    public static function can($user, string $permission): bool
    {
        // Super admin sempre pode tudo
        if ($user->role === 'super_admin') {
            return true;
        }

        // Admin tem tudo dentro do seu tenant por padrão
        // (a menos que o tenant tenha restringido explicitamente)
        if ($user->role === 'admin') {
            return self::checkFromDb($user, $permission, defaultAllow: true);
        }

        // Employee: só pode o que foi explicitamente permitido
        return self::checkFromDb($user, $permission, defaultAllow: false);
    }

    /**
     * Nega acesso e lança 403 se não tiver permissão.
     */
    public static function authorize($user, string $permission): void
    {
        if (!self::can($user, $permission)) {
            abort(403, "Sem permissão para: {$permission}");
        }
    }

    /**
     * Limpa o cache de permissões do usuário (chamar ao alterar permissões).
     */
    public static function flush($user): void
    {
        Cache::forget("perms:{$user->tenant_id}:{$user->role}");
    }

    private static function checkFromDb($user, string $permission, bool $defaultAllow): bool
    {
        // Busca todas as permissões do role deste tenant em cache
        $allPerms = Cache::remember(
            "perms:{$user->tenant_id}:{$user->role}",
            self::CACHE_TTL,
            fn() => TenantRolePermission::where([
                'tenant_id' => $user->tenant_id,
                'role' => $user->role,
            ])->pluck('enabled', 'permission')->toArray()
        );

        // Se tem entrada explícita, usa ela; caso contrário usa o padrão do role
        if (array_key_exists($permission, $allPerms)) {
            return (bool) $allPerms[$permission];
        }

        return $defaultAllow;
    }
}
