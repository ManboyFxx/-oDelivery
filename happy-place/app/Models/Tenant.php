<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'slug',
        'logo_url',
        'email',
        'phone',
        'whatsapp',
        'address',
        'operating_hours',
        'timezone',
        'is_active',
        'is_open',
        'trial_ends_at',
        'subscription_ends_at',
        'plan',
    ];

    protected $casts = [
        'address' => 'array',
        'operating_hours' => 'array',
        'is_active' => 'boolean',
        'is_open' => 'boolean',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
    ];

    // Relationships
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function settings()
    {
        return $this->hasOne(StoreSetting::class);
    }

    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }

    public function deliveryZones()
    {
        return $this->hasMany(DeliveryZone::class);
    }

    public function neighborhoodFees()
    {
        return $this->hasMany(NeighborhoodFee::class);
    }

    public function tables()
    {
        return $this->hasMany(Table::class);
    }

    // Helpers
    public function isSubscriptionActive(): bool
    {
        if ($this->plan === 'free') {
            return true;
        }

        return $this->subscription_ends_at && $this->subscription_ends_at->isFuture();
    }

    public function isTrialActive(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }
}
