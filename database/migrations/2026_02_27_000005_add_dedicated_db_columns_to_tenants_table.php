<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * FASE 3 – Multi-DB: Infraestrutura para tenants Enterprise com DB dedicado
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('dedicated_db_host')->nullable()->after('id');
            $table->integer('dedicated_db_port')->default(3306)->nullable()->after('dedicated_db_host');
            $table->string('dedicated_db_name')->nullable()->after('dedicated_db_port');
            $table->string('dedicated_db_user')->nullable()->after('dedicated_db_name');
            $table->text('dedicated_db_password')->nullable()->after('dedicated_db_user'); // encrypted
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'dedicated_db_host',
                'dedicated_db_port',
                'dedicated_db_name',
                'dedicated_db_user',
                'dedicated_db_password',
            ]);
        });
    }
};
