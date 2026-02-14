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
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->uuid('ingredient_id')->nullable()->after('product_id');
            $table->foreign('ingredient_id')->references('id')->on('ingredients')->onDelete('cascade');

            // Allow product_id to be nullable if it's an ingredient movement
            $table->uuid('product_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['ingredient_id']);
            $table->dropColumn('ingredient_id');
            $table->uuid('product_id')->nullable(false)->change();
        });
    }
};
