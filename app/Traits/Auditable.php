<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

trait Auditable
{
    /**
     * Boot the auditable trait.
     */
    protected static function bootAuditable(): void
    {
        static::created(function ($model) {
            try {
                self::createAuditLog($model, 'created', null, $model->toArray());
            } catch (\Exception $e) {
                Log::warning('Audit logging failed for created event', [
                    'model' => get_class($model),
                    'id' => $model->id,
                    'error' => $e->getMessage(),
                ]);
            }
        });

        static::updated(function ($model) {
            try {
                $changes = $model->getChanges();

                // Get original values for comparison
                $oldValues = [];
                foreach ($changes as $key => $newValue) {
                    if ($model->isDirty($key)) {
                        $oldValues[$key] = $model->getOriginal($key);
                    }
                }

                if (!empty($oldValues)) {
                    self::createAuditLog($model, 'updated', $oldValues, $changes);
                }
            } catch (\Exception $e) {
                Log::warning('Audit logging failed for updated event', [
                    'model' => get_class($model),
                    'id' => $model->id,
                    'error' => $e->getMessage(),
                ]);
            }
        });

        static::deleted(function ($model) {
            try {
                self::createAuditLog($model, 'deleted', $model->toArray(), null);
            } catch (\Exception $e) {
                Log::warning('Audit logging failed for deleted event', [
                    'model' => get_class($model),
                    'id' => $model->id,
                    'error' => $e->getMessage(),
                ]);
            }
        });
    }

    /**
     * Create an audit log entry
     */
    private static function createAuditLog($model, string $action, ?array $oldValues, ?array $newValues): void
    {
        try {
            $user = auth()->user();
            $tenantId = $model->tenant_id ?? $user?->tenant_id ?? null;

            AuditLog::create([
                'user_id' => $user?->id,
                'tenant_id' => $tenantId,
                'action' => $action,
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'old_values' => $oldValues ? json_encode($oldValues) : null,
                'new_values' => $newValues ? json_encode($newValues) : null,
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create audit log', [
                'error' => $e->getMessage(),
                'model' => get_class($model),
            ]);
        }
    }
}
