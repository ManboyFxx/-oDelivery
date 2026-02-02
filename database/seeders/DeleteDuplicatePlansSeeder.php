<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeleteDuplicatePlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Remove duplicate plans (legacy keys)
        \App\Models\PlanLimit::whereIn('plan', ['start', 'price_basic'])->delete();

        // 2. Rename Scale/Custom to "Plano Personalizado"
        \App\Models\PlanLimit::updateOrCreate(
            ['plan' => 'custom'],
            [
                'display_name' => 'Plano Personalizado'
            ]
        );

        // 3. Ensure 'free' and 'pro' exist (just in case, but UpdatePlanLimitsSeeder handles detailed attributes)
        // This seeder focuses on CLEANUP.
    }
}
