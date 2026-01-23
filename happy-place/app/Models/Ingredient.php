<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'is_available',
        'display_order',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function complementOptions(): HasMany
    {
        return $this->hasMany(ComplementOption::class);
    }

    /**
     * Get the count of items that will be affected if this ingredient is toggled
     */
    public function getImpactCount(): array
    {
        return [
            'complement_options' => $this->complementOptions()->count(),
            // Future: add products count when we implement product-ingredient relationship
        ];
    }
}
