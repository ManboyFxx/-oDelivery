# 📚 ÓoDelivery — Documentação Completa do Sistema

> **Documento Oficial de Arquitetura e Negócios**  
> **Versão:** 1.0  
> **Última Atualização:** 26 de Fevereiro de 2026  
> **Framework:** AIOS v3.0 (Orion Orchestrator)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Identidade Institucional](#identidade-institucional)
3. [Arquitetura Técnica](#arquitetura-técnica)
4. [Tech Stack](#tech-stack)
5. [Módulos e Funcionalidades](#módulos-e-funcionalidades)
6. [Fluxos de Negócio](#fluxos-de-negócio)
7. [Integrações](#integrações)
8. [Multi-tenancy e Segurança](#multi-tenancy-e-segurança)
9. [AIOS Framework](#aios-framework)
10. [Roadmap](#roadmap)

---

## 🎯 Visão Geral

### O Que É o ÓoDelivery

O **ÓoDelivery** é uma plataforma SaaS (Software as a Service) vertical para food service que permite que restaurantes, lanchonetes, pizzarias e dark kitchens gerenciem 100% de suas operações de delivery em um único sistema.

### Proposta de Valor

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  "Seu delivery no automático. Seu lucro no bolso."             │
│                                                                 │
│  • Economia de até R$ 52.000/ano vs iFood                      │
│  • 90% menos pedidos perdidos                                  │
│  • 80% mais rápido no atendimento                              │
│  • Dados dos clientes são SEUS                                 │
│  • Taxa zero por pedido                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Modelo de Negócio

| Plano      | Valor      | Características                           |
| ---------- | ---------- | ----------------------------------------- |
| **Padrão** | R$ 129/mês | Sistema completo, taxa zero, suporte 24/7 |

---

## 🏢 Identidade Institucional

### Missão

> Democratizar a tecnologia para delivery, permitindo que qualquer estabelecimento tenha controle total do seu negócio e lucre mais.

### Visão

> Ser a plataforma número 1 em gestão de delivery no Brasil, reconhecida pela simplicidade, poder de transformação e parceria real com nossos clientes.

### Valores

| Valor             | Significado                                     |
| ----------------- | ----------------------------------------------- |
| **Simplicidade**  | Tecnologia que qualquer um usa, sem complicação |
| **Transparência** | Sem taxas escondidas, sem letras miúdas         |
| **Parceria**      | Crescemos quando nosso cliente cresce           |
| **Inovação**      | Sempre evoluindo, sempre à frente               |
| **Resultado**     | Foco no que importa: fazer você lucrar mais     |

### Público-Alvo

| Segmento            | Como Usa                              |
| ------------------- | ------------------------------------- |
| 🍔 Hamburguerias    | Gestão completa do delivery + salão   |
| 🍕 Pizzarias        | Controle de tempo de forno + entregas |
| 🍣 Delivery Japonês | Pedidos precisos + cliente exigente   |
| 🍰 Confeitarias     | Pedidos sob encomenda + produção      |
| 🍺 Cervejarias      | Mesas + conta aberta + delivery       |
| 🌭 Lanchonetes      | Balcão rápido + WhatsApp integrado    |
| 🍽️ Restaurantes     | Delivery + salão no mesmo sistema     |
| 🛵 Dark Kitchens    | Múltiplas marcas, uma operação        |

---

## 🏗️ Arquitetura Técnica

> **Nota:** Para decisões de engenharia aprofundadas sobre escalabilidade, segurança SaaS, modelo de dados e observabilidade, consulte o documento de [Decisões de Arquitetura](./ARCHITECTURE_DECISIONS.md).

### Visão Macro

```
┌─────────────────────────────────────────────────────────────────┐
│                    ÓO DELIVERY PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   CAMADA DE APRESENTAÇÃO                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   Público    │  │   Parceiro   │  │   Super Admin │  │   │
│  │  │  (Cardápio)  │  │  (Dashboard) │  │  (Platform)   │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   CAMADA DE APLICAÇÃO                   │   │
│  │  • Controllers • Services • Jobs • Events • Observers   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   CAMADA DE DADOS                       │   │
│  │  • MySQL (Multi-tenant com TenantScope)                 │   │
│  │  • File Storage (Imagens, Polling)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   INTEGRAÇÕES EXTERNAS                  │   │
│  │  • Stripe • Evolution API • OneSignal • ÓoPrint         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Estrutura de Diretórios

```
-oDelivery/
│
├── app/
│   ├── Models/           # Entidades do domínio (Order, Product, Tenant, etc.)
│   ├── Controllers/      # Lógica de requisições HTTP
│   ├── Services/         # Regras de negócio e integrações
│   ├── Jobs/             # Processamento em background
│   ├── Observers/        # Gatilhos automáticos de eventos
│   ├── Middleware/       # Filtros de requisição (auth, subscription, etc.)
│   └── Helpers/          # Funções utilitárias globais
│
├── resources/js/
│   ├── Components/       # Componentes React reutilizáveis
│   ├── Pages/            # Páginas Inertia.js
│   ├── Services/         # Serviços frontend (API, polling, etc.)
│   └── Utils/            # Utilitários JavaScript/TypeScript
│
├── routes/
│   ├── web.php           # Rotas web (públicas e privadas)
│   ├── api.php           # Rotas API REST
│   └── platform.php      # Rotas Super Admin
│
├── database/
│   ├── migrations/       # Schema do banco de dados
│   ├── seeders/          # Dados de exemplo e demo
│   └── factories/        # Geradores de dados para testes
│
├── .aios-core/           # AIOS Framework
│   ├── development/
│   │   ├── agents/       # Definições de agentes especializados
│   │   ├── tasks/        # Tarefas executáveis
│   │   ├── workflows/    # Fluxos multi-agente
│   │   └── templates/    # Templates de documentos
│   └── data/
│       └── aios-kb.md    # Base de conhecimento AIOS
│
├── docs/                 # Documentação do projeto
├── tests/                # Testes automatizados
└── config/               # Configurações do Laravel
```

---

## 🛠️ Tech Stack

### Backend

| Tecnologia     | Versão | Propósito                    |
| -------------- | ------ | ---------------------------- |
| **PHP**        | 8.2+   | Linguagem principal          |
| **Laravel**    | 12.x   | Framework web                |
| **Inertia.js** | 2.x    | Ponte frontend-backend       |
| **Sanctum**    | 4.x    | Autenticação API             |
| **Stripe PHP** | 15.x   | Processamento de pagamentos  |
| **Google 2FA** | 2.3.x  | Autenticação de dois fatores |

### Frontend

| Tecnologia        | Versão  | Propósito               |
| ----------------- | ------- | ----------------------- |
| **React**         | 18.x    | Biblioteca UI           |
| **TypeScript**    | 5.x     | Tipagem estática        |
| **TailwindCSS**   | 3.x/4.x | Estilização utilitária  |
| **Inertia.js**    | 2.x     | Roteamento SPA sem API  |
| **Framer Motion** | 11.x    | Animações               |
| **Lucide React**  | 0.562.x | Ícones                  |
| **Recharts**      | 3.x     | Gráficos e dashboards   |
| **Chart.js**      | 4.x     | Visualização de dados   |
| **React Window**  | 2.x     | Virtualização de listas |
| **DnD Kit**       | 6.x     | Drag and drop           |

### Infraestrutura

| Tecnologia     | Propósito                         |
| -------------- | --------------------------------- |
| **MySQL**      | Banco de dados relacional         |
| **Vite**       | Build tool e dev server           |
| **Composer**   | Gerenciador de dependências PHP   |
| **npm**        | Gerenciador de pacotes JavaScript |
| **Git/GitHub** | Versionamento e CI/CD             |

### Serviços Externos

| Serviço                 | Propósito                            | Status   |
| ----------------------- | ------------------------------------ | -------- |
| **Stripe**              | Assinaturas e pagamentos recorrentes | ✅ Ativo |
| **Evolution API**       | Automação de WhatsApp                | ✅ Ativo |
| **OneSignal**           | Notificações push web/mobile         | ✅ Ativo |
| **ÓoPrint**             | Impressão térmica direta             | ✅ Ativo |
| **Google Maps/Leaflet** | Geolocalização e zonas de entrega    | ✅ Ativo |

---

## 📦 Módulos e Funcionalidades

### 1. Área Pública

| Rota               | Funcionalidade                   |
| ------------------ | -------------------------------- |
| `/`                | Landing Page institucional       |
| `/demo-access`     | Ambiente de demonstração isolado |
| `/login`           | Autenticação de parceiros        |
| `/register`        | Cadastro de novos tenants        |
| `/planos`          | Vitrine de planos e assinaturas  |
| `/termos`          | Termos de uso e licenciamento    |
| `/privacidade`     | Política de privacidade          |
| `/suporte`         | Central de ajuda                 |
| `/{slug}/menu`     | Cardápio digital do cliente      |
| `/{slug}/cart`     | Carrinho de compras              |
| `/{slug}/checkout` | Finalização de pedido            |

### 2. Painel Administrativo (Parceiro)

| Módulo            | Funcionalidades                               |
| ----------------- | --------------------------------------------- |
| **Dashboard**     | Visão geral, métricas, alertas em tempo real  |
| **Pedidos**       | Gestão completa, kanban de status, filtros    |
| **PDV**           | Ponto de venda para pedidos de balcão         |
| **Cozinha**       | Tela de produção cronológica                  |
| **Cardápio**      | Produtos, categorias, complementos, imagens   |
| **Motoboys**      | Cadastro, atribuição, taxas de entrega        |
| **Financeiro**    | Fluxo de caixa, fechamento, relatórios        |
| **Configurações** | Logo, cores, horários, impressão, integrações |

### 3. Cardápio Digital (Cliente Final)

| Funcionalidade     | Descrição                                       |
| ------------------ | ----------------------------------------------- |
| **Navegação**      | Categorias, busca, filtros                      |
| **Personalização** | Complementos, observações, quantidades          |
| **Carrinho**       | Adição, remoção, atualização em tempo real      |
| **Checkout**       | Identificação por WhatsApp, endereço, pagamento |
| **Acompanhamento** | Status do pedido em tempo real                  |
| **Histórico**      | Pedidos anteriores, repetição rápida            |
| **Fidelidade**     | Acúmulo e resgate de pontos                     |

### 4. Super Admin (Platform Management)

| Módulo        | Funcionalidades                             |
| ------------- | ------------------------------------------- |
| **Tenants**   | Gestão de todas as lojas, status, bloqueios |
| **WhatsApp**  | Painel mestre Evolution API, instâncias     |
| **API Keys**  | Chaves de integração, permissões            |
| **Analytics** | Métricas globais da plataforma              |

---

## 🔄 Fluxos de Negócio

### 1. Jornada do Pedido

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE PEDIDO                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CLIENTE FAZ PEDIDO                                          │
│     └─> Cardápio Digital → Carrinho → Checkout                  │
│                                                                 │
│  2. SISTEMA NOTIFICA PARCEIRO                                   │
│     └─> Push (OneSignal) + Som no Dashboard                     │
│                                                                 │
│  3. PARCEIRO ACEITA PEDIDO                                      │
│     └─> Status: new → preparing                                 │
│     └─> WhatsApp automático enviado ao cliente                  │
│     └─> Baixa de estoque iniciada                               │
│                                                                 │
│  4. COZINHA PREPARA                                             │
│     └─> Tela de Cozinha exibe pedido                            │
│     └─> Status: preparing → ready                               │
│                                                                 │
│  5. ENTREGA É ATRIBUÍDA                                         │
│     └─> Motoboy próprio ou integrado                            │
│     └─> Status: ready → motoboy_accepted → out_for_delivery     │
│     └─> WhatsApp com previsão de entrega                        │
│                                                                 │
│  6. CLIENTE RECEBE                                              │
│     └─> Status: out_for_delivery → delivered                    │
│     └─> Pontos de fidelidade creditados                         │
│     └─> WhatsApp de satisfação                                  │
│                                                                 │
│  [EM CASO DE CANCELAMENTO]                                      │
│     └─> Status: * → cancelled                                   │
│     └─> Estorno automático (se pago)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Onboarding de Novo Parceiro

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONBOARDING DE PARCEIRO                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DIA 1: CRIAÇÃO E CONFIGURAÇÃO                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Cadastro inicial (nome, email, telefone)             │   │
│  │ 2. Criação do Tenant (isolamento lógico com TenantScope)│   │
│  │ 3. Configuração da loja (logo, cores, horário)          │   │
│  │ 4. Cardápio (produtos, categorias, preços)              │   │
│  │ 5. Entregas (zonas, taxas, raio de atuação)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  DIA 2: INTEGRAÇÕES E TREINAMENTO                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. WhatsApp (Evolution API, número, templates)          │   │
│  │ 2. Pagamentos (Stripe, PIX, cartão)                     │   │
│  │ 3. Motoboys (cadastro, taxas, regras)                   │   │
│  │ 4. Treinamento da equipe (cozinha, entrega, PDV)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  DIA 3: TESTES E ATIVAÇÃO                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Pedido de teste completo                             │   │
│  │ 2. Validação de fluxos (aceite, cozinha, entrega)       │   │
│  │ 3. Ajustes finos                                        │   │
│  │ 4. Go-live oficial                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  DIA 4+: PRIMEIRAS VENDAS NO AUTOMÁTICO 🎉                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Ciclo de Vida de Assinatura

```
Registro → Trial (7 dias) → Ativo → Renovação Mensal
                              ↓
                         [Inadimplência]
                              ↓
                    Notificação → Bloqueio → Cancelamento
```

---

## 🔌 Integrações

### Evolution API (WhatsApp)

| Funcionalidade                | Descrição                               |
| ----------------------------- | --------------------------------------- |
| **Mensagens Automáticas**     | Status do pedido, confirmação, feedback |
| **Templates Personalizáveis** | Cada tenant customiza suas mensagens    |
| **ÓoBot**                     | Atendimento automático 24/7             |
| **QR Code**                   | Conexão via WhatsApp Web                |

**Implementação:**

```php
// app/Services/EvolutionApiService.php
// app/Services/OoBotService.php
// Jobs: SendWhatsAppMessageJob
```

### Stripe (Pagamentos)

| Funcionalidade              | Descrição                        |
| --------------------------- | -------------------------------- |
| **Assinaturas Recorrentes** | Cobrança mensal automática       |
| **Trial Grátis**            | 7 dias sem custo                 |
| **Webhooks**                | Atualização automática de status |
| **PIX e Cartão**            | Múltiplos métodos de pagamento   |

**Implementação:**

```php
// app/Services/StripeService.php
// Controllers: SubscriptionController, WebhookController
```

### OneSignal (Notificações Push)

| Funcionalidade  | Descrição                      |
| --------------- | ------------------------------ |
| **Push Web**    | Notificações no navegador      |
| **Push Mobile** | Preparado para app nativo      |
| **Segmentação** | Por tenant, por tipo de evento |

**Implementação:**

```php
// app/Services/NotificationService.php
// Channels: DatabaseChannel customizado
```

### ÓoPrint (Impressão Térmica)

| Funcionalidade       | Descrição                                   |
| -------------------- | ------------------------------------------- |
| **Impressão Direta** | Protocolo próprio para impressoras térmicas |
| **Desktop App**      | Electron app instalado localmente           |
| **Auto-trigger**     | Impressão automática ao aceitar pedido      |

---

## 🔐 Multi-tenancy e Segurança

### Isolamento de Dados

```php
// app/Models/TenantScope.php
protected static function booted(): void {
    static::addGlobalScope(new TenantScope());
}

// Aplicado automaticamente em:
// • Order • Product • Customer • Setting • WhatsAppInstance
// • Category • Motoboy • LoyaltyProgram • etc.
```

| Característica    | Implementação                                        |
| ----------------- | ---------------------------------------------------- |
| **Isolamento**    | `tenant_id` em todas as tabelas críticas             |
| **Escopo Global** | `TenantScope` aplicado via `booted()`                |
| **Super Admin**   | Opera com `withoutGlobalScope()` controlado          |
| **UUIDs**         | Todas as tabelas sensíveis usam UUID                 |
| **RBAC**          | Roles: `super_admin`, `admin`, `employee`, `motoboy` |

### Middleware de Segurança

| Middleware     | Propósito                        |
| -------------- | -------------------------------- |
| `auth`         | Autenticação obrigatória         |
| `subscription` | Bloqueia tenants sem plano ativo |
| `role`         | Controle de acesso por função    |
| `tenant`       | Validação de tenant ativo        |

### Observabilidade

| Recurso           | Implementação                                 |
| ----------------- | --------------------------------------------- |
| **Polling**       | `TenantPollService` atualiza JSON a cada ação |
| **Frontend**      | Consulta `/api/poll/{tenantId}` a cada 15s    |
| **Logs**          | Laravel Log channel (storage/logs/)           |
| **Monitoramento** | Preparado para Sentry/Bugsnag                 |

---

## 🤖 AIOS Framework

### Visão Geral

O ÓoDelivery utiliza o **AIOS Framework v3.0** (AutoClaude), um sistema de agentes de IA especializados para desenvolvimento e manutenção do software.

### Agentes Especializados

| Agente                   | Ícone | Responsabilidade                          |
| ------------------------ | ----- | ----------------------------------------- |
| **@aios-master** (Orion) | 👑    | Orquestração geral, framework development |
| **@architect**           | 🏗️    | Arquitetura de software, design patterns  |
| **@dev**                 | 💻    | Implementação de código, features         |
| **@qa**                  | 🔍    | Qualidade, testes, code review            |
| **@pm**                  | 📊    | Product Management, PRDs                  |
| **@po**                  | 📋    | Product Owner, backlog grooming           |
| **@sm**                  | 📖    | Scrum Master, user stories                |
| **@analyst**             | 📈    | Pesquisa, análise de mercado              |
| **@devops**              | ⚙️    | Infraestrutura, deploy, CI/CD             |
| **@data-engineer**       | 📊    | Banco de dados, ETL, analytics            |
| **@ux-design-expert**    | 🎨    | UX/UI, design system                      |
| **@squad-creator**       | 👥    | Formação de squads, handoffs              |

### Comandos Principais

| Comando               | Descrição                               |
| --------------------- | --------------------------------------- |
| `*help`               | Mostra todos os comandos disponíveis    |
| `*kb`                 | Toggle KB mode (base de conhecimento)   |
| `*status`             | Mostra contexto e progresso atual       |
| `*guide`              | Guia completo de uso                    |
| `*create {tipo}`      | Cria componente (agent, task, workflow) |
| `*modify {tipo}`      | Modifica componente existente           |
| `*workflow {nome}`    | Inicia fluxo multi-agente               |
| `*task {nome}`        | Executa tarefa específica               |
| `*plan`               | Cria plano de trabalho                  |
| `*ids check`          | Verifica registry por reutilização      |
| `*validate-component` | Valida segurança e padrões              |

### Estrutura AIOS

```
.aios-core/
├── development/
│   ├── agents/           # Definições YAML/MD dos agentes
│   ├── tasks/            # Tarefas executáveis (.md)
│   ├── workflows/        # Fluxos YAML multi-agente
│   ├── templates/        # Templates de documentos
│   ├── checklists/       # Checklists de qualidade
│   └── scripts/          # Scripts de automação
├── data/
│   ├── aios-kb.md        # Base de conhecimento principal
│   ├── workflow-chains.yaml
│   └── technical-preferences.md
└── constitution.md        # Constituição do framework
```

### Ativação de Agentes

```bash
# Via comando
*help
*kb
*status

# Via transformação de persona
@architect
@dev
@qa
@pm

# Via workflow
*workflow greenfield-fullstack
*workflow brownfield-discovery
```

---

## 📊 Roadmap

### Prioridade Alta (Próximos 3 Meses)

| Item                      | Descrição                                   | Status       |
| ------------------------- | ------------------------------------------- | ------------ |
| **Laravel Reverb**        | Substituir polling por WebSocket real       | 📋 Planejado |
| **Analytics por Tenant**  | Painel de métricas individual               | 📋 Planejado |
| **Permissões Granulares** | Evoluir de role-based para permission-based | 📋 Planejado |

### Prioridade Média (Próximos 6 Meses)

| Item              | Descrição                            | Status       |
| ----------------- | ------------------------------------ | ------------ |
| **Domain Events** | Evoluir OrderObserver para event bus | 📋 Planejado |
| **PWA Nativo**    | manifest.json + service worker       | 📋 Planejado |
| **Multi-moeda**   | Configuração por tenant              | 📋 Planejado |

### Prioridade Baixa (Futuro)

| Item                    | Descrição                                 | Status   |
| ----------------------- | ----------------------------------------- | -------- |
| **Micro-serviços**      | Separar Notification, Payment, WhatsApp   | 🔮 Visão |
| **Multi-DB por Tenant** | Banco dedicado por tenant (1000+ tenants) | 🔮 Visão |
| **IA para Previsão**    | Ticket médio, pico de demanda, sugestões  | 🔮 Visão |

---

## 📈 Métricas e Resultados

### Impacto nos Clientes

| Métrica               | Melhoria Média |
| --------------------- | -------------- |
| Pedidos perdidos      | **-90%**       |
| Tempo de atendimento  | **-80%**       |
| Erros de pedido       | **-87%**       |
| Ticket médio          | **+22%**       |
| Repetição de clientes | **+125%**      |
| Tempo de entrega      | **-30%**       |

### Números da Plataforma

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   +500       │  │   +1M        │  │   99,9%      │  │   24/7       │
│   CLIENTES   │  │   PEDIDOS    │  │  UPTIME      │  │  SUPORTE     │
│  ATENDIDOS   │  │  PROCESSADOS │  │  DO SISTEMA  │  │  DISPONÍVEL  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 📞 Suporte e Contato

| Canal            | Informação                |
| ---------------- | ------------------------- |
| **Site**         | www.oodelivery.com.br     |
| **WhatsApp**     | (XX) XXXXX-XXXX           |
| **E-mail**       | contato@oodelivery.com.br |
| **Instagram**    | @oodelivery               |
| **Documentação** | docs.oodelivery.com.br    |

---

## 📄 Licença e Termos

| Item                    | Informação          |
| ----------------------- | ------------------- |
| **Licença do Software** | Proprietário (SaaS) |
| **Framework AIOS**      | AutoClaude v3.0     |
| **Laravel**             | MIT License         |
| **Termos de Uso**       | /termos             |
| **Privacidade**         | /privacidade        |

---

## 🎯 Conclusão

O **ÓoDelivery** é uma plataforma SaaS vertical completa para food service, com:

- ✅ **Multi-tenancy real** com isolamento de dados por loja
- ✅ **Automação de WhatsApp** nativa (ÓoBot via Evolution API)
- ✅ **Modelo de receita recorrente** (Stripe)
- ✅ **Infraestrutura pronta** para 500+ tenants sem reescrita
- ✅ **Stack moderna**: Laravel 12 + React + Inertia + AIOS v3.0

**Diferencial competitivo:** Não somos apenas um sistema de pedidos. Somos o **parceiro tecnológico do seu negócio de delivery**.

---

_© 2026 ÓoDelivery. Todos os direitos reservados._

**"Seu delivery no automático. Seu lucro no bolso."**

---

_Documento gerado e mantido pelo AIOS Framework v3.0 (Orion Orchestrator)_
