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
        if (!Schema::hasColumn('plan_limits', 'max_stock_items')) {
            Schema::table('plan_limits', function (Blueprint $table) {
                $table->integer('max_stock_items')->nullable()->after('max_products');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_limits', function (Blueprint $table) {
            $table->dropColumn('max_stock_items');
        });
    }
};
