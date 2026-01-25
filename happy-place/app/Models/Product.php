<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, HasUuid, BelongsToTenant, SoftDeletes, Auditable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'category_id',
        'name',
        'description',
        'price',
        'promotional_price',
        'image_url',
        'prep_time_minutes',
        'is_available',
        'is_featured',
        'loyalty_earns_points',
        'loyalty_redeemable',
        'loyalty_points_cost',
        'stock_quantity',
        'track_stock',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'float',
        'promotional_price' => 'float',
        'prep_time_minutes' => 'integer',
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
        'loyalty_earns_points' => 'boolean',
        'loyalty_redeemable' => 'boolean',
        'loyalty_points_cost' => 'integer',
        'stock_quantity' => 'integer',
        'track_stock' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function complementGroups()
    {
        return $this->belongsToMany(ComplementGroup::class, 'product_complement_groups', 'product_id', 'group_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // Helpers
    public function getCurrentPrice(): float
    {
        return $this->promotional_price ?? $this->price;
    }

    public function hasStock(): bool
    {
        if (!$this->track_stock) {
            return true;
        }

        return $this->stock_quantity > 0;
    }

    public function decrementStock(int $quantity = 1): void
    {
        if ($this->track_stock) {
            $this->decrement('stock_quantity', $quantity);
        }
    }
}
