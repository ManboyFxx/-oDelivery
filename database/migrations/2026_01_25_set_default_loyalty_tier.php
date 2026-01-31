<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Set default tier for any customers that have NULL loyalty_tier
        DB::table('customers')
            ->whereNull('loyalty_tier')
            ->update(['loyalty_tier' => 'bronze']);

        // Set default tier for customers based on their points
        DB::table('customers')
            ->whereNotNull('loyalty_points')
            ->where('loyalty_tier', 'bronze')
            ->get()
            ->each(function ($customer) {
                $tier = match (true) {
                    $customer->loyalty_points >= 1000 => 'diamond',
                    $customer->loyalty_points >= 500 => 'gold',
                    $customer->loyalty_points >= 100 => 'silver',
                    default => 'bronze',
                };

                if ($customer->loyalty_tier !== $tier) {
                    DB::table('customers')
                        ->where('id', $customer->id)
                        ->update(['loyalty_tier' => $tier]);
                }
            });
    }

    public function down(): void
    {
        // Reset to NULL if rolling back
        DB::table('customers')
            ->update(['loyalty_tier' => null]);
    }
};
