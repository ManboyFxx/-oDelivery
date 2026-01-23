<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItemComplement extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_item_id',
        'complement_option_id',
        'name',
        'price',
        'quantity',
    ];

    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
