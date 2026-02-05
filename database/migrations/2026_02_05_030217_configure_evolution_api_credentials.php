<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\ApiCredential;
use App\Models\WhatsAppInstance;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Configure Global Credentials
        $credentialData = [
            'url' => 'http://104.243.41.159:8080',
            'apikey' => 'B8D694DAd849499896E2B9610C83119F',
        ];

        // Deactivate old credentials to avoid conflicts
        ApiCredential::where('service', 'evolution')
            ->whereNull('tenant_id')
            ->update(['is_active' => false]);

        ApiCredential::create([
            'service' => 'evolution',
            'tenant_id' => null,
            'key_name' => 'master_connection',
            'encrypted_value' => $credentialData,
            'is_active' => true,
        ]);

        // 2. Configure/Update WhatsApp Instance
        $instanceName = 'oodelivery';

        $instance = WhatsAppInstance::where('instance_type', 'shared')->first();

        if ($instance) {
            $instance->update([
                'instance_name' => $instanceName,
                'status' => 'connecting', // Force reconnection logic to trigger
            ]);
        } else {
            WhatsAppInstance::create([
                'instance_name' => $instanceName,
                'instance_type' => 'shared',
                'status' => 'connecting',
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optional: We can leave this empty as we don't necessarily want to delete credentials on rollback of this specific fix
    }
};
