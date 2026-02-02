<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('motoboy_location_history', function (Blueprint $table) {
            // Drop foreign key first if it exists (naming convention varies, trying standard)
            // Note: SQLite doesn't support dropping foreign keys easily, but we are on MySQL (Hostinger)
            $table->dropForeign(['motoboy_id']);

            // Rename column
            $table->renameColumn('motoboy_id', 'user_id');

            // Re-add foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Fix index if needed (renameColumn usually handles index, but let's be safe)
            // dropping old index if manually named? Laravel usually handles this.
        });
    }

    public function down(): void
    {
        Schema::table('motoboy_location_history', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->renameColumn('user_id', 'motoboy_id');
            $table->foreign('motoboy_id')->references('id')->on('users');
        });
    }
};
