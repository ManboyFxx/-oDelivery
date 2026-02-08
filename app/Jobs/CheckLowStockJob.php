<?php

namespace App\Jobs;

use App\Models\Tenant;
use App\Models\Ingredient;
use App\Models\User;
use App\Notifications\LowStockNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CheckLowStockJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('CheckLowStockJob: Starting low stock check');

        // Get all active tenants
        $tenants = Tenant::where('status', 'active')->get();

        foreach ($tenants as $tenant) {
            // Check ingredients for this tenant with low stock
            // Note: Assuming ingredients table has a 'stock' column. If not, this needs adjustment.
            $lowStockIngredients = Ingredient::where('tenant_id', $tenant->id)
                ->whereNotNull('min_stock')
                ->where('min_stock', '>', 0)
                ->whereRaw('COALESCE(stock, 0) <= min_stock')
                ->get();

            if ($lowStockIngredients->count() > 0) {
                // Get tenant admin users to notify
                $admins = User::where('tenant_id', $tenant->id)
                    ->where('role', 'admin')
                    ->get();

                foreach ($admins as $admin) {
                    $admin->notify(new LowStockNotification($lowStockIngredients, $tenant));
                }

                Log::info("CheckLowStockJob: Notified {$admins->count()} admins for tenant {$tenant->id} about {$lowStockIngredients->count()} low stock items");
            }
        }

        Log::info('CheckLowStockJob: Completed low stock check');
    }
}
