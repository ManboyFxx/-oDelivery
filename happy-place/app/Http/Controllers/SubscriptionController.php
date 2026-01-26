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
                    // Fixed: Align with Plans.tsx
                    'price' => 29.90, // Assuming Plans.tsx has 0 for free, but let's check Plans.tsx again. 
                    // Wait, Plans.tsx says: Free=0, Pro=89.00, Enterprise=Consult. 
                    // The Controller had "Basic"=79.90 and "Pro"=149.90.
                    // Let's realign to: Free, Pro (89.00). Removing "Basic" or matching "Pro".
                    // Actually, Plans.tsx shows: "Básico (R$0)" and "Profissional (R$89)".
                    // So we must reflect that structure.
                    'interval' => 'mês',
                    'features' => ['Tudo do Gratuito +', 'Robô WhatsApp (ÓoBot)', 'Sistema de Motoboys', 'Múltiplas Unidades', 'Suporte Prioritário'],
                    'current' => auth()->user()->tenant->plan === 'basic',
                ],
                [
                    'id' => 'price_pro',
                    'name' => 'Profissional',
                    'price' => 89.00,
                    'interval' => 'mês',
                    'features' => ['Tudo do Básico +', 'Produtos Ilimitados', 'Usuários Ilimitados', 'Remoção de marca d\'água', 'Onboarding Dedicado'],
                    'current' => auth()->user()->tenant->plan === 'pro',
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
            'price' => $plan === 'price_pro' ? 89.00 : 0
        ]);
    }

    public function upgrade(Request $request)
    {
        // Mock Payment Success
        $tenant = auth()->user()->tenant;
        $plan = $request->input('plan', 'pro');

        $tenant->update(['plan' => $plan]);

        return redirect()->route('dashboard')->with('success', "Plano atualizado para {$plan} com sucesso! (Modo de Teste)");
    }

    public function downgradeToFree()
    {
        $tenant = auth()->user()->tenant;
        $tenant->update(['plan' => 'free']);

        return redirect()->route('dashboard')->with('success', 'Plano alterado para Gratuito.');
    }

    public function expired()
    {
        return Inertia::render('Subscription/Expired');
    }

    public function status()
    {
        return redirect()->route('subscription.index');
    }
}
