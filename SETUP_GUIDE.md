# 🔧 Guia de Configuração — Pendências Técnicas

> **Siga este guia para configurar as funcionalidades pendentes**  
> **Tempo estimado:** 3 horas

---

## 📋 Checklist de Configuração

| Configuração | Tempo | Status | Prioridade |
|-------------|-------|--------|------------|
| OneSignal | 2 horas | ⚠️ Pendente | Alta |
| Google Maps API | 1 hora | ⚠️ Pendente | Alta |
| Mercado Pago | 2 horas | 🟡 Parcial | Média |
| Laravel Reverb | 8 horas | 📋 Backlog | Média |

---

## 1️⃣ OneSignal — Notificações Push

**Status:** Código pronto, falta configuração  
**Tempo:** 2 horas  
**Custo:** Gratuito (até 10k usuários)

### Passo 1: Criar Conta no OneSignal

1. Acesse https://onesignal.com
2. Clique em "Sign Up"
3. Crie conta com email corporativo
4. Confirme email

### Passo 2: Criar App

1. Clique em "Add App"
2. Selecione "Web Push"
3. Nome: "ÓoDelivery"
4. Domínio: `seu-dominio.com`
5. Clique em "Next"

### Passo 3: Obter Credenciais

Na página do app criado:

1. Vá em **Settings** → **Keys & IDs**
2. Copie:
   - **App ID** (ex: `xxxx-xxxx-xxxx-xxxx`)
   - **REST API Key** (ex: `xxxx`)

### Passo 4: Configurar no .env

```env
# OneSignal
ONESIGNAL_APP_ID=xxxx-xxxx-xxxx-xxxx
ONESIGNAL_REST_KEY=xxxx
ONESIGNAL_ENABLED=true
```

### Passo 5: Configurar no config/services.php

Adicione:

```php
'onesignal' => [
    'app_id' => env('ONESIGNAL_APP_ID'),
    'rest_key' => env('ONESIGNAL_REST_KEY'),
    'enabled' => env('ONESIGNAL_ENABLED', true),
],
```

### Passo 6: Testar Envio

No Tinker:

```bash
php artisan tinker
```

```php
use App\Services\NotificationService;

$service = app(NotificationService::class);
$service->sendToTenant(tenantId: 1, title: 'Teste', body: 'Funcionou!');
```

### Passo 7: Validar no Frontend

1. Acesse o cardápio digital
2. Aceite notificações push
3. Verifique se o `player_id` foi salvo em `push_subscriptions`

### Troubleshooting

**Erro: "Invalid App ID"**
- Verifique se copiou o App ID correto
- Confira se não há espaços em branco

**Erro: "Unauthorized"**
- REST Key incorreta
- Verifique em Settings → Keys & IDs

**Notificações não chegam:**
- Verifique se o browser tem permissão
- Cheque se o `player_id` está salvo no banco

---

## 2️⃣ Google Maps API

**Status:** Estrutura pronta, falta API Key  
**Tempo:** 1 hora  
**Custo:** $200/mês de crédito gratuito

### Passo 1: Criar Projeto no Google Cloud

1. Acesse https://console.cloud.google.com
2. Clique em "Select a Project" → "New Project"
3. Nome: "ÓoDelivery"
4. Clique em "Create"

### Passo 2: Ativar APIs Necessárias

No Google Cloud Console:

1. Vá em **APIs & Services** → **Library**
2. Pesquise e ative:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Distance Matrix API**
   - **Places API**

### Passo 3: Criar Credenciais

1. Vá em **APIs & Services** → **Credentials**
2. Clique em "Create Credentials" → "API Key"
3. Copie a API Key gerada

### Passo 4: Restringir API Key (Recomendado)

1. Clique na API Key criada
2. Em "Application restrictions":
   - Selecione "HTTP referrers"
   - Adicione: `https://seu-dominio.com/*`
3. Em "API restrictions":
   - Selecione "Restrict key"
   - Marque apenas as 4 APIs ativadas

### Passo 5: Configurar no .env

```env
# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSy...
GOOGLE_MAPS_ENABLED=true
```

### Passo 6: Configurar no config/services.php

Adicione:

```php
'google' => [
    'maps_api_key' => env('GOOGLE_MAPS_API_KEY'),
],
```

### Passo 7: Testar no Frontend

No seu componente React:

