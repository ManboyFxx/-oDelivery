<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;

class LoyaltyService
{
    /**
     * Award points to customer after order completion
     * 
     * Primary: 1 point per R$ 10 spent
     * Bonus: +10 points every 5 orders in the month
     */
    public function awardPointsForOrder(Order $order): void
    {
        if (!$order->customer) {
            return;
        }

        $customer = $order->customer;
        $totalPoints = 0;
        $descriptions = [];

        // Primary: 1 point per R$ 10
        $purchasePoints = floor($order->total / 10);
        if ($purchasePoints > 0) {
            $totalPoints += $purchasePoints;
            $descriptions[] = "Compra de R$ " . number_format($order->total, 2, ',', '.');
        }

        // Frequency Bonus: +10 points every 5 orders
        $monthlyOrders = $customer->orders()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('status', 'completed')
            ->count();

        if ($monthlyOrders > 0 && $monthlyOrders % 5 === 0) {
            $totalPoints += 10;
            $descriptions[] = "🎉 Bônus de Frequência (5º pedido do mês)";
        }

        // Award points
        if ($totalPoints > 0) {
            $customer->addPoints(
                $totalPoints,
                $order->id,
                implode(' + ', $descriptions)
            );

            // Update tier after points change
            $customer->updateLoyaltyTier();

            // Save earned points in order record
            $order->update([
                'loyalty_points_earned' => $totalPoints
            ]);
        }
    }

    /**
     * Check if customer can redeem product with points
     */
    public function canRedeemProduct(Customer $customer, $product): bool
    {
        if (!$product->loyalty_redeemable) {
            return false;
        }

        return $customer->loyalty_points >= $product->loyalty_points_cost;
    }

    /**
     * Redeem product with points
     */
    public function redeemProduct(Customer $customer, $product, ?string $orderId = null): bool
    {
        if (!$this->canRedeemProduct($customer, $product)) {
            return false;
        }

        return $customer->redeemPoints(
            $product->loyalty_points_cost,
            $orderId,
            "Resgate: {$product->name}"
        );
    }
}
