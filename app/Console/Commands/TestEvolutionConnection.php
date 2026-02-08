<?php

namespace App\Console\Commands;

use App\Models\ApiCredential;
use App\Services\EvolutionApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestEvolutionConnection extends Command
{
    protected $signature = 'evolution:test {--create-test-instance}';
    protected $description = 'Test Evolution API connection and diagnose issues';

    public function handle()
    {
        $this->info('🔍 Evolution API Connection Diagnostic');
        $this->newLine();

        // Step 1: Check Configuration
        $this->info('Step 1: Checking Configuration...');
        $this->checkConfiguration();
        $this->newLine();

        // Step 2: Check API Credentials
        $this->info('Step 2: Checking API Credentials in Database...');
        $this->checkApiCredentials();
        $this->newLine();

        // Step 3: Test Connectivity
        $this->info('Step 3: Testing API Connectivity...');
        $connected = $this->testConnectivity();
        $this->newLine();

        if (!$connected) {
            $this->error('❌ Cannot connect to Evolution API. Please check:');
            $this->warn('  1. Is the Evolution API server running?');
            $this->warn('  2. Is the EVOLUTION_API_URL correct in .env?');
            $this->warn('  3. Is the EVOLUTION_API_KEY valid?');
            $this->warn('  4. Can you access the URL from this server?');
            return 1;
        }

        // Step 4: List Instances
        $this->info('Step 4: Listing Existing Instances...');
        $this->listInstances();
        $this->newLine();

        // Step 5: Create Test Instance (optional)
        if ($this->option('create-test-instance')) {
            $this->info('Step 5: Creating Test Instance...');
            $this->createTestInstance();
        }

        $this->info('✅ Diagnostic Complete!');
        return 0;
    }

    private function checkConfiguration()
    {
        $url = config('services.evolution.url');
        $apiKey = config('services.evolution.api_key');

        $this->table(
            ['Config Key', 'Value', 'Status'],
            [
                ['EVOLUTION_API_URL', $url ?: '(not set)', $url ? '✅' : '❌'],
                ['EVOLUTION_API_KEY', $apiKey ? str_repeat('*', 20) . substr($apiKey, -4) : '(not set)', $apiKey ? '✅' : '❌'],
                ['APP_URL', config('app.url'), '✅'],
            ]
        );
    }

    private function checkApiCredentials()
    {
        $credential = ApiCredential::where('service', 'evolution')
            ->whereNull('tenant_id')
            ->where('is_active', true)
            ->latest()
            ->first();

        if ($credential) {
            $value = $credential->decrypted_value;
            $this->info('✅ Found Evolution credentials in database (ApiCredential model)');

            if (is_array($value)) {
                $this->line('  URL: ' . ($value['url'] ?? 'not set'));
                $this->line('  API Key: ' . (isset($value['apikey']) ? str_repeat('*', 20) . substr($value['apikey'], -4) : 'not set'));
            } else {
                $this->line('  API Key: ' . ($value ? str_repeat('*', 20) . substr($value, -4) : 'not set'));
            }
        } else {
            $this->warn('⚠️  No Evolution credentials found in database');
            $this->line('  Will use .env configuration as fallback');
        }
    }

    private function testConnectivity(): bool
    {
        $credential = ApiCredential::where('service', 'evolution')
            ->whereNull('tenant_id')
            ->where('is_active', true)
            ->latest()
            ->first();

        $credentialValue = $credential ? $credential->decrypted_value : null;

        if (is_array($credentialValue)) {
            $baseUrl = rtrim($credentialValue['url'] ?? config('services.evolution.url') ?? '', '/');
            $apiKey = $credentialValue['apikey'] ?? config('services.evolution.api_key') ?? '';
        } else {
            $baseUrl = rtrim(config('services.evolution.url') ?? '', '/');
            $apiKey = $credentialValue ?? config('services.evolution.api_key') ?? '';
        }

        if (!$baseUrl || !$apiKey) {
            $this->error('❌ Missing configuration');
            return false;
        }

        $this->line("Testing connection to: {$baseUrl}");

        try {
            $response = Http::timeout(10)->withHeaders([
                'apikey' => $apiKey,
            ])->get("{$baseUrl}/instance/fetchInstances");

            if ($response->successful()) {
                $this->info('✅ Successfully connected to Evolution API');
                $this->line('  Status Code: ' . $response->status());
                return true;
            } else {
                $this->error('❌ Connection failed');
                $this->line('  Status Code: ' . $response->status());
                $this->line('  Response: ' . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            $this->error('❌ Connection error: ' . $e->getMessage());

            // Provide helpful hints
            if (str_contains($e->getMessage(), 'Connection refused')) {
                $this->warn('  Hint: The server is not responding. Is Evolution API running?');
            } elseif (str_contains($e->getMessage(), 'Could not resolve host')) {
                $this->warn('  Hint: Cannot resolve hostname. Check EVOLUTION_API_URL');
            } elseif (str_contains($e->getMessage(), 'timeout')) {
                $this->warn('  Hint: Request timed out. Server might be slow or unreachable');
            }

            return false;
        }
    }

    private function listInstances()
    {
        try {
            $service = app(EvolutionApiService::class);

            // This will fail if connectivity is broken, but we already tested that
            $this->warn('Note: Instance listing requires Evolution API v2 endpoint');
            $this->line('If you see errors here, it might be an API version mismatch');

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
        }
    }

    private function createTestInstance()
    {
        $instanceName = 'test_' . time();

        try {
            $service = app(EvolutionApiService::class);
            $result = $service->createInstance($instanceName);

            $this->info("✅ Test instance created: {$instanceName}");
            $this->line('Response: ' . json_encode($result, JSON_PRETTY_PRINT));

        } catch (\Exception $e) {
            $this->error('❌ Failed to create test instance: ' . $e->getMessage());
        }
    }
}
