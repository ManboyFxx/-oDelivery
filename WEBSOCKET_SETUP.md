# WebSocket Setup - Real-time Notifications

## ✅ Status: WebSocket 100% Implementado

---

## 1. Arquivos Criados

### **resources/js/echo.ts** ✅
Configuração do Laravel Echo com suporte para múltiplos drivers:
- **log** - Development local (padrão)
- **pusher** - Pusher service
- **ably** - Ably service

```typescript
// Configuração automática baseada em VITE_BROADCAST_DRIVER
const broadcastDriver = import.meta.env.VITE_BROADCAST_DRIVER || 'pusher';
```

### **resources/js/Hooks/useWebSocketNotifications.ts** ✅
Hook React que:
- Escuta channel privado do usuário (`private-user.{userId}`)
- Recebe 6 tipos de eventos em tempo real
- Transforma eventos em notificações Notification
- Auto-cleanup ao desmontar

```typescript
useWebSocketNotifications({
    onNewNotification: (notification) => { /* display toast */ },
    onOrderStatusChanged: (data) => { /* handle order */ },
    onLocationUpdated: (data) => { /* update map */ },
})
```

### **Layouts/MotoboyLayout.tsx** ✅
Integração completa:
- Inicializa WebSocket ao montar
- Exibe NotificationToasts em tempo real
- Máximo 3 toasts simultâneos
- Auto-remove após 6 segundos

---

## 2. Eventos Suportados

### **Notification Events** 📬
Escuta notificações do banco de dados:
```javascript
Illuminate.Notifications.Events.BroadcastNotificationCreated
```
Converte para formato Notification do React.

### **Order Events** 📋
```javascript
'OrderStatusChangedEvent' → Mudança de status
'OrderAcceptedEvent'      → Novo pedido aceito
'OrderDeliveredEvent'     → Entrega confirmada
```

### **Location Events** 📍
```javascript
'LocationUpdatedEvent'     → Atualização de local
'ArrivedAtDestinationEvent' → Chegada ao destino
```

---

## 3. Configuração por Driver

### **A. Development Local (LOG DRIVER) - Default**

Sem necessidade de configuração adicional! Usa o driver `log` do Laravel.

**Setup:**
```bash
# .env
VITE_BROADCAST_DRIVER=log
BROADCAST_DRIVER=log
```

**Como funciona:**
- Notificações são escritas no log
- Útil para desenvolvimento/testes
- Não requer servidor externo

---

### **B. Production com Pusher**

