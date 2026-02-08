<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $resource): Response
    {
        $tenant = auth()->user()->tenant;

        if (!$tenant) {
            return redirect()->route('login');
        }

        // Check if tenant can add more of this resource
        if (!$tenant->canAdd($resource)) {
            $limit = $tenant->getLimit("max_{$resource}");
            $resourceName = $this->getResourceDisplayName($resource);

            return back()->with('error', "Limite de {$limit} {$resourceName} atingido. Faça upgrade para o Plano Pro para continuar!");
        }

        return $next($request);
    }

    /**
     * Get display name for resource
     */
    private function getResourceDisplayName(string $resource): string
    {
        return match ($resource) {
            'products' => 'produtos',
            'users' => 'usuários',
            'motoboys' => 'motoboys',
            'categories' => 'categorias',
            'coupons' => 'cupons',
            default => $resource,
        };
    }
}
