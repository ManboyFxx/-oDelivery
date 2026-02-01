<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MotoboyProfile extends Model
{
    use HasFactory, HasUuid, BelongsToTenant, SoftDeletes, Auditable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'vehicle_type',
        'vehicle_brand',
        'vehicle_model',
        'plate_number',
        'documents_verified',
        'cpf',
        'rg',
        'cnh',
        'cnh_validity',
        'bank_name',
        'bank_agency',
        'bank_account',
        'bank_account_type',
        'rating',
        'total_deliveries',
        'acceptance_rate',
        'total_earnings',
    ];

    protected function casts(): array
    {
        return [
            'documents_verified' => 'boolean',
            'cnh_validity' => 'date',
            'rating' => 'float',
            'total_deliveries' => 'integer',
            'acceptance_rate' => 'float',
            'total_earnings' => 'float',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // Relationships
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ratings()
    {
        return $this->hasMany(MotoboyRating::class, 'motoboy_id', 'user_id');
    }

    public function metrics()
    {
        return $this->hasMany(MotoboyMetrics::class, 'user_id', 'user_id');
    }

    public function locations()
    {
        return $this->hasMany(MotoboyLocation::class, 'user_id', 'user_id');
    }

    public function availability()
    {
        return $this->hasOne(MotoboyAvailability::class, 'user_id', 'user_id');
    }

    public function locationHistories()
    {
        return $this->hasMany(MotoboyLocationHistory::class, 'user_id', 'user_id');
    }

    // Helpers
    public function updateRating()
    {
        if ($this->ratings()->count() > 0) {
            $this->rating = $this->ratings()->avg('rating');
            $this->save();
        }
    }

    public function updateTotalEarnings()
    {
        $earnings = Order::where('motoboy_id', $this->user_id)
            ->where('status', 'delivered')
            ->sum('delivery_fee');

        $this->total_earnings = $earnings;
        $this->save();
    }

    public function updateTotalDeliveries()
    {
        $deliveries = Order::where('motoboy_id', $this->user_id)
            ->where('status', 'delivered')
            ->count();

        $this->total_deliveries = $deliveries;
        $this->save();
    }

    public function updateAcceptanceRate()
    {
        $offered = Order::where('motoboy_id', $this->user_id)
            ->whereNotNull('motoboy_id')
            ->count();

        if ($offered === 0) {
            $this->acceptance_rate = 100;
        } else {
            $accepted = Order::where('motoboy_id', $this->user_id)
                ->where('status', '!=', 'declined')
                ->count();

            $this->acceptance_rate = ($accepted / $offered) * 100;
        }

        $this->save();
    }
}
