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
        Schema::create('customer_devices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('customer_id')->constrained()->onDelete('cascade');
            $table->string('device_token', 64)->unique(); // SHA256 hash
            $table->string('device_fingerprint'); // Browser + OS + IP hash
            $table->string('user_agent')->nullable();
            $table->string('ip_address', 45)->nullable(); // IPv6 compatible
            $table->timestamp('last_used_at');
            $table->timestamp('expires_at'); // 90 days from creation
            $table->timestamps();

            $table->index(['customer_id', 'device_token']);
            $table->index('expires_at'); // For cleanup jobs
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_devices');
    }
};
