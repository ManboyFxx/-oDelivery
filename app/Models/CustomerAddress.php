<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class CustomerAddress extends Model
{
    use HasFactory, HasUuid, \App\Traits\BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'customer_id',
        'tenant_id',
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

    /**
     * Encrypt sensitive address fields
     */
    protected function street(): Attribute
    {
        return $this->makeEncryptedAttribute();
    }

    protected function number(): Attribute
    {
        return $this->makeEncryptedAttribute();
    }

    protected function complement(): Attribute
    {
        return $this->makeEncryptedAttribute();
    }

    protected function neighborhood(): Attribute
    {
        return $this->makeEncryptedAttribute();
    }

    protected function city(): Attribute
    {
        return $this->makeEncryptedAttribute();
    }

    protected function state(): Attribute
    {
        return $this->makeEncryptedAttribute();
    }

    protected function zipCode(): Attribute
    {
        return $this->makeEncryptedAttribute();
    }

    /**
     * Create an encrypted attribute
     */
    private function makeEncryptedAttribute(): Attribute
    {
        return Attribute::make(
            get: fn($val) => $val ? $this->decryptValue($val) : null,
            set: fn($val) => $val ? Crypt::encryptString($val) : null,
        );
    }

    /**
     * Safely decrypt values, handling decryption errors gracefully
     */
    private function decryptValue(string $value): ?string
    {
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to decrypt address data', [
                'address_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
            return $value; // Return encrypted value if decryption fails
        }
    }

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
