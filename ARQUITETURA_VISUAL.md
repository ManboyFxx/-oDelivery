# 🏗️ ARQUITETURA DO PAINEL DO MOTOBOY - VISUAL

## 🔐 Fluxo de Autenticação

```
┌─────────────────┐
│   Login Page    │
│  /login (GET)   │
└────────┬────────┘
         │
    ┌────┴─────────────┐
    │                  │
    │ Email Input      │
    │ Password Input   │
    │ ☑ Sou Entreg.   │ ◄── NOVO CHECKBOX
    │                  │
    └────┬─────────────┘
         │
         │ POST /login
         ▼
┌──────────────────────────┐
│   LoginRequest.php       │
│   Validação:             │
│   - email (required)     │
│   - password (required)  │
│   - is_motoboy (bool)    │
└──────────┬───────────────┘
           │
    ┌──────▼──────────────────┐
    │ Auth::attempt()         │
    │ Gera sessão             │
    └──────┬───────────────────┘
           │
    ┌──────┴───────────────────────────────────┐
    │                                          │
    ▼                                          ▼
┌─────────────────┐                    ┌──────────────────────┐
│ é super_admin?  │                    │ é motoboy?           │
│ role === 'sa'   │                    │ AND is_motoboy=true  │
└─────┬───────────┘                    └──────┬───────────────┘
      │                                       │
      ▼                                       ▼
/admin/dashboard                    /motoboy/dashboard ✅
     (painel admin)                  (NOVO - PAINEL MOTOBOY)
```

---

## 💾 Estrutura do Banco de Dados

### Tabelas Novas (5)

```
USERS (expandida)
├─ id (UUID)
├─ tenant_id
├─ name
├─ email
├─ role: 'motoboy' ◄── JÁ EXISTIA
├─ is_active
├─ is_available
├─ last_location_at ◄── NOVO
└─ timestamps
    │
    │ hasOne
    ├─────────────────────┬──────────────┬──────────────┐
    ▼                     ▼              ▼              ▼
MOTOBOY_            MOTOBOY_        MOTOBOY_      MOTOBOY_
PROFILES            LOCATIONS       AVAILABILITY  METRICS
├─ id              ├─ id            ├─ id          ├─ id
├─ user_id         ├─ user_id       ├─ user_id     ├─ user_id
├─ vehicle_type    ├─ latitude      ├─ is_online   ├─ period
├─ vehicle_brand   ├─ longitude     ├─ status      ├─ metric_date
├─ plate_number    ├─ accuracy      ├─ last_       ├─ deliveries_
├─ documents_*     ├─ speed         │  activity_at │  completed
├─ cpf/rg/cnh      ├─ heading       └─ timestamps  ├─ deliveries_
├─ bank_*          └─ created_at                   │  failed
├─ rating          (location history)              ├─ average_
├─ total_          (created every 30sec)           │  rating
│  deliveries                                      ├─ total_
├─ acceptance_                                     │  earnings
│  rate                                            ├─ distance_
├─ total_earnings                                  │  traveled
└─ timestamps                                      ├─ average_
   + soft deletes                                  │  time_
                                                   │  minutes
                    MOTOBOY_RATINGS                └─ timestamps
                    ├─ id
                    ├─ motoboy_id (FK)
                    ├─ order_id (FK)
                    ├─ rating (1-5)
                    ├─ comment
                    └─ created_at
```

### Tabelas Expandidas

```
ORDERS (existente)
├─ ... todos os campos existentes
├─ motoboy_id (FK) ◄── NOVO
├─ motoboy_accepted_at ◄── NOVO
├─ motoboy_delivery_started_at ◄── NOVO
├─ motoboy_delivered_at ◄── NOVO
├─ delivery_proof_photo ◄── NOVO
└─ motoboy_rating_id (FK) ◄── NOVO
```

---

## 🔐 Sistema de Middleware

```
REQUEST
   │
   ▼
Route Middleware Stack:
   ├─ auth (autentica)
   ├─ is_motoboy (valida role)
   │  ├─ user.role === 'motoboy'
   │  └─ user.is_active === true
   │
   └─ check_subscription (valida plano)
       │
       ▼ ✅ PASSOU

   Controller Method
   (MotoboysController@dashboard)
       │
       ▼

   Response
   (Inertia Component)
```

---

## 📁 Estrutura de Arquivos

### Modelos (app/Models)

```
User.php
├─ motoboyProfile() ─────────┐
├─ motoboyLocations() ───────┤
├─ motoboyAvailability() ────┤ ◄── 7 RELACIONAMENTOS NOVOS
├─ motoboyRatings() ─────────┤
├─ motoboyMetrics() ─────────┤
├─ motoboyLocationHistories()┤
└─ acceptedOrders() ─────────┘

Order.php
├─ motoboyRating() ──────────┐
├─ scopeForMotoboy() ────────┤
├─ scopeCompleted() ─────────┤ ◄── EXPANSÕES
├─ scopeActive() ────────────┤
└─ scopeDelivery() ──────────┘

✅ MotoboyProfile.php (NOVO)
✅ MotoboyLocation.php (NOVO)
✅ MotoboyAvailability.php (NOVO)
✅ MotoboyMetrics.php (NOVO)
✅ MotoboyRating.php (NOVO)
```

