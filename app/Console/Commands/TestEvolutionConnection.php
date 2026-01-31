<?php

namespace App\Console\Commands;

use App\Services\EvolutionApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestEvolutionConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'evolution:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test connection to Evolution API';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Testando conexão com Evolution API...');
        $this->newLine();

        $url = config('services.evolution.url');
        $apiKey = config('services.evolution.api_key');

        if (!$url || !$apiKey) {
            $this->error('❌ Configuração incompleta!');
            $this->info('Adicione as variáveis no .env:');
            $this->line('  EVOLUTION_API_URL=http://seu-ip:8080');
            $this->line('  EVOLUTION_API_KEY=sua-chave-api');
            return Command::FAILURE;
        }

        $this->line("URL: {$url}");
        $this->line("API Key: " . substr($apiKey, 0, 10) . '...');
        $this->newLine();

        try {
            // Tentar listar instâncias
            $response = Http::withHeaders([
                'apikey' => $apiKey,
            ])->get("{$url}/instance/fetchInstances");

            if (!$response->successful()) {
                $this->error('❌ Falha na conexão');
                $this->error("Status: {$response->status()}");
                $this->error("Resposta: {$response->body()}");
                return Command::FAILURE;
            }

            $this->info('✅ Conexão estabelecida com sucesso!');
            $this->newLine();

            $instances = $response->json();

            if (empty($instances)) {
                $this->info('Nenhuma instância ativa no momento.');
                return Command::SUCCESS;
            }

            $this->line('Instâncias Ativas:');
            $this->newLine();

            $headers = ['Nome', 'Status', 'Telefone'];
            $rows = collect($instances)->map(fn($i) => [
                $i['instance']['instanceName'] ?? 'N/A',
                $i['instance']['state'] ?? 'N/A',
                $i['instance']['owner'] ?? 'N/A',
            ])->toArray();

            $this->table($headers, $rows);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Erro: ' . $e->getMessage());

            // Dicas de troubleshooting
            $this->newLine();
            $this->info('Dicas de solução:');
            $this->line('1. Verificar se Evolution API está rodando');
            $this->line('2. Verificar firewall da VPS (porta 8080 aberta)');
            $this->line('3. Testar com curl: curl -H "apikey: SUA_CHAVE" http://seu-ip:8080/instance/fetchInstances');

            return Command::FAILURE;
        }
    }
}
