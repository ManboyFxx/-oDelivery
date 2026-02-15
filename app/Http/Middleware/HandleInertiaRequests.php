<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $tenant = $user?->tenant;

        if ($tenant) {
            // Eager load settings to avoid N+1 and remote DB latency
            $tenant->loadMissing(['settings']);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'is_impersonating' => $request->session()->has('impersonated_by'),
            ],
            'tenant' => $tenant ? [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'plan' => $tenant->plan,
                'plan_display_name' => $tenant->plan_display_name,
                'subscription_status' => $tenant->subscription_status,
                'limits' => $tenant->getUsageStats(), // Now cached
                'is_trial_active' => $tenant->isTrialActive(),
                'is_trial_expiring_soon' => $tenant->isTrialExpiringSoon(),
                'trial_days_remaining' => $tenant->trialDaysRemaining(),
                'is_subscription_active' => $tenant->isSubscriptionActive(),
                'show_watermark' => $tenant->shouldShowWatermark(),
                'features' => $tenant->getPlanLimits()?->features ?? [],
                'notification_settings' => $tenant->settings?->notification_settings ?? [],
                'store_status' => [
                    // Pass timezone to avoid back-query. Default to SP if not set.
                    'is_open' => $tenant->settings?->isOpenNow($tenant->timezone ?? 'America/Sao_Paulo') ?? false,
                    'status_override' => $tenant->settings?->status_override,
                    'is_delivery_paused' => $tenant->settings?->is_delivery_paused ?? false,
                    'paused_until' => $tenant->settings?->paused_until,
                ],
            ] : null,
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'flash_token' => fn() => $request->session()->get('flash_token'), // Explicitly share token
            ],
            'toast' => fn() => $request->session()->get('toast'),
        ];
    }
}
