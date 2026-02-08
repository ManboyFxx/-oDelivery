<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerDevice extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'customer_id',
        'device_token',
        'device_fingerprint',
        'user_agent',
        'ip_address',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // Helpers
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function touch($attribute = null)
    {
        $this->last_used_at = now();
        return parent::touch($attribute);
    }
}
