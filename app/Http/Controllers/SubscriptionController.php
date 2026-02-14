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

        $plans = \App\Models\PlanLimit::getActivePlans()->map(function ($plan) use ($tenant, $currentPlan) {
            return [
                'id' => $plan->plan,
                'original_id' => $plan->plan,
                'name' => $plan->display_name,
                'price' => $plan->price_monthly,
                'interval' => 'mês',
                'features' => $plan->formatted_features,
                'limits' => [
                    'products' => $plan->max_products,
                    'users' => $plan->max_users,
                    'orders' => $plan->max_orders_per_month,
                    'motoboys' => $plan->max_motoboys,
                    'stock_items' => $plan->max_stock_items,
                    'coupons' => $plan->max_coupons,
                ],
                'current' => $currentPlan === $plan->plan,
                'subscription_status' => $currentPlan === $plan->plan ? ($tenant->subscription_status ?? 'active') : null,
            ];
        });

        return Inertia::render('Subscription/Index', [
            'currentPlan' => $currentPlan,
            'subscriptionStatus' => $tenant->subscription_status ?? 'active',
            'plans' => $plans,
            'usage' => [
                'products' => $tenant->products()->count(),
                'users' => $tenant->users()->count(),
                'orders' => $tenant->orders()->count(),
                'motoboys' => $tenant->motoboys()->count(),
                'stock_items' => 0, // Placeholder
                'coupons' => 0, // Placeholder
            ],
        ]);
    }

    // Private formatFeatures method removed as logic is now in Model


    public function checkout(string $plan)
    {
        // Mock Checkout: Directly upgrade for now to test flow
        $tenant = auth()->user()->tenant;

        // Define price based on plan (should come from DB/Config)
        $prices = [
            'pro' => 79.90,
            'business' => 149.90,
            'basic' => 49.90
        ];

        $price = $prices[$plan] ?? 0;

        return Inertia::render('Subscription/Checkout', [
            'plan' => $plan,
            'price' => $price,
            'planName' => ucfirst($plan),
            'features' => [
                'Produtos Ilimitados',
                'Gestão de Motoboys',
                'Suporte Prioritário',
                'Cardápio Digital'
            ]
        ]);
    }

    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'plan' => 'required|string'
        ]);

        $coupon = \App\Models\PlanCoupon::where('code', strtoupper($request->code))->first();

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

    public function processPayment(Request $request, \App\Services\PaymentGatewayService $paymentService)
    {
        $tenant = auth()->user()->tenant;
        $user = auth()->user();

        $data = $request->validate([
            'plan' => 'required|string',
            'payment_method' => 'required|in:credit_card,pix,boleto',
            'payment_method_id' => 'nullable|string', // For Stripe Credit Card
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
                    // Ignore if customer creation fails (might already exist on Stripe side but not in DB)
                    // In production, should handle better.
                }
            }

            $planId = $data['plan'];

            // Calculate amount based on plan
            $baseAmount = match ($planId) {
                'pro' => 79.90,
                'custom' => 149.90,
                'business' => 149.90, // Alias
                default => 79.90 // Default to Pro if unsure, or throw error?
            };

            $amount = $baseAmount;
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
                    $amount = max(0, $amount); // Ensure not negative
                }
            }

            // Map to PaymentGateway plan keys (pro, custom)
            $stripePlanId = match ($planId) {
                'custom' => 'custom',
                'business' => 'custom',
                default => 'pro'
            };

            $metadata = ['plan' => $stripePlanId];
            if ($coupon) {
                $metadata['coupon_code'] = $coupon->code;
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

                // Update local state temporarily/optimistically
                // Real update happens via Webhook
                return redirect()->back()->with('success', 'Assinatura processada com sucesso!');

            } elseif ($data['payment_method'] === 'pix') {
                $result = $paymentService->createPixPayment(
                    $amount,
                    "Assinatura Plano " . ucfirst($stripePlanId) . ($coupon ? " (Cupom: {$coupon->code})" : ""),
                    $tenant,
                    $metadata
                );

                return response()->json($result); // Frontend expects JSON for Pix

            } elseif ($data['payment_method'] === 'boleto') {
                $result = $paymentService->createBoletoPayment(
                    $amount,
                    "Assinatura Plano " . ucfirst($stripePlanId) . ($coupon ? " (Cupom: {$coupon->code})" : ""),
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
        // For now, just update the plan (mock) with intelligent date calculation
        try {
            $tenant->upgradeTo($requestedPlan);
        } catch (\Exception $e) {
            return back()->withErrors(['plan' => $e->getMessage()]);
        }

        return redirect()->route('dashboard')->with('success', "Plano atualizado para {$requestedPlan} com sucesso! (Modo de Teste)");
    }

    public function downgradeToFree(Request $request)
    {
        $tenant = auth()->user()->tenant;
        $force = $request->input('force', false);

        try {
            $tenant->downgradeToFree($force);
        } catch (\Exception $e) {
            return back()->withErrors(['downgrade' => $e->getMessage()]);
        }

        return redirect()->route('dashboard')->with('success', 'Plano alterado para Gratuito.');
    }

    public function expired()
    {
        $tenant = auth()->user()->tenant;
        $activePlans = PlanLimit::where('is_active', true)->orderBy('sort_order')->get();

        $plans = $activePlans->map(function ($plan) {
            return [
                'id' => $plan->plan, // simplified mapping for this view
                'plan' => $plan->plan,
                'name' => $plan->display_name,
                'price' => $plan->price_monthly,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'interval' => 'mês',
                'features' => $plan->formatted_features,
                'max_products' => $plan->max_products,
                'max_users' => $plan->max_users,
                'current' => auth()->user()->tenant->plan === $plan->plan,
            ];
        })->values();

        // Check if downgrade is possible or needs warnings
        $downgradeRisks = $tenant->canDowngradeTo('free');

        return Inertia::render('Subscription/Expired', [
            'tenant' => $tenant,
            'plans' => $plans,
            'downgradeRisks' => $downgradeRisks
        ]);
    }

    public function status()
    {
        return redirect()->route('subscription.index');
    }
}
