<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NeighborhoodFee extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'neighborhood',
        'city',
        'fee',
        'estimated_time_minutes',
        'is_active',
    ];

    protected $casts = [
        'fee' => 'float',
        'estimated_time_minutes' => 'integer',
        'is_active' => 'boolean',
    ];
}
