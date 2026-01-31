<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantExists
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->tenant) {
            return abort(403, 'Acesso não permitido. Apenas usuários de tenants podem acessar este recurso.');
        }

        return $next($request);
    }
}
