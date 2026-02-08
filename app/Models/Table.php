<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'number',
        'capacity',
        'status',
        'current_order_id',
        'occupied_at',
        'position_x',
        'position_y',
        'width',
        'height',
        'shape',
        'rotation',
    ];

    protected $casts = [
        'number' => 'integer',
        'capacity' => 'integer',
        'occupied_at' => 'datetime',
    ];

    public function currentOrder()
    {
        return $this->belongsTo(Order::class, 'current_order_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function isFree(): bool
    {
        return $this->status === 'free';
    }

    protected $appends = ['occupied_since'];

    public function getOccupiedSinceAttribute()
    {
        return $this->currentOrder?->created_at;
    }

    public function occupy(string $orderId): void
    {
        $this->update([
            'status' => 'occupied',
            'current_order_id' => $orderId,
            'occupied_at' => now(),
        ]);
    }

    public function free(): void
    {
        $this->update([
            'status' => 'free',
            'current_order_id' => null,
            'occupied_at' => null,
        ]);
    }
}
