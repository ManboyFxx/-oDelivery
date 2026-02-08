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
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('phone'); // Encrypted phone number
            $table->string('code', 6); // 6-digit code
            $table->timestamp('expires_at'); // 5 minutes from creation
            $table->boolean('used')->default(false);
            $table->string('ip_address', 45)->nullable(); // Track request origin
            $table->timestamps();

            $table->index(['phone', 'code', 'used']);
            $table->index('expires_at'); // For cleanup jobs
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('otp_codes');
    }
};
