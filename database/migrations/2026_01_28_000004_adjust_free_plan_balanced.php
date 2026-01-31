<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ajustar limites do plano gratuito para versão equilibrada
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update([
                'max_products' => 30,           // 20 → 30 (permite cardápio completo)
                'max_orders_per_month' => 300,  // 200 → 300 (~10 pedidos/dia)
                'max_categories' => 8,          // 5 → 8 (organização adequada)
                'max_storage_mb' => 100,        // 50 → 100 MB (~100 fotos)
                'max_motoboys' => 2,            // 0 → 2 (permite testar gestão)
                'max_stock_items' => 20,        // 10 → 20 (teste de estoque)
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverter para limites da Fase 1
        DB::table('plan_limits')
            ->where('plan', 'free')
            ->update([
                'max_products' => 20,
                'max_orders_per_month' => 200,
                'max_categories' => 5,
                'max_storage_mb' => 50,
                'max_motoboys' => 0,
                'max_stock_items' => 10,
                'updated_at' => now(),
            ]);
    }
};