### Controllers (app/Http/Controllers)

```
Auth/
└─ AuthenticatedSessionController.php (modificado)

Motoboy/ (NOVA PASTA)
└─ MotoboysController.php (NOVO)
   ├─ dashboard()
   └─ future methods...
```

### Views/Pages (resources/js)

```
Auth/
└─ Login.tsx (modificado)
   └─ Adicionado checkbox is_motoboy

Motoboy/ (NOVA PASTA)
└─ Dashboard.tsx (NOVO)
   ├─ 4 cards de KPIs
   └─ Placeholder para próximas fases
```

### Migrações (database/migrations)

```
2026_02_01_000000_create_motoboy_profiles_table.php
2026_02_01_000001_create_motoboy_locations_table.php
2026_02_01_000002_create_motoboy_availability_table.php
2026_02_01_000003_create_motoboy_metrics_table.php
2026_02_01_000004_create_motoboy_ratings_table.php
2026_02_01_000005_alter_orders_table_add_motoboy_columns.php
2026_02_01_000006_alter_users_table_add_motoboy_columns.php
```

---

## 🌐 Rotas Web

```
/login (POST)
├─ Middleware: none (público)
├─ Method: AuthenticatedSessionController@store
└─ Response: Redireciona baseado em role

/motoboy/dashboard (GET)
├─ Middleware: auth, is_motoboy, check_subscription
├─ Method: MotoboysController@dashboard
├─ View: Motoboy/Dashboard.tsx
└─ Status: ✅ FUNCIONANDO

FUTURAS ROTAS (Fase 3+):
/motoboy/perfil (GET)
/motoboy/pedidos (GET)
/motoboy/pedidos/{id} (GET)
/motoboy/historico (GET)
/motoboy/metricas (GET)
/motoboy/notificacoes (GET)
```

---

## 🔄 Fluxo de Dados (Login até Dashboard)

```
1. User acessa /login
   └─ GET /login → AuthenticatedSessionController@create()
   └─ Renderiza Login.tsx com checkbox

2. User preenche formulário
   ├─ email: joao@example.com
   ├─ password: ****
   └─ is_motoboy: true ✓ MARCADO

3. User clica [Entrar]
   └─ POST /login → AuthenticatedSessionController@store()
   └─ LoginRequest valida dados

4. Backend autentica
   └─ Auth::attempt(email, password)
   └─ Obtém user object

5. Backend valida role
   ├─ Se is_motoboy && user.role !== 'motoboy'
   │  └─ Logout + erro 403
   └─ Se user.role === 'motoboy' && is_motoboy
      └─ CONTINUA ✅

6. Session regenerada
   └─ $request->session()->regenerate()

7. Redirecionamento
   └─ redirect()->route('motoboy.dashboard')

8. Request /motoboy/dashboard
   ├─ Middleware auth: ✅ autenticado
   ├─ Middleware is_motoboy: ✅ é motoboy
   └─ Middleware check_subscription: ✅ tem plano

9. Controller executa
   └─ MotoboysController@dashboard()
   └─ Retorna Inertia::render('Motoboy/Dashboard')

10. React renderiza
    └─ Dashboard.tsx
    ├─ 4 cards de KPIs
    └─ Mensagem "Em construção"
```

---

## 📊 Progresso Visual

```
COMPLETO ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░

Fase 1: Backend Base              ████████████████████ 100% ✅
Fase 2: Autenticação              ████████████████████ 100% ✅
Fase 3: Layout & Navegação        ░░░░░░░░░░░░░░░░░░░░░  0% ⏳
Fase 4: Dashboard Completo        ░░░░░░░░░░░░░░░░░░░░░  0% ⏳
Fase 5: Gerenciar Pedidos         ░░░░░░░░░░░░░░░░░░░░░  0% ⏳
Fase 6: Geolocalização            ░░░░░░░░░░░░░░░░░░░░░  0% ⏳
Fases 7-12: Restante              ░░░░░░░░░░░░░░░░░░░░░  0% ⏳

TOTAL DO PROJETO:  50% CONCLUÍDO (2 de 12 fases)
```

---

## ✨ O Que Foi Entregue

### Fase 1: Backend Base ✅
- 6 Models Eloquent novos
- 7 Migrações de banco de dados
- Relacionamentos em User e Order
- Middleware de proteção
- Estrutura pronta para funcionalidades

### Fase 2: Autenticação ✅
- Checkbox "Sou Entregador" no login
- Validação de role/permissão
- Redirecionamento automático
- Controller inicial
- Dashboard vazio funcional
- Rota protegida (/motoboy/dashboard)

---

## 🎯 O Que Vem Depois (Fase 3)

- ✅ MotoboyLayout.tsx (Sidebar + TopBar)
- ✅ Menu de navegação funcional
- ✅ Páginas vazias para estrutura
- ✅ Rotas para cada funcionalidade
- ✅ Status toggle (online/offline)

**Duração:** 4-5 horas

---

**Criado em:** 01/02/2026
**Status:** Pronto para Fase 3
