<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

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
        'address',
        'loyalty_points',
        'loyalty_tier',
        'push_subscription',
    ];

    protected $casts = [
        'loyalty_points' => 'integer',
        'loyalty_tier' => 'string',
    ];

    /**
     * Encrypt phone number when setting, decrypt when getting
     */
    protected function phone(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? $this->decryptValue($value) : null,
            set: fn($value) => $value ? Crypt::encryptString($value) : null,
        );
    }

    /**
     * Encrypt email address
     */
    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? $this->decryptValue($value) : null,
            set: fn($value) => $value ? Crypt::encryptString($value) : null,
        );
    }

    /**
     * Encrypt legacy address
     */
    protected function address(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? $this->decryptValue($value) : null,
            set: fn($value) => $value ? Crypt::encryptString($value) : null,
        );
    }

    /**
     * Safely decrypt values, handling decryption errors gracefully
     */
    private function decryptValue(string $value): ?string
    {
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to decrypt customer data', [
                'customer_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
            return $value; // Return encrypted value if decryption fails
        }
    }

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

    /**
     * Update loyalty tier based on current points
     */
    public function updateLoyaltyTier(): void
    {
        $points = $this->loyalty_points;

        $tier = match (true) {
            $points >= 1000 => 'diamond',
            $points >= 500 => 'gold',
            $points >= 100 => 'silver',
            default => 'bronze',
        };

        if ($this->loyalty_tier !== $tier) {
            $this->loyalty_tier = $tier;
            $this->save();

            // Log tier upgrade for potential notifications
            \Log::info("Customer {$this->id} tier upgraded to {$tier}", [
                'customer_id' => $this->id,
                'tier' => $tier,
                'points' => $points,
            ]);
        }
    }

    /**
     * Get tier bonus multiplier (1.0 for bronze, 1.05 for silver, 1.10 for gold, 1.15 for diamond)
     */
    public function getTierBonusMultiplier(): float
    {
        return match ($this->loyalty_tier ?? 'bronze') {
            'diamond' => 1.15,
            'gold' => 1.10,
            'silver' => 1.05,
            default => 1.0,
        };
    }
}
