<?php

namespace App\Models;


use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class WhatsAppMessageLog extends Model
{
    use HasUuid;

    protected $table = 'whatsapp_message_logs';

    protected $fillable = [
        'tenant_id',
        'order_id',
        'phone_number',
        'template_key',
        'message_sent',
        'status',
        'error_message',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function scopeRecent(Builder $query, int $limit = 50): Builder
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }
}
