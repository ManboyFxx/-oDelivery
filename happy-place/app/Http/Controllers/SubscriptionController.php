<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        return Inertia::render('Subscription/Index', [
            // 'tenant' => auth()->user()->tenant, (Removed to use global shared prop)
            // Add plans later when integrating Stripe
            'plans' => [
                [
                    'id' => 'free',
                    'name' => 'Gratuito',
                    'price' => 0,
                    'interval' => 'mês',
                    'features' => ['100 Produtos', 'Pedidos ilimitados', 'Cardápio Digital', 'Impressão Automática', 'Fidelidade'],
                    'current' => auth()->user()->tenant->plan === 'free',
                ],
                [
                    'id' => 'price_basic',
                    'name' => 'Básico',
                    'price' => 79.90,
                    'interval' => 'mês',
                    'features' => ['Tudo do Gratuito +', 'Robô WhatsApp (ÓoBot)', 'Sistema de Motoboys', 'Múltiplas Unidades', 'Suporte Prioritário'],
                    'current' => auth()->user()->tenant->plan === 'basic',
                ],
                [
                    'id' => 'price_pro',
                    'name' => 'Pro',
                    'price' => 149.90,
                    'interval' => 'mês',
                    'features' => ['Tudo do Básico +', 'Produtos Ilimitados', 'Usuários Ilimitados', 'Remoção de marca d\'água', 'Onboarding Dedicado'],
                    'current' => auth()->user()->tenant->plan === 'pro',
                ]
            ]
        ]);
    }
}
