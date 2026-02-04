<?php

namespace App\Models;


use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppInstance extends Model
{
    use HasUuid;

    protected $table = 'whatsapp_instances';

    protected $fillable = [
        'tenant_id',
        'instance_name',
        'instance_type',
        'phone_number',
        'status',
        'qr_code',
        'last_connected_at',
    ];

    protected $casts = [
        'last_connected_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isConnected(): bool
    {
        return $this->status === 'connected';
    }

    public function isShared(): bool
    {
        return $this->instance_type === 'shared';
    }

    public function isCustom(): bool
    {
        return $this->instance_type === 'custom';
    }

    public function needsReconnection(): bool
    {
        return $this->status === 'disconnected' ||
            ($this->last_connected_at && $this->last_connected_at->diffInDays(now()) > 7);
    }

    /**
     * Get the shared WhatsApp instance (CMS-managed)
     */
    public static function getSharedInstance(): ?self
    {
        return self::where('instance_type', 'shared')
            ->where('status', 'connected')
            ->first();
    }

    /**
     * Mark instance as connected with phone number
     */
    public function markAsConnected(string $phoneNumber = ''): self
    {
        $this->update([
            'status' => 'connected',
            'phone_number' => $phoneNumber ?: $this->phone_number,
            'last_connected_at' => now(),
            'qr_code' => null,
        ]);

        return $this->refresh();
    }

    /**
     * Mark instance as disconnected
     */
    public function markAsDisconnected(): self
    {
        $this->update([
            'status' => 'disconnected',
            'qr_code' => null,
        ]);

        return $this->refresh();
    }
}
