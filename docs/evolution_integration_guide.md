# Guia de Integração - Evolution API Existente

> **Conectando o oDelivery à sua Evolution API já configurada**  
> Data: 25/01/2026

---

## 🎯 Objetivo

Conectar o sistema oDelivery à sua instância Evolution API já ativa na VPS, permitindo envio e recebimento de mensagens WhatsApp automatizadas.

---

## 📋 Pré-requisitos

✅ Evolution API rodando na VPS  
✅ IP da VPS  
✅ API Key de acesso  
✅ Porta da Evolution API (geralmente 8080)

---

## 🔧 Passo 1: Configurar Variáveis de Ambiente

Adicione no arquivo `.env` do projeto:

```env
# Evolution API Configuration
EVOLUTION_API_URL=http://SEU_IP_VPS:8080
EVOLUTION_API_KEY=sua_api_key_aqui
EVOLUTION_WEBHOOK_URL=${APP_URL}/webhooks/whatsapp
```

**Exemplo real:**
```env
EVOLUTION_API_URL=http://192.168.1.100:8080
EVOLUTION_API_KEY=B6D9F8E3-4C2A-4F5B-9E1D-7A3C8F2E5B4A
EVOLUTION_WEBHOOK_URL=https://seudominio.com/webhooks/whatsapp
```

---

## 🔧 Passo 2: Atualizar config/services.php

O arquivo já existe, mas vamos garantir que está correto:

```php
// config/services.php

'evolution' => [
    'url' => env('EVOLUTION_API_URL'),
    'api_key' => env('EVOLUTION_API_KEY'),
    'webhook_url' => env('EVOLUTION_WEBHOOK_URL'),
],
```

---

## 🔧 Passo 3: Testar Conexão com Evolution API

Vamos criar um comando Artisan para testar a conexão:

**Arquivo:** `app/Console/Commands/TestEvolutionConnection.php`

```php
<?php

namespace App\Console\Commands;

use App\Services\EvolutionApiService;
use Illuminate\Console\Command;

class TestEvolutionConnection extends Command
{
    protected $signature = 'evolution:test';
    protected $description = 'Test connection to Evolution API';

    public function handle(EvolutionApiService $evolutionApi)
    {
        $this->info('🔍 Testando conexão com Evolution API...');
        $this->info('URL: ' . config('services.evolution.url'));
        
        try {
            // Tentar listar instâncias
            $response = \Http::withHeaders([
                'apikey' => config('services.evolution.api_key'),
            ])->get(config('services.evolution.url') . '/instance/fetchInstances');
            
            if ($response->successful()) {
                $this->info('✅ Conexão estabelecida com sucesso!');
                $instances = $response->json();
                
                $this->table(
                    ['Nome', 'Status', 'Telefone'],
                    collect($instances)->map(fn($i) => [
                        $i['instance']['instanceName'] ?? 'N/A',
                        $i['instance']['state'] ?? 'N/A',
                        $i['instance']['owner'] ?? 'N/A',
                    ])
                );
                
                return Command::SUCCESS;
            }
            
            $this->error('❌ Falha na conexão: ' . $response->body());
            return Command::FAILURE;
            
        } catch (\Exception $e) {
            $this->error('❌ Erro: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
```

**Executar teste:**
```bash
php artisan evolution:test
```

---

## 🔧 Passo 4: Criar Tabela para Gerenciar Instâncias

**Migration:** `database/migrations/xxxx_create_whatsapp_instances_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('whatsapp_instances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->onDelete('cascade');
            $table->string('instance_name')->unique();
            $table->string('phone_number')->nullable();
            $table->enum('status', ['disconnected', 'connecting', 'connected', 'error'])->default('disconnected');
            $table->text('qr_code')->nullable();
            $table->timestamp('last_connected_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('whatsapp_instances');
    }
};
```

**Executar:**
```bash
php artisan make:migration create_whatsapp_instances_table
# Copiar código acima
php artisan migrate
```

---

## 🔧 Passo 5: Atualizar Model WhatsAppInstance

O model já existe, vamos garantir que está completo:

