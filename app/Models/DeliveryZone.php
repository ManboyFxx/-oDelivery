<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DeliveryZone extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'neighborhood',
        'delivery_fee',
        'estimated_time_min',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'delivery_fee' => 'decimal:2',
        'is_active' => 'boolean',
        'estimated_time_min' => 'integer',
        'display_order' => 'integer',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
