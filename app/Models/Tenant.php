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
        'printer_token_raw',
        'menu_view_mode',
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

    public function scopeReal($query)
    {
        return $query->where('slug', 'not like', 'demo-%');
    }

    public function scopeDemo($query)
    {
        return $query->where('slug', 'like', 'demo-%');
    }

    // ==========================================
    // Subscription Status Helpers
    // ==========================================

    /**
     * Check if the subscription is active.
     * With unified plan, all active tenants have access.
     */
    public function isSubscriptionActive(): bool
    {
        // Se estiver suspenso, não está ativo
        if ($this->is_suspended) {
            return false;
        }

        // Verifica se a assinatura está ativa E se a data de expiração é futura
        return $this->subscription_ends_at && $this->subscription_ends_at->isFuture();
    }

    // Trial methods removed - unified plan has no trial period
    // restore onTrial for backward compatibility with FinancialController
    public function onTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
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
     * Activate unified plan subscription.
     */
    public function activateUnifiedPlan(string $billingCycle = 'monthly', float $amount = 129.90): void
    {
        $oldPlan = $this->plan;

        // Calculate new expiration date
        $currentExpiry = $this->subscription_ends_at;
        $startFrom = ($currentExpiry && $currentExpiry->isFuture()) ? $currentExpiry->copy() : now();

        $newExpiry = $billingCycle === 'yearly'
            ? $startFrom->addYear()
            : $startFrom->addMonth();

        $this->update([
            'plan' => 'unified',
            'billing_cycle' => $billingCycle,
            'subscription_status' => 'active',
            'subscription_ends_at' => $newExpiry,
            'trial_ends_at' => null,
            'show_watermark' => false,
        ]);

        SubscriptionHistory::recordUpgrade($this, $oldPlan, 'unified', $amount, $billingCycle);
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

    // Downgrade methods removed - unified plan only

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

        if ($this->is_active && $this->plan === 'unified') {
            return 'Ativa';
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

    public function getLogoUrlAttribute($value)
    {
        if (empty($value))
            return null;
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            // Em vez de retornar direto o caminho da URL completa que pode dar problema se mudar o domínio,
            // poderíamos limpar, mas por hora vamos manter a lógica atual de extrair PATH.
            $path = parse_url($value, PHP_URL_PATH);
            $cleanPath = ltrim($path, '/');
        } else {
            $cleanPath = $value;
        }

        if (str_starts_with($cleanPath, '/storage/')) {
            $cleanPath = substr($cleanPath, 9);
        } elseif (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        } elseif (str_starts_with($cleanPath, '/uploads/')) {
            $cleanPath = substr($cleanPath, 9);
        } elseif (str_starts_with($cleanPath, 'uploads/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        return '/uploads/' . ltrim($cleanPath, '/');
    }
}
