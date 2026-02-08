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
            if (!Schema::hasColumn('tables', 'position_x')) {
                $table->integer('position_x')->default(0);
            }
            if (!Schema::hasColumn('tables', 'position_y')) {
                $table->integer('position_y')->default(0);
            }
            if (!Schema::hasColumn('tables', 'width')) {
                $table->integer('width')->default(80);
            }
            if (!Schema::hasColumn('tables', 'height')) {
                $table->integer('height')->default(80);
            }
            if (!Schema::hasColumn('tables', 'shape')) {
                $table->string('shape')->default('square'); // square, round
            }
            if (!Schema::hasColumn('tables', 'rotation')) {
                $table->integer('rotation')->default(0);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            $table->dropColumn(['position_x', 'position_y', 'width', 'height', 'shape', 'rotation']);
        });
    }
};
