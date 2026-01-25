<?php

namespace App\Models;


use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class WhatsAppTemplate extends Model
{
    use HasUuid;

    protected $table = 'whatsapp_templates';

    protected $fillable = [
        'key',
        'name',
        'message',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function replaceVariables(array $data): string
    {
        $message = $this->message;

        foreach ($data as $key => $value) {
            $message = str_replace("{{{$key}}}", $value, $message);
        }

        return $message;
    }
}
