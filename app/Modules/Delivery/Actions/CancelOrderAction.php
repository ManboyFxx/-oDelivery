<?php

namespace App\Modules\Delivery\Actions;

use App\Models\Order;
use App\Services\AuditLogService;
use App\Services\CancellationService;

/**
 * FASE 3 – ARQUITETURA EVOLUTIVA
 * @module Delivery
 * @agent @dev
 * 
 * Action Class responsável por cancelar um pedido.
 * Delega o estorno de pontos e notificações para o CancellationService.
 * O OrderObserver dispara os Domain Events após o update do status.
 */
class CancelOrderAction
{
    public function __construct(
        private readonly CancellationService $cancellationService
    ) {
    }

    public function execute(Order $order, string $reason, $actor = null): void
    {
        // Idempotência: evita duplicar cancelamento
        if ($order->status === 'cancelled') {
            return;
        }

        // Delega para o CancellationService (reverte pontos loyalty, etc.)
        $this->cancellationService->cancel($order, $reason);

        // Audit log com responsável pela ação
        if ($actor) {
            AuditLogService::record($actor, 'order.cancelled', $order, [
                'reason' => $reason,
            ]);
        }
    }
}
