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

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'tenant' => $tenant ? [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'plan' => $tenant->plan,
                'plan_display_name' => $tenant->plan_display_name,
                'subscription_status' => $tenant->subscription_status,
                'is_trial_active' => $tenant->isTrialActive(),
                'is_trial_expiring_soon' => $tenant->isTrialExpiringSoon(),
                'trial_days_remaining' => $tenant->trialDaysRemaining(),
                'is_subscription_active' => $tenant->isSubscriptionActive(),
                'show_watermark' => $tenant->shouldShowWatermark(),
                'features' => $tenant->getPlanLimits()?->features ?? [],
                'notification_settings' => $tenant->settings?->notification_settings ?? [],
                'store_status' => [
                    'is_open' => $tenant->settings?->isOpenNow() ?? false,
                    'status_override' => $tenant->settings?->status_override,
                    'is_delivery_paused' => $tenant->settings?->is_delivery_paused ?? false,
                    'paused_until' => $tenant->settings?->paused_until,
                ],
            ] : null,
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'toast' => fn() => $request->session()->get('toast'),
        ];
    }
}
