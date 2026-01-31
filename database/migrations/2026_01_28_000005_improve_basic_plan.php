<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Melhorar limites do plano básico
        DB::table('plan_limits')
            ->where('plan', 'basic')
            ->update([
                'max_products' => 250,          // 100 → 250 (atende 95% dos restaurantes)
                'max_categories' => null,       // 20 → ilimitado
                'max_coupons' => 15,            // 10 → 15 (múltiplas campanhas)
                'max_motoboys' => 10,           // 5 → 10 (frota maior)
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverter para limites anteriores
        DB::table('plan_limits')
            ->where('plan', 'basic')
            ->update([
                'max_products' => 100,
                'max_categories' => 20,
                'max_coupons' => 10,
                'max_motoboys' => 5,
                'updated_at' => now(),
            ]);
    }
};
