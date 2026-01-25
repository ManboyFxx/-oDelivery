<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanLimit extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'plan',
        'display_name',
        'price_monthly',
        'price_yearly',
        'max_products',
        'max_users',
        'max_orders_per_month',
        'max_categories',
        'max_coupons',
        'max_motoboys',
        'max_storage_mb',
        'max_units',
        'features',
        'show_watermark',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_monthly' => 'float',
        'price_yearly' => 'float',
        'max_products' => 'integer',
        'max_users' => 'integer',
        'max_orders_per_month' => 'integer',
        'max_categories' => 'integer',
        'max_coupons' => 'integer',
        'max_motoboys' => 'integer',
        'max_storage_mb' => 'integer',
        'max_units' => 'integer',
        'features' => 'array',
        'show_watermark' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get active plans ordered by sort_order.
     */
    public static function getActivePlans()
    {
        return static::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Get a plan by its slug.
     */
    public static function findByPlan(string $plan): ?self
    {
        return static::where('plan', $plan)->first();
    }

    /**
     * Check if this plan has a specific feature.
     */
    public function hasFeature(string $feature): bool
    {
        return in_array($feature, $this->features ?? []);
    }

    /**
     * Get the yearly discount percentage.
     */
    public function getYearlyDiscountAttribute(): float
    {
        if ($this->price_monthly <= 0) {
            return 0;
        }

        $monthlyTotal = $this->price_monthly * 12;
        $discount = (($monthlyTotal - $this->price_yearly) / $monthlyTotal) * 100;

        return round($discount, 0);
    }

    /**
     * Get the monthly price when billed yearly.
     */
    public function getYearlyMonthlyPriceAttribute(): float
    {
        return round($this->price_yearly / 12, 2);
    }

    /**
     * Check if a limit is unlimited (null).
     */
    public function isUnlimited(string $limit): bool
    {
        return is_null($this->{$limit});
    }

    /**
     * Format limit for display.
     */
    public function formatLimit(string $limit): string
    {
        $value = $this->{$limit};

        if (is_null($value)) {
            return 'Ilimitado';
        }

        return number_format($value, 0, ',', '.');
    }
}
