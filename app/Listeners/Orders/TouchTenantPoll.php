<?php

namespace App\Listeners\Orders;

use App\Events\Orders\OrderStatusChanged;
use App\Services\TenantPollService;

/**
 * FASE 2 – ESCALA REAL: Manutenção retrocompatível do arquivo de polling.
 *
 * Mesmo com o Reverb ativo, o arquivo de polling é atualizado para garantir
 * que clientes sem suporte a WebSocket (redes corporativas, proxies) sejam notificados.
 * Pode ser removido após validação completa do Reverb em 100% dos clientes.
 *
 * Agente: @dev
 */
class TouchTenantPoll
{
    // Não enfileirado — deve ser síncrono para garantir que o arquivo
    // seja atualizado antes do próximo ciclo de polling do cliente.
    public function __construct(
        private readonly TenantPollService $pollService
    ) {
    }

    public function handle(OrderStatusChanged $event): void
    {
        $this->pollService->touch($event->order->tenant_id);
    }
}
