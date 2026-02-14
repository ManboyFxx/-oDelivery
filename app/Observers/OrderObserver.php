<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\OoBotService;
use App\Services\LoyaltyService;
use App\Services\TenantPollService;

class OrderObserver
{

    protected $ooBotService;
    protected $loyaltyService;
    protected $tenantPollService;

    public function __construct(
        OoBotService $ooBotService,
        LoyaltyService $loyaltyService,
        TenantPollService $tenantPollService
    ) {
        $this->ooBotService = $ooBotService;
        $this->loyaltyService = $loyaltyService;
        $this->tenantPollService = $tenantPollService;
    }

    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        $this->tenantPollService->touch($order->tenant_id);
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Always touch on update to notify frontend
        $this->tenantPollService->touch($order->tenant_id);

        if ($order->isDirty('status')) {
            switch ($order->status) {
                case 'preparing': // Confirmed
                    $order->decrementIngredientsStock();
                    $this->ooBotService->sendOrderConfirmation($order);
                    break;
                case 'ready':
                    $this->ooBotService->sendOrderReady($order);
                    break;
                case 'out_for_delivery':
                    $this->ooBotService->sendOrderOutForDelivery($order);
                    break;
                case 'delivered':
                    $this->ooBotService->sendOrderDelivered($order);

                    // Award loyalty points
                    if ($order->customer && !$order->loyalty_points_earned) {
                        $this->loyaltyService->awardPointsForOrder($order);
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
