<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'name',
        'min_distance_km',
        'max_distance_km',
        'fee',
        'estimated_time_minutes',
        'is_active',
    ];

    protected $casts = [
        'min_distance_km' => 'float',
        'max_distance_km' => 'float',
        'fee' => 'float',
        'estimated_time_minutes' => 'integer',
        'is_active' => 'boolean',
    ];

    public function containsDistance(float $distanceKm): bool
    {
        return $distanceKm >= $this->min_distance_km && $distanceKm <= $this->max_distance_km;
    }
}
