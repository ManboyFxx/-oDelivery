<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customer_addresses', function (Blueprint $table) {
            $table->uuid('tenant_id')->nullable()->after('customer_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['customer_id', 'tenant_id']);
        });

        // Update existing addresses with tenant_id from their associated customer
        DB::statement("
            UPDATE customer_addresses
            SET tenant_id = (
                SELECT tenant_id FROM customers WHERE customers.id = customer_addresses.customer_id
            )
            WHERE tenant_id IS NULL
        ");

        // Make tenant_id NOT NULL after data population
        Schema::table('customer_addresses', function (Blueprint $table) {
            $table->uuid('tenant_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_addresses', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropIndex(['customer_id', 'tenant_id']);
            $table->dropColumn('tenant_id');
        });
    }
};
