<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'customer_id',
        'label',
        'street',
        'number',
        'complement',
        'neighborhood',
        'city',
        'state',
        'zip_code',
        'latitude',
        'longitude',
        'is_default',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_default' => 'boolean',
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // Helpers
    public function getFormattedAddress(): string
    {
        $parts = array_filter([
            $this->street,
            $this->number,
            $this->complement,
            $this->neighborhood,
            $this->city,
            $this->state,
        ]);

        return implode(', ', $parts);
    }
}
