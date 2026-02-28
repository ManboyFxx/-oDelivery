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
        'password',
        'loyalty_points',
        'loyalty_tier',
        'referral_code',
        'referred_by',
        'onesignal_id',
        'phone_hash',
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
            set: function ($value) {
                if ($value) {
                    $this->attributes['phone_hash'] = hash('sha256', $value);
                    return Crypt::encryptString($value);
                }
                $this->attributes['phone_hash'] = null;
                return null;
            },
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

    protected static function booted()
    {
        static::creating(function ($customer) {
            if (empty($customer->referral_code)) {
                $customer->referral_code = strtoupper(substr(uniqid(), -6));
            }
        });
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }



    public function referrer()
    {
        return $this->belongsTo(Customer::class, 'referred_by');
    }

    public function referrals()
    {
        return $this->hasMany(Customer::class, 'referred_by');
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

        // Create Notification
        \App\Models\Notification::create([
            'customer_id' => $this->id,
            'title' => 'Você ganhou pontos! 🎉',
            'message' => "Você recebeu {$points} pontos. " . ($description ?? ''),
            'type' => 'loyalty',
            'icon' => 'Gift',
            'color' => '#ff3d03',
            'data' => ['points' => $points, 'order_id' => $orderId],
            'read_at' => null,
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
        $settings = StoreSetting::where('tenant_id', $this->tenant_id)->first();

        // Get tiers from settings or use defaults (handled by accessor)
        $tiers = $settings ? $settings->loyalty_tiers : [
            ['name' => 'Bronze', 'min_points' => 0, 'multiplier' => 1.0],
            ['name' => 'Prata', 'min_points' => 100, 'multiplier' => 1.05],
            ['name' => 'Ouro', 'min_points' => 500, 'multiplier' => 1.10],
            ['name' => 'Diamante', 'min_points' => 1000, 'multiplier' => 1.15],
        ];

        // Sort by min_points descending to find the highest tier reachable
        usort($tiers, function ($a, $b) {
            return $b['min_points'] <=> $a['min_points'];
        });

        $newTier = 'Bronze'; // Default fallback
        foreach ($tiers as $tier) {
            if ($points >= $tier['min_points']) {
                $newTier = $tier['name'];
                break;
            }
        }

        if ($this->loyalty_tier !== $newTier) {
            $this->loyalty_tier = $newTier;
            $this->save();

            // Log tier upgrade for potential notifications
            \Illuminate\Support\Facades\Log::info("Customer {$this->id} tier updated to {$newTier}", [
                'customer_id' => $this->id,
                'tier' => $newTier,
                'points' => $points,
            ]);
        }
    }

    /**
     * Get tier bonus multiplier
     */
    public function getTierBonusMultiplier(): float
    {
        $settings = StoreSetting::where('tenant_id', $this->tenant_id)->first();
        $tiers = $settings ? $settings->loyalty_tiers : []; // Accessor handles defaults

        if (empty($tiers)) {
            $tiers = [
                ['name' => 'Bronze', 'min_points' => 0, 'multiplier' => 1.0],
                ['name' => 'Prata', 'min_points' => 100, 'multiplier' => 1.05],
                ['name' => 'Ouro', 'min_points' => 500, 'multiplier' => 1.10],
                ['name' => 'Diamante', 'min_points' => 1000, 'multiplier' => 1.15],
            ];
        }

        $currentTierName = $this->loyalty_tier ?? 'Bronze';

        foreach ($tiers as $tier) {
            if (strcasecmp($tier['name'], $currentTierName) === 0) {
                return (float) ($tier['multiplier'] ?? 1.0);
            }
        }

        return 1.0;
    }
}
