<?php

namespace App\Http\Middleware;

use App\Services\PermissionService;
use Closure;
use Illuminate\Http\Request;

/**
 * FASE 3 – PBAC
 * 
 * Middleware que valida se o usuário autenticado possui a permissão necessária.
 * 
 * Uso nas rotas:
 *   ->middleware('permission:orders.cancel')
 *   ->middleware('permission:financial.view')
 */
class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): mixed
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Não autenticado.');
        }

        if (!PermissionService::can($user, $permission)) {
            abort(403, "Sem permissão para executar esta ação ({$permission}).");
        }

        return $next($request);
    }
}
