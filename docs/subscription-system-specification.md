# Sistema de Assinaturas - Happy Place

## Visão Geral

Este documento especifica a implementação do sistema de assinaturas para a plataforma Happy Place, incluindo três planos distintos, fluxo de registro com criação de slug, e toda a lógica de negócio associada.

---

## 1. Estrutura dos Planos

### 1.1 Plano Gratuito (Free)

**Preço:** R$ 0,00/mês

**Limitações:**
| Recurso | Limite |
|---------|--------|
| Produtos | 15 |
| Usuários (funcionários) | 1 (apenas admin) |
| Pedidos/mês | 50 |
| Categorias | 5 |
| Cupons ativos | 1 |
| Armazenamento (imagens) | 100 MB |

**Funcionalidades Incluídas:**
- [x] Cardápio digital básico
- [x] Recebimento de pedidos (WhatsApp/Manual)
- [x] Gestão de produtos e categorias
- [x] Painel de pedidos
- [x] Relatório básico de vendas (últimos 7 dias)
- [ ] ~~Impressão automática~~
- [ ] ~~Programa de fidelidade~~
- [ ] ~~Múltiplas formas de pagamento online~~
- [ ] ~~Gestão de estoque~~
- [ ] ~~Integrações (iFood, etc)~~
- [ ] ~~Suporte prioritário~~

**Marca d'água:**
- Exibe "Powered by Happy Place" no rodapé do cardápio digital

---

### 1.2 Plano Básico (Basic)

**Preço:** R$ 79,90/mês (ou R$ 69,90/mês no plano anual)

**Limitações:**
| Recurso | Limite |
|---------|--------|
| Produtos | 100 |
| Usuários (funcionários) | 5 |
| Pedidos/mês | Ilimitado |
| Categorias | 20 |
| Cupons ativos | 10 |
| Armazenamento (imagens) | 1 GB |
| Motoboys cadastrados | 5 |

**Funcionalidades Incluídas:**
- [x] Tudo do plano Gratuito
- [x] Impressão automática de pedidos
- [x] Múltiplas formas de pagamento
- [x] Programa de fidelidade básico
- [x] Relatórios completos (30 dias)
- [x] Gestão de motoboys
- [x] Taxas de entrega por bairro
- [x] Gestão de mesas (modo restaurante)
- [x] Histórico de clientes
- [x] Cupons de desconto avançados
- [ ] ~~Remoção da marca d'água~~
- [ ] ~~Integrações (iFood, etc)~~
- [ ] ~~API de acesso~~
- [ ] ~~Múltiplas unidades~~

**Marca d'água:**
- Ainda exibe "Powered by Happy Place" (versão discreta)

---

### 1.3 Plano Pro (Fale com Consultor)

**Preço:** Personalizado (a partir de R$ 199,90/mês)

**Limitações:**
| Recurso | Limite |
|---------|--------|
| Produtos | Ilimitado |
| Usuários (funcionários) | Ilimitado |
| Pedidos/mês | Ilimitado |
| Categorias | Ilimitado |
| Cupons ativos | Ilimitado |
| Armazenamento (imagens) | 10 GB |
| Motoboys cadastrados | Ilimitado |
| Unidades/Filiais | Até 10 |

**Funcionalidades Incluídas:**
- [x] Tudo do plano Básico
- [x] **Remoção completa da marca d'água**
- [x] Integrações (iFood, Rappi, etc) - *em desenvolvimento*
- [x] API de acesso para integrações customizadas
- [x] Gestão de estoque completa
- [x] Relatórios avançados com exportação
- [x] Múltiplas unidades/filiais
- [x] Domínio personalizado (ex: cardapio.seurestaurante.com)
- [x] Suporte prioritário via WhatsApp
- [x] Onboarding dedicado
- [x] Personalização de tema avançada

**Contato para Consultor:**
- WhatsApp: (11) 99999-9999
- Email: comercial@happyplace.com.br
- Formulário no sistema

---

## 2. Fluxo de Registro (Atualizado)

### 2.1 Campos do Formulário de Registro

