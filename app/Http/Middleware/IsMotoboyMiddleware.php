<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsMotoboyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar se o usuário está autenticado
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        // Verificar se o usuário é um motoboy
        if (!$user->isMotoboy()) {
            abort(403, 'Acesso restrito a entregadores.');
        }

        // Verificar se o usuário está ativo
        if (!$user->is_active) {
            abort(403, 'Sua conta foi desativada.');
        }

        return $next($request);
    }
}
