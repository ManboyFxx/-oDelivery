<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Remover motoboys do plano gratuito
        // Gestão de motoboys deve ser feature exclusiva de planos pagos
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update([
                'max_motoboys' => 0,  // 2 → 0 (sem motoboys no gratuito)
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverter para permitir 2 motoboys
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update([
                'max_motoboys' => 2,
                'updated_at' => now(),
            ]);
    }
};
