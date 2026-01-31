<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MotoboyLocationHistory extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'motoboy_location_history';

    protected $fillable = [
        'motoboy_id',
        'order_id',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function motoboy()
    {
        return $this->belongsTo(User::class, 'motoboy_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
