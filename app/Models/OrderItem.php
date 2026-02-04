<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'quantity',
        'unit_price',
        'complements_price',
        'subtotal',
        'notes',
        'is_loyalty_redemption',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'float',
        'complements_price' => 'float',
        'subtotal' => 'float',
        'is_loyalty_redemption' => 'boolean',
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function complements()
    {
        return $this->hasMany(OrderItemComplement::class);
    }
}
