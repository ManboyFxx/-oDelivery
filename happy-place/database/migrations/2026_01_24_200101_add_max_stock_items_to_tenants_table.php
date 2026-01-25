<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('tenants', 'max_stock_items')) {
            Schema::table('tenants', function (Blueprint $table) {
                $table->integer('max_stock_items')->nullable()->after('max_storage_mb');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('tenants', 'max_stock_items')) {
            Schema::table('tenants', function (Blueprint $table) {
                $table->dropColumn('max_stock_items');
            });
        }
    }
};
