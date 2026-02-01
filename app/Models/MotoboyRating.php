<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MotoboyRating extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    public $timestamps = true;
    const UPDATED_AT = null;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'motoboy_id',
        'order_id',
        'rating',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    // Relationships
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function motoboy()
    {
        return $this->belongsTo(User::class, 'motoboy_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Scopes
    public function scopeForMotoboy($query, $motoboyId)
    {
        return $query->where('motoboy_id', $motoboyId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days))
            ->orderByDesc('created_at');
    }

    public function scopeOrderByDateDesc($query)
    {
        return $query->orderByDesc('created_at');
    }

    // Helpers
    public function getRatingLabel(): string
    {
        return match ($this->rating) {
            5 => '★★★★★',
            4 => '★★★★☆',
            3 => '★★★☆☆',
            2 => '★★☆☆☆',
            1 => '★☆☆☆☆',
            default => 'Sem avaliação',
        };
    }

    public function getRatingText(): string
    {
        return match ($this->rating) {
            5 => 'Excelente',
            4 => 'Muito Bom',
            3 => 'Bom',
            2 => 'Aceitável',
            1 => 'Ruim',
            default => 'Sem avaliação',
        };
    }
}
