<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_id',
        'method',
        'amount',
        'change_amount',
        'external_id',
        'qr_code',
        'qr_code_base64',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'change_amount' => 'float',
        'paid_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function isPaid(): bool
    {
        return $this->paid_at !== null;
    }
}
