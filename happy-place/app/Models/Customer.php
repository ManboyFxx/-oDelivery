<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'name',
        'phone',
        'email',
        'loyalty_points',
        'push_subscription',
    ];

    protected $casts = [
        'loyalty_points' => 'integer',
    ];

    // Relationships
    public function addresses()
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function defaultAddress()
    {
        return $this->hasOne(CustomerAddress::class)->where('is_default', true);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function loyaltyHistory()
    {
        return $this->hasMany(LoyaltyPointsHistory::class);
    }

    // Helpers
    public function addPoints(int $points, ?string $orderId = null, ?string $description = null): void
    {
        $this->increment('loyalty_points', $points);

        $this->loyaltyHistory()->create([
            'tenant_id' => $this->tenant_id,
            'order_id' => $orderId,
            'points' => $points,
            'type' => 'earn',
            'description' => $description ?? 'Pontos ganhos em compra',
        ]);
    }

    public function redeemPoints(int $points, ?string $orderId = null, ?string $description = null): bool
    {
        if ($this->loyalty_points < $points) {
            return false;
        }

        $this->decrement('loyalty_points', $points);

        $this->loyaltyHistory()->create([
            'tenant_id' => $this->tenant_id,
            'order_id' => $orderId,
            'points' => -$points,
            'type' => 'redeem',
            'description' => $description ?? 'Pontos resgatados',
        ]);

        return true;
    }
}
