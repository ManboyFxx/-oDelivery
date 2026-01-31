<?php

namespace App\Jobs;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CleanupOldOrders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $cutoffDate = Carbon::now()->subDays(15);

        // Soft delete orders older than 15 days that are completed
        $deletedCount = Order::whereNull('deleted_at')
            ->where('created_at', '<', $cutoffDate)
            ->whereIn('status', ['delivered', 'completed', 'cancelled'])
            ->update(['deleted_at' => now()]);

        Log::info("CleanupOldOrders: {$deletedCount} orders soft-deleted (older than 15 days)");

        // Permanently delete orders that were soft-deleted more than 30 days ago
        $permanentDeleteDate = Carbon::now()->subDays(30);
        $permanentDeleted = Order::onlyTrashed()
            ->where('deleted_at', '<', $permanentDeleteDate)
            ->forceDelete();

        Log::info("CleanupOldOrders: {$permanentDeleted} orders permanently deleted (soft-deleted > 30 days ago)");
    }
}
