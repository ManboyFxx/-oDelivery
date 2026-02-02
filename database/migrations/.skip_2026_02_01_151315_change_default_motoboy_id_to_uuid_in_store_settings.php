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
        Schema::table('store_settings', function (Blueprint $table) {
            if (Schema::hasColumn('store_settings', 'default_motoboy_id')) {
                try {
                    $table->dropForeign(['default_motoboy_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist
                }

                // Change column to UUID type
                $table->string('default_motoboy_id', 36)->nullable()->change();

                // Re-add the foreign key constraint
                $table->foreign('default_motoboy_id')->references('id')->on('users')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            if (Schema::hasColumn('store_settings', 'default_motoboy_id')) {
                try {
                    $table->dropForeign(['default_motoboy_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist
                }

                $table->unsignedBigInteger('default_motoboy_id')->nullable()->change();
            }
        });
    }
};
