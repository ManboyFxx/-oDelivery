<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaFile extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'original_name',
        'filename',
        'path',
        'size',
        'mime_type',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    protected $appends = ['url'];

    /**
     * Full URL via StorageController (works even without symlink on shared hosting).
     */
    public function getUrlAttribute(): string
    {
        return '/uploads/' . ltrim($this->path, '/');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
