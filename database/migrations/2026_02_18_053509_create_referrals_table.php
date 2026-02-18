<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('referrals')) {
            Schema::create('referrals', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('tenant_id')->index();
                $table->uuid('referrer_id')->index(); // quem indicou
                $table->uuid('referred_id')->nullable()->index(); // quem foi indicado
                $table->string('referral_code', 20)->index(); // código usado
                $table->enum('status', ['pending', 'completed', 'fraud', 'expired'])->default('pending')->index();
                $table->unsignedInteger('referrer_points_awarded')->default(0);
                $table->unsignedInteger('referred_points_awarded')->default(0);
                // Anti-fraude
                $table->string('referred_ip', 45)->nullable();
                $table->string('referred_device_fingerprint')->nullable();
                $table->string('referrer_ip', 45)->nullable();
                $table->string('referrer_device_fingerprint')->nullable();
                // Timestamps
                $table->timestamp('completed_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();

                $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
                $table->foreign('referrer_id')->references('id')->on('customers')->onDelete('cascade');
                $table->foreign('referred_id')->references('id')->on('customers')->onDelete('set null');

                // Um cliente só pode ser indicado uma vez por tenant
                $table->unique(['tenant_id', 'referred_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
