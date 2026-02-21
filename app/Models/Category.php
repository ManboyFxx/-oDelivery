<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'image_url',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Always return a full absolute URL for the category image.
     */
    public function getImageUrlAttribute($value): ?string
    {
        if (!$value)
            return null;

        if (str_starts_with($value, 'http'))
            return $value;

        $cleanPath = $value;

        // Clean any existing storage/ or uploads/ prefix to prevent duplication
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

    // Relationships
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function activeProducts()
    {
        return $this->hasMany(Product::class)->where('is_available', true);
    }
}
