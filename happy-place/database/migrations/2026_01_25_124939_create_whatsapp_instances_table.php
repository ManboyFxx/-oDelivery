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
        Schema::create('whatsapp_instances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->constrained()->onDelete('cascade'); // Null for shared instance
            $table->string('instance_name')->unique(); // Ex: "shared_oobot" or "tenant_slug_whatsapp"
            $table->enum('instance_type', ['shared', 'custom'])->default('shared'); // shared = CMS managed, custom = tenant owned
            $table->string('phone_number')->nullable(); // Número conectado
            $table->enum('status', ['disconnected', 'connecting', 'connected'])->default('disconnected');
            $table->text('qr_code')->nullable(); // Base64 do QR code
            $table->timestamp('last_connected_at')->nullable();
            $table->timestamps();

            // Index for quick lookup of shared instance
            $table->index(['instance_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_instances');
    }
};
