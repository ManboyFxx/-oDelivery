<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'customer_id',
        'title',
        'message',
        'type',
        'icon',
        'color',
        'data',
        'action_url',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'read_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    public function isUnread(): bool
    {
        return $this->read_at === null;
    }

    public function markAsRead(): bool
    {
        return $this->update(['read_at' => now()]);
    }

    public function markAsUnread(): bool
    {
        return $this->update(['read_at' => null]);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    private function getDefaultColor(): string
    {
        return match ($this->type) {
            'delivery' => '#10b981',
            'order' => '#3b82f6',
            'location' => '#ff3d03',
            'arrived' => '#8b5cf6',
            'system' => '#f59e0b',
            default => '#6b7280',
        };
    }

    private function getDefaultIcon(): string
    {
        return match ($this->type) {
            'delivery' => 'CheckCircle',
            'order' => 'Package',
            'location' => 'MapPin',
            'arrived' => 'Navigation',
            'system' => 'AlertCircle',
            default => 'Bell',
        };
    }

    public function getFormattedDateAttribute(): string
    {
        return $this->created_at?->format('d/m/Y H:i:s') ?? '—';
    }

    public function getRelativeDateAttribute(): string
    {
        return $this->created_at?->diffForHumans() ?? '—';
    }
}
