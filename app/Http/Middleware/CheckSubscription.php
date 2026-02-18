<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Routes that should be accessible even with expired subscription.
     */
    protected array $exceptRoutes = [
        'subscription.expired',
        'subscription.upgrade',
        'subscription.checkout',
        'account.suspended',
        'logout',
        'profile.edit',
        'profile.update',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // No user = not logged in, let auth middleware handle it
        if (!$user) {
            return $next($request);
        }

        $tenant = $user->tenant;

        // Super admin (no tenant) always has access
        if ($user->isSuperAdmin() || !$tenant) {
            return $next($request);
        }

        // Check if current route is in except list
        $currentRoute = $request->route()?->getName();
        if ($currentRoute && in_array($currentRoute, $this->exceptRoutes)) {
            return $next($request);
        }

        // Check if account is suspended
        if ($tenant->is_suspended) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'account_suspended',
                    'message' => 'Sua conta está suspensa.',
                    'reason' => $tenant->suspension_reason,
                ], 403);
            }

            return redirect()->route('account.suspended');
        }

        // Check if account is active
        if (!$tenant->is_active) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'account_inactive',
                    'message' => 'Sua conta está desativada.',
                ], 403);
            }

            return redirect()->route('account.suspended');
        }

        // Check subscription status
        if (!$tenant->isSubscriptionActive()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'subscription_expired',
                    'message' => 'Sua assinatura não está ativa.',
                    'upgrade_url' => route('subscription.expired'),
                ], 403);
            }

            // Se for novo cadastro (pending), manda direto pro checkout
            if ($tenant->subscription_status === 'pending') {
                return redirect()->route('subscription.checkout', 'unified');
            }

            return redirect()->route('subscription.expired');
        }

        return $next($request);
    }
}