```
┌─────────────────────────────────────────────────────────────┐
│                    CRIE SUA CONTA                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nome do Estabelecimento *                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Ex: Pizzaria do João                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Seu Link Personalizado *                                   │
│  ┌────────────────────────────────────────────┬────────┐   │
│  │ pizzaria-do-joao                           │ ✓ Livre│   │
│  └────────────────────────────────────────────┴────────┘   │
│  happyplace.com.br/pizzaria-do-joao                        │
│                                                             │
│  Nome Completo (Responsável) *                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ João da Silva                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  WhatsApp *                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ (11) 99999-9999                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  E-mail *                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ joao@email.com                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Senha *                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ••••••••                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Confirmar Senha *                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ••••••••                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [ ] Li e aceito os Termos de Uso e Política de     │   │
│  │     Privacidade                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          CRIAR CONTA GRÁTIS                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🎁 14 dias grátis do plano Básico, sem cartão de crédito  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Validação do Slug (Link Personalizado)

**Regras de Validação:**
1. Mínimo 3 caracteres, máximo 50
2. Apenas letras minúsculas, números e hífens
3. Não pode começar ou terminar com hífen
4. Não pode ter hífens consecutivos
5. Deve ser único no sistema

**Slugs Reservados (não permitidos):**
```
admin, api, app, www, blog, help, support, pricing,
terms, privacy, login, register, dashboard, settings,
menu, pedidos, orders, checkout, cart, null, undefined
```

**Auto-geração do Slug:**
- Ao digitar o nome do estabelecimento, sugerir slug automaticamente
- Sanitizar: remover acentos, converter para minúsculas, substituir espaços por hífens
- Verificar disponibilidade em tempo real (debounce 500ms)

### 2.3 Fluxo Backend do Registro

```php
// Pseudo-código do fluxo
1. Validar todos os campos
2. Verificar se slug está disponível
3. Criar Tenant:
   - name: nome do estabelecimento
   - slug: link personalizado
   - email: email do usuário
   - phone: whatsapp
   - plan: 'free'
   - trial_ends_at: now() + 14 days
   - is_active: true
   - max_users: 5 (trial com recursos do Básico)
   - max_products: 100

4. Criar User:
   - tenant_id: ID do tenant criado
   - name: nome do responsável
   - email: email
   - phone: whatsapp
   - password: hash
   - role: 'admin'
   - is_active: true

5. Criar StoreSetting:
   - tenant_id: ID do tenant
   - store_name: nome do estabelecimento
   - phone: whatsapp
   - whatsapp: whatsapp

6. Disparar evento Registered
7. Enviar email de boas-vindas
8. Auto-login
9. Redirecionar para onboarding/dashboard
```

---

## 3. Fluxo de Login (Atualizado)

### 3.1 Campos do Formulário de Login

```
┌─────────────────────────────────────────────────────────────┐
│                    ACESSE SUA CONTA                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  E-mail *                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ joao@email.com                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Senha *                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ••••••••                                    👁      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────┐    Esqueceu sua senha?             │
│  │ [x] Lembrar de mim │                                    │
│  └────────────────────┘                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     ENTRAR                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────── ou ───────────────────                │
│                                                             │
│  Ainda não tem conta? Criar conta grátis                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Verificações no Login

1. **Verificar se usuário existe e senha está correta**
2. **Verificar se usuário está ativo** (`is_active = true`)
3. **Verificar status do tenant:**
   - Se `is_suspended = true` → Mostrar mensagem de suspensão
   - Se `is_active = false` → Mostrar mensagem de conta desativada
4. **Verificar assinatura:**
   - Se trial expirou E não tem assinatura ativa → Redirecionar para página de upgrade
   - Se assinatura expirou → Redirecionar para página de renovação

### 3.3 Redirecionamentos Pós-Login

| Situação | Destino |
|----------|---------|
| Tudo OK | /dashboard |
| Trial expirado | /subscription/expired |
| Conta suspensa | /account/suspended |
| Primeiro acesso | /onboarding |

---

## 4. Estrutura do Banco de Dados

### 4.1 Alterações na Tabela `tenants`

```sql
-- Adicionar colunas
ALTER TABLE tenants ADD COLUMN subscription_status ENUM('trialing', 'active', 'past_due', 'canceled', 'expired') DEFAULT 'trialing';
ALTER TABLE tenants ADD COLUMN billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly';
ALTER TABLE tenants ADD COLUMN next_billing_date TIMESTAMP NULL;
ALTER TABLE tenants ADD COLUMN stripe_customer_id VARCHAR(255) NULL;
ALTER TABLE tenants ADD COLUMN stripe_subscription_id VARCHAR(255) NULL;
ALTER TABLE tenants ADD COLUMN max_orders_per_month INT NULL;
ALTER TABLE tenants ADD COLUMN max_categories INT NULL;
ALTER TABLE tenants ADD COLUMN max_motoboys INT NULL;
ALTER TABLE tenants ADD COLUMN max_storage_mb INT NULL;
ALTER TABLE tenants ADD COLUMN features JSON NULL; -- features habilitadas
ALTER TABLE tenants ADD COLUMN custom_domain VARCHAR(255) NULL;
ALTER TABLE tenants ADD COLUMN show_watermark BOOLEAN DEFAULT TRUE;
```

