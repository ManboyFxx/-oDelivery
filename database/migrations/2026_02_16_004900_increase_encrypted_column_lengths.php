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
        Schema::table('users', function (Blueprint $table) {
            // No direct indexes on phone found via tinker, but adding safe drops
            if (Schema::hasIndex('users', 'users_phone_index')) {
                $table->dropIndex('users_phone_index');
            }
            if (Schema::hasIndex('users', 'users_phone_unique')) {
                $table->dropUnique('users_phone_unique');
            }

            $table->text('phone')->nullable()->change();
        });

        Schema::table('customers', function (Blueprint $table) {
            // Drop todos os possíveis índices em phone antes de modificar para TEXT
            $indexesToDrop = ['customers_tenant_id_phone_index', 'customers_tenant_phone_index', 'idx_customers_phone', 'customers_phone_index', 'customers_phone_unique'];
            foreach ($indexesToDrop as $idx) {
                try {
                    if (Schema::hasIndex('customers', $idx)) {
                        $table->dropIndex($idx);
                    }
                } catch (\Throwable $e) {
                    // Ignora se não existir
                }
            }

            $table->text('phone')->nullable()->change();
            $table->text('email')->nullable()->change();
            $table->text('address')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 255)->nullable()->change();
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->string('phone', 255)->nullable()->change();
            $table->string('email', 255)->nullable()->change();
            $table->string('address', 255)->nullable()->change();
        });
    }
};
