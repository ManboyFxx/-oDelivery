<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\OoBotService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 30;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = [10, 30, 60];

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     *
     * @var int
     */
    public $maxExceptions = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Order $order,
        public string $templateKey,
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(OoBotService $ooBotService): void
    {
        Log::info('WhatsApp Message Job Started', [
            'order_id' => $this->order->id,
            'template_key' => $this->templateKey,
        ]);

        try {
            // Reload order with necessary relations to ensure fresh data and prevent lazy loading issues
            $order = Order::with(['tenant.settings', 'items', 'customer'])->find($this->order->id);

            if (!$order) {
                Log::warning('WhatsApp Message Job - Order not found', [
                    'order_id' => $this->order->id,
                ]);
                return;
            }

            // Send notification based on template key
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

            // Re-throw to trigger retry
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('WhatsApp Message Job Failed After Retries', [
            'order_id' => $this->order->id,
            'template_key' => $this->templateKey,
            'error' => $exception->getMessage(),
        ]);

        // Optionally: send alert to admins, update order status, etc.
    }
}
