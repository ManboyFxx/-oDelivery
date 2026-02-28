<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\WhatsAppMessageLog;
use App\Services\OoBotService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * FASE 1 – BLINDAGEM: Idempotência adicionada.
 *
 * Antes de despachar a mensagem, o job verifica no WhatsAppMessageLog se já
 * existe um registro com status='sent' para a combinação (order_id, template_key).
 * Se existir, o job encerra silenciosamente sem re-envio — protegendo o cliente
 * de receber a mesma mensagem duas vezes em caso de retry na fila.
 */
class SendWhatsAppMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** @var int Timeout do job em segundos */
    public $timeout = 30;

    /**
     * Backoff exponencial: aguarda 10s, depois 30s, depois 60s antes de cada retry.
     * @var array<int>
     */
    public $backoff = [10, 30, 60];

    /** @var int Máximo de exceções antes de marcar como falha permanente */
    public $maxExceptions = 3;

    public function __construct(
        public Order $order,
        public string $templateKey,
    ) {
    }

    public function handle(OoBotService $ooBotService): void
    {
        // ── IDEMPOTÊNCIA ────────────────────────────────────────────────────
        // Verifica se essa combinação (order + template) já foi enviada com êxito.
        // É seguro contra retries causados por falhas de rede ou restart do worker.
        $alreadySent = WhatsAppMessageLog::where('order_id', $this->order->id)
            ->where('template_key', $this->templateKey)
            ->where('status', 'sent')
            ->exists();

        if ($alreadySent) {
            Log::info('WhatsApp Job: skipped (already sent — idempotency guard)', [
                'order_id' => $this->order->id,
                'template_key' => $this->templateKey,
            ]);
            return;
        }
        // ────────────────────────────────────────────────────────────────────

        Log::info('WhatsApp Message Job Started', [
            'order_id' => $this->order->id,
            'template_key' => $this->templateKey,
        ]);

        try {
            // Recarrega o pedido com relações para garantir dados frescos
            $order = Order::with(['tenant.settings', 'items', 'customer'])
                ->find($this->order->id);

            if (!$order) {
                Log::warning('WhatsApp Message Job - Order not found', [
                    'order_id' => $this->order->id,
                ]);
                return;
            }

            $result = match ($this->templateKey) {
                'order_confirmed' => $ooBotService->sendOrderConfirmation($order),
                'order_ready' => $ooBotService->sendOrderReady($order),
                'order_out_for_delivery' => $ooBotService->sendOrderOutForDelivery($order),
                'order_delivered' => $ooBotService->sendOrderDelivered($order),
                'order_cancelled' => $ooBotService->sendOrderCancelled($order),
                'motoboy_assigned' => $ooBotService->sendMotoboyAssigned($order),
                'order_approaching' => $ooBotService->sendOrderApproaching($order),
                default => false,
            };

            if ($result) {
                Log::info('WhatsApp Message Job Completed', [
                    'order_id' => $this->order->id,
                    'template_key' => $this->templateKey,
                ]);
            } else {
                Log::warning('WhatsApp Message Job - Failed to send message', [
                    'order_id' => $this->order->id,
                    'template_key' => $this->templateKey,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('WhatsApp Message Job Exception', [
                'order_id' => $this->order->id,
                'template_key' => $this->templateKey,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-lança para disparar o retry com backoff exponencial
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('WhatsApp Message Job Failed After Retries', [
            'order_id' => $this->order->id,
            'template_key' => $this->templateKey,
            'error' => $exception->getMessage(),
        ]);
    }
}
