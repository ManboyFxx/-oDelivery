<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ensure Table Exists
        if (!Schema::hasTable('whatsapp_instances')) {
            Schema::create('whatsapp_instances', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('tenant_id')->nullable()->constrained()->onDelete('cascade');
                $table->string('instance_name')->unique();
                $table->enum('instance_type', ['shared', 'custom'])->default('shared');
                $table->string('phone_number')->nullable();
                $table->enum('status', ['disconnected', 'connecting', 'connected'])->default('disconnected');
                $table->text('qr_code')->nullable();
                $table->timestamp('last_connected_at')->nullable();
                $table->timestamps();

                $table->index(['instance_type', 'status']);
            });
        }

        // 2. Ensure Shared Instance Exists (Fix "Select * from ... where instance_type = shared")
        if (Schema::hasTable('whatsapp_instances')) {
            $exists = DB::table('whatsapp_instances')
                ->where('instance_type', 'shared')
                ->exists();

            if (!$exists) {
                DB::table('whatsapp_instances')->insert([
                    'id' => (string) Str::uuid(),
                    'tenant_id' => null, // Shared = null
                    'instance_name' => 'shared_server_bot',
                    'instance_type' => 'shared',
                    'status' => 'disconnected',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safety: Do not drop table automatically to avoid data loss on rollback
    }
};
