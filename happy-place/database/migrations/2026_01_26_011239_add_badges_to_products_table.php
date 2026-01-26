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
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_promotional')->default(false)->comment('Badge: Promoção 🔥');
            $table->boolean('is_new')->default(false)->comment('Badge: Novo ✨');
            $table->boolean('is_exclusive')->default(false)->comment('Badge: Exclusivo 💎');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['is_promotional', 'is_new', 'is_exclusive']);
        });
    }
};
