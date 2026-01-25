<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFeature
{
    /**
     * Handle an incoming request.
     *
     * @param string $feature The feature to check
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();

        if (!$user || !$user->tenant) {
            return $next($request);
        }

        $tenant = $user->tenant;

        if (!$tenant->hasFeature($feature)) {
            $planName = $tenant->plan_display_name;

            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'feature_not_available',
                    'message' => $this->getFeatureMessage($feature, $planName),
                    'feature' => $feature,
                    'upgrade_url' => route('subscription.upgrade'),
                ], 403);
            }

            return back()->withErrors([
                'feature' => $this->getFeatureMessage($feature, $planName),
            ]);
        }

        return $next($request);
    }

    /**
     * Get a user-friendly message for the feature.
     */
    protected function getFeatureMessage(string $feature, string $planName): string
    {
        $messages = [
            'auto_print' => 'Impressão automática não está disponível no plano ' . $planName . '.',
            'loyalty_basic' => 'Programa de fidelidade não está disponível no plano ' . $planName . '.',
            'multiple_payments' => 'Múltiplas formas de pagamento não estão disponíveis no plano ' . $planName . '.',
            'motoboy_management' => 'Gestão de motoboys não está disponível no plano ' . $planName . '.',
            'delivery_zones' => 'Taxas por bairro não estão disponíveis no plano ' . $planName . '.',
            'tables' => 'Gestão de mesas não está disponível no plano ' . $planName . '.',
            'customer_history' => 'Histórico de clientes não está disponível no plano ' . $planName . '.',
            'advanced_coupons' => 'Cupons avançados não estão disponíveis no plano ' . $planName . '.',
            'full_reports' => 'Relatórios completos não estão disponíveis no plano ' . $planName . '.',
            'integrations' => 'Integrações não estão disponíveis no plano ' . $planName . '.',
            'api_access' => 'Acesso à API não está disponível no plano ' . $planName . '.',
            'stock_management' => 'Gestão de estoque não está disponível no plano ' . $planName . '.',
            'advanced_reports' => 'Relatórios avançados não estão disponíveis no plano ' . $planName . '.',
            'multi_unit' => 'Múltiplas unidades não estão disponíveis no plano ' . $planName . '.',
            'custom_domain' => 'Domínio personalizado não está disponível no plano ' . $planName . '.',
            'priority_support' => 'Suporte prioritário não está disponível no plano ' . $planName . '.',
            'advanced_themes' => 'Temas avançados não estão disponíveis no plano ' . $planName . '.',
        ];

        return $messages[$feature] ?? 'Este recurso não está disponível no seu plano atual.';
    }
}
