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

        $customer = $order->customer;
        $tenantId = $order->tenant_id;
        $settings = \App\Models\StoreSetting::where('tenant_id', $tenantId)->first();

        if (!$settings || !$settings->loyalty_enabled) {
            return;
        }

        $pointsRate = $settings->points_per_currency ?? 1.0;
        $totalPoints = 0;
        $descriptions = [];

        // 1. Base Points from Purchase
        $basePoints = (int) ceil($order->total * $pointsRate);
        if ($basePoints > 0) {
            $totalPoints = $basePoints;
            $descriptions[] = "Compra de R$ " . number_format($order->total, 2, ',', '.');
        }

        // 2. Active Promotion Multiplier
        $activePromotion = \App\Models\LoyaltyPromotion::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();

        if ($activePromotion && $activePromotion->multiplier > 1) {
            $promoBonus = (int) ceil($totalPoints * ($activePromotion->multiplier - 1));
            $totalPoints += $promoBonus;
            $descriptions[] = "Promoção: {$activePromotion->name} ({$activePromotion->multiplier}x)";
        }

        // 3. Tier Bonus Multiplier
        $tierMultiplier = $customer->getTierBonusMultiplier();
        if ($tierMultiplier > 1) {
            $tierBonus = (int) ceil($totalPoints * ($tierMultiplier - 1));
            $totalPoints += $tierBonus;
            $descriptions[] = "Bônus de Nível: " . ucfirst($customer->loyalty_tier);
        }

        // 4. Frequency Bonus (Keep existing logic but make it dynamic if needed)
        $monthlyOrders = $customer->orders()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('status', 'completed')
            ->count();

        if ($monthlyOrders > 0 && $monthlyOrders % 5 === 0) {
            $totalPoints += 10;
            $descriptions[] = "🎉 Bônus de Frequência (5º pedido)";
        }

        // Award points
        if ($totalPoints > 0) {
            $customer->addPoints(
                $totalPoints,
                $order->id,
                implode(' | ', $descriptions)
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