```tsx
// Exemplo: DeliveryZoneValidator.tsx
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Script do Google Maps
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=geometry`;
document.head.appendChild(script);
```

### Passo 8: Testar Validação de Endereço

1. Acesse `/dashboard`
2. Vá em "Zonas de Entrega"
3. Desenhe um polígono
4. Teste um endereço dentro da zona

### Troubleshooting

**Erro: "API_KEY_INVALID"**
- Verifique se copiou a chave correta
- Confira se não há espaços

**Erro: "BILLING_NOT_SETUP"**
- Google Maps requer conta de faturamento
- Adicione um cartão (os primeiros $200 são grátis)

**Erro: "API_NOT_ENABLED"**
- Volte no Google Cloud Console
- Ative a API específica que está dando erro

---

## 3️⃣ Mercado Pago — Pagamento Alternativo

**Status:** Estrutura pronta, falta implementação  
**Tempo:** 2 horas  
**Custo:** Gratuito para setup

### Passo 1: Criar Conta no Mercado Pago

1. Acesse https://www.mercadopago.com.br
2. Crie conta empresarial
3. Valide CNPJ

### Passo 2: Obter Credenciais

1. Acesse https://www.mercadopago.com.br/developers
2. Vá em "Suas integrações" → "Criar integração"
3. Selecione "Checkout Pro"
4. Copie:
   - **Public Key**
   - **Access Token**

### Passo 3: Instalar SDK

```bash
composer require mercadopago/dx-php
```

### Passo 4: Configurar .env

```env
# Mercado Pago
MERCADO_PAGO_PUBLIC_KEY=TEST-xxxx
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxx
MERCADO_PAGO_ENABLED=true
```

### Passo 5: Criar Service

Crie `app/Services/MercadoPagoService.php`:

```php
<?php

namespace App\Services;

use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Resources\Preference;

class MercadoPagoService
{
    protected $client;
    protected $preferenceClient;

    public function __construct()
    {
        $this->client = new PaymentClient();
        $this->preferenceClient = new PreferenceClient();
        
        // Configurar access token
        $this->client->setAccessToken(config('services.mercadopago.access_token'));
        $this->preferenceClient->setAccessToken(config('services.mercadopago.access_token'));
    }

    /**
     * Criar preferência de pagamento
     */
    public function createPreference(array $data): Preference
    {
        $preferenceData = [
            'items' => [
                [
                    'title' => $data['description'],
                    'quantity' => 1,
                    'unit_price' => (float) $data['amount'],
                ]
            ],
            'external_reference' => $data['order_id'] ?? null,
            'notification_url' => route('webhook.mercadopago'),
        ];

        return $this->preferenceClient->create($preferenceData);
    }

    /**
     * Buscar pagamento por ID
     */
    public function findPayment(string $id): array
    {
        return $this->client->get($id);
    }
}
```

### Passo 6: Configurar config/services.php

```php
'mercadopago' => [
    'public_key' => env('MERCADO_PAGO_PUBLIC_KEY'),
    'access_token' => env('MERCADO_PAGO_ACCESS_TOKEN'),
    'enabled' => env('MERCADO_PAGO_ENABLED', false),
],
```

### Passo 7: Criar Controller de Webhook

Crie `app/Http/Controllers/MercadoPagoWebhookController.php`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\MercadoPagoService;

class MercadoPagoWebhookController extends Controller
{
    public function __construct(
        private MercadoPagoService $mpService
    ) {}

    public function handle(Request $request)
    {
        $data = $request->all();

        if ($data['type'] === 'payment') {
            $paymentId = $data['data']['id'];
            $payment = $this->mpService->findPayment($paymentId);

            if ($payment['status'] === 'approved') {
                // Processar pagamento aprovado
                $orderId = $payment['external_reference'];
                // Atualizar pedido...
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
```

### Passo 8: Adicionar Rota

Em `routes/api.php`:

```php
Route::post('/webhook/mercadopago', [MercadoPagoWebhookController::class, 'handle'])
    ->name('webhook.mercadopago');
```

### Passo 9: Testar

```php
// No Tinker
use App\Services\MercadoPagoService;

$service = app(MercadoPagoService::class);
$preference = $service->createPreference([
    'description' => 'Teste',
    'amount' => 10.00,
    'order_id' => '123'
]);

echo $preference->init_point; // URL de pagamento
```

---

## 4️⃣ Laravel Reverb — WebSocket

**Status:** Backlog (não urgente)  
**Tempo:** 8 horas  
**Custo:** Requer VPS (não funciona em shared hosting)

