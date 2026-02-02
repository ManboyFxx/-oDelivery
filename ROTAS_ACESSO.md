# 🔐 Mapa de Rotas e Controle de Acesso

Documento de referência para a estrutura de autorização e permissões no oDelivery.

---

## 📊 Estrutura de Roles

```
User Role (coluna: users.role)
├── super_admin    → Acesso total ao sistema administrativo (/admin)
├── admin          → Proprietário do tenant (todos os recursos do estabelecimento)
├── employee       → Operador (recursos operacionais apenas)
└── motoboy        → Entregador (painel isolado /motoboy/*)
```

---

## 🔄 Fluxo de Autorização nas Rotas

### 1️⃣ **Rotas Operacionais** (admin + employee)
**Middleware:** `auth`, `subscription`, `role:admin,employee`

**Acesso:** Qualquer um com role admin OU employee

| Rota | Controle | Descrição |
|------|----------|-----------|
| `/orders` | Visualizar, atualizar status | Gestão de pedidos |
| `/kitchen` | Gerenciar fila | Produção |
| `/pdv` | Criar pedidos | Ponto de venda |
| `/cardapio` | Organizar produtos | Menu |
| `/estoque` | Entrada/saída | Inventário |
| `/tables/*` | Gerenciar mesas | Salão |

**Bloqueio:** Um funcionário NÃO vê estas rotas no menu:
- ❌ `/settings` (Configurações)
- ❌ `/financeiro` (Financeiro)
- ❌ `/whatsapp` (Automação)
- ❌ `/employees` (Equipe)
- ❌ `/motoboys` (Entregadores)

---

### 2️⃣ **Rotas Administrativas** (admin only)
**Middleware:** `auth`, `subscription`, `role:admin`

**Acesso:** Apenas usuários com role = `admin`

| Rota | Descrição |
|------|-----------|
| `/settings` | Configurações da loja |
| `/financeiro` | Relatórios financeiros |
| `/employees` | Gerenciar equipe |
| `/customers` | Gestão de clientes |
| `/motoboys` | Gerenciar entregadores (se plano permite) |
| `/products` | CRUD de produtos |
| `/categories` | CRUD de categorias |
| `/ingredients` | CRUD de ingredientes |
| `/coupons` | Cupons e promoções |
| `/fidelidade` | Programa de fidelidade |
| `/whatsapp/*` | Automação WhatsApp (se plano permite) |
| `/delivery-zones` | Zonas de entrega |
| `/payment-methods` | Métodos de pagamento |

---

### 3️⃣ **Rotas Motoboy** (motoboy only)
**Middleware:** `auth`, `is_motoboy`, `subscription`, `feature:motoboy_management`

**Acesso:** Apenas motoboys com permissão de feature "motoboy_management"

| Rota | Descrição |
|------|-----------|
| `/motoboy/dashboard` | Painel principal |
| `/motoboy/pedidos` | Minhas entregas |
| `/motoboy/perfil` | Meu perfil |
| `/motoboy/metricas` | Meu desempenho |
| `/motoboy/notificacoes` | Notificações |
| `/motoboy/availability/*` | Status de disponibilidade |
| `/motoboy/location/*` | Rastreamento |
| `/api/motoboy/*` | APIs de geolocalização |

---

## 🔑 Validações de Feature (Feature Flags)

Além de roles, algumas rotas verificam **features do plano**:

| Feature | Acesso | Plano Mínimo |
|---------|--------|-------------|
| `motoboy_management` | Acesso a `/motoboy/*` e `/motoboys` | Pro |
| `whatsapp_integration` | Acesso a `/whatsapp/*` | Pro |

**Como funciona:**
```php
Route::middleware('feature:motoboy_management')
```

Se o plano não tiver a feature, retorna `403 Forbidden`.

---

## 🛡️ Middleware Stack Explicado

### Auth + Subscription + Role
```php
Route::middleware(['auth', 'subscription', 'role:admin,employee'])->group(...)
```

1. **`auth`** - Usuário está logado?
2. **`subscription`** - Tenant tem subscrição válida?
3. **`role:admin,employee`** - User é admin OU employee?

Se QUALQUER falhar → `403 Forbidden`

### Motoboy Específico
```php
Route::middleware(['auth', 'is_motoboy', 'subscription', 'feature:motoboy_management'])->group(...)
```

1. **`auth`** - Usuário está logado?
2. **`is_motoboy`** - User é um motoboy? (verifica role + is_active)
3. **`subscription`** - Tenant tem subscrição válida?
4. **`feature:motoboy_management`** - Plano permite motoboys?

---

## 📋 Checklist de Implementação

- [x] Rotas operacionais separadas em grupo com `role:admin,employee`
- [x] Rotas administrativas em grupo separado com `role:admin`
- [x] Rotas motoboy com `feature:motoboy_management`
- [x] Middleware `RoleBasedAccessMiddleware` criado
- [x] OrderController validando tenant_id
- [x] MotoboySummaryService filtrando por tenant_id
- [ ] **Fase 3:** Frontend esconder menu items baseado em role
- [ ] **Fase 3:** Testes de acesso (ataque de role escalation)

---

## 🚨 Exemplo: Por que isto é importante?

**Sem autorização de role:**
```php
Route::get('/financeiro', [FinancialController::class, 'index']);
// ❌ Um funcionário logado pode acessar dados financeiros!
```

**Com autorização de role:**
```php
Route::middleware('role:admin')->get('/financeiro', [...]);
// ✅ Apenas admin acessa. Se employee tentar:
// → 403 Forbidden: "Acesso restrito..."
```

---

## 🔗 Referências

- **Documentação de Planos:** `@sugestao_planos.md`
- **Regras de Acesso:** `@regras_acesso_cargos.md`
- **Middleware de Roles:** `app/Http/Middleware/RoleBasedAccessMiddleware.php`
- **Validação Tenant:** `app/Http/Controllers/OrderController.php` (método `authorizeOrder()`)

