<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, HasUuid, BelongsToTenant, SoftDeletes, Auditable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'order_number',
        'mode',
        'status',
        'customer_id',
        'address_id',
        'table_id',
        'motoboy_id',
        'coupon_id',
        'created_by',
        'subtotal',
        'discount',
        'delivery_fee',
        'service_fee',
        'tip',
        'total',
        'payment_status',
        'change_for',
        'notes',
        'customer_name',
        'customer_phone',
        'delivery_address',
        'estimated_time_minutes',
        'loyalty_points_earned',
        'loyalty_points_used',
        'confirmed_at',
        'ready_at',
        'delivered_at',
        'cancelled_at',
        'cancellation_reason',
        'preparation_started_at',
        'estimated_ready_at',
        'preparation_time_minutes',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'discount' => 'float',
        'delivery_fee' => 'float',
        'service_fee' => 'float',
        'tip' => 'float',
        'total' => 'float',
        'change_for' => 'float',
        'estimated_time_minutes' => 'integer',
        'loyalty_points_earned' => 'integer',
        'loyalty_points_used' => 'integer',
        'confirmed_at' => 'datetime',
        'ready_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'preparation_started_at' => 'datetime',
        'estimated_ready_at' => 'datetime',
        'preparation_time_minutes' => 'integer',
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function address()
    {
        return $this->belongsTo(CustomerAddress::class, 'address_id');
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function motoboy()
    {
        return $this->belongsTo(User::class, 'motoboy_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function motoboyRating()
    {
        return $this->hasOne(MotoboyRating::class);
    }

    // Scopes
    public function scopeForMotoboy($query, $motoboyId)
    {
        return $query->where('motoboy_id', $motoboyId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['confirmed', 'preparing', 'ready', 'waiting_motoboy', 'motoboy_accepted', 'out_for_delivery']);
    }

    public function scopeDelivery($query)
    {
        return $query->where('mode', 'delivery');
    }

    // Status Helpers
    public function isNew(): bool
    {
        return $this->status === 'new';
    }

    public function isConfirmed(): bool
    {
        return in_array($this->status, ['confirmed', 'preparing', 'ready', 'waiting_motoboy', 'motoboy_accepted', 'out_for_delivery']);
    }

    public function isDelivery(): bool
    {
        return $this->mode === 'delivery';
    }

    public function isPickup(): bool
    {
        return $this->mode === 'pickup';
    }

    public function isTable(): bool
    {
        return $this->mode === 'table';
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function confirm(): void
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function cancel(string $reason): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
    }

    // Timing Helpers
    public function startPreparation(): void
    {
        $this->update([
            'preparation_started_at' => now(),
            'estimated_ready_at' => now()->addMinutes($this->preparation_time_minutes),
            'status' => 'preparing',
        ]);
    }

    public function getIsLateAttribute(): bool
    {
        if (!$this->preparation_started_at || !$this->estimated_ready_at) {
            return false;
        }

        // Only consider late if still in preparation/ready status
        if (!in_array($this->status, ['preparing', 'ready', 'waiting_motoboy'])) {
            return false;
        }

        return now()->greaterThan($this->estimated_ready_at);
    }

    public function getElapsedMinutesAttribute(): int
    {
        return $this->created_at->diffInMinutes(now());
    }

    public function getPreparationElapsedMinutesAttribute(): ?int
    {
        if (!$this->preparation_started_at) {
            return null;
        }

        return $this->preparation_started_at->diffInMinutes(now());
    }

    public function getTimeStatusAttribute(): string
    {
        if (!$this->preparation_started_at || !$this->estimated_ready_at) {
            return 'pending';
        }

        $elapsed = $this->preparation_elapsed_minutes;
        $estimated = $this->preparation_time_minutes;

        if ($elapsed >= $estimated) {
            return 'late';
        } elseif ($elapsed >= $estimated * 0.8) {
            return 'warning';
        }

        return 'on_time';
    }
}
