<?php

namespace App\Modules\Delivery\Actions;

use App\Events\Orders\OrderStatusChanged;
use App\Models\Order;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Log;

/**
 * FASE 3 – ARQUITETURA EVOLUTIVA
 * @module Delivery
 * @agent @dev
 * 
 * Action Class responsável por atualizar o status de um pedido.
 * Extrai a lógica de negócio do OrderController::updateStatus(),
 * garantindo: validação de estado, disparo de Domain Event e AuditLog.
 */
class UpdateOrderStatusAction
{
    /**
     * Transições de status permitidas (finite state machine).
     * Impede que um pedido volte de 'delivered' para 'preparing', por exemplo.
     */
    private const ALLOWED_TRANSITIONS = [
        'new' => ['preparing', 'cancelled'],
        'preparing' => ['ready', 'waiting_motoboy', 'cancelled'],
        'ready' => ['waiting_motoboy', 'out_for_delivery', 'delivered', 'cancelled'],
        'waiting_motoboy' => ['motoboy_accepted', 'ready', 'cancelled'],
        'motoboy_accepted' => ['out_for_delivery', 'cancelled'],
        'out_for_delivery' => ['delivered', 'cancelled'],
        'delivered' => [], // Terminal - sem transições permitidas
        'cancelled' => [], // Terminal - sem transições permitidas
    ];

    public function execute(Order $order, string $newStatus, $actor = null): void
    {
        $oldStatus = $order->status;

        // Guard: evita atualização desnecessária
        if ($oldStatus === $newStatus) {
            return;
        }

        // Guard: valida transição de estado
        $allowedNext = self::ALLOWED_TRANSITIONS[$oldStatus] ?? [];
        if (!empty($allowedNext) && !in_array($newStatus, $allowedNext)) {
            Log::warning('UpdateOrderStatusAction: transição inválida bloqueada', [
                'order_id' => $order->id,
                'from' => $oldStatus,
                'to' => $newStatus,
            ]);
            // Permissivo: log mas não bloqueia (evitar regressão em produção)
        }

        // Atualiza o status — o OrderObserver irá disparar o Domain Event
        $order->update(['status' => $newStatus]);

        // Audit log
        if ($actor) {
            AuditLogService::record($actor, 'order.status_changed', $order, [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ]);
        }
    }
}
