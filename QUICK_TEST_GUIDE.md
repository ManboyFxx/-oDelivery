# 🚀 Quick Test Guide - Phase 6 Notifications

**Faça isso para testar tudo funcionando!**

---

## Passo 1️⃣: Setup Inicial

```bash
# Terminal 1 - Instalar dependências
cd /path/to/oDelivery
npm install

# Verificar instalação
npm list laravel-echo pusher-js
```

**Esperado:**
```
✅ laravel-echo@1.14.1
✅ pusher-js@8.4.0-rc5
```

---

## Passo 2️⃣: Iniciar Servidor

```bash
# Terminal 1 - Servidor PHP
php artisan serve

# Terminal 2 - Vite dev server
npm run dev
```

**Esperado:**
```
✅ Laravel development server started: http://127.0.0.1:8000
✅ VITE v7.0.7  ready in 123 ms
✅ ➜  local:   http://localhost:5173/
```

---

## Passo 3️⃣: Login como Motoboy

1. Abra browser: `http://localhost:8000`
2. Clique em "Login"
3. Use credenciais de motoboy:
   - Email: `motoboy@example.com`
   - Senha: `password`
4. ✅ Marque "Sou Entregador"
5. Clique "Entrar"

**Esperado:**
```
✅ Redirecionado para /motoboy/dashboard
✅ Ver sidebar de motoboy
✅ TopBar com sino de notificações
```

---

## Passo 4️⃣: Abrir Developer Tools

```
Chrome/Edge: F12
Firefox: F12
Safari: Cmd + Option + I
```

Ir para **Console** e procurar por:

```javascript
✅ 🔊 Broadcasting initialized with driver: log
✅ 🔗 Listening to notifications for user: 1
```

---

## Passo 5️⃣: Testar Notificações

### Opção A: Via Tinker (Recomendado)

```bash
# Terminal 3
php artisan tinker

# Digitar:
> include 'routes/test-notifications.php'
> testCreateNotification()
```

**Esperado:**
```
🧪 Testing Notification Creation...

✅ Notification Created!
   ID: abc123def456
   User: João Motoboy
   Title: Teste de Notificação
   Type: system

🔔 Toast should appear in real-time on the dashboard!
```

### Opção B: Via API (CURL)

```bash
# Abrir novo terminal
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "motoboy@example.com",
    "password": "password"
  }' | jq '.token'

# Copiar o token e usar:
TOKEN="seu_token_aqui"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/motoboy/notifications
```

---

## Passo 6️⃣: Verificar Toast Appearance

**No browser na dashboard:**

✅ **Você deve ver um toast no canto inferior direito:**

```
┌────────────────────────────┐
│ 🔔 Teste de Notificação    │ ← Ícone + Título
│ Esta é uma notificação...  │ ← Mensagem
│                       ✕    │ ← Botão fechar
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░│ ← Progress bar
└────────────────────────────┘
```

**Comportamentos:**
- ✅ Aparece suavemente (fade in)
- ✅ Fica por 6 segundos
- ✅ Progress bar anima
- ✅ Desaparece automaticamente
- ✅ Pode fechar manualmente

---

## Passo 7️⃣: Testar Bell de Notificações

Na **TopBar** (canto superior direito):

1. ✅ Ver sino vazio (sem badge)
2. **Criar outra notificação** (Passo 5)
3. ✅ Badge aparece com número "1"
4. Clique no sino
5. ✅ Popup abre com NotificationCenter
6. ✅ Lista mostra a notificação recém-criada

---

## Passo 8️⃣: Testar Página Completa de Notificações

1. Na TopBar, clique em "Ver todas as notificações" (no popup)
2. Ou vá para: `/motoboy/notificacoes`

**Você deve ver:**

