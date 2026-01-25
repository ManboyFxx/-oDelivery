<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PaymentMethod extends Model
{
    use HasFactory, HasUuids, Auditable;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'fee_percentage',
        'fee_fixed',
        'is_active',
        'display_order',
        'pix_key',
        'pix_key_type',
    ];

    protected $casts = [
        'fee_percentage' => 'decimal:2',
        'fee_fixed' => 'decimal:2',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function calculateFee(float $orderTotal): float
    {
        $percentageFee = ($orderTotal * $this->fee_percentage) / 100;
        return $percentageFee + $this->fee_fixed;
    }
}
