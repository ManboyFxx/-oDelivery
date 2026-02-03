<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Rename 'free' plan from "Plano Start" to "Gratuito"
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update(['display_name' => 'Gratuito']);

        // 2. Rename 'pro' plan from "Plano Pro" to "Pro"
        DB::table('plan_limits')
            ->where('plan', 'pro')
            ->update(['display_name' => 'Pro']);

        // 3. Rename 'custom' plan from "Plano Personalizado" to "Personalizado"
        DB::table('plan_limits')
            ->where('plan', 'custom')
            ->update(['display_name' => 'Personalizado']);

        // 4. Remove 'basic' and 'starter' if they exist (Clean up)
        DB::table('plan_limits')
            ->whereIn('plan', ['basic', 'starter'])
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Ideally we would revert names, but this is a fix-forward.
    }
};
