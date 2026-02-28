# 🏗️ Decisões Críticas de Arquitetura e Engenharia

> **Documento de Formalização Técnica**  
> **Sistema:** ÓoDelivery SaaS  
> **Atualização:** 27 de Fevereiro de 2026

Este documento formaliza as decisões arquiteturais e técnicas críticas para garantir que o ÓoDelivery seja um SaaS robusto, seguro e escalável. Ele resolve ambiguidades do modelo de dados e define o padrão de engenharia para o próximo estágio de maturidade da plataforma (escala para 500+ tenants).

---

## 1️⃣ Arquitetura Multi-tenancy

**Decisão Oficial:** `Shared Database + tenant_id` (Isolamento Lógico)

**Por que não Database per Tenant?**  
Escalar para mais de 500+ tenants com bancos de dados isolados (um banco por loja) demandaria um custo absurdo de provisionamento de instâncias na AWS RDS (ou similar) e tornaria as migrações (migrations) extremamente lentas e propensas a falhas - o infame _schema drift_. O modelo `Shared DB` mantém a infraestrutura enxuta e o pooling de conexões altamente eficiente.

**Regras de Ouro:**

1. **Obrigatório:** Toda tabela da aplicação (exceto tabelas base do super admin, como provedores globais, planos) deve ter a coluna `tenant_id`.
2. **Global Scope:** Toda consulta ao banco nos controllers e apis tenant-aware deve **obrigatoriamente** estar sob o controle do `TenantScope` nativo do Laravel (`app/Models/Scopes/TenantScope.php`).
3. **Foreign Keys Restritas:** O `tenant_id` sempre faz referência a `tenants(id)` com regra de `ON DELETE CASCADE` estritamente avaliada e auditada.

---

## 2️⃣ Escalabilidade Real

**Comunicação em Tempo Real (Real-time):**

- A transição será feita de Polling HTTP clássico para uso nativo de **WebSockets com Laravel Reverb**.
- _Estratégia de Fallback:_ Caso a conexão do WebSocket falhe no cliente (timeout, wss indisponível em rede 4G instável ou falha no Reverb), a SPA (React/Inertia) deve possuir um fallback suave (graceful degradation) para Short-polling assíncrono.

**Processamento Assíncrono (Webhooks & Threads):**

- **Filas Separadas (Horizon/Redis):** Criação de queues isoladas: `critical_webhooks`, `emails_sms`, `heavy_reports`, `default`. Em horas de pico (Sexta 19h), os workers focarão no pipeline crítico de checkout/webhooks.
- **Webhooks Recebidos:** Resposta HTTP 200/202 imediata para as integrações (Stripe, Evolution API) empurrando a carga pesada para os jobs.
- O reprocessamento tentará 3x em falhas de API com técnica de _Exponential Backoff_.

**Picos de Acesso e Proteções:**

- **Rate Limiting por Tenant/IP:** Em caso limite no API Gateway ou Nginx usando `ThrottleRequests`, limitando abusos em rotas de APIs abertas do front. Proteção explícita contra raspagem de cardápio digital e requisições repetitivas de finalização.

**Autorização Estrita no Canal Reverb:**

- Presença e canais logados (em `routes/channels.php`) devem autenticar os requests do Laravel Reverb. O Tenant B nunca verá as difusões de pedidos do Tenant A. O sistema exige validação Sanctum para emitir broadcast de loja local.

---

## 3️⃣ Modelo de Dados e Índices

**Entidades Core Redefinidas:**

- **Order (Pedido):** Apenas um agregador macro e estado principal da operação (`new` -> `preparing` -> `ready` -> `out_for_delivery` -> `delivered`).
- **Payment (Pagamento):** Tabela separada. Centraliza informações 1:1 com `Order`. Mantém histórico de logs e os `gateway_id` limpos de misturas de provedores diretos (separando PIX nativos, Stripe Webhook events e Linkers).
- **Loyalty (Fidelidade do Cliente):** Ledger (livro-razão) de pontos por `customer_id` atrelado ao `tenant_id`. Pontos de `cashback` funcionam como extrato com entradas (Créditos de pedido) e saídas (Resgates/Pagamento de descontos).
- **Relacionamento Motoboy:** Cardinalidade **1:N**. 1 Pedido na rua pertence a 1 Motoboy durante o percurso. Um Motoboy, no entanto, pode fazer rotas empilhadas com N Orders da mesma bag.

