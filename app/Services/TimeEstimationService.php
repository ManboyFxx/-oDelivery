<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Tenant;

class TimeEstimationService
{
    /**
     * Estimate delivery/preparation time for a tenant based on current volume.
     * 
     * @param Tenant $tenant
     * @param string|null $mode (delivery, pickup)
     * @return int minutes
     */
    public function estimateForTenant(Tenant $tenant, ?string $mode = null): int
    {
        $settings = $tenant->settings;

        // 1. Get Base Time from Settings
        $baseTime = $settings->estimated_delivery_time ?? 40;

        // 2. Count Active Orders (In the "House")
        // We consider 'new' (not yet confirmed) and 'preparing' (in kitchen)
        $activeOrdersCount = Order::where('tenant_id', $tenant->id)
            ->whereIn('status', ['new', 'confirmed', 'preparing'])
            ->count();

        // 3. Calculate Dynamic Delay
        // Formula: +5 minutes for every 3 active orders
        // Example: 0-2 orders = +0m, 3-5 orders = +5m, 6-8 orders = +10m, etc.
        $dynamicDelay = floor($activeOrdersCount / 3) * 5;

        // 4. Mode-specific adjustments (optional)
        $modeAdjustment = 0;
        if ($mode === 'pickup') {
            $modeAdjustment = -10; // Pickup is usually faster than delivery
        }

        // 5. Final Calculation with sensible bounds
        $estimatedTime = $baseTime + $dynamicDelay + $modeAdjustment;

        // Ensure we don't return ridiculous values
        return (int) max(15, min(120, $estimatedTime));
    }

    /**
     * Get a human-readable estimate range (e.g., "45-60 min")
     */
    public function getEstimateRange(Tenant $tenant, ?string $mode = null): string
    {
        $minutes = $this->estimateForTenant($tenant, $mode);

        // Create a range of 15 minutes around the estimate
        $min = max(15, $minutes - 5);
        $max = $minutes + 10;

        return "{$min}-{$max} min";
    }
}
