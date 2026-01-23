<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashRegister extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'opened_by',
        'closed_by',
        'opening_balance',
        'closing_balance',
        'expected_balance',
        'difference',
        'notes',
        'opened_at',
        'closed_at',
    ];

    protected $casts = [
        'opening_balance' => 'float',
        'closing_balance' => 'float',
        'expected_balance' => 'float',
        'difference' => 'float',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function opener()
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function closer()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function isOpen(): bool
    {
        return $this->closed_at === null;
    }

    public function close(float $closingBalance, ?string $notes = null): void
    {
        $this->update([
            'closing_balance' => $closingBalance,
            'expected_balance' => $this->calculateExpectedBalance(),
            'difference' => $closingBalance - $this->calculateExpectedBalance(),
            'closed_by' => auth()->id(),
            'closed_at' => now(),
            'notes' => $notes,
        ]);
    }

    protected function calculateExpectedBalance(): float
    {
        // This would be calculated based on orders and expenses
        return $this->opening_balance;
    }
}