**Deletes Rigorosos:**

- **Soft Delete (`deleted_at`):** Obrigatório em `Customers`, `Orders`, `Products`, `Categories` mantendo consistência para métricas financeiras passadas. O sistema nunca apagará o Produto ID 4 que foi vendido ano passado, evitando erros fatais nas views históricas.
- **Hard Delete:** Puramente mantido em tabelas pivot, logs voláteis ou tokens temporários.

**Índices Compostos Globais:**
Todo novo índice de pesquisa no BD em tabelas Tenant-Aware precisará do prefixo `tenant_id`. Por exemplo, se pesquisa clientes por e-mail ou nome dentro do Tenant A:

```sql
INDEX idx_tenant_status (tenant_id, status);
INDEX idx_tenant_phone (tenant_id, phone);
```

---

## 4️⃣ Segurança SaaS Profissional

**Auditoria e Log de Ações (Audit Trail):**

- **SaaS de alto nível exige rastreabilidade.** Quaisquer recursos deletados, contas desativas ou pedidos manualmente cancelados deverão gerar logs apontando: Quais `user_id` e `tenant_id` executaram a ação, com um diff em JSON das alterações (`[old_values => ..., new_values => ...]`), com IP rastreado.

**LGPD, Privacidade e Retenção:**

- Garantia do direito ao esquecimento.
- Processo automatizado executará anonimização de dados de `customers` de lojas inativas sob solicitação, trocando endereços completos, documentos e números originais por Hashing ofuscado passados prazos legais de retenção da plataforma (ex: +3 a 5 anos se possuir faturamento fiscal, ou wipe após abandono dos "demos/trials" em inatividade brutal há 6 meses).

**Controle de Concorrência e Idempotência:**

- **Race Condition (Exclusão Mútua):** Aplicar _Pessimistic Locking_ em transações. No momento de aceite de um pedido concorrente ou redução de estoque físico, executa `DB::table()->lockForUpdate()`. Se Operador A e Operador B na tela clicarem para atribuir Motoboy 1 ao Pedido no décimo de segundo exato, apenas um transaciona.
- **Idempotency Header:** Checkout API validará chave única do frontend em postagens financeiras (Impedindo 2 capturas no cartão por variação de Wi-Fi no celular do cliente).

**Assinaturas de Webhook:**

- Proteção vital: Todos webhooks expostos publicamente como `/api/webhooks/stripe` e `/api/webhooks/whatsapp` calcularão a assinatura criptográfica (`HMAC-SHA256`) baseada no "secret" definido. Ninguém injeta Payload Faker de pagamento aprovado via Postman no SaaS.

---

## 5️⃣ Observabilidade Operacional (Observability)

A diferença entra o SaaS cego e preventivo mora no monitoramento passivo.

**Métricas Técnicas Globais & SLAs:**

- Medição e rastreamento de **Latência P95** na vitrine (Cardápio Digital).
- Tempo de resposta e percentil de falhas (Failure rate) documentados. Notificações do webhook passando a margem de X% ativam alerta Slack/Discord nos logs master dos Desenvolvedores antes do servidor colapsar.

**Estratégia RPO / RTO Corporativo:**

- **RPO (Recovery Point Objective):** Alvo menor a **15 minutos** em DR (Disaster Recovery). Baseado em Point-In-Time recovery (Logs incrementais transacionais AWS/MySQL DB).
- **RTO (Recovery Time Objective):** Tempo estimado máximo de levantamento (downtime real tolerado em catástrofes) na janela de **2 horas**.

**Saúde e Tolerância:**

- Backups automáticos em nuvem de todo core Data com replicação Redundante.
- Extrator HealthCheck dedicado por Tenant: Monitor pró-ativo vai iterando `/api/health-check` (ou command local validando ping via Job) notificando se um Tenant específico parou de logar a Evolution API/WhatsApp Node na plataforma. A solução acusa que o WhatsApp xpto caiu antes de o lojista ligar na sexta 22h sem entender.
