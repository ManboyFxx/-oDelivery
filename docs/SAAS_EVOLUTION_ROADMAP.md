# 🚀 Roadmap de Evolução Técnica: ÓoDelivery SaaS

> **Status:** Aprovado e Homologado pelo Framework AIOS  
> **Agentes Responsáveis:** `@architect`, `@pm`  
> **Objetivo Estratégico:** Preparar a infraestrutura e arquitetura estrutural de código para escalar o ÓoDelivery de "SaaS Emergente" para "SaaS de Alta Escala" com operação massiva segura.

O ÓoDelivery atingiu o platô de maturação inicial onde a pergunta estratégica deixou de ser _"O sistema funciona?"_ e passou a ser _"O sistema está arquiteturalmente blindado para quando funcionar demais?"_.

A proposta apresentada é cirúrgica e **100% válida**. Ela atinge exatamente a transição de um "Monolito Funcional" para um "Monolito Modular Resiliente". O roadmap abaixo divide essa evolução nas três fases naturais de maturidade tecnológica de um SaaS B2B.

---

## 🔥 Fase 1 – Blindagem (Antes de Escalar Mais)

_Foco: Estabilidade transacional, segurança contra perda de dados e resiliência contra falhas de integração externa._

- **Definir ADR Oficial de Tenancy:** Formalização final do uso estrito do modelo "Shared DB + `tenant_id`" (conforme detalhado em `ARCHITECTURE_DECISIONS.md`), documentando o limite prático desse banco antes do particionamento.
- **Implementar Idempotência em Integrações Críticas:** Prevenir duplicidade destrutiva de chamadas em instabilidades de rede (Race Conditions):
  - **Stripe:** Evitar cobranças e estornos duplicados com `Idempotency-Key` atrelada à UUID do evento.
  - **WhatsApp (Evolution API):** Prevenir disparos múltiplos do mesmo status via cache/locks diários no Job.
  - **Impressão (ÓoPrint):** Impedir que a mesma comanda física seja gerada duas vezes via Hash do ID e timestamp do pedido.
- **Criar Tabela `audit_logs`:** Rastreabilidade corporativa "Quem fez o que". Registrar a mutação do dado (old value -> new value) em cancelamentos de pedidos e alterações financeiras (filtrável por `tenant_id` e `user_id`).
- **Criar Tabela `integration_events`:** Desacoplar logs de falha HTTP da tabela principal de `Orders`. Registra todo webhook recebido ou despachado para retentativas isoladas.
- **Índices Compostos Globais:** Varredura no schema MySQL para adicionar índices compostos obrigatórios no formato `(tenant_id, status)` nas tabelas de volume, mitigando o _Full Table Scan_ fatal nos dashboards.
- **Definir Política Formal de Cancelamento e Estorno:** Rotinas de código para desativar pedidos, devolver saldo ao gateway (via webhook assíncrono) ou creditar loyalty automatizadamente, sem intervenção humana de suporte.

---

## 🚀 Fase 2 – Escala Real

_Foco: Alta performance em tempo real, processos assíncronos desacoplados e governança de acesso._

- **Pushover para Laravel Reverb (WebSockets):** Substituir a pesada carga de rotinas _HTTP Short-Polling_ do React/Inertia por transmissões broadcast via WebSocket. Essa é a virada fundamental para comportar sexta-feira 19h sem gargalos de I/O.
- **Event Bus Interno (Domain Events):** Interromper o uso exagerado de Eloquent Observers. Mudar a arquitetura para emitir eventos de domínio (ex: `OrderWasConfirmed`), onde Listeners independentes processarão suas próprias filas colaterais (Push, SMS, Contabilidade).
- **Analytics por Tenant (Tabelas de Agregação):** Em vez de iterar `orders` mensais sob demanda (pesadelo de performance), implementar rotinas noturnas que preencham tabelas agregadoras (`daily_tenant_revenues`), agilizando dashboards instantâneos.
- **Permissões Granulares (PBAC - Permission-Based):** Sair da gestão simples de "Roles" (Admin/Employee) e permitir que os usuários gerenciem quais recursos exatos da plataforma cada carteira pode manipular (ex: Ver pedidos, mas sem poder de cancelamento).
- **Rate Limit por Tenant:** Proteção ativa `ThrottleRequests` segmentada por subdomínio/`tenant_id` em rotas públicas abertas à internet, evitando que clientes raspadores de cardápios derrubem o SaaS limitando picos (DDoS Layer 7 mitigado).

---

## 🧠 Fase 3 – Arquitetura Evolutiva

_Foco: Desacoplamento estrutural em módulos autossuficientes, fronteiras Bounded Contexts e resiliência elástica._

- **Separação de Camadas de Domínio:** Refatoração de lógicas colossais dentro de _Controllers_ e _Models_ passando a usar _Use Cases_, _Action Classes_ e _Repositories_ ignorantes do Framework.
- **Domain Events como Padrão Absoluto:** Qualquer alteração de estado primordial do Tenant deve imperativamente engatilhar reações puramente orientadas a eventos e mensagens, rompendo as árvores de dependência pesadas entre pastas.
- **Preparação para Micro-serviços (Microservices readiness):** O sistema não se transformará em micro-serviços ainda (anti-pattern de escalada prematura), mas ele se dividirá em um "Modular Monolith", isolando logicamente pastas independentes: `Notification`, `Billing`, `Delivery` e `Core`.
- **Estratégia Híbrida de Multi-DB:** Mapeamento de viabilidade via arquitetura de conexão dinâmica para isolar logicamente clientes supergigantes (Enterprise/Franquias) em instâncias RDS separadas sem rasgar todo o sistema base.

---

> _"Arquitetar um software SaaS maduro não é sobre construir o topo do arranha-céus na primeira semana, mas sim sobre garantir agressivamente que a fundação e a estrutura metálica suportarão o topo quando ele chegar."_  
> — **Assinado: `@architect` e `@pm`**
