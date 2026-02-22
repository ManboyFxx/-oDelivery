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
            $table->string('onesignal_id')->nullable()->after('phone_hash');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->string('onesignal_id')->nullable()->after('phone_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('onesignal_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('onesignal_id');
        });
    }
};
