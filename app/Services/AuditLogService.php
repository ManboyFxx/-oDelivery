<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

/**
 * FASE 3 – ARQUITETURA EVOLUTIVA
 * @agent @dev
 * 
 * Centraliza o registro de auditoria de todas as ações sensíveis.
 * Elimina código duplicado espalhado entre Controllers e Observers.
 * 
 * Uso: AuditLogService::record($user, 'order.cancelled', $order, ['reason' => $reason]);
 */
class AuditLogService
{
    /**
     * Registra uma ação auditável.
     *
     * @param  \App\Models\User|null $actor  Usuário que executou a ação (null se for sistema)
     * @param  string $action               Ação realizada, ex: 'order.status_changed'
     * @param  Model  $subject              Modelo afetado (Order, Tenant, etc.)
     * @param  array  $metadata             Dados adicionais (old/new values, razões, etc.)
     */
    public static function record($actor, string $action, Model $subject, array $metadata = []): void
    {
        try {
            AuditLog::create([
                'user_id' => $actor?->id,
                'tenant_id' => $actor?->tenant_id ?? ($subject->tenant_id ?? null),
                'action' => $action,
                'subject_type' => get_class($subject),
                'subject_id' => $subject->getKey(),
                'metadata' => json_encode($metadata, JSON_UNESCAPED_UNICODE),
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // Auditoria nunca deve quebrar o fluxo principal
            \Illuminate\Support\Facades\Log::error('AuditLogService: falha ao registrar', [
                'action' => $action,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
