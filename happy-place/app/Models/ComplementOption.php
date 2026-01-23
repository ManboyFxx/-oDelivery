<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplementOption extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'group_id',
        'name',
        'price',
        'max_quantity',
        'is_available',
        'sort_order',
        'ingredient_id',
    ];

    protected $casts = [
        'price' => 'float',
        'max_quantity' => 'integer',
        'is_available' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function group()
    {
        return $this->belongsTo(ComplementGroup::class, 'group_id');
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}
