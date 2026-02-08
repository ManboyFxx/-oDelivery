<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'phone',
        'code',
        'expires_at',
        'used',
        'ip_address',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean',
    ];

    // Helpers
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return !$this->used && !$this->isExpired();
    }

    public function markAsUsed(): void
    {
        $this->update(['used' => true]);
    }
}
