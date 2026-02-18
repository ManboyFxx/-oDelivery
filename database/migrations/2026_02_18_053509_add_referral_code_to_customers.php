<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'referral_code')) {
                $table->string('referral_code', 20)->nullable()->after('loyalty_points');
                $table->string('device_fingerprint')->nullable()->after('referral_code');
                $table->string('last_known_ip', 45)->nullable()->after('device_fingerprint');
                $table->index(['referral_code']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['referral_code', 'device_fingerprint', 'last_known_ip']);
        });
    }
};