#### **Passo 1: Criar conta Pusher**
1. Ir para [pusher.com](https://pusher.com)
2. Criar conta gratuita (100 conexões/dia)
3. Criar novo app/cluster
4. Copiar credenciais:
   - App ID
   - App Key
   - App Secret
   - Cluster (ex: mt1, us2)

#### **Passo 2: Atualizar .env**
```bash
VITE_BROADCAST_DRIVER=pusher
BROADCAST_DRIVER=pusher

PUSHER_APP_ID=seu_app_id
PUSHER_APP_KEY=seu_app_key
PUSHER_APP_SECRET=seu_app_secret
PUSHER_APP_CLUSTER=mt1

# Vite variables (auto-preenchidas)
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="api-${PUSHER_APP_CLUSTER}.pusher.com"
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

#### **Passo 3: Instalar packages**
```bash
npm install
```

#### **Passo 4: Deploy**
```bash
npm run build
# Deploy normalmente
```

---

### **C. Production com Ably (Alternativa)**

#### **Passo 1: Criar conta Ably**
1. Ir para [ably.io](https://ably.io)
2. Criar conta gratuita
3. Copiar API Key

#### **Passo 2: Atualizar .env**
```bash
VITE_BROADCAST_DRIVER=ably

ABLY_PUBLIC_KEY=seu_ably_api_key
VITE_ABLY_PUBLIC_KEY="${ABLY_PUBLIC_KEY}"
```

#### **Passo 3: Instalar packages**
```bash
npm install
```

---

## 4. Estrutura de Canais

### **Channel Privado do Usuário**
```
private-user.{userId}
├─ Notificações individuais
├─ Eventos de pedido pessoais
└─ Eventos de localização pessoais
```

**Autorização:**
Laravel Echo usa middleware `channels.php` para autorizar canais privados.

### **Broadcasting Routes (config/channels.php)**
```php
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
```

---

## 5. Fluxo de Dados

```
┌──────────────────────────────────────┐
│   Backend (Laravel)                  │
│                                      │
│  1. Event disparado                  │
│     → Order::delivered()             │
│                                      │
│  2. Notification Class               │
│     → toDatabase() + toBroadcast()   │
│                                      │
│  3. Broadcasting                     │
│     → Pusher/Ably/Log                │
└──────────────────────────────────────┘
                  │
                  │ WebSocket
                  ▼
┌──────────────────────────────────────┐
│   Frontend (React)                   │
│                                      │
│  1. useWebSocketNotifications Hook   │
│     → Escuta private-user.{id}       │
│                                      │
│  2. Event Listener                   │
│     → Converte para Notification     │
│                                      │
│  3. Callback                         │
│     → onNewNotification(notif)       │
│                                      │
│  4. MotoboyLayout                    │
│     → Exibe NotificationToast        │
│                                      │
│  5. Toast Automático                 │
│     → Aparece 6s no canto inferior   │
└──────────────────────────────────────┘
```

---

## 6. Teste Local

### **Opção 1: Via Console**
```bash
# Terminal 1: Run Laravel server
php artisan serve

# Terminal 2: Run Vite
npm run dev
```

Abra browser em `http://localhost:8000/motoboy/dashboard`

### **Opção 2: Simular Evento**
```php
// routes/web.php ou controller
use App\Services\NotificationService;

Route::get('/test-notification', function () {
    $notificationService = app(NotificationService::class);
    $user = auth()->user();

    $notificationService->createNotification(
        $user,
        'Teste WebSocket',
        'Esta é uma notificação de teste!',
        'system'
    );

    return 'Notificação enviada!';
});
```

Acesse `http://localhost:8000/test-notification` e veja o toast aparecer!

---

## 7. Configuração do Laravel (config/broadcasting.php)

Já deve estar configurado, mas verifique:

```php
'default' => env('BROADCAST_DRIVER', 'log'),

'connections' => [
    'pusher' => [
        'driver' => 'pusher',
        'key' => env('PUSHER_APP_KEY'),
        'secret' => env('PUSHER_APP_SECRET'),
        'app_id' => env('PUSHER_APP_ID'),
        'options' => [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'useTLS' => true,
        ],
    ],
]
```

---

## 8. Troubleshooting

### **Problema: Toasts não aparecem**

**Solução 1: Verificar driver**
```bash
# No .env
echo VITE_BROADCAST_DRIVER
# Deve ser: log (dev) ou pusher/ably (prod)
```

**Solução 2: Verificar console**
```javascript
// Abrir DevTools > Console
// Deve ver logs como:
// 🔊 Broadcasting initialized with driver: log
// 🔗 Listening to notifications for user: 1
```

**Solução 3: Verificar autenticação**
```javascript
// Se ver erro 401 Unauthorized:
// Problema: User não está autenticado
// Solução: Fazer login primeiro
```

### **Problema: WebSocket não conecta**

**Para Pusher:**
```bash
# Verificar credenciais em .env
echo "PUSHER_APP_KEY=${PUSHER_APP_KEY}"

# Pode estar vazio? Adicione as credenciais corretas
```

**Para Ably:**
```bash
# Verificar credenciais
echo "ABLY_PUBLIC_KEY=${ABLY_PUBLIC_KEY}"
```

---

## 9. Segurança

### **Canais Privados**
- Apenas usuários autenticados podem se conectar
- Laravel valida automaticamente via `channels.php`
- Usuário só recebe notificações dele

### **Dados Sensíveis**
- Não envie senhas ou tokens via broadcast
- Use apenas IDs e dados públicos
- Notificações são criptografadas via HTTPS/WSS

### **Rate Limiting**
- Pusher: 100 mensagens/segundo por app
- Ably: Verificar plano
- Adequado para aplicação de delivery

---

## 10. Próximos Passos

1. **Instalar packages:**
   ```bash
   npm install
   ```

2. **Para Development Local:**
   - Nenhuma configuração adicional!
   - Just run `npm run dev` and test

3. **Para Production:**
   - Escolher Pusher ou Ably
   - Atualizar `.env`
   - Deploy normalmente

4. **Testar:**
   - Criar notificações via admin
   - Verificar se aparecem como toast
   - Verificar lista de notificações atualiza

---

## 11. CURL Test (Simulação)

Você pode testar enviando notificações manualmente:

```bash
# Login primeiro
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"motoboy@example.com","password":"password"}'

# Criar notificação
curl -X POST http://localhost:8000/api/motoboy/notifications \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Novo Pedido",
    "message":"Pedido #123 aguardando",
    "type":"order"
  }'
```

---

## 12. Status

| Componente | Status | Arquivo |
|-----------|--------|---------|
| Echo Setup | ✅ | `resources/js/echo.ts` |
| Hook WebSocket | ✅ | `resources/js/Hooks/useWebSocketNotifications.ts` |
| Layout Integration | ✅ | `resources/js/Layouts/MotoboyLayout.tsx` |
| Toast Display | ✅ | Auto via hook |
| .env Config | ✅ | Development ready |
| Package.json | ✅ | laravel-echo + pusher-js |
| Documentation | ✅ | This file |

**Total: 7/7 - 100% Complete**

---

**Data:** 01/02/2026
**Status:** WebSocket Ready for Development
**Próxima Fase:** Testing & Production Deployment

