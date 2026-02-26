<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\OoBotService;
use App\Services\LoyaltyService;
use App\Services\TenantPollService;
use App\Services\NotificationService;
use App\Notifications\NewOrderNotification;
use App\Notifications\OrderStatusChangedNotification;
use App\Models\User;

class OrderObserver
{

    protected $ooBotService;
    protected $loyaltyService;
    protected $tenantPollService;
    protected $notificationService;

    public function __construct(
        OoBotService $ooBotService,
        LoyaltyService $loyaltyService,
        TenantPollService $tenantPollService,
        NotificationService $notificationService
    ) {
        $this->ooBotService = $ooBotService;
        $this->loyaltyService = $loyaltyService;
        $this->tenantPollService = $tenantPollService;
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        $this->tenantPollService->touch($order->tenant_id);

        // Notify Merchants (Admins/Employees) of the tenant
        $merchants = User::where('tenant_id', $order->tenant_id)
            ->whereIn('role', ['admin', 'employee'])
            ->get();

        foreach ($merchants as $merchant) {
            /** @var User $merchant */
            $merchant->notify(new NewOrderNotification($order));
        }
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Always touch on update to notify frontend
        $this->tenantPollService->touch($order->tenant_id);

        if ($order->isDirty('status')) {
            $oldStatus = $order->getOriginal('status');
            $newStatus = $order->status;

            // Handle specific notifications vs generic status change
            if ($newStatus === 'motoboy_accepted') {
                $this->notificationService->sendOrderAccepted($order, $order->motoboy);
            } elseif ($newStatus === 'delivered') {
                $this->notificationService->sendOrderDelivered($order);
            } else {
                $this->notificationService->sendOrderStatusChanged($order, $oldStatus, $newStatus);
            }

            switch ($newStatus) {
                case 'preparing': // Confirmed
                    $order->decrementIngredientsStock();
                    try {
                        \App\Jobs\SendWhatsAppMessageJob::dispatch($order, 'order_confirmed');
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::error('Dispatch WhatsApp Job Failed (order_confirmed): ' . $e->getMessage());
                    }
                    break;
                case 'ready':
                    try {
                        \App\Jobs\SendWhatsAppMessageJob::dispatch($order, 'order_ready');
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::error('Dispatch WhatsApp Job Failed (order_ready): ' . $e->getMessage());
                    }
                    break;
                case 'out_for_delivery':
                    try {
                        \App\Jobs\SendWhatsAppMessageJob::dispatch($order, 'order_out_for_delivery');
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::error('Dispatch WhatsApp Job Failed (order_out_for_delivery): ' . $e->getMessage());
                    }
                    break;
                case 'delivered':
                    try {
                        \App\Jobs\SendWhatsAppMessageJob::dispatch($order, 'order_delivered');
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::error('Dispatch WhatsApp Job Failed (order_delivered): ' . $e->getMessage());
                    }

                    // Award loyalty points
                    if ($order->customer && !$order->loyalty_points_earned) {
                        $this->loyaltyService->awardPointsForOrder($order);
                    }
                    break;
                case 'cancelled':
                    try {
                        \App\Jobs\SendWhatsAppMessageJob::dispatch($order, 'order_cancelled');
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::error('Dispatch WhatsApp Job Failed (order_cancelled): ' . $e->getMessage());
                    }
                    break;
            }
        }
    }

    /**
     * Handle the Order "deleted" event.
     */
    public function deleted(Order $order): void
    {
        $this->tenantPollService->touch($order->tenant_id);
    }
}
