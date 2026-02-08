<?php

namespace App\Http\Controllers\Api;

use App\Models\PlanLimit;
use Illuminate\Http\JsonResponse;

class PlanController
{
    /**
     * Get all active plans with details
     */
    public function index(): JsonResponse
    {
        $plans = PlanLimit::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn($plan) => [
                'id' => $plan->plan,
                'name' => $plan->display_name,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'yearly_discount' => $plan->yearly_discount,
                'interval' => 'mês',
                'features' => $plan->formatted_features,
            ]);

        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }

    /**
     * Get detailed comparison data for pricing table
     */
    public function comparison(): JsonResponse
    {
        $plans = PlanLimit::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $comparisonFeatures = [
            [
                'name' => 'Cardápio Digital',
                'description' => 'Gerencie seu cardápio online com categorias, preços e imagens.',
                'free' => true,
                'pro' => true,
                'custom' => true,
            ],
            [
                'name' => 'Recebimento de Pedidos',
                'description' => 'Receba pedidos via WhatsApp e painel de administração em tempo real.',
                'free' => true,
                'pro' => true,
                'custom' => true,
            ],
            [
                'name' => 'Produtos Ilimitados',
                'description' => 'Cadastre quantos produtos quiser sem limitações.',
                'free' => false,
                'pro' => true,
                'custom' => true,
            ],
            [
                'name' => 'Usuários da Equipe',
                'description' => 'Convide membros da equipe com diferentes níveis de acesso.',
                'free' => '1 Admin + 2 Funcionários',
                'pro' => '3 Admin + 5 Funcionários',
                'custom' => 'Ilimitados',
            ],
            [
                'name' => 'Gestão de Motoboys',
                'description' => 'Rastreie entregadores em tempo real, atribua pedidos e monitore performance.',
                'free' => false,
                'pro' => true,
                'custom' => true,
            ],
            [
                'name' => 'Impressão Automática (ÓoPrint)',
                'description' => 'Imprima pedidos automaticamente em impressora térmica.',
                'free' => false,
                'pro' => true,
                'custom' => true,
            ],
            [
                'name' => 'Automação WhatsApp (ÓoBot)',
                'description' => 'Automação de mensagens, confirmação de pedidos e notificações.',
                'free' => false,
                'pro' => true,
                'custom' => true,
            ],
            [
                'name' => 'Programa de Fidelidade',
                'description' => 'Crie sistema de pontos, cupons e promoções para fidelizar clientes.',
                'free' => false,
                'pro' => true,
                'custom' => true,
            ],
            [
                'name' => 'Controle de Estoque',
                'description' => 'Controle de quantidade, alertas de baixa quantidade e relatórios.',
                'free' => 'Básico',
                'pro' => 'Avançado',
                'custom' => 'Enterprise',
            ],
            [
                'name' => 'API & Integrações',
                'description' => 'Integre com seus sistemas existentes via API REST.',
                'free' => false,
                'pro' => true,
                'custom' => true,
            ],
            [
                'name' => 'Domínio Personalizado',
                'description' => 'Use seu próprio domínio (ex: loja.seunegocio.com.br) ao invés de oodelivery.com',
                'free' => false,
                'pro' => true,
                'custom' => true,
            ],
            [
                'name' => 'Suporte',
                'description' => 'Acesso a suporte, documentação e comunidade de usuários.',
                'free' => 'Community + FAQ',
                'pro' => 'Prioritário',
                'custom' => 'VIP 24/7',
            ],
        ];

        return response()->json([
            'success' => true,
            'plans' => $plans->map(fn($p) => [
                'id' => $p->plan,
                'name' => $p->display_name,
            ])->toArray(),
            'features' => $comparisonFeatures,
        ]);
    }

    /**
     * Get a single plan by ID
     */
    public function show(string $planId): JsonResponse
    {
        $plan = PlanLimit::where('plan', $planId)
            ->where('is_active', true)
            ->first();

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Plan not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $plan->plan,
                'name' => $plan->display_name,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'yearly_discount' => $plan->yearly_discount,
                'features' => $plan->formatted_features,
                'limits' => [
                    'max_products' => $plan->max_products,
                    'max_users' => $plan->max_users,
                    'max_orders_per_month' => $plan->max_orders_per_month,
                    'max_categories' => $plan->max_categories,
                    'max_coupons' => $plan->max_coupons,
                    'max_motoboys' => $plan->max_motoboys,
                    'max_stock_items' => $plan->max_stock_items,
                    'max_storage_mb' => $plan->max_storage_mb,
                ],
            ]
        ]);
    }
}
