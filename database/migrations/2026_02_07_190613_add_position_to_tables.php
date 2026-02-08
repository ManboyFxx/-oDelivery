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
        Schema::table('tables', function (Blueprint $table) {
            $table->integer('position_x')->default(0)->nullable();
            $table->integer('position_y')->default(0)->nullable();
            $table->integer('width')->default(100)->nullable();
            $table->integer('height')->default(100)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            $table->dropColumn(['position_x', 'position_y', 'width', 'height']);
        });
    }
};
