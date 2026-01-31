<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\OoBotService;
use App\Services\LoyaltyService;

class OrderObserver
{
    protected $ooBotService;
    protected $loyaltyService;

    public function __construct(OoBotService $ooBotService, LoyaltyService $loyaltyService)
    {
        $this->ooBotService = $ooBotService;
        $this->loyaltyService = $loyaltyService;
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        if ($order->isDirty('status')) {
            switch ($order->status) {
                case 'preparing': // Confirmed
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
}
