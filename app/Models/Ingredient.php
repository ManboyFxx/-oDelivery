<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ingredient extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'is_available',
        'min_stock',
        'stock',
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

    /**
     * Scope a query to only include ingredients with low stock.
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw('stock <= min_stock'); // Assuming 'stock' column exists, wait, checking if 'stock' column exists. User prompt says "monitoring stock", implying a stock column/mechanism exists.
    }
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_ingredients')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function recordStockMovement(float $quantity, string $type, ?string $description = null, ?string $orderId = null)
    {
        return $this->stockMovements()->create([
            'tenant_id' => $this->tenant_id,
            'user_id' => auth()->id(),
            'order_id' => $orderId,
            'type' => $type,
            'quantity' => $quantity,
            'description' => $description,
        ]);
    }

    public function incrementStock(float $quantity, string $type = 'manual', ?string $description = null)
    {
        $this->increment('stock', $quantity);
        return $this->recordStockMovement($quantity, $type, $description);
    }

    public function decrementStock(float $quantity, string $type = 'sale', ?string $description = null, ?string $orderId = null)
    {
        $this->decrement('stock', $quantity);
        $movement = $this->recordStockMovement($quantity * -1, $type, $description, $orderId);

        // Check for low stock and notify admins
        if ($this->stock <= $this->min_stock) {
            $admins = User::where('tenant_id', $this->tenant_id)
                ->whereIn('role', ['admin', 'employee'])
                ->get();

            foreach ($admins as $admin) {
                /** @var User $admin */
                $admin->notify(new \App\Notifications\LowStockNotification(collect([$this]), $this->tenant));
            }
        }

        return $movement;
    }
}