**Arquivo:** `app/Models/WhatsAppInstance.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WhatsAppInstance extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'instance_name',
        'phone_number',
        'status',
        'qr_code',
        'last_connected_at',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
        'last_connected_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
    
    public function isConnected(): bool
    {
        return $this->status === 'connected';
    }
    
    public function markAsConnected(string $phoneNumber): void
    {
        $this->update([
            'status' => 'connected',
            'phone_number' => $phoneNumber,
            'last_connected_at' => now(),
            'qr_code' => null,
        ]);
    }
    
    public function markAsDisconnected(): void
    {
        $this->update([
            'status' => 'disconnected',
            'qr_code' => null,
        ]);
    }
}
```

---

## 🔧 Passo 6: Criar Controller para Gerenciar Instâncias

**Arquivo:** `app/Http/Controllers/WhatsAppInstanceController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppInstance;
use App\Services\EvolutionApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsAppInstanceController extends Controller
{
    public function __construct(
        private EvolutionApiService $evolutionApi
    ) {}

    public function index()
    {
        $tenant = auth()->user()->tenant;
        
        $instances = WhatsAppInstance::where('tenant_id', $tenant->id)
            ->latest()
            ->get();
        
        return Inertia::render('Settings/WhatsApp', [
            'instances' => $instances,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'instance_name' => 'required|string|max:255|unique:whatsapp_instances,instance_name',
        ]);
        
        $tenant = auth()->user()->tenant;
        
        try {
            // Criar instância na Evolution API
            $response = $this->evolutionApi->createInstance($validated['instance_name']);
            
            // Salvar no banco
            $instance = WhatsAppInstance::create([
                'tenant_id' => $tenant->id,
                'instance_name' => $validated['instance_name'],
                'status' => 'connecting',
            ]);
            
            return redirect()->back()->with('success', 'Instância criada! Escaneie o QR Code para conectar.');
            
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Erro ao criar instância: ' . $e->getMessage()]);
        }
    }

    public function getQrCode(WhatsAppInstance $instance)
    {
        try {
            $qrCode = $this->evolutionApi->getQrCode($instance->instance_name);
            
            if ($qrCode) {
                $instance->update(['qr_code' => $qrCode]);
                
                return response()->json([
                    'qr_code' => $qrCode,
                ]);
            }
            
            return response()->json(['error' => 'QR Code não disponível'], 404);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function checkStatus(WhatsAppInstance $instance)
    {
        try {
            $status = $this->evolutionApi->getInstanceStatus($instance->instance_name);
            
            // Atualizar status no banco
            if ($status['state'] === 'open') {
                $instance->markAsConnected($status['instance']['owner'] ?? '');
            } else {
                $instance->update(['status' => 'disconnected']);
            }
            
            return response()->json([
                'status' => $instance->fresh()->status,
                'phone_number' => $instance->phone_number,
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function disconnect(WhatsAppInstance $instance)
    {
        try {
            $this->evolutionApi->deleteInstance($instance->instance_name);
            $instance->markAsDisconnected();
            
            return redirect()->back()->with('success', 'Instância desconectada!');
            
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Erro ao desconectar: ' . $e->getMessage()]);
        }
    }

    public function destroy(WhatsAppInstance $instance)
    {
        try {
            $this->evolutionApi->deleteInstance($instance->instance_name);
            $instance->delete();
            
            return redirect()->back()->with('success', 'Instância removida!');
            
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Erro ao remover: ' . $e->getMessage()]);
        }
    }
}
```

---

## 🔧 Passo 7: Adicionar Rotas

**Arquivo:** `routes/web.php`

```php
// WhatsApp Instance Management
Route::middleware(['auth', 'subscription'])->prefix('whatsapp')->name('whatsapp.')->group(function () {
    Route::get('/instances', [WhatsAppInstanceController::class, 'index'])->name('instances.index');
    Route::post('/instances', [WhatsAppInstanceController::class, 'store'])->name('instances.store');
    Route::get('/instances/{instance}/qrcode', [WhatsAppInstanceController::class, 'getQrCode'])->name('instances.qrcode');
    Route::get('/instances/{instance}/status', [WhatsAppInstanceController::class, 'checkStatus'])->name('instances.status');
    Route::post('/instances/{instance}/disconnect', [WhatsAppInstanceController::class, 'disconnect'])->name('instances.disconnect');
    Route::delete('/instances/{instance}', [WhatsAppInstanceController::class, 'destroy'])->name('instances.destroy');
});
```

