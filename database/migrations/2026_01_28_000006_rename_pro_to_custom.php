<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Renomear plano 'pro' para 'custom' (Personalizado)
        DB::table('plan_limits')
            ->where('plan', 'pro')
            ->update([
                'plan' => 'custom',
                'display_name' => 'Personalizado',
                'max_units' => 1, // Remover multi-unit por enquanto (feature não implementada)
                'updated_at' => now(),
            ]);

        // Atualizar tenants que usam plano 'pro'
        DB::table('tenants')
            ->where('plan', 'pro')
            ->update([
                'plan' => 'custom',
                'updated_at' => now(),
            ]);

        // Remover feature 'multi_unit' das features (não implementada ainda)
        $customPlan = DB::table('plan_limits')->where('plan', 'custom')->first();

        if ($customPlan && $customPlan->features) {
            $features = json_decode($customPlan->features, true);

            // Remover 'multi_unit' se existir
            $features = array_diff($features, ['multi_unit']);

            DB::table('plan_limits')
                ->where('plan', 'custom')
                ->update([
                    'features' => json_encode(array_values($features)),
                    'updated_at' => now(),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverter nome do plano
        DB::table('plan_limits')
            ->where('plan', 'custom')
            ->update([
                'plan' => 'pro',
                'display_name' => 'Pro',
                'max_units' => 10,
                'updated_at' => now(),
            ]);

        // Reverter tenants
        DB::table('tenants')
            ->where('plan', 'custom')
            ->update([
                'plan' => 'pro',
                'updated_at' => now(),
            ]);

        // Re-adicionar feature 'multi_unit'
        $proPlan = DB::table('plan_limits')->where('plan', 'pro')->first();

        if ($proPlan && $proPlan->features) {
            $features = json_decode($proPlan->features, true);

            if (!in_array('multi_unit', $features)) {
                $features[] = 'multi_unit';
            }

            DB::table('plan_limits')
                ->where('plan', 'pro')
                ->update([
                    'features' => json_encode(array_values($features)),
                    'updated_at' => now(),
                ]);
        }
    }
};
