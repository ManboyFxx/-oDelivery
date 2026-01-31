<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use Symfony\Component\HttpFoundation\Response;

class TenantScopeMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Obter tenant via slug da session (definido no login)
        $tenantSlug = session('current_tenant_slug');

        if (!$tenantSlug) {
            // Tentar obter do referer (fallback)
            $referer = $request->headers->get('referer');
            if ($referer && preg_match('/\/([^\/]+)\/menu/', $referer, $matches)) {
                $tenantSlug = $matches[1];
                session(['current_tenant_slug' => $tenantSlug]);
            } else {
                return response()->json(['error' => 'Sessão inválida. Por favor, acesse o menu novamente.'], 400);
            }
        }

        $tenant = Tenant::where('slug', $tenantSlug)->first();

        if (!$tenant) {
            return response()->json(['error' => 'Loja não encontrada'], 404);
        }

        // Armazenar tenant no request para uso nos controllers
        $request->merge(['validated_tenant_id' => $tenant->id]);
        $request->attributes->set('tenant', $tenant);

        return $next($request);
    }
}
