<?php

namespace App\Jobs;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExpireTrialsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('ExpireTrialsJob: Starting trial expiration check');

        // Find all tenants with expired trials
        $expiredTrials = Tenant::where('subscription_status', 'trial')
            ->where('trial_ends_at', '<=', now())
            ->get();

        Log::info("ExpireTrialsJob: Found {$expiredTrials->count()} expired trials");

        foreach ($expiredTrials as $tenant) {
            try {
                Log::info("ExpireTrialsJob: Processing tenant {$tenant->id} ({$tenant->name})");

                // Downgrade to FREE plan
                // Data is RETAINED, only limits are applied
                $tenant->update([
                    'plan' => 'free',
                    'subscription_status' => 'free',
                    'trial_ends_at' => null,
                ]);

                // TODO: Send notification to tenant admins
                // $tenant->users()->where('role', 'admin')->each(function ($admin) {
                //     $admin->notify(new TrialExpiredNotification());
                // });

                Log::info("ExpireTrialsJob: Successfully downgraded tenant {$tenant->id} to FREE");
            } catch (\Exception $e) {
                Log::error("ExpireTrialsJob: Failed to process tenant {$tenant->id}: {$e->getMessage()}");
            }
        }

        Log::info('ExpireTrialsJob: Completed');
    }
}