### 4.2 Nova Tabela `subscription_history`

```sql
CREATE TABLE subscription_history (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL,
    plan_from VARCHAR(50),
    plan_to VARCHAR(50) NOT NULL,
    action ENUM('created', 'upgraded', 'downgraded', 'canceled', 'renewed', 'expired') NOT NULL,
    amount DECIMAL(10,2) NULL,
    billing_cycle VARCHAR(20) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

### 4.3 Nova Tabela `plan_limits`

```sql
CREATE TABLE plan_limits (
    id CHAR(36) PRIMARY KEY,
    plan VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    max_products INT NULL,
    max_users INT NULL,
    max_orders_per_month INT NULL,
    max_categories INT NULL,
    max_coupons INT NULL,
    max_motoboys INT NULL,
    max_storage_mb INT NOT NULL,
    max_units INT DEFAULT 1,
    features JSON NOT NULL, -- array de features habilitadas
    show_watermark BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed dos planos
INSERT INTO plan_limits (id, plan, display_name, price_monthly, price_yearly, max_products, max_users, max_orders_per_month, max_categories, max_coupons, max_motoboys, max_storage_mb, features, show_watermark, sort_order) VALUES
(UUID(), 'free', 'Gratuito', 0, 0, 15, 1, 50, 5, 1, 0, 100, '["digital_menu", "whatsapp_orders", "basic_reports"]', TRUE, 1),
(UUID(), 'basic', 'Básico', 79.90, 838.80, 100, 5, NULL, 20, 10, 5, 1024, '["digital_menu", "whatsapp_orders", "basic_reports", "auto_print", "loyalty_basic", "multiple_payments", "motoboy_management", "delivery_zones", "tables", "customer_history", "advanced_coupons", "full_reports"]', TRUE, 2),
(UUID(), 'pro', 'Pro', 199.90, 2158.80, NULL, NULL, NULL, NULL, NULL, NULL, 10240, '["digital_menu", "whatsapp_orders", "basic_reports", "auto_print", "loyalty_basic", "multiple_payments", "motoboy_management", "delivery_zones", "tables", "customer_history", "advanced_coupons", "full_reports", "integrations", "api_access", "stock_management", "advanced_reports", "multi_unit", "custom_domain", "priority_support", "advanced_themes"]', FALSE, 3);
```

---

## 5. Páginas e Componentes

### 5.1 Página de Preços (`/pricing`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    Escolha o plano ideal para você                          │
│           Comece grátis e faça upgrade quando precisar                      │
│                                                                             │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐       │
│  │     GRATUITO      │  │   ✨ BÁSICO       │  │       PRO         │       │
│  │                   │  │    RECOMENDADO    │  │                   │       │
│  │     R$ 0/mês      │  │   R$ 79,90/mês    │  │  Personalizado    │       │
│  │                   │  │   ou R$ 69,90/mês │  │                   │       │
│  │                   │  │   no plano anual  │  │                   │       │
│  ├───────────────────┤  ├───────────────────┤  ├───────────────────┤       │
│  │ • 15 produtos     │  │ • 100 produtos    │  │ • Produtos ilimit.│       │
│  │ • 1 usuário       │  │ • 5 usuários      │  │ • Usuários ilimit.│       │
│  │ • 50 pedidos/mês  │  │ • Pedidos ilimit. │  │ • Pedidos ilimit. │       │
│  │ • Cardápio digital│  │ • Impressão auto. │  │ • Integrações     │       │
│  │ • WhatsApp orders │  │ • Fidelidade      │  │ • API de acesso   │       │
│  │                   │  │ • Multi-pagamento │  │ • Domínio próprio │       │
│  │                   │  │ • Gestão motoboys │  │ • Múltiplas lojas │       │
│  │                   │  │ • Relatórios      │  │ • Suporte VIP     │       │
│  │                   │  │                   │  │                   │       │
│  │ [COMEÇAR GRÁTIS]  │  │ [ASSINAR AGORA]   │  │ [FALAR COM        │       │
│  │                   │  │                   │  │  CONSULTOR]       │       │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘       │
│                                                                             │
│                      Comparar todos os recursos →                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Página de Upgrade (`/subscription/upgrade`)

Para usuários logados que querem fazer upgrade.

### 5.3 Modal de Trial Expirando

Exibir quando faltam 3 dias para o trial expirar:

```
┌─────────────────────────────────────────────────────────────┐
│  ⏰ Seu período de teste termina em 3 dias!                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Você está aproveitando recursos do plano Básico.           │
│  Para continuar com acesso completo, escolha um plano.      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  💎 Oferta especial: 20% OFF no primeiro mês!         │ │
│  │     Use o código: TRIAL20                             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [VER PLANOS]                    [LEMBRAR DEPOIS]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Página Trial Expirado (`/subscription/expired`)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           😕 Seu período de teste expirou                   │
│                                                             │
│  Não se preocupe! Seus dados estão seguros.                │
│  Escolha um plano para continuar usando o Happy Place.     │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │      GRATUITO       │  │       BÁSICO        │          │
│  │      R$ 0/mês       │  │    R$ 79,90/mês     │          │
│  │                     │  │                     │          │
│  │  Continuar com      │  │  Manter todos os    │          │
│  │  recursos limitados │  │  recursos do trial  │          │
│  │                     │  │                     │          │
│  │  [USAR GRATUITO]    │  │  [ASSINAR BÁSICO]   │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│           Precisa de mais? Fale com nosso consultor         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 Contato com Consultor (Plano Pro)

**Opções de contato:**
1. **WhatsApp direto** - Botão que abre chat no WhatsApp com mensagem pré-preenchida
2. **Formulário de contato** - Nome, email, telefone, mensagem
3. **Agendamento de call** - Integração com Calendly ou similar

**Mensagem pré-preenchida WhatsApp:**
```
Olá! Tenho interesse no plano Pro do Happy Place.
Meu estabelecimento: {nome_estabelecimento}
Email: {email}
```

---

## 6. Middleware e Verificações

### 6.1 Middleware de Verificação de Assinatura

```php
// CheckSubscription.php
class CheckSubscription
{
    public function handle($request, Closure $next)
    {
        $tenant = auth()->user()->tenant;

        if (!$tenant) {
            return $next($request); // Super admin
        }

        // Verificar suspensão
        if ($tenant->is_suspended) {
            return redirect()->route('account.suspended');
        }

        // Verificar trial
        if ($tenant->isTrialActive()) {
            return $next($request);
        }

        // Verificar assinatura
        if ($tenant->isSubscriptionActive()) {
            return $next($request);
        }

        // Trial e assinatura expirados
        return redirect()->route('subscription.expired');
    }
}
```

### 6.2 Middleware de Verificação de Limites

```php
// CheckPlanLimits.php
class CheckPlanLimits
{
    public function handle($request, Closure $next, $resource)
    {
        $tenant = auth()->user()->tenant;
        $limits = $tenant->getPlanLimits();

        switch ($resource) {
            case 'products':
                if ($tenant->products()->count() >= $limits->max_products) {
                    return response()->json([
                        'error' => 'Limite de produtos atingido',
                        'upgrade_url' => route('subscription.upgrade')
                    ], 403);
                }
                break;
            // ... outros recursos
        }

        return $next($request);
    }
}
```

---

## 7. API Endpoints

### 7.1 Verificação de Disponibilidade de Slug

```
GET /api/check-slug?slug={slug}

Response:
{
    "available": true,
    "suggested": "pizzaria-do-joao" // se não disponível, sugerir alternativa
}
```

### 7.2 Informações do Plano Atual

```
GET /api/subscription/status

Response:
{
    "plan": "basic",
    "status": "active",
    "trial_ends_at": null,
    "subscription_ends_at": "2026-02-24",
    "limits": {
        "products": { "used": 45, "max": 100 },
        "users": { "used": 3, "max": 5 },
        "storage_mb": { "used": 234, "max": 1024 }
    },
    "features": ["auto_print", "loyalty_basic", ...]
}
```

### 7.3 Listar Planos Disponíveis

```
GET /api/plans

Response:
{
    "plans": [
        {
            "id": "free",
            "name": "Gratuito",
            "price_monthly": 0,
            "price_yearly": 0,
            "features": [...],
            "limits": {...}
        },
        ...
    ]
}
```

---

## 8. Cronograma de Implementação

### Fase 1: Fundação (Prioridade Alta)
- [ ] Migração do banco de dados (novas colunas e tabelas)
- [ ] Atualizar modelo Tenant com métodos de plano
- [ ] Criar seeder de planos
- [ ] Atualizar fluxo de registro (criar tenant + slug)
- [ ] Endpoint de verificação de slug
- [ ] Atualizar UI de registro

### Fase 2: Controle de Acesso
- [ ] Middleware CheckSubscription
- [ ] Middleware CheckPlanLimits
- [ ] Atualizar fluxo de login com verificações
- [ ] Página de trial expirado
- [ ] Página de conta suspensa

### Fase 3: Interface de Planos
- [ ] Página de preços (/pricing)
- [ ] Página de upgrade (/subscription/upgrade)
- [ ] Componente de uso de recursos no dashboard
- [ ] Modal de trial expirando
- [ ] Indicador de plano atual no header

### Fase 4: Integração de Pagamentos
- [ ] Integração Stripe/MercadoPago
- [ ] Checkout de assinatura
- [ ] Portal de gerenciamento de assinatura
- [ ] Webhooks de pagamento
- [ ] Emails transacionais (confirmação, falha, etc)

### Fase 5: Contato Comercial (Plano Pro)
- [ ] Formulário de contato com consultor
- [ ] Integração WhatsApp Business
- [ ] CRM interno para leads

---

## 9. Considerações de Segurança

1. **Validação de slug**: Sempre sanitizar e validar no backend
2. **Rate limiting**: Limitar verificações de slug (anti-enumeration)
3. **Webhook verification**: Validar assinaturas dos webhooks de pagamento
4. **Audit log**: Registrar todas as mudanças de plano
5. **Graceful degradation**: Se pagamento falhar, manter acesso por X dias

---

## 10. Métricas e Analytics

### Eventos a Rastrear:
- Registro iniciado
- Registro completado
- Trial iniciado
- Trial convertido para pago
- Trial expirado (não converteu)
- Upgrade de plano
- Downgrade de plano
- Cancelamento
- Reativação

### Dashboard Admin:
- MRR (Monthly Recurring Revenue)
- Churn rate
- Trial-to-paid conversion rate
- Planos mais populares
- Recursos mais utilizados por plano

---

## Apêndice A: Features por Plano (Referência)

| Feature | Free | Basic | Pro |
|---------|:----:|:-----:|:---:|
| digital_menu | ✓ | ✓ | ✓ |
| whatsapp_orders | ✓ | ✓ | ✓ |
| basic_reports | ✓ | ✓ | ✓ |
| auto_print | - | ✓ | ✓ |
| loyalty_basic | - | ✓ | ✓ |
| multiple_payments | - | ✓ | ✓ |
| motoboy_management | - | ✓ | ✓ |
| delivery_zones | - | ✓ | ✓ |
| tables | - | ✓ | ✓ |
| customer_history | - | ✓ | ✓ |
| advanced_coupons | - | ✓ | ✓ |
| full_reports | - | ✓ | ✓ |
| integrations | - | - | ✓ |
| api_access | - | - | ✓ |
| stock_management | - | - | ✓ |
| advanced_reports | - | - | ✓ |
| multi_unit | - | - | ✓ |
| custom_domain | - | - | ✓ |
| priority_support | - | - | ✓ |
| advanced_themes | - | - | ✓ |
| remove_watermark | - | - | ✓ |

---

## Apêndice B: Mensagens de Erro

```typescript
const SUBSCRIPTION_MESSAGES = {
  trial_expired: {
    title: 'Período de teste expirado',
    message: 'Seu período de teste de 14 dias chegou ao fim. Escolha um plano para continuar.',
  },
  subscription_expired: {
    title: 'Assinatura expirada',
    message: 'Sua assinatura expirou. Renove para continuar tendo acesso.',
  },
  payment_failed: {
    title: 'Falha no pagamento',
    message: 'Não conseguimos processar seu pagamento. Atualize seus dados de pagamento.',
  },
  account_suspended: {
    title: 'Conta suspensa',
    message: 'Sua conta foi suspensa. Entre em contato com o suporte.',
  },
  limit_reached: {
    products: 'Você atingiu o limite de produtos do seu plano.',
    users: 'Você atingiu o limite de usuários do seu plano.',
    orders: 'Você atingiu o limite de pedidos do mês.',
  },
};
```

---

*Documento criado em: 24/01/2026*
*Versão: 1.0*
