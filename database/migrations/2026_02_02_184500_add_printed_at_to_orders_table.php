<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('orders', 'printed_at')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->timestamp('printed_at')->nullable()->after('cancellation_reason');
                $table->index('printed_at'); // Add index for performance in printer polling
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('printed_at');
        });
    }
};
