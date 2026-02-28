<?php

namespace App\Listeners\Orders;

use App\Events\Orders\OrderStatusChanged;
use App\Jobs\SendWhatsAppMessageJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * FASE 2 – ESCALA REAL: Envio de notificações WhatsApp pelo Domain Event.
 *
 * Extrai toda a lógica de disparo do WhatsApp que estava no switch/case
 * monolítico do OrderObserver, tornando-a independente e testável.
 *
 * Agente: @dev
 */
class SendWhatsAppNotification implements ShouldQueue
{
    public $queue = 'default';

    // Template map: status -> templateKey
    private array $statusTemplates = [
        'preparing' => 'order_confirmed',
        'ready' => 'order_ready',
        'out_for_delivery' => 'order_out_for_delivery',
        'delivered' => 'order_delivered',
        'cancelled' => 'order_cancelled',
    ];

    public function handle(OrderStatusChanged $event): void
    {
        $order = $event->order;
        $newStatus = $event->newStatus;

        // Dispatch para motoboy se atribuído
        if (in_array($newStatus, ['motoboy_accepted', 'waiting_motoboy']) && $order->motoboy_id) {
            try {
                SendWhatsAppMessageJob::dispatch($order, 'motoboy_assigned');
            } catch (\Throwable $e) {
                Log::error('SendWhatsAppNotification: falha motoboy_assigned', ['order_id' => $order->id, 'error' => $e->getMessage()]);
            }
            return;
        }

        // Templates padrão por status
        if (isset($this->statusTemplates[$newStatus])) {
            try {
                SendWhatsAppMessageJob::dispatch($order, $this->statusTemplates[$newStatus]);
            } catch (\Throwable $e) {
                Log::error('SendWhatsAppNotification: falha dispatch', [
                    'order_id' => $order->id,
                    'status' => $newStatus,
                    'template' => $this->statusTemplates[$newStatus],
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
