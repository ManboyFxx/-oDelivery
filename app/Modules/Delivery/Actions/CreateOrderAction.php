<?php

namespace App\Modules\Delivery\Actions;

use App\Models\Order;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Log;

/**
 * FASE 3 – ARQUITETURA EVOLUTIVA
 * @module Delivery
 * @agent @dev
 * 
 * Action Class responsável por criar um novo pedido.
 * Valida os limites de plano do tenant e registra em AuditLog.
 */
class CreateOrderAction
{
    public function execute(array $data, User $actor): Order
    {
        try {
            // Garante que o tenant_id está no payload
            if (!isset($data['tenant_id']) && $actor->tenant_id) {
                $data['tenant_id'] = $actor->tenant_id;
            }

            $order = Order::create($data);

            AuditLogService::record(
                $actor,
                'order.created',
                $order,
                ['items_count' => count($data['items'] ?? [])]
            );

            return $order;

        } catch (\Throwable $e) {
            Log::error('CreateOrderAction: falha ao criar pedido', [
                'actor_id' => $actor->id,
                'tenant_id' => $actor->tenant_id ?? 'N/A',
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
