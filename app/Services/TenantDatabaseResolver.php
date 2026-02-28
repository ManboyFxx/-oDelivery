<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Config;

/**
 * FASE 3 – ARQUITETURA EVOLUTIVA: Multi-DB Híbrida
 * @agent @data-engineer
 * 
 * Resolve qual conexão de banco de dados usar para um dado Tenant.
 * Tenants comuns usam o banco compartilhado ('mysql').
 * Tenants Enterprise (franquias, grandes redes) podem ter DB dedicado
 * configurado via painel, sendo roteados automaticamente.
 * 
 * Esta infraestrutura existe para o futuro Enterprise tier.
 * Hoje todos os tenants usam o DB compartilhado.
 */
class TenantDatabaseResolver
{
    /**
     * Retorna o nome da conexão Eloquent para o tenant.
     */
    public static function resolve(Tenant $tenant): string
    {
        if (
            $tenant->dedicated_db_host
            && $tenant->dedicated_db_name
            && $tenant->dedicated_db_user
        ) {
            // Injeta conexão dinâmica no runtime
            Config::set('database.connections.tenant_dedicated', [
                'driver' => 'mysql',
                'host' => $tenant->dedicated_db_host,
                'port' => $tenant->dedicated_db_port ?? 3306,
                'database' => $tenant->dedicated_db_name,
                'username' => $tenant->dedicated_db_user,
                'password' => self::decryptPassword($tenant->dedicated_db_password),
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
            ]);

            return 'tenant_dedicated';
        }

        // Todos os tenants comuns usam o banco compartilhado
        return config('database.default', 'mysql');
    }

    private static function decryptPassword(?string $encrypted): string
    {
        if (empty($encrypted))
            return '';
        try {
            return decrypt($encrypted);
        } catch (\Throwable) {
            return $encrypted; // Fallback se não estiver criptografado ainda
        }
    }
}
