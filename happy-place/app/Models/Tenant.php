<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'slug',
        'logo_url',
        'email',
        'phone',
        'whatsapp',
        'address',
        'operating_hours',
        'timezone',
        'is_active',
        'is_open',
        'trial_ends_at',
        'subscription_ends_at',
        'plan',
        'subscription_status',
        'billing_cycle',
        'next_billing_date',
        'stripe_customer_id',
        'stripe_subscription_id',
        'max_users',
        'max_products',
        'max_orders_per_month',
        'max_categories',
        'max_motoboys',
        'max_storage_mb',
        'max_stock_items',
        'features',
        'custom_domain',
        'show_watermark',
        'is_suspended',
        'suspended_at',
        'suspension_reason',
    ];

    protected $casts = [
        'address' => 'array',
        'operating_hours' => 'array',
        'features' => 'array',
        'is_active' => 'boolean',
        'is_open' => 'boolean',
        'is_suspended' => 'boolean',
        'show_watermark' => 'boolean',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'next_billing_date' => 'datetime',
        'suspended_at' => 'datetime',
    ];

    // Cache for plan limits
    protected ?PlanLimit $planLimitsCache = null;

    // ==========================================
    // Relationships
    // ==========================================

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function settings()
    {
        return $this->hasOne(StoreSetting::class);
    }

    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }

    public function deliveryZones()
    {
        return $this->hasMany(DeliveryZone::class);
    }

    public function neighborhoodFees()
    {
        return $this->hasMany(NeighborhoodFee::class);
    }

    public function tables()
    {
        return $this->hasMany(Table::class);
    }

    public function subscriptionHistory()
    {
        return $this->hasMany(SubscriptionHistory::class);
    }

    public function motoboys()
    {
        return $this->hasMany(User::class)->where('role', 'motoboy');
    }

    public function whatsAppInstances()
    {
        return $this->hasMany(WhatsAppInstance::class);
    }

    // ==========================================
    // Subscription Status Helpers
    // ==========================================

    /**
     * Check if the subscription is active (paid or free plan).
     */
    public function isSubscriptionActive(): bool
    {
        if ($this->plan === 'free') {
            return true;
        }

        if ($this->isTrialActive()) {
            return true;
        }

        return $this->subscription_ends_at && $this->subscription_ends_at->isFuture();
    }

    /**
     * Check if trial is currently active.
     */
    public function isTrialActive(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * Check if trial has expired.
     */
    public function isTrialExpired(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isPast();
    }

    /**
     * Get days remaining in trial.
     */
    public function trialDaysRemaining(): int
    {
        if (!$this->trial_ends_at || $this->trial_ends_at->isPast()) {
            return 0;
        }

        return now()->diffInDays($this->trial_ends_at);
    }

    /**
     * Check if trial is expiring soon (within 3 days).
     */
    public function isTrialExpiringSoon(): bool
    {
        if (!$this->isTrialActive()) {
            return false;
        }

        return $this->trialDaysRemaining() <= 3;
    }

    /**
     * Check if the tenant has access to the system.
     */
    public function hasAccess(): bool
    {
        if ($this->is_suspended) {
            return false;
        }

        if (!$this->is_active) {
            return false;
        }

        return $this->isSubscriptionActive();
    }

    /**
     * Get the effective plan (considering trial).
     */
    public function getEffectivePlan(): string
    {
        // During trial, user has access to 'basic' features
        if ($this->isTrialActive() && $this->plan === 'free') {
            return 'basic';
        }

        return $this->plan ?? 'free';
    }

    // ==========================================
    // Plan Limits
    // ==========================================

    /**
     * Get the plan limits for this tenant.
     */
    public function getPlanLimits(): ?PlanLimit
    {
        if ($this->planLimitsCache) {
            return $this->planLimitsCache;
        }

        $this->planLimitsCache = PlanLimit::findByPlan($this->getEffectivePlan());

        return $this->planLimitsCache;
    }

    /**
     * Get a specific limit value, preferring tenant override.
     */
    public function getLimit(string $limitName): ?int
    {
        // Check if tenant has a custom override
        if (!is_null($this->{$limitName})) {
            return $this->{$limitName};
        }

        // Fall back to plan limits
        $planLimits = $this->getPlanLimits();

        return $planLimits?->{$limitName};
    }

    /**
     * Check if a specific feature is available.
     */
    public function hasFeature(string $feature): bool
    {
        // Check tenant-specific features first
        if (!empty($this->features) && in_array($feature, $this->features)) {
            return true;
        }

        // Fall back to plan features
        $planLimits = $this->getPlanLimits();

        return $planLimits?->hasFeature($feature) ?? false;
    }

    /**
     * Check if tenant can add more of a resource.
     */
    public function canAdd(string $resource): bool
    {
        $limit = $this->getLimit("max_{$resource}");

        // null means unlimited
        if (is_null($limit)) {
            return true;
        }

        $currentCount = match ($resource) {
            'products' => $this->products()->count(),
            'users' => $this->users()->count(),
            'categories' => $this->categories()->count(),
            'coupons' => $this->coupons()->where('is_active', true)->count(),
            'motoboys' => $this->motoboys()->count(),
            default => 0,
        };

        return $currentCount < $limit;
    }

    /**
     * Get usage statistics for resources.
     */
    public function getUsageStats(): array
    {
        $planLimits = $this->getPlanLimits();

        return [
            'products' => [
                'used' => $this->products()->count(),
                'max' => $this->getLimit('max_products'),
            ],
            'users' => [
                'used' => $this->users()->count(),
                'max' => $this->getLimit('max_users'),
            ],
            'categories' => [
                'used' => $this->categories()->count(),
                'max' => $this->getLimit('max_categories'),
            ],
            'coupons' => [
                'used' => $this->coupons()->where('is_active', true)->count(),
                'max' => $this->getLimit('max_coupons'),
            ],
            'motoboys' => [
                'used' => $this->motoboys()->count(),
                'max' => $this->getLimit('max_motoboys'),
            ],
            'stock_items' => [
                'used' => $this->products()
                    ->whereHas('stockMovements')
                    ->count(),
                'max' => $this->getLimit('max_stock_items'),
            ],
            'orders_this_month' => [
                'used' => $this->orders()
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'max' => $this->getLimit('max_orders_per_month'),
            ],
        ];
    }

    /**
     * Check if should show watermark.
     */
    public function shouldShowWatermark(): bool
    {
        // Check tenant override first
        if ($this->show_watermark === false) {
            return false;
        }

        $planLimits = $this->getPlanLimits();

        return $planLimits?->show_watermark ?? true;
    }

    // ==========================================
    // Subscription Management
    // ==========================================

    /**
     * Upgrade to a new plan.
     */
    public function upgradeTo(string $plan, string $billingCycle = 'monthly', float $amount = 0): void
    {
        $oldPlan = $this->plan;

        $this->update([
            'plan' => $plan,
            'billing_cycle' => $billingCycle,
            'subscription_status' => 'active',
            'subscription_ends_at' => $billingCycle === 'yearly'
                ? now()->addYear()
                : now()->addMonth(),
            'trial_ends_at' => null, // Clear trial
        ]);

        SubscriptionHistory::recordUpgrade($this, $oldPlan, $plan, $amount, $billingCycle);
    }

    /**
     * Downgrade to free plan.
     */
    public function downgradeToFree(): void
    {
        $oldPlan = $this->plan;

        // Apply free plan limits
        $freePlan = PlanLimit::findByPlan('free');

        $this->update([
            'plan' => 'free',
            'subscription_status' => 'active',
            'subscription_ends_at' => null,
            'billing_cycle' => null,
            'next_billing_date' => null,
            'max_users' => $freePlan?->max_users,
            'max_products' => $freePlan?->max_products,
            'show_watermark' => true,
        ]);

        SubscriptionHistory::recordDowngrade($this, $oldPlan, 'free');
    }

    /**
     * Cancel subscription.
     */
    public function cancelSubscription(string $reason = null): void
    {
        $this->update([
            'subscription_status' => 'canceled',
        ]);

        SubscriptionHistory::recordCancellation($this, $reason);
    }

    /**
     * Suspend the tenant account.
     */
    public function suspend(string $reason): void
    {
        $this->update([
            'is_suspended' => true,
            'suspended_at' => now(),
            'suspension_reason' => $reason,
        ]);
    }

    /**
     * Restore a suspended account.
     */
    public function restore(): void
    {
        $this->update([
            'is_suspended' => false,
            'suspended_at' => null,
            'suspension_reason' => null,
        ]);
    }

    // ==========================================
    // Accessors
    // ==========================================

    /**
     * Get the subscription status label.
     */
    public function getSubscriptionStatusLabelAttribute(): string
    {
        if ($this->is_suspended) {
            return 'Suspensa';
        }

        if ($this->isTrialActive()) {
            return 'Em Trial';
        }

        return match ($this->subscription_status) {
            'active' => 'Ativa',
            'past_due' => 'Pagamento Pendente',
            'canceled' => 'Cancelada',
            'expired' => 'Expirada',
            default => 'Gratuito',
        };
    }

    /**
     * Get the plan display name.
     */
    public function getPlanDisplayNameAttribute(): string
    {
        $planLimits = PlanLimit::findByPlan($this->plan ?? 'free');

        return $planLimits?->display_name ?? 'Gratuito';
    }
}