### Pré-requisitos

- VPS ou servidor dedicado
- Laravel 11+
- Redis instalado
- Node.js instalado

### Passo 1: Instalar Reverb

```bash
composer require laravel/reverb
php artisan reverb:install
```

### Passo 2: Configurar .env

```env
REVERB_APP_ID=xxx
REVERB_APP_KEY=xxx
REVERB_APP_SECRET=xxx
REVERB_HOST="127.0.0.1"
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### Passo 3: Configurar config/broadcasting.php

```php
'reverb' => [
    'driver' => 'reverb',
    'key' => env('REVERB_APP_KEY'),
    'secret' => env('REVERB_APP_SECRET'),
    'app_id' => env('REVERB_APP_ID'),
    'options' => [
        'host' => env('REVERB_HOST', '127.0.0.1'),
        'port' => env('REVERB_PORT', 8080),
        'scheme' => env('REVERB_SCHEME', 'http'),
        'useTLS' => env('REVERB_SCHEME', 'http') === 'https',
    ],
],
```

### Passo 4: Criar Event

```bash
php artisan make:event OrderStatusUpdated
```

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class OrderStatusUpdated implements ShouldBroadcast
{
    use InteractsWithSockets;

    public function __construct(
        public Order $order
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('orders.' . $this->order->tenant_id);
    }

    public function broadcastAs(): string
    {
        return 'status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'status' => $this->order->status,
            'updated_at' => $this->order->updated_at,
        ];
    }
}
```

### Passo 5: Disparar Event

No `OrderObserver.php` ou `OrderController.php`:

```php
use App\Events\OrderStatusUpdated;

// Após atualizar status
event(new OrderStatusUpdated($order));
```

### Passo 6: Escutar no Frontend

```tsx
// resources/js/Components/OrderPolling.tsx
import { useEffect } from 'react';
import Echo from 'laravel-echo';

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: false,
});

export function useOrderUpdates(tenantId: string) {
    useEffect(() => {
        const channel = echo.channel(`orders.${tenantId}`);
        
        channel.listen('.status.updated', (data: any) => {
            console.log('Pedido atualizado:', data);
            // Atualizar estado...
        });

        return () => {
            channel.stopListening('.status.updated');
        };
    }, [tenantId]);
}
```

### Passo 7: Iniciar Reverb

```bash
php artisan reverb:start
```

Para produção (com supervisor):

```ini
# /etc/supervisor/conf.d/reverb.conf
[program:reverb]
process_name=%(program_name)s
command=php /path/to/artisan reverb:start
autostart=true
autorestart=true
user=www-data
```

```bash
supervisorctl reread
supervisorctl update
supervisorctl start reverb
```

---

## ✅ Validação Final

Após configurar tudo, execute:

### Teste OneSignal

```bash
php artisan tinker
```

```php
use App\Services\NotificationService;
$service = app(NotificationService::class);
$service->sendToTenant(1, 'Teste', 'Se funcionou, está configurado!');
```

### Teste Google Maps

1. Acesse `/dashboard`
2. Vá em "Zonas de Entrega"
3. Desenhe um polígono
4. Valide um endereço

### Teste Mercado Pago

```bash
php artisan tinker
```

```php
use App\Services\MercadoPagoService;
$service = app(MercadoPagoService::class);
$pref = $service->createPreference([
    'description' => 'Teste',
    'amount' => 10.00
]);
echo $pref->init_point;
```

### Teste Reverb (se implementado)

1. Inicie: `php artisan reverb:start`
2. Acesse o dashboard
3. Atualize um pedido
4. Verifique se atualizou em tempo real

---

## 📊 Status After Setup

| Configuração | Antes | Depois |
|-------------|-------|--------|
| **OneSignal** | ⚠️ Pendente | ✅ Configurado |
| **Google Maps** | ⚠️ Pendente | ✅ Configurado |
| **Mercado Pago** | 🟡 Parcial | ✅ Implementado |
| **Reverb** | 📋 Backlog | ⚠️ Opcional |

---

## 🎯 Próximos Passos

Após configurar tudo:

1. **Teste completo** — Faça um pedido do início ao fim
2. **Documente** — Atualize o README do projeto
3. **Monitore** — Configure logs e alertas
4. **Otimize** — Ajuste baseado em métricas

---

**Guia criado em:** 26/02/2026  
**Tempo total estimado:** 3 horas (sem Reverb)

*ÓoDelivery — Seu delivery no automático.* 🚀
