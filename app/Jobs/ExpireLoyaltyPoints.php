<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Models\StoreSetting;
use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExpireLoyaltyPoints implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting ExpireLoyaltyPoints job...');

        // Iterate over tenants that have loyalty enabled and expiry configured
        $settings = StoreSetting::where('loyalty_enabled', true)
            ->where('loyalty_expiry_days', '>', 0)
            ->get();

        foreach ($settings as $setting) {
            $this->processTenant($setting);
        }

        Log::info('ExpireLoyaltyPoints job finished.');
    }

    protected function processTenant(StoreSetting $setting)
    {
        $tenantId = $setting->tenant_id; // StoreSettings might be global (null) or tenant specific. Assuming tenant_id is set.
        if (!$tenantId)
            return;

        $expiryDate = now()->subDays($setting->loyalty_expiry_days);

        // Find customers with points > 0
        // And last completed order older than expiryDate
        // OR no orders (but have points? maybe manual add? then check updated_at or history)

        // Simpler approach: Check distinct customers with points > 0 in this tenant
        $customers = Customer::where('tenant_id', $tenantId)
            ->where('loyalty_points', '>', 0)
            ->get();

        foreach ($customers as $customer) {
            $lastOrder = $customer->orders()
                ->where('status', 'completed')
                ->latest()
                ->first();

            $lastActivity = $lastOrder ? $lastOrder->created_at : $customer->created_at;

            // If we want to consider point earning activity as well (e.g. manual add), we should check loyalty history too.
            // But let's stick to "Order Activity" as the driver for retention.

            if ($lastActivity->lt($expiryDate)) {
                // Expire points
                $points = $customer->loyalty_points;

                $customer->loyalty_points = 0;
                $customer->save();

                // Record history
                $customer->loyaltyHistory()->create([
                    'tenant_id' => $tenantId,
                    'points' => -$points,
                    'type' => 'expired',
                    'description' => "Expiração por inatividade ({$setting->loyalty_expiry_days} dias sem comprar)",
                ]);

                // Notify
                \App\Models\Notification::create([
                    'customer_id' => $customer->id,
                    'title' => 'Seus pontos expiraram 😢',
                    'message' => "Seus {$points} pontos expiraram devido à inatividade.",
                    'type' => 'loyalty',
                    'icon' => 'Clock',
                    'color' => '#888888',
                    'read_at' => null,
                ]);

                Log::info("Expired {$points} points for customer {$customer->id} (Tenant {$tenantId})");
            }
        }
    }
}
