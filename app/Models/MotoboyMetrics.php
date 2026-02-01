<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MotoboyMetrics extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'period',
        'metric_date',
        'deliveries_completed',
        'deliveries_failed',
        'average_rating',
        'total_earnings',
        'distance_traveled_km',
        'average_time_minutes',
    ];

    protected function casts(): array
    {
        return [
            'metric_date' => 'date',
            'deliveries_completed' => 'integer',
            'deliveries_failed' => 'integer',
            'average_rating' => 'float',
            'total_earnings' => 'float',
            'distance_traveled_km' => 'float',
            'average_time_minutes' => 'integer',
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

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeDaily($query)
    {
        return $query->where('period', 'daily');
    }

    public function scopeWeekly($query)
    {
        return $query->where('period', 'weekly');
    }

    public function scopeMonthly($query)
    {
        return $query->where('period', 'monthly');
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('metric_date', $date);
    }

    public function scopeAfterDate($query, $date)
    {
        return $query->where('metric_date', '>=', $date);
    }

    public function scopeBeforeDate($query, $date)
    {
        return $query->where('metric_date', '<=', $date);
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('metric_date', [$startDate, $endDate]);
    }

    public function scopeOrderByDateDesc($query)
    {
        return $query->orderByDesc('metric_date');
    }

    // Helpers
    public function getSuccessRate(): float
    {
        $total = $this->deliveries_completed + $this->deliveries_failed;

        if ($total === 0) {
            return 0;
        }

        return ($this->deliveries_completed / $total) * 100;
    }

    public function getEarningsPerDelivery(): float
    {
        if ($this->deliveries_completed === 0) {
            return 0;
        }

        return round($this->total_earnings / $this->deliveries_completed, 2);
    }

    public function getTotalDeliveries(): int
    {
        return $this->deliveries_completed + $this->deliveries_failed;
    }
}
