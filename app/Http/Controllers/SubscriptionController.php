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
                    'features' => [
                        ['text' => '30 produtos', 'included' => true],
                        ['text' => '2 usuários', 'included' => true],
                        ['text' => 'Até 300 pedidos/mês', 'included' => true],
                        ['text' => '8 categorias', 'included' => true],
                        ['text' => '3 cupons ativos', 'included' => true],
                        ['text' => 'Cardápio digital', 'included' => true],
                        ['text' => 'Programa de fidelidade básico', 'included' => true],
                        ['text' => 'Múltiplas formas de pagamento', 'included' => true],
                        ['text' => 'Relatórios básicos (30 dias)', 'included' => true],
                        ['text' => 'Gestão de motoboys', 'included' => false],
                        ['text' => 'Impressão automática (ÓoPrint)', 'included' => false],
                        ['text' => 'Robô WhatsApp (ÓoBot)', 'included' => false],
                    ],
                    'current' => auth()->user()->tenant->plan === 'free',
                ],
                [
                    'id' => 'price_basic',
                    'name' => 'Básico',
                    'price' => 79.90,
                    'interval' => 'mês',
                    'features' => [
                        ['text' => '250 produtos', 'included' => true],
                        ['text' => '5 usuários', 'included' => true],
                        ['text' => 'Pedidos ilimitados', 'included' => true],
                        ['text' => 'Categorias ilimitadas', 'included' => true],
                        ['text' => '15 cupons ativos', 'included' => true],
                        ['text' => '10 motoboys', 'included' => true],
                        ['text' => 'Impressão automática (ÓoPrint) (Em breve)', 'included' => true],
                        ['text' => 'Robô WhatsApp (ÓoBot) (Em breve)', 'included' => true],
                        ['text' => 'Relatórios avançados', 'included' => true],
                        ['text' => 'Gestão de estoque ilimitada', 'included' => true],
                        ['text' => 'Suporte por email', 'included' => true],
                    ],
                    'current' => auth()->user()->tenant->plan === 'basic',
                ],
                [
                    'id' => 'price_pro', // Mantém ID interno 'price_pro' para compatibilidade frontend
                    'name' => 'Personalizado',
                    'price' => null,
                    'interval' => 'mês',
                    'features' => [
                        ['text' => 'Tudo do Básico +', 'included' => true],
                        ['text' => 'Produtos ilimitados', 'included' => true],
                        ['text' => 'Usuários ilimitados', 'included' => true],
                        ['text' => 'Integrações customizadas (API)', 'included' => true],
                        ['text' => 'Motoboys ilimitados', 'included' => true],
                        ['text' => 'White Label (Sua marca)', 'included' => true],
                        ['text' => 'Domínio personalizado', 'included' => true],
                        ['text' => 'Suporte prioritário WhatsApp', 'included' => true],
                        ['text' => 'Gerente de conta dedicado', 'included' => true],
                    ],
                    'current' => auth()->user()->tenant->plan === 'custom',
                ]
            ]
        ]);
    }

    public function checkout(string $plan)
    {
        // Mock Checkout: Directly upgrade for now to test flow
        $tenant = auth()->user()->tenant;

        // Simulating logic
        if ($plan === 'free') {
            return $this->downgradeToFree();
        }

        return Inertia::render('Subscription/Checkout', [
            'plan' => $plan,
            'price' => $plan === 'price_basic' ? 79.90 : 0 // Ajustado para refletir preço real do básico
        ]);
    }

    public function upgrade(Request $request)
    {
        $tenant = auth()->user()->tenant;
        $requestedPlan = $request->input('plan');

        // Validate that the plan is allowed for self-service upgrade
        if (!in_array($requestedPlan, ['free', 'basic'])) {
            return back()->withErrors([
                'plan' => 'O plano Personalizado requer contato com nossa equipe. Entre em contato via WhatsApp.'
            ]);
        }

        // Prevent downgrade from custom/pro to basic/free via this method
        if (in_array($tenant->plan, ['custom', 'pro'])) {
            return back()->withErrors([
                'plan' => 'Para alterar seu plano Personalizado, entre em contato com o suporte.'
            ]);
        }

        // TODO: Integrate with Stripe payment here
        // For now, just update the plan (mock)
        $tenant->update(['plan' => $requestedPlan]);

        return redirect()->route('dashboard')->with('success', "Plano atualizado para {$requestedPlan} com sucesso! (Modo de Teste)");
    }

    public function downgradeToFree()
    {
        $tenant = auth()->user()->tenant;
        $tenant->update(['plan' => 'free']);

        return redirect()->route('dashboard')->with('success', 'Plano alterado para Gratuito.');
    }

    public function expired()
    {
        return Inertia::render('Subscription/Expired', [
            'tenant' => auth()->user()->tenant,
            'plans' => [
                [
                    'id' => 'free',
                    'plan' => 'free', // Added for frontend match
                    'name' => 'Gratuito',
                    'price' => 0,
                    'price_monthly' => 0, // Added for frontend match
                    'price_yearly' => 0,
                    'interval' => 'mês',
                    'features' => [
                        '30 produtos',
                        '2 usuários',
                        'Até 300 pedidos/mês',
                    ],
                    'max_products' => 30,
                    'max_users' => 2,
                    'current' => auth()->user()->tenant->plan === 'free',
                ],
                [
                    'id' => 'price_basic',
                    'plan' => 'basic', // Added for frontend match
                    'name' => 'Básico',
                    'price' => 79.90,
                    'price_monthly' => 79.90, // Added for frontend match
                    'price_yearly' => 79.90 * 10,
                    'interval' => 'mês',
                    'features' => [
                        '250 produtos',
                        '5 usuários',
                        'Pedidos ilimitados',
                        'Impressão automática',
                        'Fidelidade',
                    ],
                    'max_products' => 250,
                    'max_users' => 5,
                    'current' => auth()->user()->tenant->plan === 'basic',
                ],
            ]
        ]);
    }

    public function status()
    {
        return redirect()->route('subscription.index');
    }
}
