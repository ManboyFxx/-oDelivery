<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoyaltyPromotion extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'multiplier',
        'start_date',
        'end_date',
        'is_active',
        'banner_gradient_start',
        'banner_gradient_end',
        'banner_icon',
        'banner_image_url',
    ];

    protected $casts = [
        'multiplier' => 'float',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active)
            return false;
        return now()->between($this->start_date, $this->end_date);
    }
}
