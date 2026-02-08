<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanCoupon extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'plan_coupons';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'max_uses',
        'current_uses',
        'valid_until',
        'is_active',
        'plan_restriction'
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'max_uses' => 'integer',
        'current_uses' => 'integer',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function isValid(?string $plan = null): bool
    {
        if (!$this->is_active)
            return false;

        if ($this->valid_until && $this->valid_until->isPast())
            return false;

        if ($this->max_uses && $this->current_uses >= $this->max_uses)
            return false;

        if ($this->plan_restriction && $plan && $this->plan_restriction !== $plan)
            return false;

        return true;
    }
}
