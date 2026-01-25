<?php

namespace App\Http\Middleware;

use App\Services\TwoFactorService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorEnabled
{
    public function __construct(
        private TwoFactorService $twoFactorService
    ) {
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only enforce 2FA for super admins
        if ($user && $user->isSuperAdmin()) {
            // If 2FA is not enabled, redirect to setup
            if (!$this->twoFactorService->isEnabled($user)) {
                // Check if already on 2FA setup page
                if (!$request->is('settings/two-factor*')) {
                    return redirect()->route('settings.two-factor.show')
                        ->with('warning', 'Super admins devem ativar 2FA para segurança');
                }
            }
        }

        return $next($request);
    }
}
