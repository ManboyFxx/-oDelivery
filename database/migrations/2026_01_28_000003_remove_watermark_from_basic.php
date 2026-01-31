<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('plan_limits')
            ->where('plan', 'basic')
            ->update([
                'show_watermark' => false,  // ⬇️ De true para false
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('plan_limits')
            ->where('plan', 'basic')
            ->update([
                'show_watermark' => true,
            ]);
    }
};
