# Story 002: Implementar Estratégias de Retenção e Redução de Churn

## Status: Pending

## Description
Implementar funcionalidades proativas para retenção de clientes, alertando sobre limites de plano e oferecendo alternativas antes do cancelamento. Objetivo: reduzir churn em 20-30% e aumentar lifetime value dos clientes.

**Impacto Esperado:** Redução de 20-30% na taxa de churn mensal

---

## Acceptance Criteria

### Alertas Proativos de Limite
- [ ] Criar sistema de monitoramento de uso por plano
  - Rastrear: produtos cadastrados, usuários criados, pedidos processados, motoboys vinculados
  - Comparar com limites do plano do cliente
  - Armazenar histórico de uso em tabela de audit

- [ ] Implementar notificações de alerta
  - Exibir banner no dashboard quando cliente atinge 80% do limite
  - Incluir CTA: "Upgrade para plano Pro"
  - Enviar email quando atinge 90% do limite
  - Alert sonoro/visual no painel quando atinge 100%

- [ ] Bloquear funcionalidade quando limite é atingido
  - Não permitir criar novo produto se limite atingido
  - Mostrar modal: "Limite atingido. Upgrade para continuar"
  - Oferecer 7 dias de trial do plano superior antes de cobrar

### Fluxo de Retenção ao Cancelar
- [ ] Criar página de confirmação de cancelamento
  - Mostrar o que será perdido (dados, funcionalidades, histórico)
  - Oferecer alternativas: downgrade → pausa → desconto → cancelamento

- [ ] Implementar oferta de retenção
  - Oferecer 20-30% de desconto por 3 meses antes de cancelar
  - Oferecer pausa de assinatura por 30-60 dias (sem perder dados)
  - Sugerir downgrade para plano gratuito ao invés de cancelar
  - A/B testar qual oferta é mais efetiva

- [ ] Capturar motivo do cancelamento
  - Pesquisa de saída: "Por que está cancelando?"
  - Opções: preço alto, funcionalidades insuficientes, suporte ruim, inativo
  - Usar feedback para melhorias futuras

### Período de Graça
- [ ] Implementar período de graça de 5-7 dias
  - Ao falhar cobrança, não suspender conta imediatamente
  - Notificar cliente a atualizar forma de pagamento
  - Após 5-7 dias sem pagamento, suspender
  - Permitir reativar ao atualizar pagamento

### Dashboard de Uso e Transparência
- [ ] Criar widget de uso no dashboard do cliente
  - Exibir gráfico: "Seus limites de uso"
  - Mostrar: X de 10 produtos, Y de 5 usuários, Z de 1000 pedidos
  - Incluir % de utilização com cores: verde (0-70%), amarelo (70-90%), vermelho (90-100%)
  - Link direto para upgrade neste widget

- [ ] Exibir próxima cobrança
  - Data de próxima cobrança clara
  - Valor a ser cobrado
  - Opção de alterar forma de pagamento
  - Histórico das últimas 3 cobranças

---

## Technical Details

### Components to Create/Modify
- `resources/js/Pages/Dashboard/UsageWidget.tsx` - Novo: widget de uso
- `resources/js/Pages/Subscription/CancelConfirmation.tsx` - Novo: página de cancelamento
- `resources/js/Components/RetentionOffer.tsx` - Novo: modal de oferta de retenção
- `resources/js/Components/UsageLimitAlert.tsx` - Novo: alerta de limite
- `app/Http/Controllers/SubscriptionController.php` - Modificar

### Jobs/Commands Needed
- `app/Jobs/CheckUsageLimits.php` - Job: executar diariamente, verificar uso
- `app/Jobs/SendUsageWarningEmail.php` - Job: enviar emails de alerta
- `app/Jobs/CheckFailedPayments.php` - Job: verificar falhas de pagamento e enviar notificações

### API Endpoints Needed
- `GET /api/subscription/usage` - Retornar uso atual vs. limites
- `POST /api/subscription/cancel` - Iniciar fluxo de cancelamento
- `POST /api/subscription/pause` - Pausar assinatura
- `POST /api/subscription/retention-offer` - Aplicar oferta de retenção
- `POST /api/subscription/billing-update` - Atualizar forma de pagamento

