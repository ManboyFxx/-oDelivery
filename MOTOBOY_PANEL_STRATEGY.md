# 📋 ESTRATÉGIA DE IMPLEMENTAÇÃO - PAINEL DO MOTOBOY

## 📌 ÍNDICE
1. [Visão Geral](#visão-geral)
2. [Análise da Situação Atual](#análise-da-situação-atual)
3. [Arquitetura Proposta](#arquitetura-proposta)
4. [Fluxo de Autenticação](#fluxo-de-autenticação)
5. [Funcionalidades do Painel do Motoboy](#funcionalidades-do-painel-do-motoboy)
6. [Banco de Dados - Alterações Necessárias](#banco-de-dados---alterações-necessárias)
7. [Implementação Passo-a-Passo](#implementação-passo-a-passo)
8. [Migração para Mobile (PlayStore)](#migração-para-mobile-playstore)
9. [Cronograma Estimado](#cronograma-estimado)
10. [Dúvidas Comuns](#dúvidas-comuns)

---

## 🎯 VISÃO GERAL

O objetivo é criar um **painel completo e integrado para motoboyss/entregadores** na mesma aplicação ÓoDelivery, permitindo que:

- ✅ O mesmo usuário (via role `motoboy`) tenha acesso a um painel diferenciado
- ✅ Login unificado com checkbox "Sou Entregador"
- ✅ Geolocalização em tempo real
- ✅ Recebimento de pedidos via notificações
- ✅ Histórico de entregas completo
- ✅ Métricas de performance (avaliações, ganhos, etc)
- ✅ Perfil customizável
- ✅ Suporte para Web (fase 1) + Mobile via ReactNative/Flutter (fase 2 - PlayStore)

---

## 🔍 ANÁLISE DA SITUAÇÃO ATUAL

### ✅ O Que Já Existe

```
1. Sistema de Autenticação
   ├── Login com email/password
   ├── Role system (super_admin, admin, motoboy, employee)
   └── Multi-tenancy implementado

2. Modelo de Usuário
   ├── Coluna 'role' enum com 'motoboy'
   ├── Métodos isMotoboy()
   └── Soft deletes e audit logging

3. Banco de Dados
   ├── Tabela users com role
   ├── Tabela orders com motoboy_id (FK)
   └── Tabela motoboy_location_history (para geolocalização)

4. Estrutura de Rotas
   ├── Routes autenticadas protegidas
   ├── Middleware de super_admin existente
   └── API routes para integração mobile

5. Frontend React
   ├── Layout system
   ├── Protected routes
   └── Component structure
```

### ❌ O Que Falta Implementar

```
1. UI/UX Específica para Motoboy
   ├── Dashboard do motoboy diferenciado
   ├── Página de perfil do entregador
   ├── Lista de pedidos com filtros/status
   ├── Mapa com geolocalização
   └── Histórico de entregas

2. Lógica de Negócio
   ├── Sistema de notificações para pedidos
   ├── Rating/Avaliação do motoboy
   ├── Sistema de ganhos/comissão
   ├── Métricas de performance
   └── Disponibilidade (online/offline)

3. Geolocalização
   ├── Tracking em tempo real
   ├── Histórico de trajetos
   └── Distância para o cliente

4. Notificações
   ├── Push notifications para novos pedidos
   ├── In-app notifications
   ├── WebSockets para updates em tempo real (opcional)
   └── Email/SMS de confirmação

5. Mobile API
   ├── Endpoints específicos para geolocalização
   ├── Polling de novos pedidos
   └── Token-based auth (Sanctum)
```

---

## 🏗️ ARQUITETURA PROPOSTA

### 1. ESTRUTURA DE ROTAS

```
WEB ROUTES:
├── /login (modificado - com checkbox "sou entregador")
├── /dashboard (admin/employee)
└── /motoboy
    ├── /dashboard (novo)
    ├── /perfil (novo)
    ├── /pedidos (novo)
    ├── /pedidos/{id} (novo)
    ├── /historico (novo)
    ├── /metricas (novo)
    └── /notificacoes (novo)

API ROUTES (para mobile):
├── /api/motoboy/auth (login + registrar como motoboy)
├── /api/motoboy/location (POST geolocalização)
├── /api/motoboy/location/history (GET histórico)
├── /api/motoboy/orders (GET pedidos disponíveis/ativos)
├── /api/motoboy/orders/{id}/accept (POST aceitar pedido)
├── /api/motoboy/orders/{id}/pickup (POST confirmar coleta)
├── /api/motoboy/orders/{id}/deliver (POST confirmar entrega)
├── /api/motoboy/orders/{id}/history (GET histórico de um pedido)
├── /api/motoboy/profile (GET/PUT perfil)
├── /api/motoboy/notifications (GET notificações)
├── /api/motoboy/metrics (GET métricas/estatísticas)
└── /api/motoboy/availability (PUT ativar/desativar)
```

### 2. MIDDLEWARE NECESSÁRIO

```php
// Novo middleware: EnsureMotoboy
app/Http/Middleware/EnsureMotoboy.php
├── Valida se user.role === 'motoboy'
├── Valida se motoboy está ativo (is_active)
└── Retorna 403 se não for motoboy

// Existente para aproveitar: TenantScopeMiddleware
```

### 3. MODELS NECESSÁRIOS

```php
// Novos Models:
├── MotoboyProfile (novo)
│   ├── user_id (FK)
│   ├── vehicle_type (motorcycle, bicycle, car)
│   ├── plate_number (placa do veículo)
│   ├── documents_verified (bool)
│   ├── cpf (criptografado)
│   ├── rg (criptografado)
│   ├── cnh (criptografado)
│   ├── bank_account (criptografado)
│   ├── rating (float 0-5)
│   ├── total_deliveries
│   ├── acceptance_rate (%)
│   └── timestamps

├── MotoboyLocation (novo)
│   ├── user_id (FK)
│   ├── latitude
│   ├── longitude
│   ├── accuracy (metros)
│   ├── speed (km/h)
│   ├── heading (direção)
│   └── created_at (atualizado constantemente)

├── MotoboyMetrics (novo ou agregado)
│   ├── user_id (FK)
│   ├── period (daily/weekly/monthly)
│   ├── deliveries_completed
│   ├── deliveries_failed
│   ├── average_rating
│   ├── total_earnings
│   ├── distance_traveled_km
│   └── timestamps

├── MotoboyAvailability (novo)
│   ├── user_id (FK)
│   ├── is_online (bool)
│   ├── availability_status (available, on_delivery, break, offline)
│   ├── last_activity_at
│   └── timestamps

└── MotoboyRating (novo)
    ├── motoboy_id (FK)
    ├── order_id (FK)
    ├── rating (1-5)
    ├── comment (texto)
    └── created_at
```

### 4. ALTERAÇÕES NO MODEL USER

```php
// Adicionar relationships
public function motoboyProfile()      // HasOne
public function motoboyLocations()    // HasMany
public function motoboyAvailability() // HasOne
public function motoboyRatings()      // HasMany (ratings que recebeu)
public function acceptedOrders()      // HasMany orders onde é motoboy

// Adicionar mutators/accessors
public function getAvatarUrlAttribute() // se não existir
```

### 5. ALTERAÇÕES NA TABELA ORDERS

```sql
-- Adicionar colunas (se não existirem):
ALTER TABLE orders ADD COLUMN motoboy_id UUID NULLABLE AFTER customer_id;
ALTER TABLE orders ADD COLUMN motoboy_accepted_at TIMESTAMP NULLABLE;
ALTER TABLE orders ADD COLUMN pickup_at TIMESTAMP NULLABLE;
ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP NULLABLE;
ALTER TABLE orders ADD COLUMN motoboy_rating_id UUID NULLABLE;

-- Foreign keys:
ALTER TABLE orders ADD FOREIGN KEY (motoboy_id) REFERENCES users(id);
ALTER TABLE orders ADD FOREIGN KEY (motoboy_rating_id) REFERENCES motoboy_ratings(id);
```

---

## 🔐 FLUXO DE AUTENTICAÇÃO

### Login Modificado (Nova Interface)

```
ANTES:
┌─────────────────────────────────────┐
│       Login - ÓoDelivery            │
├─────────────────────────────────────┤
│ Email:     [___________________]    │
│ Password:  [___________________]    │
│            [ ENTRAR ]               │
└─────────────────────────────────────┘

DEPOIS:
┌─────────────────────────────────────┐
│       Login - ÓoDelivery            │
├─────────────────────────────────────┤
│ Email:     [___________________]    │
│ Password:  [___________________]    │
│                                     │
│ ☐ Sou um Entregador/Motoboy         │
│            [ ENTRAR ]               │
└─────────────────────────────────────┘
```

### Fluxo Backend

```
1. User acessa GET /login
   └─→ Login.tsx renderiza com novo checkbox

2. User clica [ ENTRAR ]
   └─→ POST /login com:
       {
         email: "motoboy@example.com",
         password: "senha123",
         is_motoboy: true/false  ← NOVO
       }

3. AuthenticatedSessionController@store valida:
   └─→ Verifica email/password (LoginRequest)
   └─→ Verifica role do usuário:
       - Se is_motoboy === true E user.role !== 'motoboy'
         └─→ Retorna erro 403 "Acesso negado"
       - Se user.role === 'motoboy' E is_motoboy === false
         └─→ Aviso "Você é registrado como entregador"
   └─→ Session regenerada
   └─→ Redireciona para:
       - user.role === 'super_admin' → /admin/dashboard
       - user.role === 'motoboy' → /motoboy/dashboard ← NOVO
       - outros → /dashboard

4. ProtectedRoute em React valida role
   └─→ Se motoboy, renderiza MotoboyLayout
   └─→ Se admin, renderiza AuthenticatedLayout
   └─→ Se super_admin, renderiza AdminLayout
```

### Migração de Usuários Existentes

```
Opção 1: Criar usuários motoboyss manualmente (recomendado no início)
Opção 2: Permitir auto-registro de motoboyss com validação de documentos
Opção 3: Admin convida motoboyss com token único

Escolha: Opção 1 + 2
- Fase 1: Admin cria motoboyss
- Fase 2: Motoboy pode se registrar auto
```

---

## 🚀 FUNCIONALIDADES DO PAINEL DO MOTOBOY

### 1. DASHBOARD DO MOTOBOY `/motoboy/dashboard`

```
┌────────────────────────────────────────────────────────┐
│  Status: ONLINE  |  Pedidos Hoje: 5  |  Ganho: R$45.50  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  PEDIDOS DISPONÍVEIS (ativos)           PRÓXIMO PEDIDO │
│  ┌────────────────────────────────┐  ┌──────────────┐ │
│  │ 1. Pedido #001                 │  │              │ │
│  │    📍 Rua A, 123               │  │   MAPA COM   │ │
│  │    👤 João Silva               │  │ GEOLOCALIZAÇÃO
│  │    💰 R$ 12.50                 │  │              │ │
│  │    [ACEITAR] [DETALHES]        │  │              │ │
│  │                                │  │              │ │
│  │ 2. Pedido #002                 │  │              │ │
│  │    📍 Avenida B, 456           │  │              │ │
│  │    👤 Maria Costa              │  │              │ │
│  │    💰 R$ 18.00                 │  │              │ │
│  │    [ACEITAR] [DETALHES]        │  │              │ │
│  └────────────────────────────────┘  └──────────────┘ │
│                                                        │
│  PEDIDOS EM ENTREGA (ativos)                           │
│  ┌────────────────────────────────┐                   │
│  │ 1. Pedido #003                 │                   │
│  │    Status: EM ROTA             │                   │
│  │    ETA: 15 min                 │                   │
│  │    [DETALHES] [ENTREGAR]       │                   │
│  └────────────────────────────────┘                   │
└────────────────────────────────────────────────────────┘
```

**Métricas Principais:**
- Status atual (ONLINE, OFFLINE, EM ENTREGA, PAUSA)
- Total de pedidos hoje
- Ganho total hoje
- Avaliação média (★★★★☆)
- Próximo pedido com mapa

**Interações:**
- Toggle ONLINE/OFFLINE
- Aceitar novo pedido (com confirmação)
- Ver detalhes do pedido
- Iniciar rota no mapa

---

### 2. PERFIL DO MOTOBOY `/motoboy/perfil`

```
┌────────────────────────────────────────┐
│         MEU PERFIL                [EDITAR]│
├────────────────────────────────────────┤
│                                        │
│  FOTO DE PERFIL                        │
│  ┌──────────────┐                     │
│  │     [👤]     │  [MUDAR FOTO]       │
│  │              │                     │
│  └──────────────┘                     │
│                                        │
│  INFORMAÇÕES PESSOAIS                  │
│  ├─ Nome:          João Silva          │
│  ├─ Email:        joao@example.com    │
│  ├─ Telefone:     (11) 98765-4321     │
│  └─ Data Nasc.:   01/01/1990          │
│                                        │
│  VEÍCULO                               │
│  ├─ Tipo:         Moto                 │
│  ├─ Placa:        ABC-1234            │
│  ├─ Marca/Modelo: Honda CB 500        │
│  └─ Documento:    ✓ Verificado        │
│                                        │
│  DOCUMENTAÇÃO                          │
│  ├─ CPF:          ✓ Verificado        │
│  ├─ RG:           ✓ Verificado        │
│  ├─ CNH:          ✓ Verificado        │
│  └─ CNH Validade: 31/12/2028          │
│                                        │
│  BANCO                                 │
│  ├─ Banco:        Itaú                 │
│  ├─ Agência:      1234                │
│  └─ Conta:        56789-0 (oculta)    │
│      [EDITAR DADOS BANCÁRIOS]          │
│                                        │
│  ESTATÍSTICAS                          │
│  ├─ Avaliação:    ★★★★★ (4.8)        │
│  ├─ Total Entregas: 1.234             │
│  ├─ Taxa Aceitação: 98%               │
│  └─ Tempo Médio: 18 min                │
│                                        │
│  [SALVAR] [CANCELAR]                   │
└────────────────────────────────────────┘
```

**Seções:**
- Foto de perfil (upload)
- Dados pessoais (editável)
- Informações do veículo
- Documentação (com status de verificação)
- Dados bancários (criptografados)
- Estatísticas de performance

---

### 3. PEDIDOS `/motoboy/pedidos`

```
┌────────────────────────────────────────────────────────┐
│  PEDIDOS                                               │
├────────────────────────────────────────────────────────┤
│  Filtro: [Todos] [Disponíveis] [Em Entrega] [Concluídos]
├────────────────────────────────────────────────────────┤
│                                                        │
│  PEDIDO #001                                           │
│  ┌────────────────────────────────────────────────┐   │
│  │ 📍 Rua A, 123 → Avenida B, 456                │   │
│  │ 👤 João Silva        💰 R$ 12.50              │   │
│  │ 📞 (11) 98765-4321                            │   │
│  │ ⏰ 14:30 - 14:45 (15 min)                      │   │
│  │ 📦 2 itens (pizza grande + refrigerante)      │   │
│  │                                                │   │
│  │ Status: DISPONÍVEL                            │   │
│  │ [ACEITAR] [DETALHES] [CHAMAR CLIENTE]         │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  PEDIDO #003                                           │
│  ┌────────────────────────────────────────────────┐   │
│  │ 📍 Avenida C, 789 → Rua D, 101                │   │
│  │ 👤 Maria Costa       💰 R$ 18.00              │   │
│  │ 📞 (11) 91234-5678                            │   │
│  │ ⏰ 15:00 - 15:25 (25 min)                      │   │
│  │ 📦 3 itens (burguer combo + sobremesa)        │   │
│  │                                                │   │
│  │ Status: EM ROTA (Coletado há 5 min)           │   │
│  │ [VER MAPA] [CONFIRMAR ENTREGA]                │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Lista com filtros (disponíveis, em entrega, concluídos)
- Informações do pedido completas
- Dados do cliente
- Estimativa de tempo
- Botões de ação (aceitar, entregar, detalhes)
- Integração com mapa para rota

---

### 4. DETALHES DO PEDIDO `/motoboy/pedidos/{id}`

```
┌────────────────────────────────────────────────────────┐
│  PEDIDO #001 - DETALHES                           [X]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  CLIENTE                                               │
│  ┌────────────────────────────────────────────────┐   │
│  │ 👤 João Silva                                 │   │
│  │ 📧 joao@example.com                           │   │
│  │ 📞 (11) 98765-4321                            │   │
│  │ 📍 Rua A, 123 - Apt 45 - São Paulo            │   │
│  │    Ponto de referência: Perto do semáforo     │   │
│  │                                                │   │
│  │ [CHAMAR CLIENTE] [ENVIAR MENSAGEM]            │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  PEDIDO                                                │
│  ┌────────────────────────────────────────────────┐   │
│  │ Número:        #001                           │   │
│  │ Data/Hora:     01/02/2026 14:30               │   │
│  │ Status:        DISPONÍVEL / EM ROTA / ENTREGUE
│  │ Tempo Estimado: 15 minutos                    │   │
│  │ Distância:     2.5 km                         │   │
│  │                                                │   │
│  │ ITENS:                                        │   │
│  │ ├─ Pizza Grande Mozzarella × 1 - R$ 35.00   │   │
│  │ ├─ Refrigerante 2L × 1 - R$ 8.00             │   │
│  │ └─ Embalagem - R$ 2.00                       │   │
│  │                                                │   │
│  │ Subtotal:      R$ 45.00                       │   │
│  │ Desconto:      -R$ 0.00                       │   │
│  │ TOTAL:         R$ 45.00                       │   │
│  │                                                │   │
│  │ Forma Pagamento: Cartão (crédito)            │   │
│  │ Status Pagamento: ✓ Pago                     │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  MAPA E ROTA                                           │
│  ┌────────────────────────────────────────────────┐   │
│  │                                                │   │
│  │             [MAPA INTERATIVO]                 │   │
│  │                                                │   │
│  │     📍 Você está aqui (São Paulo)             │   │
│  │     → Rota para: Rua A, 123 (2.5 km)          │   │
│  │                                                │   │
│  │    [ABRIR EM GOOGLE MAPS] [COPIAR ENDEREÇO]  │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  AÇÕES                                                 │
│  ├─ [ACEITAR PEDIDO]      (se disponível)           │
│  ├─ [INICIAR ENTREGA]     (se aceito)               │
│  ├─ [CONFIRMAR ENTREGA]   (se em rota)              │
│  └─ [RECUSAR PEDIDO]      (se disponível)           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Dados completos do cliente
- Itens do pedido com preços
- Mapa interativo com rota
- Timeline do pedido
- Botões contextuais de ação
- Opção de contato com cliente

---

### 5. HISTÓRICO DE ENTREGAS `/motoboy/historico`

```
┌────────────────────────────────────────────────────────┐
│  HISTÓRICO DE ENTREGAS                                 │
├────────────────────────────────────────────────────────┤
│  Filtro: [Últimos 7 dias] [Último mês] [Todos]        │
│  Buscar: [__________________] [Buscar]                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  FEVEREIRO 2026                                        │
│                                                        │
│  01/02/2026 - Sexta-feira (5 entregas)                │
│  ┌────────────────────────────────────────────────┐   │
│  │ 14:45 │ #001 │ João Silva     │ R$ 12.50 │ ✓   │   │
│  │ 15:30 │ #002 │ Maria Costa    │ R$ 18.00 │ ✓   │   │
│  │ 16:15 │ #003 │ Pedro Oliveira │ R$ 25.00 │ ✓   │   │
│  │ 17:00 │ #004 │ Ana Silva      │ R$ 14.50 │ ✓   │   │
│  │ 18:30 │ #005 │ Carlos Mendes  │ R$ 22.00 │ ✓   │   │
│  │                                              │   │
│  │ Ganho do dia: R$ 92.00                      │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  31/01/2026 - Quinta-feira (7 entregas)               │
│  ┌────────────────────────────────────────────────┐   │
│  │ 12:00 │ #001 │ Roberto Costa  │ R$ 15.00 │ ✓   │   │
│  │ ... (mais 6 entregas)                        │   │
│  │                                              │   │
│  │ Ganho do dia: R$ 128.50                     │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Filtro por período
- Busca por número do pedido ou cliente
- Lista com data, hora, cliente, valor
- Status visual (✓ Entregue, ✗ Cancelado)
- Ganho por dia
- Click para ver detalhes da entrega

---

### 6. MÉTRICAS E DESEMPENHO `/motoboy/metricas`

```
┌────────────────────────────────────────────────────────┐
│  MÉTRICAS E DESEMPENHO                                 │
├────────────────────────────────────────────────────────┤
│  Período: [Hoje] [Semana] [Mês] [Personalizado]       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  KPIs PRINCIPAIS                                       │
│  ┌──────────────┬──────────────┬──────────────┐      │
│  │ Entregas     │ Taxa Aceição │ Avaliação    │      │
│  │   5/10       │    50%       │   ★★★★★     │      │
│  │ Completas    │ (5 de 10)    │   4.8/5.0    │      │
│  └──────────────┴──────────────┴──────────────┘      │
│                                                        │
│  ┌──────────────┬──────────────┬──────────────┐      │
│  │ Tempo Médio  │ Distância    │ Ganho Total  │      │
│  │    18 min    │   65.2 km    │  R$ 450.00   │      │
│  │ Por entrega  │ (semana)     │ (semana)     │      │
│  └──────────────┴──────────────┴──────────────┘      │
│                                                        │
│  GRÁFICOS ANALÍTICOS                                   │
│                                                        │
│  Entregas por Dia (Últimas 2 semanas)                 │
│  ┌────────────────────────────────────────────────┐   │
│  │  10                                            │   │
│  │   8  ▄                                         │   │
│  │   6  █ ▄                                       │   │
│  │   4  █ █ ▄ ▄ █ ▄ ▄                            │   │
│  │   2  █ █ █ █ █ █ █                            │   │
│  │      Seg Ter Qua Qui Sex Sab Dom               │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  Ganho por Semana (Últimas 2 meses)                   │
│  ┌────────────────────────────────────────────────┐   │
│  │  500                                           │   │
│  │  400  ▄                                        │   │
│  │  300  █                                        │   │
│  │  200  █ █ ▄ █ ▄ █ ▄ █                         │   │
│  │  100  █ █ █ █ █ █ █ █                         │   │
│  │        S1 S2 S3 S4 S5 S6 S7 S8                 │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  AVALIAÇÕES RECENTES                                   │
│  ┌────────────────────────────────────────────────┐   │
│  │ ★★★★★ João Silva       (01/02) "Muito rápido!"   │   │
│  │ ★★★★☆ Maria Costa      (31/01) "Bom atendimento" │   │
│  │ ★★★★★ Pedro Oliveira  (30/01) "Excelente!"      │   │
│  │ ★★★☆☆ Ana Silva        (29/01) "Demorou um pouco"│   │
│  │ ★★★★★ Carlos Mendes   (28/01) "Perfeito!"       │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Métricas Exibidas:**
- Entregas completadas hoje/semana/mês
- Taxa de aceitação (pedidos aceitos vs oferecidos)
- Avaliação média (★★★★★)
- Tempo médio por entrega
- Distância total percorrida
- Ganho total
- Gráficos de tendência
- Avaliações e comentários dos clientes

---

### 7. NOTIFICAÇÕES `/motoboy/notificacoes`

```
┌────────────────────────────────────────────────────────┐
│  NOTIFICAÇÕES                          [Marcar Todas]  │
├────────────────────────────────────────────────────────┤
│  Filtro: [Todas] [Não Lidas] [Pedidos] [Mensagens]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  HOJE                                                  │
│                                                        │
│  🔔 Novo Pedido Disponível                   14:30    │
│  Pedido #005 - João Silva - R$ 12.50                  │
│  Rua A, 123 (2.5 km de distância)                     │
│  [ACEITAR] [DETALHES] [×]                            │
│                                                        │
│  🔔 Pedido Aceito com Sucesso                14:35    │
│  Seu pedido #004 foi aceito. Comece a entrega!       │
│  [VER PEDIDO] [×]                                     │
│                                                        │
│  💬 Mensagem do Cliente                      14:45    │
│  João Silva (Pedido #005): "Por favor, toca a       │
│  campainha pois o interfone não funciona"           │
│  [RESPONDER] [×]                                      │
│                                                        │
│  ⚠️ Aviso de Limite de Operação               15:00    │
│  Você atingiu o limite de 10 entregas do dia        │
│  Próximas entregas após resetar limite.             │
│  [OK] [×]                                             │
│                                                        │
│  ONTEM                                                 │
│                                                        │
│  🏆 Você recebeu uma avaliação ★★★★★              13:20 │
│  João Silva: "Muito rápido!"                          │
│  [VER PERFIL] [×]                                     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Notificações em tempo real (push + in-app)
- Filtros (todas, não lidas, pedidos, mensagens)
- Ações diretas nas notificações
- Notificações arquivadas

---

## 💾 BANCO DE DADOS - ALTERAÇÕES NECESSÁRIAS

### Novas Tabelas

```sql
-- 1. PERFIL DO MOTOBOY
CREATE TABLE motoboy_profiles (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL UNIQUE,
    vehicle_type ENUM('motorcycle', 'bicycle', 'car', 'other') DEFAULT 'motorcycle',
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    plate_number VARCHAR(20),
    documents_verified BOOLEAN DEFAULT false,
    cpf VARCHAR(255),  -- criptografado
    rg VARCHAR(255),   -- criptografado
    cnh VARCHAR(255),  -- criptografado
    cnh_validity DATE,
    bank_name VARCHAR(100),
    bank_agency VARCHAR(10),
    bank_account VARCHAR(255),  -- criptografado
    bank_account_type ENUM('checking', 'savings'),
    rating DECIMAL(3,2) DEFAULT 0,
    total_deliveries INT DEFAULT 0,
    acceptance_rate DECIMAL(5,2) DEFAULT 100,
    total_earnings DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2. LOCALIZAÇÃO DO MOTOBOY
CREATE TABLE motoboy_locations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(10,2),  -- metros
    speed DECIMAL(5,2),      -- km/h
    heading INT,             -- 0-360 graus
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX (user_id, created_at)
);

-- 3. DISPONIBILIDADE DO MOTOBOY
CREATE TABLE motoboy_availability (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    is_online BOOLEAN DEFAULT false,
    availability_status ENUM('available', 'on_delivery', 'break', 'offline') DEFAULT 'offline',
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. MÉTRICAS DO MOTOBOY
CREATE TABLE motoboy_metrics (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    period ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily',
    metric_date DATE NOT NULL,
    deliveries_completed INT DEFAULT 0,
    deliveries_failed INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0,
    distance_traveled_km DECIMAL(10,2) DEFAULT 0,
    average_time_minutes INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY (user_id, period, metric_date)
);

-- 5. AVALIAÇÕES DO MOTOBOY
CREATE TABLE motoboy_ratings (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    motoboy_id UUID NOT NULL,
    order_id UUID NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (motoboy_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 6. HISTÓRICO DE LOCALIZAÇÃO (AUDIT)
CREATE TABLE motoboy_location_history (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX (user_id, created_at)
);
```

### Alterações em Tabelas Existentes

```sql
-- USERS - Adicionar coluna de geolocalização
ALTER TABLE users ADD COLUMN is_available BOOLEAN DEFAULT true AFTER is_active;
ALTER TABLE users ADD COLUMN last_location_at TIMESTAMP NULLABLE;

-- ORDERS - Adicionar colunas de motoboy
ALTER TABLE orders ADD COLUMN motoboy_id UUID NULLABLE AFTER customer_id;
ALTER TABLE orders ADD COLUMN motoboy_accepted_at TIMESTAMP NULLABLE;
ALTER TABLE orders ADD COLUMN pickup_at TIMESTAMP NULLABLE;
ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP NULLABLE;
ALTER TABLE orders ADD COLUMN motoboy_rating_id UUID NULLABLE AFTER payment_status;

-- Foreign keys
ALTER TABLE orders ADD CONSTRAINT fk_orders_motoboy
    FOREIGN KEY (motoboy_id) REFERENCES users(id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_motoboy_rating
    FOREIGN KEY (motoboy_rating_id) REFERENCES motoboy_ratings(id);
```

---

## 📋 IMPLEMENTAÇÃO PASSO-A-PASSO

### FASE 1: PREPARAÇÃO (Backend Base)

#### 1.1 Criar Models Eloquent
```
[ ] MotoboyProfile (com relationships)
[ ] MotoboyLocation (com índices para performance)
[ ] MotoboyAvailability
[ ] MotoboyMetrics
[ ] MotoboyRating
[ ] MotoboyLocationHistory
```

#### 1.2 Criar Migrações
```
[ ] create_motoboy_profiles_table
[ ] create_motoboy_locations_table
[ ] create_motoboy_availability_table
[ ] create_motoboy_metrics_table
[ ] create_motoboy_ratings_table
[ ] create_motoboy_location_history_table
[ ] alter_orders_table_add_motoboy_columns
[ ] alter_users_table_add_motoboy_columns
```

#### 1.3 Criar Migrations (Seeders para dados de teste)
```
[ ] Database/Seeders/MotoboySeeder.php
```

#### 1.4 Atualizar Modelos Existentes
```
[ ] User model: adicionar relationships com MotoboyProfile, MotoboyRating, etc
[ ] Order model: adicionar motoboy relationship
```

#### 1.5 Criar Middleware
```
[ ] app/Http/Middleware/EnsureMotoboy.php
[ ] Testar proteção de rotas
```

---

### FASE 2: AUTENTICAÇÃO (Login Modificado)

#### 2.1 Modificar Login Form (Frontend)
```
[ ] resources/js/Pages/Auth/Login.tsx
    ├─ Adicionar checkbox "Sou Entregador"
    ├─ Validação no frontend
    └─ Enviar flag is_motoboy no formulário
```

#### 2.2 Modificar LoginRequest (Backend)
```
[ ] app/Http/Requests/Auth/LoginRequest.php
    ├─ Adicionar validação de is_motoboy
    └─ Verificar role do usuário
```

#### 2.3 Modificar AuthenticatedSessionController
```
[ ] app/Http/Controllers/Auth/AuthenticatedSessionController.php
    ├─ Validar se is_motoboy coincide com role
    ├─ Redirecionar para /motoboy/dashboard se motoboy
    └─ Log de tentativas suspeitas
```

#### 2.4 Criar ProtectedRoute para Motoboy (Frontend)
```
[ ] resources/js/Components/MotoboyRoute.tsx
    └─ Validar role === 'motoboy' antes de renderizar
```

---

### FASE 3: LAYOUT E NAVEGAÇÃO (Frontend)

#### 3.1 Criar MotoboyLayout
```
[ ] resources/js/Layouts/MotoboyLayout.tsx
    ├─ Sidebar com navegação
    ├─ Top bar com status/avatar
    ├─ Footer opcional
    └─ Responsivo para mobile
```

#### 3.2 Criar componentes de navegação
```
[ ] NavLink com ícones para:
    ├─ Dashboard
    ├─ Pedidos
    ├─ Histórico
    ├─ Métricas
    ├─ Perfil
    ├─ Notificações
    └─ Logout
```

---

### FASE 4: DASHBOARD DO MOTOBOY

#### 4.1 Criar página Dashboard
```
[ ] resources/js/Pages/Motoboy/Dashboard.tsx
    ├─ Componente Status (online/offline toggle)
    ├─ Componente Metrics (cards de KPIs)
    ├─ Componente MapView (integração com mapa)
    ├─ Componente PendingOrders (lista de pedidos)
    └─ Componente ActiveDeliveries (pedidos em entrega)
```

#### 4.2 Criar Controllers
```
[ ] app/Http/Controllers/Motoboy/DashboardController.php
    ├─ GET /motoboy/dashboard
    └─ Retorna: metrics, orders pendentes, orders ativos
```

#### 4.3 Criar Services
```
[ ] app/Services/MotoboyService.php
    ├─ getMetrics(user_id, period)
    ├─ getAvailableOrders(user_id)
    ├─ getActiveDeliveries(user_id)
    └─ updateAvailability(user_id, status)
```

---

### FASE 5: GERENCIAMENTO DE PEDIDOS

#### 5.1 Criar Componentes de Pedidos
```
[ ] resources/js/Pages/Motoboy/Pedidos.tsx
    ├─ Filtros (disponíveis, em entrega, concluídos)
    ├─ Lista de pedidos com estado
    └─ Ações contextuais
```

#### 5.2 Criar Detalhes do Pedido
```
[ ] resources/js/Pages/Motoboy/Pedidos/Show.tsx
    ├─ Dados do cliente
    ├─ Itens do pedido
    ├─ Mapa com rota
    ├─ Timeline de status
    └─ Botões de ação (aceitar, entregar, recusar)
```

#### 5.3 Criar Controllers
```
[ ] app/Http/Controllers/Motoboy/OrderController.php
    ├─ GET /motoboy/pedidos (listagem com filtros)
    ├─ GET /motoboy/pedidos/{id} (detalhes)
    ├─ POST /motoboy/pedidos/{id}/accept
    ├─ POST /motoboy/pedidos/{id}/pickup
    ├─ POST /motoboy/pedidos/{id}/deliver
    └─ POST /motoboy/pedidos/{id}/decline
```

#### 5.4 Criar Services
```
[ ] app/Services/OrderAssignmentService.php
    ├─ assignOrderToMotoboy(order_id, motoboy_id)
    ├─ findNearbyMotoboyss(order_id)
    ├─ calculateETA(motoboy_location, delivery_location)
    └─ updateOrderStatus(order_id, status)
```

---

### FASE 6: GEOLOCALIZAÇÃO

#### 6.1 Criar API Endpoints
```
[ ] POST /api/motoboy/location
    └─ Receber: latitude, longitude, accuracy, speed
    ├─ Salvar em motoboy_locations
    └─ Atualizar motoboy_availability.last_activity_at

[ ] GET /api/motoboy/location/history
    └─ Retornar histórico de localização
```

#### 6.2 Criar Controllers API
```
[ ] app/Http/Controllers/Api/Motoboy/LocationController.php
    ├─ POST store (salvar localização)
    ├─ GET history (histórico)
    └─ GET current (localização atual)
```

#### 6.3 Criar Componente de Mapa (Frontend)
```
[ ] resources/js/Components/MapView.tsx
    ├─ Integração com Leaflet ou Google Maps
    ├─ Renderizar localização do motoboy
    ├─ Renderizar rota até cliente
    ├─ Mostrar ETA
    └─ Atualizar localização em tempo real
```

#### 6.4 Criar Hook para Geolocalização
```
[ ] resources/js/Hooks/useGeolocation.ts
    ├─ Obter coordenadas via Geolocation API
    ├─ Enviar para backend periodicamente (30s)
    ├─ Tratar erros e permissões
    └─ Salvar em localStorage como fallback
```

---

### FASE 7: PERFIL DO MOTOBOY

#### 7.1 Criar página de Perfil
```
[ ] resources/js/Pages/Motoboy/Perfil.tsx
    ├─ Foto de perfil (upload)
    ├─ Dados pessoais (editáveis)
    ├─ Informações do veículo
    ├─ Documentação
    ├─ Dados bancários
    ├─ Estatísticas
    └─ Botões salvar/cancelar
```

#### 7.2 Criar Controllers
```
[ ] app/Http/Controllers/Motoboy/ProfileController.php
    ├─ GET /motoboy/perfil (mostrar perfil)
    ├─ PUT /motoboy/perfil (atualizar dados)
    ├─ POST /motoboy/perfil/avatar (upload foto)
    ├─ PUT /motoboy/perfil/vehicle
    ├─ PUT /motoboy/perfil/documents
    └─ PUT /motoboy/perfil/bank
```

#### 7.3 Criar Policies
```
[ ] app/Policies/MotoboyProfilePolicy.php
    └─ Autorizar que usuário edite apenas seu próprio perfil
```

#### 7.4 Criar Services
```
[ ] app/Services/MotoboyProfileService.php
    ├─ updateProfile(user_id, data)
    ├─ uploadAvatar(user_id, file)
    ├─ verifyDocuments(user_id) → marca como verificado
    ├─ encryptSensitiveData(data)
    └─ decryptSensitiveData(data)
```

---

### FASE 8: HISTÓRICO DE ENTREGAS

#### 8.1 Criar página de Histórico
```
[ ] resources/js/Pages/Motoboy/Historico.tsx
    ├─ Filtro por período (7 dias, 30 dias, tudo)
    ├─ Busca por número do pedido/cliente
    ├─ Agrupado por data
    ├─ Card de entrega com:
    │   ├─ Hora
    │   ├─ Cliente
    │   ├─ Valor
    │   ├─ Status
    │   └─ Click para detalhes
    └─ Resumo do ganho por dia
```

#### 8.2 Criar Controllers
```
[ ] app/Http/Controllers/Motoboy/HistoryController.php
    ├─ GET /motoboy/historico
    └─ Retorna: orders com filtros aplicados
```

#### 8.3 Criar Query Scopes
```
[ ] Order model
    ├── scopeForMotoboy($user_id)
    ├── scopeCompleted()
    ├── scopeBetweenDates($start, $end)
    └── scopeWithMetrics()
```

---

### FASE 9: MÉTRICAS E DESEMPENHO

#### 9.1 Criar página de Métricas
```
[ ] resources/js/Pages/Motoboy/Metricas.tsx
    ├─ Seletor de período (hoje, semana, mês, custom)
    ├─ Cards de KPIs
    ├─ Gráficos:
    │   ├─ Entregas por dia (gráfico de barras)
    │   ├─ Ganho por semana (gráfico de linhas)
    │   ├─ Tempo médio (gauge)
    │   └─ Distribuição de avaliações (pizza)
    └─ Avaliações recentes (comments)
```

#### 9.2 Criar Controllers
```
[ ] app/Http/Controllers/Motoboy/MetricsController.php
    ├─ GET /motoboy/metricas
    └─ Retorna: métricas calculadas, gráficos, avaliações
```

#### 9.3 Criar Services
```
[ ] app/Services/MotoboyMetricsService.php
    ├─ calculateMetrics(user_id, period)
    ├─ getDeliveriesByDay(user_id, days)
    ├─ getEarningsByWeek(user_id, weeks)
    ├─ getAverageRating(user_id)
    ├─ getRecentRatings(user_id, limit)
    └─ calculateAcceptanceRate(user_id)
```

#### 9.4 Usar Chartslib (já existe: recharts)
```
[ ] BarChart para entregas por dia
[ ] LineChart para ganho
[ ] PieChart para avaliações
```

---

### FASE 10: NOTIFICAÇÕES

#### 10.1 Criar página de Notificações
```
[ ] resources/js/Pages/Motoboy/Notificacoes.tsx
    ├─ Filtros (todas, não lidas, pedidos, mensagens)
    ├─ Lista de notificações com:
    │   ├─ Ícone
    │   ├─ Título
    │   ├─ Descrição
    │   ├─ Hora
    │   └─ Botões de ação
    └─ Marcar como lida/arquivar
```

#### 10.2 Criar Model Notification
```
[ ] Database migration para notifications
[ ] Model Notification (se não existir)
```

#### 10.3 Criar Controllers
```
[ ] app/Http/Controllers/Motoboy/NotificationController.php
    ├─ GET /motoboy/notificacoes
    ├─ POST /motoboy/notificacoes/{id}/read
    ├─ POST /motoboy/notificacoes/{id}/archive
    └─ DELETE /motoboy/notificacoes/{id}
```

#### 10.4 Criar Sistema de Notificações
```
[ ] app/Events/OrderAvailable.php
    └─ Disparado quando pedido fica disponível

[ ] app/Listeners/NotifyAvailableMotoboyss.php
    └─ Envia notificação para motoboyss disponíveis

[ ] app/Notifications/OrderAvailableNotification.php
    └─ Define conteúdo e canais (database, mail, sms)
```

#### 10.5 Criar Sistema de Push (Web)
```
[ ] Service Worker para Web Push
[ ] /api/motoboy/push-subscribe (registrar subscription)
[ ] Enviar notificações via WebPush
```

---

### FASE 11: API ENDPOINTS (Mobile)

Criar todos os endpoints necessários para a app mobile:

```
[ ] POST /api/auth/motoboy/login
    ├─ Email
    ├─ Password
    ├─ Device token (para push)
    └─ Retorna: token, user data

[ ] POST /api/auth/motoboy/register
    └─ Criar novo motoboy (com validação de documentos)

[ ] GET /api/motoboy/orders/available
    └─ Pedidos disponíveis próximos ao motoboy

[ ] POST /api/motoboy/orders/{id}/accept
    └─ Aceitar pedido específico

[ ] GET /api/motoboy/orders/active
    └─ Pedidos em entrega do motoboy

[ ] POST /api/motoboy/location
    └─ Enviar geolocalização

[ ] GET /api/motoboy/profile
    └─ Dados do perfil do motoboy

[ ] PUT /api/motoboy/profile
    └─ Atualizar perfil

[ ] GET /api/motoboy/metrics
    └─ Métricas do motoboy

[ ] GET /api/motoboy/ratings
    └─ Avaliações do motoboy

[ ] POST /api/motoboy/availability
    └─ Ativar/desativar disponibilidade
```

---

### FASE 12: TESTES

#### 12.1 Testes Unitários
```
[ ] Tests/Unit/Models/MotoboyProfileTest.php
[ ] Tests/Unit/Services/MotoboyServiceTest.php
[ ] Tests/Unit/Services/MotoboyMetricsServiceTest.php
```

#### 12.2 Testes de Feature
```
[ ] Tests/Feature/Motoboy/LoginTest.php
[ ] Tests/Feature/Motoboy/OrderTest.php
[ ] Tests/Feature/Motoboy/ProfileTest.php
[ ] Tests/Feature/Motoboy/GeolocationTest.php
[ ] Tests/Feature/Motoboy/MetricsTest.php
```

#### 12.3 Testes de API
```
[ ] Tests/Feature/Api/Motoboy/AuthTest.php
[ ] Tests/Feature/Api/Motoboy/OrderTest.php
[ ] Tests/Feature/Api/Motoboy/LocationTest.php
```

---

## 📱 MIGRAÇÃO PARA MOBILE (PLAYSTORE)

### Fase 2.1: Preparação Mobile

1. **Tecnologias:**
   - React Native + Expo (recomendado para iniciar)
   - OU Flutter se preferir (melhor performance)
   - Mapbox ou Google Maps para geolocalização
   - Redux ou Zustand para state management
   - API calls com axios/fetch

2. **Compartilhar código:**
   - API endpoints (mobile usa mesma API do web)
   - Tipos TypeScript (compartilhados)
   - Utils de formatação (utils.ts)

3. **Features específicas de mobile:**
   - Background geolocation (Geolocation API + Background Task)
   - Push notifications (Firebase Cloud Messaging)
   - Offline support (SQLite local storage)
   - Acesso a câmera (fotos de entrega)

4. **Processo:**
   ```
   Web (Fase 1) → Estável e testado
   Mobile (Fase 2) → Usar mesma API
                    → Componentes React Native
                    → Testar em staging
   PlayStore → Publish quando estável
   ```

---

## ⏱️ CRONOGRAMA ESTIMADO

| Fase | Descrição | Esforço |
|------|-----------|---------|
| 1 | Preparação (Backend Base) | 4-6 horas |
| 2 | Autenticação (Login Modificado) | 3-4 horas |
| 3 | Layout e Navegação | 4-5 horas |
| 4 | Dashboard do Motoboy | 6-8 horas |
| 5 | Gerenciamento de Pedidos | 8-10 horas |
| 6 | Geolocalização | 6-8 horas |
| 7 | Perfil do Motoboy | 5-7 horas |
| 8 | Histórico de Entregas | 4-5 horas |
| 9 | Métricas | 6-8 horas |
| 10 | Notificações | 6-8 horas |
| 11 | API Endpoints (Mobile) | 4-6 horas |
| 12 | Testes | 8-10 horas |
| **Total Web** | **Fases 1-12** | **60-85 horas** |
| 13 | Mobile Setup | 4-6 horas |
| 14 | Mobile Features | 20-30 horas |
| 15 | PlayStore Deploy | 2-4 horas |
| **Total Mobile** | **Fases 13-15** | **26-40 horas** |

---

## ❓ DÚVIDAS COMUNS

### 1. **Posso usar a mesma tabela de usuários para admin e motoboy?**
**Resposta:** SIM! O sistema já foi projetado assim. A coluna `role` é enum com 'motoboy' como uma das opções. Você não precisa de tabelas separadas.

### 2. **Como garantir que motoboyss online nunca perdem pedidos?**
**Resposta:**
- Implementar notificações em tempo real (WebSockets + fallback polling)
- Cada pedido fica disponível por X minutos até ser aceito
- Se ninguém aceitar, volta para "disponível"
- Log de tentativas de atribuição

### 3. **Como calcular a comissão/ganho do motoboy?**
**Resposta:**
```php
// No OrderService, quando pedido é entregue:
$commission = $order->delivery_fee * 0.8;  // 80% para motoboy, 20% para plataforma
$motoboy->increment('total_earnings', $commission);
// Log em motoboy_metrics para analytics
```

### 4. **Preciso de WebSockets para notificações em tempo real?**
**Resposta:** Não obrigatoriamente.
- Fase 1: Polling a cada 15 segundos (simples)
- Fase 2: WebSockets via Laravel Echo (mais eficiente)
- Recomendo começar com polling

### 5. **Como funciona o rating do motoboy?**
**Resposta:**
```php
// Cliente avalia após entrega
POST /pedidos/{id}/rate
{
  rating: 5,
  comment: "Muito rápido!"
}

// Backend:
MotoboyRating::create(...);
$motoboy->update([
  'rating' => $motoboy->ratings()->avg('rating')
]);
```

### 6. **Posso integrar com Google Maps direto?**
**Resposta:** SIM!
- Frontend: @react-google-maps/api
- Backend: Google Maps API para calcular distância/tempo
- Alternativa: Leaflet + OpenStreetMap (open source)

### 7. **Como proteger dados sensíveis (CPF, CNH)?**
**Resposta:**
- Usar Laravel Encryption: `Crypt::encryptString()`
- Salvar criptografado no banco
- Descriptografar apenas quando necessário exibir
- Hash a senha normalmente (já faz)

### 8. **E o LGPD/privacidade dos dados?**
**Resposta:**
- Criptografar dados sensíveis ✓
- Não coletar dados desnecessários
- Permitir exportar/deletar dados (GDPR compliant)
- Documentar coleta de geolocalização
- Avisar ao motoboy sobre tracking

### 9. **Como testar geolocalização em desenvolvimento?**
**Resposta:**
- Chrome DevTools → Sensors → Location (simular)
- Postman com endpoint `/api/motoboy/location` (manual)
- Testes automatizados com dados mock

### 10. **Quando vai estar pronto para PlayStore?**
**Resposta:**
- Phase 1 (Web completo): 2-3 semanas
- Phase 2 (Mobile): Próximas 2-3 semanas
- PlayStore: Pronto em 4-5 semanas

### 11. **Preciso de backend separado para mobile?**
**Resposta:** NÃO! Mesma API funciona para web e mobile. Apenas crie controllers/endpoints API específicos.

### 12. **Como lidar com motoboyss offline durante entregas?**
**Resposta:**
- App mobile com sqlite local
- Sincroniza quando volta online
- Log de tentativas offline
- Cache de pedidos para modo offline

---

## 🎯 PRÓXIMAS AÇÕES

1. **Você quer que eu comece a implementar?** (Recomendo começar pela Fase 1)
2. **Qual prioridade?** (Quais features são críticas primeiro?)
3. **Alguma dúvida antes de começar?**

---

**Documento Preparado por:** Claude Code
**Data:** 01/02/2026
**Status:** Pronto para Implementação
**Versão:** 1.0
