<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforcePlanLimits
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $limitType)
    {
        $tenant = auth()->user()->tenant;

        // Fetch current plan limits
        $plan = \App\Models\PlanLimit::where('plan', $tenant->plan)->first();

        if (!$plan) {
            return $next($request);
        }

        $limitReached = false;
        $max = 0;
        $current = 0;
        $entityName = '';

        switch ($limitType) {
            case 'products':
                if (!is_null($plan->max_products)) {
                    $current = $tenant->products()->count();
                    $max = $plan->max_products;
                    if ($current >= $max)
                        $limitReached = true;
                    $entityName = 'produtos';
                }
                break;

            case 'users':
                if (!is_null($plan->max_users)) {
                    $current = $tenant->users()->count();
                    $max = $plan->max_users;
                    if ($current >= $max)
                        $limitReached = true;
                    $entityName = 'usuários da equipe';
                }
                break;

            case 'orders':
                // Check monthly orders
                if (!is_null($plan->max_orders_per_month)) {
                    $current = $tenant->orders()->whereMonth('created_at', now()->month)->count();
                    $max = $plan->max_orders_per_month;
                    if ($current >= $max)
                        $limitReached = true;
                    $entityName = 'pedidos este mês';
                }
                break;

            case 'motoboys':
                $max = $plan->max_motoboys;
                if (is_null($max))
                    break; // Unlimited

                $current = $tenant->users()->where('role', 'motoboy')->count();
                if ($current >= $max) {
                    $limitReached = true;
                    $entityName = 'motoboys';
                }
                break;

            case 'stock':
                if (!is_null($plan->max_stock_items)) {
                    if (class_exists(\App\Models\Ingredient::class)) {
                        $current = \App\Models\Ingredient::where('tenant_id', $tenant->id)->count();
                        $max = $plan->max_stock_items;
                        if ($current >= $max)
                            $limitReached = true;
                        $entityName = 'itens de estoque';
                    }
                }
                break;

            case 'coupons':
                if (!is_null($plan->max_coupons)) {
                    $current = $tenant->coupons()->where('is_active', true)->count();
                    $max = $plan->max_coupons;
                    if ($current >= $max)
                        $limitReached = true;
                    $entityName = 'cupons ativos';
                }
                break;
        }

        if ($limitReached) {
            // Check if we accept JSON or redirect
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => "Seu plano atingiu o limite de {$max} {$entityName}. Faça upgrade para continuar.",
                    'limit_reached' => true,
                    'upgrade_url' => route('subscription.index')
                ], 403);
            }

            return redirect()->route('subscription.index')
                ->with('error', "Seu plano atingiu o limite de {$max} {$entityName}. Faça upgrade para continuar.");
        }

        return $next($request);
    }
}
