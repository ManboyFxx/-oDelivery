<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\CleanupOldOrders;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Run cleanup of old orders daily at 3 AM
        $schedule->job(new CleanupOldOrders())->dailyAt('03:00');

        // Expire loyalty points daily at 4 AM
        $schedule->job(new \App\Jobs\ExpireLoyaltyPoints())->dailyAt('04:00');

        // Cleanup demo tenants hourly
        $schedule->command('demo:cleanup')->hourly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
