<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuid, SoftDeletes, Auditable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'phone',
        'password',
        'avatar_url',
        'role',
        'is_available',
        'is_active',
        'phone_hash',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_available' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'motoboy_id');
    }

    public function createdOrders()
    {
        return $this->hasMany(Order::class, 'created_by');
    }

    // Motoboy Relationships
    public function motoboyProfile()
    {
        return $this->hasOne(MotoboyProfile::class);
    }

    public function motoboyLocations()
    {
        return $this->hasMany(MotoboyLocation::class);
    }

    public function motoboyAvailability()
    {
        return $this->hasOne(MotoboyAvailability::class);
    }

    public function motoboyRatings()
    {
        return $this->hasMany(MotoboyRating::class, 'motoboy_id');
    }

    public function motoboyMetrics()
    {
        return $this->hasMany(MotoboyMetrics::class);
    }

    public function motoboyLocationHistories()
    {
        return $this->hasMany(MotoboyLocationHistory::class, 'user_id');
    }

    public function acceptedOrders()
    {
        return $this->hasMany(Order::class, 'motoboy_id');
    }

    // Helpers
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isMotoboy(): bool
    {
        return $this->role === 'motoboy';
    }


    public function isEmployee(): bool
    {
        return $this->role === 'employee';
    }

    // Roles & Permissions
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_role');
    }

    public function hasRole(string $roleSlug): bool
    {
        return $this->roles()->where('slug', $roleSlug)->exists();
    }

    public function hasPermission(string $permissionSlug): bool
    {
        return $this->roles()->whereHas('permissions', function ($query) use ($permissionSlug) {
            $query->where('slug', $permissionSlug);
        })->exists();
    }

    public function giveRole(Role|string $role)
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->firstOrFail();
        }

        $this->roles()->syncWithoutDetaching($role);
    }

    /**
     * Encrypt phone number
     */
    protected function phone(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? $this->decryptValue($value) : null,
            set: function ($value) {
                if ($value) {
                    $this->attributes['phone_hash'] = hash('sha256', $value);
                    return \Illuminate\Support\Facades\Crypt::encryptString($value);
                }
                $this->attributes['phone_hash'] = null;
                return null;
            },
        );
    }

    /**
     * Safely decrypt values, handling decryption errors gracefully
     */
    private function decryptValue(string $value): ?string
    {
        try {
            return \Illuminate\Support\Facades\Crypt::decryptString($value);
        } catch (\Exception $e) {
            // Return raw value if not encrypted (for migration transition)
            return $value;
        }
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }
}
