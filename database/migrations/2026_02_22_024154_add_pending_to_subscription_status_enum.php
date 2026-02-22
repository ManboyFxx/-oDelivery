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
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE tenants MODIFY COLUMN subscription_status ENUM('pending', 'trialing', 'active', 'past_due', 'canceled', 'expired') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE tenants MODIFY COLUMN subscription_status ENUM('trialing', 'active', 'past_due', 'canceled', 'expired') NOT NULL DEFAULT 'active'");
    }
};
