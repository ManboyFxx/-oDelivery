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
        'printer_token',
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
        $cacheKey = "tenant_{$this->id}_usage_stats";

        return \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function () { // 5 minutes cache
            // $planLimits = $this->getPlanLimits(); // Unused variable

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
        });
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
        // Prevent unauthorized upgrades to 'pro' plan
        // 'pro' (Personalizado) should only be set manually by super_admin
        if ($plan === 'pro') {
            throw new \Exception('O plano Personalizado requer aprovação manual. Entre em contato com o suporte.');
        }

        $oldPlan = $this->plan;

        // Calculate new expiration date
        // Logic: If currently active and in future, add time to current end date.
        // If expired or null, start from NOW.
        $currentExpiry = $this->subscription_ends_at;
        $startFrom = ($currentExpiry && $currentExpiry->isFuture()) ? $currentExpiry->copy() : now();

        $newExpiry = $billingCycle === 'yearly'
            ? $startFrom->addYear()
            : $startFrom->addMonth();

        $this->update([
            'plan' => $plan,
            'billing_cycle' => $billingCycle,
            'subscription_status' => 'active',
            'subscription_ends_at' => $newExpiry,
            'trial_ends_at' => null, // Clear trial
        ]);

        SubscriptionHistory::recordUpgrade($this, $oldPlan, $plan, $amount, $billingCycle);
    }

    /**
     * Extend subscription by a number of days.
     */
    public function extendSubscription(int $days): void
    {
        $currentExpiry = $this->subscription_ends_at;
        $startFrom = ($currentExpiry && $currentExpiry->isFuture()) ? $currentExpiry->copy() : now();

        $this->update([
            'subscription_ends_at' => $startFrom->addDays($days),
            'subscription_status' => 'active', // Reactivate if it was expired
        ]);
    }

    /**
     * Downgrade to free plan.
     */
    public function downgradeToFree(bool $force = false): void
    {
        // ✅ Validar antes de fazer downgrade
        $validation = $this->canDowngradeTo('free');

        if (!$validation['can_downgrade'] && !$force) {
            throw new \Exception(
                'Não é possível fazer downgrade. ' .
                implode(' ', array_column($validation['issues'], 'action'))
            );
        }

        $oldPlan = $this->plan;

        // Apply free plan limits
        $freePlan = PlanLimit::findByPlan('free');

        $this->update([
            'plan' => 'free',
            'subscription_status' => 'active',
            'subscription_ends_at' => null,
            'billing_cycle' => null,
            'next_billing_date' => null,
            'max_users' => null, // Segue o padrão do PlanLimit
            'max_products' => null, // Segue o padrão do PlanLimit
            'show_watermark' => true,
        ]);

        SubscriptionHistory::recordDowngrade($this, $oldPlan, 'free');
    }

    /**
     * Check if tenant can downgrade to a specific plan without data loss.
     */
    public function canDowngradeTo(string $targetPlan): array
    {
        $targetLimits = PlanLimit::findByPlan($targetPlan);

        if (!$targetLimits) {
            return [
                'can_downgrade' => false,
                'issues' => [['resource' => 'plan', 'message' => 'Plano não encontrado']]
            ];
        }

        $issues = [];

        // Verificar produtos
        if ($targetLimits->max_products !== null) {
            $currentProducts = $this->products()->count();
            if ($currentProducts > $targetLimits->max_products) {
                $excess = $currentProducts - $targetLimits->max_products;
                $issues[] = [
                    'resource' => 'products',
                    'current' => $currentProducts,
                    'limit' => $targetLimits->max_products,
                    'excess' => $excess,
                    'action' => "Você precisa desativar {$excess} produto(s) antes de fazer downgrade."
                ];
            }
        }

        // Verificar usuários
        if ($targetLimits->max_users !== null) {
            $currentUsers = $this->users()->count();
            if ($currentUsers > $targetLimits->max_users) {
                $excess = $currentUsers - $targetLimits->max_users;
                $issues[] = [
                    'resource' => 'users',
                    'current' => $currentUsers,
                    'limit' => $targetLimits->max_users,
                    'excess' => $excess,
                    'action' => "Você precisa remover {$excess} usuário(s) antes de fazer downgrade."
                ];
            }
        }

        // Verificar categorias
        if ($targetLimits->max_categories !== null) {
            $currentCategories = $this->categories()->count();
            if ($currentCategories > $targetLimits->max_categories) {
                $excess = $currentCategories - $targetLimits->max_categories;
                $issues[] = [
                    'resource' => 'categories',
                    'current' => $currentCategories,
                    'limit' => $targetLimits->max_categories,
                    'excess' => $excess,
                    'action' => "Você precisa remover {$excess} categoria(s) antes de fazer downgrade."
                ];
            }
        }

        // Verificar cupons ativos
        if ($targetLimits->max_coupons !== null) {
            $currentCoupons = $this->coupons()->where('is_active', true)->count();
            if ($currentCoupons > $targetLimits->max_coupons) {
                $excess = $currentCoupons - $targetLimits->max_coupons;
                $issues[] = [
                    'resource' => 'coupons',
                    'current' => $currentCoupons,
                    'limit' => $targetLimits->max_coupons,
                    'excess' => $excess,
                    'action' => "Você precisa desativar {$excess} cupom/cupons antes de fazer downgrade."
                ];
            }
        }

        return [
            'can_downgrade' => empty($issues),
            'issues' => $issues
        ];
    }

    /**
     * Get usage percentage for a specific resource.
     */
    public function getUsagePercentage(string $resource): float
    {
        $limit = $this->getLimit($resource);

        if ($limit === null) {
            return 0; // Ilimitado
        }

        $current = match ($resource) {
            'max_products' => $this->products()->count(),
            'max_users' => $this->users()->count(),
            'max_storage_mb' => $this->storage_used_mb ?? 0,
            'max_orders_per_month' => $this->getCurrentMonthOrders(),
            'max_categories' => $this->categories()->count(),
            'max_coupons' => $this->coupons()->where('is_active', true)->count(),
            default => 0
        };

        return $limit > 0 ? ($current / $limit) * 100 : 0;
    }

    /**
     * Check if should warn about reaching limit (80% threshold).
     */
    public function shouldWarnAboutLimit(string $resource): bool
    {
        $usage = $this->getUsagePercentage($resource);
        return $usage >= 80;
    }

    /**
     * Get all resources approaching limits.
     */
    public function getResourceWarnings(): array
    {
        $warnings = [];
        $resources = ['max_products', 'max_users', 'max_storage_mb', 'max_orders_per_month', 'max_categories', 'max_coupons'];

        foreach ($resources as $resource) {
            if ($this->shouldWarnAboutLimit($resource)) {
                $usage = $this->getUsagePercentage($resource);
                $limit = $this->getLimit($resource);

                $warnings[] = [
                    'resource' => $resource,
                    'usage_percent' => round($usage, 1),
                    'current' => $this->getCurrentUsage($resource),
                    'limit' => $limit,
                    'message' => "Você está usando " . round($usage, 1) . "% do limite de {$resource}."
                ];
            }
        }

        return $warnings;
    }

    /**
     * Get current usage for a resource.
     */
    private function getCurrentUsage(string $resource): int
    {
        return match ($resource) {
            'max_products' => $this->products()->count(),
            'max_users' => $this->users()->count(),
            'max_storage_mb' => $this->storage_used_mb ?? 0,
            'max_orders_per_month' => $this->getCurrentMonthOrders(),
            'max_categories' => $this->categories()->count(),
            'max_coupons' => $this->coupons()->where('is_active', true)->count(),
            default => 0
        };
    }

    /**
     * Get current month orders count.
     */
    private function getCurrentMonthOrders(): int
    {
        return $this->orders()
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();
    }

    /**
     * Cancel subscription.
     */
    public function cancelSubscription(?string $reason = null): void
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