---

## 🔧 Passo 8: Criar Interface de Gerenciamento

**Arquivo:** `resources/js/Pages/Settings/WhatsApp.tsx`

```tsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Smartphone, QrCode, Wifi, WifiOff, Trash2, RefreshCw } from 'lucide-react';

interface WhatsAppInstance {
    id: string;
    instance_name: string;
    phone_number: string | null;
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    qr_code: string | null;
    last_connected_at: string | null;
}

export default function WhatsApp({ instances }: { instances: WhatsAppInstance[] }) {
    const [newInstanceName, setNewInstanceName] = useState('');
    const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const createInstance = () => {
        router.post('/whatsapp/instances', {
            instance_name: newInstanceName,
        }, {
            onSuccess: () => setNewInstanceName(''),
        });
    };

    const loadQrCode = async (instance: WhatsAppInstance) => {
        setLoading(true);
        try {
            const response = await fetch(`/whatsapp/instances/${instance.id}/qrcode`);
            const data = await response.json();
            setQrCode(data.qr_code);
            setSelectedInstance(instance);
        } catch (error) {
            console.error('Erro ao carregar QR Code:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async (instance: WhatsAppInstance) => {
        try {
            const response = await fetch(`/whatsapp/instances/${instance.id}/status`);
            const data = await response.json();
            
            if (data.status === 'connected') {
                router.reload({ only: ['instances'] });
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    };

    // Auto-refresh status a cada 5 segundos para instâncias conectando
    useEffect(() => {
        const interval = setInterval(() => {
            instances
                .filter(i => i.status === 'connecting')
                .forEach(checkStatus);
        }, 5000);

        return () => clearInterval(interval);
    }, [instances]);

    return (
        <AuthenticatedLayout>
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Configuração WhatsApp
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Gerencie suas conexões WhatsApp Business via Evolution API
                    </p>
                </div>

                {/* Criar Nova Instância */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        Nova Instância
                    </h2>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newInstanceName}
                            onChange={(e) => setNewInstanceName(e.target.value)}
                            placeholder="Nome da instância (ex: loja-centro)"
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <button
                            onClick={createInstance}
                            disabled={!newInstanceName}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Criar Instância
                        </button>
                    </div>
                </div>

                {/* Lista de Instâncias */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {instances.map((instance) => (
                        <div
                            key={instance.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="h-8 w-8 text-green-600" />
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                            {instance.instance_name}
                                        </h3>
                                        {instance.phone_number && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {instance.phone_number}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Status Badge */}
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                                    instance.status === 'connected' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                        : instance.status === 'connecting'
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                    {instance.status === 'connected' ? (
                                        <><Wifi className="h-4 w-4" /> Conectado</>
                                    ) : instance.status === 'connecting' ? (
                                        <><RefreshCw className="h-4 w-4 animate-spin" /> Conectando</>
                                    ) : (
                                        <><WifiOff className="h-4 w-4" /> Desconectado</>
                                    )}
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="flex gap-2">
                                {instance.status !== 'connected' && (
                                    <button
                                        onClick={() => loadQrCode(instance)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <QrCode className="h-4 w-4" />
                                        Ver QR Code
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => router.delete(`/whatsapp/instances/${instance.id}`)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal QR Code */}
                {selectedInstance && qrCode && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setQrCode(null)}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                                Escanear QR Code
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Abra o WhatsApp no seu celular e escaneie este código
                            </p>
                            <div className="bg-white p-4 rounded-lg">
                                <img src={qrCode} alt="QR Code" className="w-full" />
                            </div>
                            <button
                                onClick={() => setQrCode(null)}
                                className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
```

---

## 🔧 Passo 9: Configurar Webhooks

