<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanLimits
{
    /**
     * Handle an incoming request.
     *
     * @param string $resource The resource type to check (products, users, categories, etc.)
     */
    public function handle(Request $request, Closure $next, string $resource): Response
    {
        // ✅ PLANO UNIFICADO - Sem limites
        // Todos os recursos são ilimitados no plano único
        return $next($request);

        /* CÓDIGO ANTIGO DESABILITADO - Mantido para referência
        $user = $request->user();

        if (!$user || !$user->tenant) {
            return $next($request);
        }

        $tenant = $user->tenant;

        // Only check on POST/PUT requests (creating/updating)
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            return $next($request);
        }

        // For updates, we don't need to check limits (only for creation)
        if ($request->route()->parameter($resource) || $request->route()->parameter('id')) {
            return $next($request);
        }

        // Check if tenant can add more of this resource
        if (!$tenant->canAdd($resource)) {
            $limit = $tenant->getLimit("max_{$resource}");
            $planName = $tenant->plan_display_name;

            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'limit_reached',
                    'message' => $this->getLimitMessage($resource, $limit, $planName),
                    'resource' => $resource,
                    'limit' => $limit,
                    'upgrade_url' => route('subscription.upgrade'),
                ], 403);
            }

            return back()->withErrors([
                'limit' => $this->getLimitMessage($resource, $limit, $planName),
            ]);
        }

        return $next($request);
        */
    }

    /**
     * Get a user-friendly message for the limit.
     */
    protected function getLimitMessage(string $resource, int $limit, string $planName): string
    {
        $messages = [
            'products' => "Você atingiu o limite de {$limit} produtos do plano {$planName}.",
            'users' => "Você atingiu o limite de {$limit} usuários do plano {$planName}.",
            'categories' => "Você atingiu o limite de {$limit} categorias do plano {$planName}.",
            'coupons' => "Você atingiu o limite de {$limit} cupons ativos do plano {$planName}.",
            'motoboys' => "Você atingiu o limite de {$limit} motoboys do plano {$planName}.",
            'orders' => "Você atingiu o limite de {$limit} pedidos/mês do plano {$planName}.",
        ];

        return $messages[$resource] ?? "Você atingiu o limite do seu plano.";
    }
}
