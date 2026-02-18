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
            // Verificar se enable_otp_verification já existe para evitar erro
            if (!Schema::hasColumn('store_settings', 'enable_otp_verification')) {
                $table->boolean('enable_otp_verification')->default(true)->after('loyalty_enabled');
            }

            $table->boolean('enable_password_login')->default(true)->after('loyalty_enabled');
            $table->boolean('enable_quick_login')->default(true)->after('enable_password_login');
            $table->boolean('enable_checkout_security')->default(false)->after('enable_quick_login'); // Validação final no checkout
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn(['enable_password_login', 'enable_quick_login', 'enable_checkout_security']);
            // Não remover enable_otp_verification no down se ele foi criado condicionalmente ou se for essencial
        });
    }
};
