<?php

namespace App\Console\Commands;

use App\Models\ApiCredential;
use Illuminate\Console\Command;

class ConfigureEvolutionApi extends Command
{
    protected $signature = 'evolution:configure {--url=} {--apikey=}';
    protected $description = 'Configure Evolution API credentials';

    public function handle()
    {
        $this->info('🔧 Evolution API Configuration');
        $this->newLine();

        // Get credentials from options or prompt
        $url = $this->option('url') ?: $this->ask('Evolution API URL', config('services.evolution.url', 'http://localhost:8080'));
        $apiKey = $this->option('apikey') ?: $this->secret('Evolution API Key');

        if (!$url || !$apiKey) {
            $this->error('❌ Both URL and API Key are required');
            return 1;
        }

        // Remove trailing slash from URL
        $url = rtrim($url, '/');

        // Find or create ApiCredential
        $credential = ApiCredential::where('service', 'evolution')
            ->whereNull('tenant_id')
            ->first();

        $credentialData = [
            'url' => $url,
            'apikey' => $apiKey,
        ];

        if ($credential) {
            $this->info('Updating existing Evolution API credentials...');
            $credential->update([
                'encrypted_value' => json_encode($credentialData), // Mutator will encrypt
                'is_active' => true,
            ]);
        } else {
            $this->info('Creating new Evolution API credentials...');
            ApiCredential::create([
                'service' => 'evolution',
                'tenant_id' => null, // Global credential
                'encrypted_value' => json_encode($credentialData), // Mutator will encrypt
                'is_active' => true,
            ]);
        }

        $this->newLine();
        $this->info('✅ Evolution API credentials saved!');
        $this->newLine();

        // Test connection
        if ($this->confirm('Test connection now?', true)) {
            $this->call('evolution:test');
        }

        return 0;
    }
}
