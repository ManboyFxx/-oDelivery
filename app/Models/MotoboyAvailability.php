<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MotoboyAvailability extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'motoboy_availability';

    protected $fillable = [
        'user_id',
        'is_online',
        'availability_status',
        'last_activity_at',
    ];

    protected function casts(): array
    {
        return [
            'is_online' => 'boolean',
            'last_activity_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helpers
    public function setOnline()
    {
        $this->is_online = true;
        $this->availability_status = 'available';
        $this->last_activity_at = now();
        $this->save();
    }

    public function setOffline()
    {
        $this->is_online = false;
        $this->availability_status = 'offline';
        $this->last_activity_at = now();
        $this->save();
    }

    public function setOnDelivery()
    {
        $this->is_online = true;
        $this->availability_status = 'on_delivery';
        $this->last_activity_at = now();
        $this->save();
    }

    public function setBreak()
    {
        $this->is_online = true;
        $this->availability_status = 'break';
        $this->last_activity_at = now();
        $this->save();
    }

    public function isOnline(): bool
    {
        return $this->is_online === true;
    }

    public function isAvailable(): bool
    {
        return $this->availability_status === 'available';
    }

    public function isOnDelivery(): bool
    {
        return $this->availability_status === 'on_delivery';
    }

    public function isOffline(): bool
    {
        return !$this->is_online;
    }
}
