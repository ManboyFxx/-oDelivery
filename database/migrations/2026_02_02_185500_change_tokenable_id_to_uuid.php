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
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Drop the old index if it exists to avoid conflicts
            // Laravel's morphs() creates an index named `personal_access_tokens_tokenable_type_tokenable_id_index`
            $table->dropIndex('personal_access_tokens_tokenable_type_tokenable_id_index');

            // Change the column to string to support UUIDs
            $table->string('tokenable_id', 36)->change();

            // Re-add the index
            $table->index(['tokenable_type', 'tokenable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // This might fail if there are UUIDs in it, but for rollback logic:
            $table->dropIndex(['tokenable_type', 'tokenable_id']);
            $table->unsignedBigInteger('tokenable_id')->change();
            $table->index(['tokenable_type', 'tokenable_id']);
        });
    }
};
