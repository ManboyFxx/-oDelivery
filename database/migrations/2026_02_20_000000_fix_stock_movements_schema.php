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
            // Rename columns if they exist
            if (Schema::hasColumn('stock_movements', 'created_by') && !Schema::hasColumn('stock_movements', 'user_id')) {
                $table->renameColumn('created_by', 'user_id');
            }

            if (Schema::hasColumn('stock_movements', 'reason') && !Schema::hasColumn('stock_movements', 'description')) {
                $table->renameColumn('reason', 'description');
            }

            // Change quantity to decimal for precision
            $table->decimal('quantity', 10, 3)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            if (Schema::hasColumn('stock_movements', 'user_id') && !Schema::hasColumn('stock_movements', 'created_by')) {
                $table->renameColumn('user_id', 'created_by');
            }

            if (Schema::hasColumn('stock_movements', 'description') && !Schema::hasColumn('stock_movements', 'reason')) {
                $table->renameColumn('description', 'reason');
            }

            $table->integer('quantity')->change();
        });
    }
};
