<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'code',
        'discount_type',
        'discount_value',
        'min_order_value',
        'max_uses',
        'current_uses',
        'is_single_use',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'float',
        'min_order_value' => 'float',
        'max_uses' => 'integer',
        'current_uses' => 'integer',
        'is_single_use' => 'boolean',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function isValid(): bool
    {
        if (!$this->is_active)
            return false;
        if ($this->max_uses && $this->current_uses >= $this->max_uses)
            return false;
        if ($this->valid_from && $this->valid_from->isFuture())
            return false;
        if ($this->valid_until && $this->valid_until->isPast())
            return false;
        return true;
    }

    public function calculateDiscount(float $orderTotal): float
    {
        if ($orderTotal < $this->min_order_value)
            return 0;

        if ($this->discount_type === 'percentage') {
            return $orderTotal * ($this->discount_value / 100);
        }

        return min($this->discount_value, $orderTotal);
    }

    public function incrementUsage(): void
    {
        $this->increment('current_uses');
    }
}
