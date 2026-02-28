<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

class IntegrationEvent extends Model
{
    use HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'source',
        'event_type',
        'payload',
        'idempotency_key',
        'status',
        'attempts',
        'processed_at',
        'error_message',
        'related_type',
        'related_id',
    ];

    protected $casts = [
        'payload' => 'array',
        'attempts' => 'integer',
        'processed_at' => 'datetime',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function related()
    {
        return $this->morphTo('related');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Record a new integration event idempotently.
     * If the idempotency_key already exists, returns the existing event.
     */
    public static function record(
        string $source,
        string $eventType,
        array $payload = [],
        ?string $tenantId = null,
        ?string $idempotencyKey = null,
        ?Model $related = null
    ): self {
        if ($idempotencyKey) {
            $existing = static::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing;
            }
        }

        return static::create([
            'tenant_id' => $tenantId,
            'source' => $source,
            'event_type' => $eventType,
            'payload' => $payload,
            'idempotency_key' => $idempotencyKey,
            'status' => 'pending',
            'attempts' => 0,
            'related_type' => $related ? get_class($related) : null,
            'related_id' => $related?->id,
        ]);
    }

    /** Mark as successfully processed. */
    public function markProcessed(): self
    {
        $this->update([
            'status' => 'processed',
            'processed_at' => now(),
            'attempts' => $this->attempts + 1,
        ]);
        return $this;
    }

    /** Mark as failed with error info. */
    public function markFailed(string $errorMessage): self
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'attempts' => $this->attempts + 1,
        ]);
        return $this;
    }

    /** Increment attempt counter and set to processing. */
    public function markProcessing(): self
    {
        $this->update([
            'status' => 'processing',
            'attempts' => $this->attempts + 1,
        ]);
        return $this;
    }
}
