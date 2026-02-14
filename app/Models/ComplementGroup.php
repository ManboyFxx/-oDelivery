<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplementGroup extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'name',
        'min_selections',
        'max_selections',
        'is_required',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'min_selections' => 'integer',
        'max_selections' => 'integer',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function options()
    {
        return $this->hasMany(ComplementOption::class, 'group_id');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_complement_groups', 'group_id', 'product_id');
    }
}
