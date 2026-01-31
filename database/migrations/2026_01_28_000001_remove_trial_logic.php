<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Atualizar tenants com status 'trialing' para 'active'
        DB::table('tenants')
            ->where('subscription_status', 'trialing')
            ->update(['subscription_status' => 'active']);

        // SQLite não suporta ALTER COLUMN, então vamos usar Schema::table
        Schema::table('tenants', function (Blueprint $table) {
            // Remover índice primeiro (se existir)
            $table->dropIndex(['subscription_status']);
        });

        Schema::table('tenants', function (Blueprint $table) {
            // Remover coluna antiga
            $table->dropColumn('subscription_status');
        });

        Schema::table('tenants', function (Blueprint $table) {
            // Adicionar coluna nova sem 'trialing'
            $table->enum('subscription_status', ['active', 'past_due', 'canceled', 'expired'])
                ->default('active')
                ->after('plan')
                ->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex(['subscription_status']);
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('subscription_status');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->enum('subscription_status', ['trialing', 'active', 'past_due', 'canceled', 'expired'])
                ->default('active')
                ->after('plan')
                ->index();
        });
    }
};
