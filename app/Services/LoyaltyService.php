<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;

class LoyaltyService
{
    /**
     * Award points to customer after order completion
     */
    public function awardPointsForOrder(Order $order): void
    {
        if (!$order->customer) {
            return;
        }

        $settings = \App\Models\StoreSetting::where('tenant_id', $order->tenant_id)->first();

        if (!$settings || !$settings->loyalty_enabled) {
            return;
        }

        $customer = $order->customer;
        $totalPoints = 0;
        $descriptions = [];

        // 1. Base Points
        $basePoints = floor($order->total_amount * ($settings->points_per_currency ?? 1));
        $totalPoints += $basePoints;

        // 2. Product Accelerators
        foreach ($order->items as $item) {
            if ($item->product && $item->product->loyalty_points_multiplier > 1.0) {
                $itemBasePoints = $item->price * $item->quantity * ($settings->points_per_currency ?? 1);
                $extraPoints = $itemBasePoints * ($item->product->loyalty_points_multiplier - 1);
                $totalPoints += $extraPoints;
                // Avoid too many descriptions
                if (count($descriptions) < 3) {
                    $descriptions[] = "Turbo: {$item->product->name}";
                }
            }
        }

        // 3. Tier Bonus Multiplier
        $tierMultiplier = $customer->getTierBonusMultiplier();
        if ($tierMultiplier > 1) {
            $tierBonus = (int) ceil($totalPoints * ($tierMultiplier - 1));
            $totalPoints += $tierBonus;
            $descriptions[] = "Bônus Nível " . ucfirst($customer->loyalty_tier ?? 'Bronze');
        }

        // 4. Frequency Bonus
        // Check orders in current month
        $monthlyOrders = $customer->orders()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('status', 'completed') // Assuming completed status exists
            ->count();

        // If this is the 5th, 10th, etc order
        if ($monthlyOrders > 0 && $monthlyOrders % 5 === 0) {
            $bonus = 10; // Fixed bonus or setting? Using 10 as placeholder
            $totalPoints += $bonus;
            $descriptions[] = "Bônus Frequência (5º pedido)";
        }

        // Award points
        if ($totalPoints > 0) {
            $customer->addPoints(
                (int) $totalPoints,
                $order->id,
                empty($descriptions) ? 'Pontos por compra' : implode(' | ', $descriptions)
            );

            // Update tier after points change
            $customer->updateLoyaltyTier();

            // Save earned points in order record
            $order->update([
                'loyalty_points_earned' => (int) $totalPoints
            ]);

            // Process Referral Reward (only on first order usually)
            $this->processReferralReward($customer, $settings);
        }
    }

    protected function processReferralReward(Customer $customer, \App\Models\StoreSetting $settings)
    {
        if ($settings->referral_bonus_points > 0 && $customer->referred_by) {
            $completedOrdersCount = $customer->orders()->where('status', 'completed')->count();

            // If this is the first order (current order is already completed/paid presumably)
            if ($completedOrdersCount === 1) {
                // Check Minimum Order Amount for Referral Reward
                // We need the current order instance, but this method only receives customer.
                // Assuming the last order is the one triggering this.
                $lastOrder = $customer->orders()->latest()->first();

                if ($lastOrder && $lastOrder->total_amount >= ($settings->min_order_for_referral ?? 0)) {
                    $referrer = $customer->referrer;
                    if ($referrer) {
                        $referrer->addPoints($settings->referral_bonus_points, null, "Bônus por indicar " . $customer->name);
                    }
                }
            }
        }
    }

    /**
     * Calculate discount value for a given amount of points
     */
    public function calculateDiscountForPoints(string $tenantId, int $points): float
    {
        $settings = \App\Models\StoreSetting::where('tenant_id', $tenantId)->first();
        if (!$settings || !$settings->loyalty_enabled) {
            return 0;
        }

        return $points * ($settings->currency_per_point ?? 0.10);
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