**Arquivo:** `app/Http/Controllers/WhatsAppWebhookController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppInstance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $data = $request->all();
        
        Log::info('WhatsApp Webhook Received', $data);
        
        // Processar diferentes tipos de eventos
        match($data['event'] ?? null) {
            'connection.update' => $this->handleConnectionUpdate($data),
            'messages.upsert' => $this->handleNewMessage($data),
            'qrcode.updated' => $this->handleQrCodeUpdate($data),
            default => null,
        };
        
        return response()->json(['status' => 'ok']);
    }
    
    private function handleConnectionUpdate(array $data)
    {
        $instanceName = $data['instance'] ?? null;
        $state = $data['data']['state'] ?? null;
        
        if (!$instanceName) return;
        
        $instance = WhatsAppInstance::where('instance_name', $instanceName)->first();
        
        if (!$instance) return;
        
        if ($state === 'open') {
            $instance->markAsConnected($data['data']['instance']['owner'] ?? '');
        } else {
            $instance->markAsDisconnected();
        }
    }
    
    private function handleNewMessage(array $data)
    {
        // Processar mensagem recebida
        // Implementar lógica de chatbot aqui
        Log::info('New message received', $data);
    }
    
    private function handleQrCodeUpdate(array $data)
    {
        $instanceName = $data['instance'] ?? null;
        $qrCode = $data['data']['qrcode']['base64'] ?? null;
        
        if (!$instanceName || !$qrCode) return;
        
        $instance = WhatsAppInstance::where('instance_name', $instanceName)->first();
        
        if ($instance) {
            $instance->update(['qr_code' => $qrCode]);
        }
    }
}
```

**Rota do webhook:**
```php
// routes/web.php
Route::post('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle'])->name('webhooks.whatsapp');
```

---

## 🔧 Passo 10: Configurar Webhook na Evolution API

Você precisa configurar o webhook na sua Evolution API para que ela envie eventos para o oDelivery.

**Via API:**
```bash
curl -X POST "http://SEU_IP_VPS:8080/webhook/set/NOME_DA_INSTANCIA" \
  -H "apikey: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seudominio.com/webhooks/whatsapp",
    "webhook_by_events": true,
    "events": [
      "CONNECTION_UPDATE",
      "MESSAGES_UPSERT",
      "QRCODE_UPDATED"
    ]
  }'
```

---

## ✅ Checklist de Implementação

- [ ] Configurar variáveis de ambiente (.env)
- [ ] Testar conexão com `php artisan evolution:test`
- [ ] Executar migration da tabela whatsapp_instances
- [ ] Criar controller WhatsAppInstanceController
- [ ] Adicionar rotas no web.php
- [ ] Criar página Settings/WhatsApp.tsx
- [ ] Criar webhook controller
- [ ] Configurar webhook na Evolution API
- [ ] Testar criação de instância
- [ ] Testar conexão via QR Code
- [ ] Testar envio de mensagem

---

## 🧪 Testes

**1. Testar conexão:**
```bash
php artisan evolution:test
```

**2. Criar instância de teste:**
```bash
php artisan tinker
>>> $instance = App\Models\WhatsAppInstance::create([
    'tenant_id' => 'SEU_TENANT_ID',
    'instance_name' => 'teste',
    'status' => 'connecting'
]);
```

**3. Enviar mensagem de teste:**
```bash
php artisan tinker
>>> $service = app(App\Services\EvolutionApiService::class);
>>> $service->sendTextMessage('teste', '5511999999999', 'Olá! Teste de integração.');
```

---

## 🚨 Troubleshooting

### Erro: "Connection refused"
- Verificar se Evolution API está rodando
- Verificar firewall da VPS (porta 8080 aberta)
- Testar com `curl http://SEU_IP:8080`

### Erro: "Unauthorized"
- Verificar se API_KEY está correta
- Verificar se está usando header `apikey` (não `Authorization`)

### QR Code não aparece
- Verificar se instância foi criada corretamente
- Verificar logs da Evolution API
- Tentar recriar a instância

### Webhook não recebe eventos
- Verificar se URL do webhook está acessível publicamente
- Usar ngrok para testes locais: `ngrok http 8000`
- Verificar logs do Laravel: `tail -f storage/logs/laravel.log`

---

## 📞 Próximos Passos

Após conectar com sucesso:

1. **Implementar envio automático de notificações** (pedido confirmado, pronto, etc.)
2. **Criar chatbot básico** para responder clientes
3. **Dashboard de mensagens** para visualizar histórico
4. **Templates de mensagens** personalizáveis

---

**Última atualização:** 25/01/2026
