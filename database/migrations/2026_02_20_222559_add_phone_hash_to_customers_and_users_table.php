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
        Schema::table('customers', function (Blueprint $table) {
            $table->string('phone_hash')->nullable()->after('phone');
            $table->index(['tenant_id', 'phone_hash'], 'idx_customers_tenant_phone_hash');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone_hash')->nullable()->after('phone');
            $table->index('phone_hash', 'idx_users_phone_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('idx_customers_tenant_phone_hash');
            $table->dropColumn('phone_hash');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_phone_hash');
            $table->dropColumn('phone_hash');
        });
    }
};
