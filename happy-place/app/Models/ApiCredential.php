<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiCredential extends Model
{
    use HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'service',
        'key_name',
        'encrypted_value',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    protected $hidden = [
        'encrypted_value',
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Accessors & Mutators
    public function setEncryptedValueAttribute($value)
    {
        $this->attributes['encrypted_value'] = encrypt($value);
    }

    public function getDecryptedValueAttribute()
    {
        try {
            return decrypt($this->encrypted_value);
        } catch (\Exception $e) {
            return null;
        }
    }

    // Helpers
    public function markAsUsed()
    {
        $this->update(['last_used_at' => now()]);
    }

    public function isExpired(): bool
    {
        // Implementar lógica de expiração se necessário
        return false;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForService($query, string $service)
    {
        return $query->where('service', $service);
    }

    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
}