### Database Changes
- Tabela `subscription_usage_logs` - Rastrear uso diário
- Tabela `cancellation_feedback` - Armazenar motivos de cancelamento
- Coluna `paused_at` na tabela `subscriptions`
- Coluna `paused_until` na tabela `subscriptions`

### Email Templates Needed
- `UsageWarningEmail.php` - Email de alerta de limite
- `RetentionOfferEmail.php` - Email com oferta de desconto
- `CancellationConfirmationEmail.php` - Confirmação de cancelamento
- `ReactivationEmail.php` - Email para reativar cliente (30 dias depois)

---

## File List
(Arquivos que serão criados/modificados nesta story)

- [ ] `resources/js/Pages/Dashboard/UsageWidget.tsx`
- [ ] `resources/js/Pages/Subscription/CancelConfirmation.tsx`
- [ ] `resources/js/Components/RetentionOffer.tsx`
- [ ] `resources/js/Components/UsageLimitAlert.tsx`
- [ ] `app/Http/Controllers/SubscriptionController.php`
- [ ] `app/Jobs/CheckUsageLimits.php`
- [ ] `app/Jobs/SendUsageWarningEmail.php`
- [ ] `app/Jobs/CheckFailedPayments.php`
- [ ] `app/Mail/UsageWarningEmail.php`
- [ ] `app/Mail/RetentionOfferEmail.php`
- [ ] `app/Mail/CancellationConfirmationEmail.php`
- [ ] `app/Mail/ReactivationEmail.php`
- [ ] `database/migrations/[timestamp]_create_subscription_usage_logs.php`
- [ ] `database/migrations/[timestamp]_create_cancellation_feedback.php`
- [ ] `database/migrations/[timestamp]_add_pause_to_subscriptions.php`

---

## Related Documents
- `.aios-core/development/IMPROVEMENTS_SALES_PLANS.md` - Seção 8: Retenção e Redução de Churn
- `.aios-core/development/IMPROVEMENTS_SALES_PLANS.md` - Seção 4: Gestão de Assinatura
- `docs/subscription-system-specification.md` - Especificação do sistema de planos

---

## Tasks Breakdown

1. **Database & Backend Setup**
   - [ ] Criar migrations para tabelas de log e feedback
   - [ ] Criar modelos `SubscriptionUsageLog`, `CancellationFeedback`
   - [ ] Adicionar colunas `paused_at`, `paused_until` em `Subscription`

2. **Usage Tracking Implementation**
   - [ ] Criar `CheckUsageLimits` job
   - [ ] Implementar lógica de cálculo de uso (produtos, usuários, pedidos)
   - [ ] Integrar com scheduler Laravel para rodar diariamente

3. **Alert System**
   - [ ] Criar componente `UsageLimitAlert`
   - [ ] Implementar notificação no dashboard em 80% de uso
   - [ ] Criar jobs de email em 90% de uso
   - [ ] Implementar bloqueio de funcionalidade em 100% de uso

4. **Cancellation & Retention Flow**
   - [ ] Criar página `CancelConfirmation`
   - [ ] Criar componente `RetentionOffer`
   - [ ] Implementar lógica de aplicar desconto temporário
   - [ ] Implementar lógica de pausar assinatura
   - [ ] Capturar feedback de cancelamento

5. **Email Templates**
   - [ ] Criar todos os 4 email templates
   - [ ] Configurar fila para envio
   - [ ] Testar delivery e renderização

6. **Grace Period & Payment Monitoring**
   - [ ] Criar `CheckFailedPayments` job
   - [ ] Implementar lógica de período de graça
   - [ ] Notificar cliente com 5-7 dias antes de suspender

7. **QA & Testing**
   - [ ] Testar fluxo completo de cancelamento
   - [ ] Testar alertas de limite em diferentes cenários
   - [ ] A/B test das ofertas de retenção
   - [ ] Testar emails em múltiplos clientes
   - [ ] Verificar performance do job de verificação de uso

---

## Success Metrics
- Redução de churn mensal de 20-30%
- Taxa de aceitação de oferta de retenção > 30%
- Taxa de pausa de assinatura > 15%
- Taxa de resposta ao feedback de cancelamento > 40%
