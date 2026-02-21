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
        'is_promotional',
        'is_new',
        'is_exclusive',
        'loyalty_earns_points',
        'loyalty_redeemable',
        'loyalty_points_cost',
        'loyalty_points_multiplier', // Added
        'stock_quantity',
        'track_stock',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2', // Changed from 'float'
        'promotional_price' => 'float',
        'prep_time_minutes' => 'integer',
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
        'is_promotional' => 'boolean',
        'is_new' => 'boolean',
        'is_exclusive' => 'boolean',
        'loyalty_earns_points' => 'boolean',
        'loyalty_redeemable' => 'boolean',
        'loyalty_points_cost' => 'integer',
        'stock_quantity' => 'integer',
        'track_stock' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Always return a full absolute URL for the product image.
     */
    public function getImageUrlAttribute($value): ?string
    {
        if (!$value)
            return null;

        // Already a full URL (e.g. https://...)
        if (str_starts_with($value, 'http')) {
            return $value;
        }

        // Clean any existing storage/ prefix to prevent duplication
        $cleanPath = ltrim($value, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        return '/storage/' . ltrim($cleanPath, '/');
    }



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

    public function decrementStock(int $quantity = 1, ?string $reason = null, ?string $orderId = null): void
    {
        if ($this->track_stock) {
            $this->decrement('stock_quantity', $quantity);

            $this->recordStockMovement(
                -$quantity,
                'sale',
                $reason ?? 'Venda',
                $orderId
            );
        }
    }

    public function incrementStock(int $quantity = 1, ?string $reason = null, ?string $orderId = null): void
    {
        if ($this->track_stock) {
            $this->increment('stock_quantity', $quantity);

            $this->recordStockMovement(
                $quantity,
                'purchase',
                $reason ?? 'Entrada',
                $orderId
            );
        }
    }

    public function recordStockMovement(float $quantity, string $type, ?string $description = null, ?string $orderId = null): void
    {
        StockMovement::create([
            'tenant_id' => $this->tenant_id,
            'product_id' => $this->id,
            'quantity' => abs($quantity),
            'type' => $type,
            'description' => $description,
            'order_id' => $orderId,
            'user_id' => auth()->id() ?? User::where('tenant_id', $this->tenant_id)->first()->id,
        ]);
    }

    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'product_ingredients')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
