<?php

namespace App\Http\Middleware;

use App\Services\TenantDatabaseResolver;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * FASE 3 – Multi-DB: Roteia requests de tenants Enterprise para seu DB dedicado.
 * 
 * Deve ser adicionado no grupo 'web' autenticado no bootstrap/app.php
 * Runs após auth para ter acesso ao usuário e seu tenant.
 */
class ResolveTenantDatabase
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $user = $request->user();

            if ($user && $user->tenant_id) {
                $tenant = $user->tenant ?? \App\Models\Tenant::find($user->tenant_id);

                if ($tenant) {
                    $connection = TenantDatabaseResolver::resolve($tenant);

                    if ($connection !== config('database.default', 'mysql')) {
                        DB::setDefaultConnection($connection);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error('ResolveTenantDatabase: falha ao resolver DB do tenant', [
                'user_id' => $request->user()?->id,
                'tenant_id' => $request->user()?->tenant_id,
                'error' => $e->getMessage(),
            ]);
            // Não bloqueia o request — fallback para DB padrão
        }

        return $next($request);
    }
}
