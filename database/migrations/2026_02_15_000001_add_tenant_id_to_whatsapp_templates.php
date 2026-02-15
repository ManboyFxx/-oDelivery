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
        Schema::table('whatsapp_templates', function (Blueprint $table) {
            $table->uuid('tenant_id')->nullable()->after('id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // Drop unique constraint on key (since now we can have same key for different tenants)
            $table->dropUnique(['key']);

            // Add composite unique index
            $table->unique(['key', 'tenant_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_templates', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropUnique(['key', 'tenant_id']);
            $table->dropColumn('tenant_id');

            // Restore unique constraint (might fail if duplicates exist, but standard for down)
            $table->unique('key');
        });
    }
};
