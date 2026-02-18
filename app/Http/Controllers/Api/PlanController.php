<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanLimit;
use Illuminate\Http\JsonResponse;

class PlanController extends Controller
{
    /**
     * Get all active plans.
     * Returns only the unified plan.
     */
    public function index(): JsonResponse
    {
        // Retorna apenas o plano unificado
        $plan = PlanLimit::where('plan', 'unified')
            ->where('is_active', true)
            ->first();

        if (!$plan) {
            return response()->json([
                'error' => 'Plano não encontrado'
            ], 404);
        }

        return response()->json([
            'plan' => [
                'id' => $plan->plan,
                'name' => $plan->display_name,
                'price' => $plan->price_monthly,
                'interval' => 'mês',
                'features' => $plan->formatted_features,
            ]
        ]);
    }

    /**
     * Get a specific plan by slug.
     */
    public function show(string $planSlug): JsonResponse
    {
        // Sempre retorna o plano unificado
        $plan = PlanLimit::where('plan', 'unified')
            ->where('is_active', true)
            ->first();

        if (!$plan) {
            return response()->json([
                'error' => 'Plano não encontrado'
            ], 404);
        }

        return response()->json([
            'plan' => [
                'id' => $plan->plan,
                'name' => $plan->display_name,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'features' => $plan->formatted_features,
                'limits' => [
                    'products' => $plan->formatLimit('max_products'),
                    'users' => $plan->formatLimit('max_users'),
                    'orders' => $plan->formatLimit('max_orders_per_month'),
                    'categories' => $plan->formatLimit('max_categories'),
                    'coupons' => $plan->formatLimit('max_coupons'),
                    'motoboys' => $plan->formatLimit('max_motoboys'),
                    'stock_items' => $plan->formatLimit('max_stock_items'),
                ],
            ]
        ]);
    }
}
