<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Adjust Gratuito plan - allow 2 users (funcionários), no motoboys
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update([
                'max_users' => 2,
                'max_motoboys' => 0,
            ]);

        // Ensure Básico plan allows flexible distribution: up to 5 users/motoboys total
        DB::table('plan_limits')
            ->where('plan', 'basic')
            ->update([
                'max_users' => 5,
                'max_motoboys' => 5,
            ]);

        // Pro plan - unlimited
        DB::table('plan_limits')
            ->where('plan', 'pro')
            ->update([
                'max_users' => null,
                'max_motoboys' => null,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original values
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update([
                'max_users' => 1,
                'max_motoboys' => 0,
            ]);

        DB::table('plan_limits')
            ->where('plan', 'basic')
            ->update([
                'max_users' => 5,
                'max_motoboys' => 5,
            ]);

        DB::table('plan_limits')
            ->where('plan', 'pro')
            ->update([
                'max_users' => null,
                'max_motoboys' => null,
            ]);
    }
};