```
┌─────────────────────────────────────┐
│ Notificações                        │
│ Gerencie suas notificações          │
├─────────────────────────────────────┤
│                                     │
│ Não lidas: 1    │    Total: 5      │ ← Cards KPI
│                                     │
│ [Todas] [Não lidas] [Lidas] ...    │ ← Filtros
│                                     │
│ [Marcar tudo como lido]            │ ← Ação
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 🔔 Teste de Notificação    1h   ││ ← Item
│ │ Esta é uma notificação...       ││
│ │         [✓] [✕]               ││ ← Ações
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ✓ Entrega Confirmada       2h   ││
│ │ Pedido #123 entregue          ││
│ └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## Passo 9️⃣: Testar Ações

### Marcar como Lida

1. Passe mouse sobre um item
2. Clique no ícone ✓ (checkmark)
3. ✅ Item muda de aparência (menos destaque)
4. ✅ Contagem "Não lidas" diminui

### Deletar

1. Passe mouse sobre um item
2. Clique no ícone ✕ (X)
3. ✅ Item desaparece
4. ✅ Total diminui

### Filtros

1. Clique em "Não lidas"
2. ✅ Lista mostra apenas não lidas
3. Clique em "Delivery"
4. ✅ Lista mostra apenas de entrega
5. Clique em "Todas"
6. ✅ Lista volta ao normal

---

## Passo 🔟: Teste de WebSocket Real-time

**Em 2 abas diferentes:**

Aba 1: Dashboard
Aba 2: Admin/Tinker

```bash
# Aba 2: Criar notificação
php artisan tinker
> include 'routes/test-notifications.php'
> testCreateNotification()
```

**Esperado em Aba 1:**
```
⚡ Toast aparece INSTANTANEAMENTE
⚡ Badge do sino atualiza em tempo real
⚡ Nenhum refresh necessário
```

---

## Passo 1️⃣1️⃣: Verificar Console Logs

Abra DevTools (F12) → Console

**Procure por:**

```javascript
✅ 🔊 Broadcasting initialized with driver: log
✅ 🔗 Listening to notifications for user: 1
✅ 📬 Notification received: { ... }
✅ 📲 New notification to display as toast: { ... }
```

**Se não ver os logs:**
- Verifique se está logado
- Verifique se está na rota `/motoboy/*`
- Abra nova aba do browser

---

## ✅ Checklist Final

```
SETUP
☑️ npm install completado
☑️ PHP server rodando
☑️ Vite dev server rodando

AUTENTICAÇÃO
☑️ Login como motoboy funcionando
☑️ Dashboard carregando
☑️ TopBar com sino visível

NOTIFICAÇÕES
☑️ Toast aparece no canto inferior
☑️ Toast desaparece após 6s
☑️ Badge do sino atualiza
☑️ Popup do centro abre/fecha

PÁGINA COMPLETA
☑️ Página /motoboy/notificacoes carrega
☑️ Cards KPI mostram números
☑️ Filtros funcionam (8 tipos)
☑️ Marcar como lida funciona
☑️ Deletar funciona
☑️ Marcar tudo funciona

WEBSOCKET
☑️ Notificações aparecem em tempo real
☑️ Múltiplas abas sincronizam
☑️ Console logs aparecem
☑️ Sem erros no console

API
☑️ GET /api/motoboy/notifications retorna dados
☑️ POST mark-read funciona
☑️ POST read-all funciona
☑️ DELETE funciona
```

---

## 🆘 Troubleshooting

### Toast não aparece

**Solução:**
```bash
# 1. Verificar console
# Deve ver: 🔊 Broadcasting initialized

# 2. Criar notificação
php artisan tinker
> include 'routes/test-notifications.php'
> testCreateNotification()

# 3. Verificar console novamente
# Deve ver: 📬 Notification received
```

### Badge não atualiza

**Solução:**
```bash
# 1. Abrir nova aba
# 2. Ir para /motoboy/dashboard
# 3. Criar notificação em outro terminal
# 4. Badge deve atualizar na aba 1
```

### Erros de import

**Solução:**
```bash
npm install
npm run dev
# Reload página
```

### Console vazio

**Solução:**
```bash
# 1. Fazer logout
# 2. Fazer login novamente
# 3. Ir para /motoboy/dashboard
# 4. Abrir console
```

---

## 📊 Resultados Esperados

| Funcionalidade | Status | Tempo |
|----------------|--------|-------|
| Toast aparece | ✅ | < 100ms |
| Badge atualiza | ✅ | < 100ms |
| Página carrega | ✅ | < 1s |
| Filtro funciona | ✅ | < 500ms |
| Marcar lida | ✅ | < 500ms |
| Deletar | ✅ | < 500ms |
| **Tudo** | ✅ | Smooth |

---

## 🎯 Resumo

```
Se você vir:
✅ Toast no canto inferior
✅ Badge com número
✅ Página carregando notificações
✅ Filtros funcionando
✅ Ações (marcar, deletar) funcionando
✅ Logs no console

TUDO ESTÁ FUNCIONANDO! 🎉
```

---

## 🚀 Próximos Passos

```bash
# Quando tudo passar no teste:

# 1. Commit das mudanças
git add -A
git commit -m "feat: add real-time notifications system"

# 2. Build para production
npm run build

# 3. Deploy para Hostinger
# (Usar seu processo de deploy)
```

---

**Boa sorte com os testes! 🚀**

Se algo não funcionar, verifique os logs do console (F12) e compare com a seção Troubleshooting.

