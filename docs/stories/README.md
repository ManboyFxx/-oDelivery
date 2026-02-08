# Stories - Melhorias de Vendas e Planos

Documentação de stories para implementar as melhorias identificadas no documento `IMPROVEMENTS_SALES_PLANS.md`.

## Status Geral

| ID | Story | Status | Prioridade | Impacto Esperado |
|----|-------|--------|-----------|------------------|
| 001 | Melhorar Conversão - Página de Planos | Pending | 🔴 Alta | Aumento 15-25% na taxa de conversão |
| 002 | Implementar Retenção de Clientes | Pending | 🔴 Alta | Redução 20-30% no churn |
| 003 | Sistema Robusto de Pagamento | Pending | 🔴 Alta | Redução 30-40% em falhas, +10-15% conversão |

## Story 001: Melhorar Taxa de Conversão - Página de Planos

**Objetivo:** Aumentar conversão através de comparativo detalhado, toggle anual/mensal e garantia visível.

**Acceptance Criteria Principais:**
- [ ] Tabela comparativa detalhada de planos
- [ ] Toggle Anual/Mensal com desconto
- [ ] Selos de "Garantia" e "Sem risco"
- [ ] Tooltips explicativos em features
- [ ] Tracking de conversão (Facebook Pixel, Google Ads)

**Arquivos Chave:**
- `resources/js/Pages/Welcome/Plans.tsx`
- `resources/js/Components/PricingComparison.tsx`
- `resources/js/Components/BillingToggle.tsx`

**Estimativa:** 40-60 horas
**Agentes Recomendados:** @dev, @ux-design-expert, @qa

---

## Story 002: Implementar Estratégias de Retenção e Redução de Churn

**Objetivo:** Reter clientes com alertas proativos, ofertas de retenção e período de graça.

**Acceptance Criteria Principais:**
- [ ] Alertas quando cliente atinge 80% de limite
- [ ] Oferta de desconto/pausa antes de cancelar
- [ ] Período de graça de 5-7 dias antes de suspensão
- [ ] Widget de uso no dashboard
- [ ] Feedback de cancelamento

**Arquivos Chave:**
- `resources/js/Pages/Dashboard/UsageWidget.tsx`
- `resources/js/Pages/Subscription/CancelConfirmation.tsx`
- `app/Jobs/CheckUsageLimits.php`
- `app/Mail/RetentionOfferEmail.php`

**Estimativa:** 60-80 horas
**Agentes Recomendados:** @dev, @pm, @qa

---

## Story 003: Implementar Sistema Robusto de Pagamento Recorrente

**Objetivo:** Suportar múltiplas formas de pagamento com retry automático e notificações.

**Acceptance Criteria Principais:**
- [ ] Integração Stripe (cartão de crédito)
- [ ] Integração Pix (Brasil)
- [ ] Retry automático (3 tentativas em dias alternados)
- [ ] Período de graça antes de suspensão
- [ ] Notificações de falha e atualização fácil

**Arquivos Chave:**
- `app/Http/Controllers/PaymentController.php`
- `app/Http/Controllers/WebhookController.php`
- `app/Jobs/ProcessPaymentRetry.php`
- `resources/js/Pages/Checkout/CardForm.tsx`

**Estimativa:** 80-120 horas
**Agentes Recomendados:** @dev, @devops, @qa

---

## Roadmap de Implementação

### Fase 1 (Sprint 1-2): Foundation
1. **Story 001**: Melhorar Conversão
   - Implementar comparativo de planos
   - Implementar toggle anual/mensal
   - Setup de tracking

### Fase 2 (Sprint 3-4): Payment & Retention
2. **Story 003**: Sistema de Pagamento
   - Setup Stripe
   - Implementar checkout
   - Implementar webhook handling

3. **Story 002**: Retenção de Clientes
   - Implementar alertas de limite
   - Implementar período de graça
   - Implementar oferta de retenção

### Fase 3 (Sprint 5+): Optimization
- A/B testing das ofertas de retenção
- Otimizações baseadas em analytics
- Melhorias em UX baseadas em user feedback

---

## Como Trabalhar com Stories

### 1. Ler a Story Completa
```bash
cat docs/stories/001-melhorar-conversao-pricing.md
```

### 2. Marcar Como In Progress
```bash
# Editar o arquivo da story e mudar o status de:
# Status: Pending
# Para:
# Status: In Progress
```

### 3. Criar Tasks
Use o sistema AIOS para criar tasks específicas:
```bash
@dev *create-task "Implementar componente PricingComparison"
```

### 4. Atualizar Progress
- Marque checkboxes conforme completa tarefas
- Atualize a File List com arquivos criados/modificados
- Documente decisões e aprendizados

### 5. Marcar Como Completed
Quando todas as criteria forem atendidas:
```bash
# Editar arquivo da story e mudar status para:
# Status: Completed
```

---

## Métricas de Sucesso

### Story 001: Conversão
- ✅ Taxa de conversão de landing page: **+15-25%**
- ✅ Taxa de clique em "Começar Grátis": aumentada
- ✅ Tempo gasto na página de preços: aumentado
- ✅ Taxa de abandono do checkout: reduzida

### Story 002: Retenção
- ✅ Churn mensal: **-20-30%**
- ✅ Taxa de aceitação de oferta de retenção: **>30%**
- ✅ Taxa de pausa de assinatura: **>15%**
- ✅ Lifetime Value por cliente: aumentado

### Story 003: Pagamento
- ✅ Taxa de falha de pagamento: **-30-40%**
- ✅ Taxa de recuperação com retry: **>60%**
- ✅ Taxa de conversão: **+10-15%**
- ✅ Tempo de resolução de falha: **<2 dias**

---

## Recursos Relacionados

- `.aios-core/development/IMPROVEMENTS_SALES_PLANS.md` - Documento completo de melhorias
- `docs/subscription-system-specification.md` - Especificação técnica do sistema
- `.claude/CLAUDE.md` - Regras AIOS de desenvolvimento
- `docs/strategic_plan.md` - Plano estratégico geral

---

## Contato & Dúvidas

Para dúvidas sobre uma story, consulte:
1. A seção "Related Documents" na story
2. A especificação técnica em `docs/subscription-system-specification.md`
3. Converse com o PM (@pm) para esclarecimentos de requisitos
4. Converse com o Architect (@architect) para decisões de design

---

**Last Updated:** 2026-02-07
**Created by:** Claude Code
