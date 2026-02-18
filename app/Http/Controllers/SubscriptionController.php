<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PlanLimit;
use App\Services\PaymentGatewayService;

class SubscriptionController extends Controller
{
    public function index()
    {
        $tenant = auth()->user()->tenant;
        $currentPlan = $tenant->plan;

        // Sempre retorna o plano unificado para exibição
        $unifiedPlan = PlanLimit::findByPlan('unified');

        $planData = null;
        if ($unifiedPlan) {
            $planData = [
                'id' => $unifiedPlan->plan,
                'name' => $unifiedPlan->display_name,
                'price' => $unifiedPlan->price_monthly,
                'interval' => 'mês',
                'features' => $unifiedPlan->formatted_features,
                'limits' => [
                    'products' => $unifiedPlan->max_products,
                    'users' => $unifiedPlan->max_users,
                    'orders' => $unifiedPlan->max_orders_per_month,
                    'motoboys' => $unifiedPlan->max_motoboys,
                    'stock_items' => $unifiedPlan->max_stock_items,
                    'coupons' => $unifiedPlan->max_coupons,
                ],
                'current' => $currentPlan === 'unified',
                'subscription_status' => $tenant->subscription_status ?? 'active',
            ];
        }

        return Inertia::render('Subscription/Index', [
            'currentPlan' => $currentPlan,
            'subscriptionStatus' => $tenant->subscription_status ?? 'active',
            'plan' => $planData,
            'usage' => [
                'products' => $tenant->products()->count(),
                'users' => $tenant->users()->count(),
                'orders' => $tenant->orders()->count(),
                'motoboys' => $tenant->motoboys()->count(),
                'stock_items' => 0,
                'coupons' => $tenant->coupons()->count(),
            ],
        ]);
    }

    public function checkout(string $plan)
    {
        // Se tentar acessar outro plano, redireciona para unified
        if ($plan !== 'unified') {
            return redirect()->route('subscription.checkout', ['plan' => 'unified']);
        }

        $planModel = PlanLimit::findByPlan('unified');
        if (!$planModel) {
            return back()->with('error', 'Plano não encontrado.');
        }

        return Inertia::render('Subscription/Checkout', [
            'plan' => 'unified',
            'price' => $planModel->price_monthly,
            'planName' => $planModel->display_name,
            'features' => collect($planModel->formatted_features)->where('included', true)->pluck('text')->toArray()
        ]);
    }

    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'plan' => 'required|string'
        ]);

        $coupon = \App\Models\PlanCoupon::where('code', strtoupper($request->code))->first();

        // Pass 'unified' context if plan is unified
        if (!$coupon || !$coupon->isValid($request->plan)) {
            return response()->json(['valid' => false, 'message' => 'Cupom inválido ou expirado.'], 422);
        }

        return response()->json([
            'valid' => true,
            'discount_type' => $coupon->discount_type,
            'discount_value' => $coupon->discount_value,
            'code' => $coupon->code
        ]);
    }

    public function processPayment(Request $request, PaymentGatewayService $paymentService)
    {
        $tenant = auth()->user()->tenant;
        $user = auth()->user();

        $data = $request->validate([
            'plan' => 'required|string',
            'payment_method' => 'required|in:credit_card,pix,boleto',
            'payment_method_id' => 'nullable|string',
            'cpf' => 'nullable|string',
            'cardholder_name' => 'nullable|string',
            'coupon_code' => 'nullable|string|exists:plan_coupons,code'
        ]);

        try {
            // 1. Ensure Customer exists
            if (!$tenant->stripe_customer_id) {
                try {
                    $customerId = $paymentService->createCustomer($tenant, $user->email, $tenant->name);
                    $tenant->update(['stripe_customer_id' => $customerId]);
                    $tenant->refresh();
                } catch (\Exception $e) {
                    // Ignore logic same as before
                }
            }

            $planId = $data['plan'];
            $planModel = PlanLimit::findByPlan($planId);

            if (!$planModel) {
                // Fallback if unified not found for some reason
                $planModel = PlanLimit::findByPlan('unified');
            }

            if (!$planModel) {
                return back()->withErrors(['payment' => 'Plano inválido']);
            }

            $amount = $planModel->price_monthly;
            $coupon = null;

            // Apply Coupon
            if (!empty($data['coupon_code'])) {
                $coupon = \App\Models\PlanCoupon::where('code', $data['coupon_code'])->first();
                if ($coupon && $coupon->isValid($planId)) {
                    if ($coupon->discount_type === 'percentage') {
                        $discount = $amount * ($coupon->discount_value / 100);
                        $amount -= $discount;
                    } else {
                        $amount -= $coupon->discount_value;
                    }
                    $amount = max(0, $amount);
                }
            }

            // Map to PaymentGateway plan keys
            // Agora tudo mapeia para 'unified' no metadata, mas o Stripe Plan ID pode variar se o user não tiver criado 'unified' lá.
            // Vou assumir 'unified' como ID do plano no Stripe também.
            $stripePlanId = 'unified';

            $metadata = ['plan' => $stripePlanId];
            if ($coupon) {
                $metadata['coupon_code'] = $coupon->code;
                if ($coupon->stripe_coupon_id) {
                    $metadata['stripe_coupon_id'] = $coupon->stripe_coupon_id;
                }
                $coupon->increment('current_uses');
            }

            // 2. Process Payment based on method
            if ($data['payment_method'] === 'credit_card') {
                $result = $paymentService->createSubscription(
                    $tenant->stripe_customer_id,
                    $stripePlanId,
                    $data['payment_method_id'],
                    'monthly',
                    $metadata
                );
                return redirect()->back()->with('success', 'Assinatura processada com sucesso!');

            } elseif ($data['payment_method'] === 'pix') {
                $result = $paymentService->createPixPayment(
                    $amount,
                    "Assinatura Plano Único" . ($coupon ? " (Cupom: {$coupon->code})" : ""),
                    $tenant,
                    $metadata
                );
                return response()->json($result);

            } elseif ($data['payment_method'] === 'boleto') {
                $result = $paymentService->createBoletoPayment(
                    $amount,
                    "Assinatura Plano Único" . ($coupon ? " (Cupom: {$coupon->code})" : ""),
                    $tenant,
                    $data['cpf'],
                    now()->addDays(3),
                    $metadata
                );
                return response()->json($result);
            }

        } catch (\Exception $e) {
            return back()->withErrors(['payment' => $e->getMessage()]);
        }
    }

    public function upgrade(Request $request)
    {
        $tenant = auth()->user()->tenant;

        // Simplesmente ativa o plano unificado (usado para reativar/atualizar)
        try {
            $tenant->activateUnifiedPlan();
        } catch (\Exception $e) {
            return back()->withErrors(['plan' => $e->getMessage()]);
        }

        return redirect()->route('dashboard')->with('success', "Plano atualizado com sucesso!");
    }

    public function expired()
    {
        $tenant = auth()->user()->tenant;
        $unifiedPlan = PlanLimit::findByPlan('unified');

        $planData = [
            'id' => $unifiedPlan->plan,
            'name' => $unifiedPlan->display_name,
            'price' => $unifiedPlan->price_monthly,
            'interval' => 'mês',
            'features' => $unifiedPlan->formatted_features,
            'current' => true, // Única opção
        ];

        return Inertia::render('Subscription/Expired', [
            'tenant' => $tenant,
            'plans' => [$planData], // Array com 1 elemento para compatibilidade da view Expired se não for reescrita agora
            'downgradeRisks' => [] // Sem riscos
        ]);
    }

    public function status()
    {
        return redirect()->route('subscription.index');
    }
}
