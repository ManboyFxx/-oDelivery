<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionHistory extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'subscription_history';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'plan_from',
        'plan_to',
        'action',
        'amount',
        'billing_cycle',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'float',
        'metadata' => 'array',
    ];

    /**
     * Get the tenant that owns this history entry.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope to filter by action.
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }


    /**
     * Create an upgrade entry.
     */
    public static function recordUpgrade(Tenant $tenant, string $fromPlan, string $toPlan, float $amount, string $billingCycle): self
    {
        return static::create([
            'tenant_id' => $tenant->id,
            'plan_from' => $fromPlan,
            'plan_to' => $toPlan,
            'action' => 'upgraded',
            'amount' => $amount,
            'billing_cycle' => $billingCycle,
        ]);
    }

    /**
     * Create a downgrade entry.
     */
    public static function recordDowngrade(Tenant $tenant, string $fromPlan, string $toPlan): self
    {
        return static::create([
            'tenant_id' => $tenant->id,
            'plan_from' => $fromPlan,
            'plan_to' => $toPlan,
            'action' => 'downgraded',
        ]);
    }

    /**
     * Create a cancellation entry.
     */
    public static function recordCancellation(Tenant $tenant, ?string $reason = null): self
    {
        return static::create([
            'tenant_id' => $tenant->id,
            'plan_from' => $tenant->plan,
            'plan_to' => 'free',
            'action' => 'canceled',
            'notes' => $reason,
        ]);
    }

    /**
     * Create an expiration entry.
     */
    public static function recordExpiration(Tenant $tenant): self
    {
        return static::create([
            'tenant_id' => $tenant->id,
            'plan_from' => $tenant->plan,
            'plan_to' => 'free',
            'action' => 'expired',
            'notes' => 'Assinatura expirada automaticamente',
        ]);
    }
}
