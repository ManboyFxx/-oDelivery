<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthPrinterToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Token não fornecido'], 401);
        }

        // Busca o tenant pelo token da impressora (comparando o hash)
        $hashedToken = hash('sha256', $token);
        $tenant = Tenant::where('printer_token', $hashedToken)->first();

        if (!$tenant) {
            return response()->json(['message' => 'Token inválido'], 401);
        }

        if (!$tenant->is_active) {
            return response()->json(['message' => 'Estabelecimento inativo'], 403);
        }

        // Injeta o tenant na requisição para fácil acesso no controller
        $request->merge(['tenant' => $tenant]);

        // Também define o tenant_id no request para compatibilidade
        $request->merge(['tenant_id' => $tenant->id]);

        return $next($request);
    }
}
