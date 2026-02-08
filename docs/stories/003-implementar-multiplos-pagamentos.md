# Story 003: Implementar Sistema Robusto de Pagamento Recorrente

## Status: Pending

## Description
Implementar suporte a múltiplas formas de pagamento (cartão de crédito, Pix, boleto) com sistema de retry automático e notificações de falha. Objetivo: aumentar taxa de conversão, reduzir falhas de pagamento e melhorar fluxo de caixa com opção de pagamento anual.

**Impacto Esperado:** Redução de 30-40% em falhas de cobrança, aumento de 10-15% em conversão

---

## Acceptance Criteria

### Múltiplas Formas de Pagamento
- [ ] Integração com Stripe
  - Suportar pagamento com cartão de crédito
  - Implementar tokenização segura (conformidade PCI)
  - Permitir salvar múltiplos cartões
  - Exibir últimos 4 dígitos do cartão salvo

- [ ] Integração com Pix (Brasil)
  - Gerar QR code para pagamento Pix
  - Implementar validação de comprovante (hash)
  - Suportar pagamento Pix para cobrança única e recorrente
  - Mostrar status em tempo real

- [ ] Integração com Boleto (Brasil - opcional, V2)
  - Gerar boleto com código de barras
  - Rastrear status do boleto
  - Enviar por email ao cliente
  - Notificar quando boleto é pago

### Tokenização e Segurança
- [ ] Salvar cartões de forma segura
  - Usar tokens do Stripe, não armazenar números em bruto
  - Permitir deletar cartões salvos
  - Permitir definir cartão padrão para cobrança
  - Atualizar cartão quando próximo de expirar

- [ ] Implementar PCI compliance
  - Usar formulários seguros do Stripe (Stripe.js)
  - Não armazenar dados de cartão no banco de dados
  - Auditar acessos a dados de pagamento
  - Exibir selos de segurança no checkout

### Retry Automático de Falhas
- [ ] Implementar sistema de retry inteligente
  - 1º tentativa: imediatamente ao falhar
  - 2º tentativa: 3 dias depois
  - 3º tentativa: 5 dias depois
  - Após 3 falhas: suspender conta com período de graça

- [ ] Notificar cliente em cada tentativa
  - Email após cada falha de pagamento
  - Incluir link direto para atualizar forma de pagamento
  - Mostrar data da próxima tentativa
  - Alertar que conta será suspensa em X dias

- [ ] Automatizar recuperação
  - Reativar conta automaticamente quando pagamento é bem-sucedido
  - Não perder dados durante suspensão
  - Manter histórico de tentativas e comunicações

### Checkout Simplificado
- [ ] Criar página de checkout otimizada
  - Reduzir campos ao mínimo: email, CPF/CNPJ, forma de pagamento
  - 1-click checkout se já tem cartão salvo
  - Indicador de progresso (passos do checkout)
  - Resumo visual fixo com plano, valor e próxima cobrança

- [ ] Exibir indicadores de segurança
  - Selos SSL/TLS
  - Badge PCI Compliance
  - Garantia de "dados seguros"
  - Explicar proteção de dados

### Atualização Fácil de Cartão
- [ ] Implementar fluxo de atualização de cartão
  - Link direto no email de falha de pagamento
  - Página dedicada para atualizar forma de pagamento
  - Permitir atualizar sem fazer login (link tokenizado)
  - Confirmar sucesso e reativar conta automaticamente

### Período de Graça e Suspensão
- [ ] Criar estado "Suspendido Temporariamente"
  - Cliente pode logar, ver aviso
  - Acesso limitado a dados (view-only)
  - CTA claro para atualizar pagamento
  - Reativar em 1 clique após pagamento bem-sucedido

- [ ] Implementar período de graça antes de suspensão final
  - 5-7 dias de período de graça após última falha
  - Notificações progressivas: -7 dias, -3 dias, -1 dia, hoje
  - Após período de graça: suspender dados de acesso
  - Manter dados por 30 dias antes de deletar

---

## Technical Details

### Integrations Required
1. **Stripe**: Pagamento com cartão, token management
2. **Pix Gateway**: Integração com provider Pix (ex: Stripe, Mercado Pago, PagSeguro)
3. **Webhook Handler**: Receber notificações de sucesso/falha das gateways

### Components to Create/Modify
- `resources/js/Pages/Checkout/PaymentMethod.tsx` - Novo: seleção de forma de pagamento
- `resources/js/Pages/Checkout/CardForm.tsx` - Novo: formulário de cartão (Stripe.js)
- `resources/js/Pages/Checkout/PixPayment.tsx` - Novo: pagamento Pix
- `resources/js/Components/PaymentUpdateForm.tsx` - Novo: atualizar cartão
- `resources/js/Pages/Subscription/PaymentFailed.tsx` - Novo: página de falha
- `resources/js/Components/SecurityBadges.tsx` - Novo: indicadores de segurança

### API Endpoints Needed
- `POST /api/payment/charge` - Fazer cobrança
- `POST /api/payment/methods` - Listar formas de pagamento salvos
- `POST /api/payment/methods/save` - Salvar novo cartão
- `DELETE /api/payment/methods/{id}` - Deletar cartão
- `POST /api/payment/methods/{id}/set-default` - Definir cartão padrão
- `POST /api/payment/retry` - Retry manual de falha
- `POST /api/payment/webhooks/stripe` - Webhook do Stripe
- `POST /api/payment/webhooks/pix` - Webhook do Pix

### Database Changes
- Tabela `payment_methods` - Armazenar tokens de cartões salvos
- Tabela `payment_transactions` - Log de todas as transações
- Tabela `payment_failures` - Log de falhas e retries
- Coluna `stripe_customer_id` em `subscriptions`
- Coluna `pix_key` em `subscriptions` (opcional)
- Coluna `last_payment_attempt_at` em `subscriptions`
- Coluna `next_retry_at` em `subscriptions`

### Jobs/Commands Needed
- `app/Jobs/ProcessPaymentRetry.php` - Tentar novamente cobrança com falha
- `app/Jobs/CheckSuspensionGracePeriod.php` - Verificar e suspender após período de graça
- `app/Jobs/SendPaymentFailureNotification.php` - Enviar email de falha
- `app/Commands/ChargeRecurringSubscriptions.php` - Fazer cobrança mensal/anual
- `app/Commands/SuspendOverdueSubscriptions.php` - Suspender contas vencidas

### Stripe Configuration
```php
// config/stripe.php
'key' => env('STRIPE_PUBLIC_KEY'),
'secret' => env('STRIPE_SECRET_KEY'),
'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
```

### Email Templates Needed
- `PaymentFailedEmail.php` - Notificação de falha
- `PaymentSuccessEmail.php` - Confirmação de sucesso
- `CardExpiringEmail.php` - Alerta de cartão próximo de expirar
- `SuspensionWarningEmail.php` - Aviso antes de suspensão
- `SubscriptionSuspendedEmail.php` - Confirmação de suspensão
- `PaymentMethodUpdateEmail.php` - Confirmação de atualização

---

## File List
(Arquivos que serão criados/modificados nesta story)

- [ ] `resources/js/Pages/Checkout/PaymentMethod.tsx`
- [ ] `resources/js/Pages/Checkout/CardForm.tsx`
- [ ] `resources/js/Pages/Checkout/PixPayment.tsx`
- [ ] `resources/js/Components/PaymentUpdateForm.tsx`
- [ ] `resources/js/Pages/Subscription/PaymentFailed.tsx`
- [ ] `resources/js/Components/SecurityBadges.tsx`
- [ ] `app/Http/Controllers/PaymentController.php`
- [ ] `app/Http/Controllers/WebhookController.php`
- [ ] `app/Jobs/ProcessPaymentRetry.php`
- [ ] `app/Jobs/CheckSuspensionGracePeriod.php`
- [ ] `app/Jobs/SendPaymentFailureNotification.php`
- [ ] `app/Commands/ChargeRecurringSubscriptions.php`
- [ ] `app/Commands/SuspendOverdueSubscriptions.php`
- [ ] `app/Models/PaymentMethod.php`
- [ ] `app/Models/PaymentTransaction.php`
- [ ] `app/Models/PaymentFailure.php`
- [ ] `app/Mail/PaymentFailedEmail.php`
- [ ] `app/Mail/PaymentSuccessEmail.php`
- [ ] `app/Mail/CardExpiringEmail.php`
- [ ] `app/Mail/SuspensionWarningEmail.php`
- [ ] `app/Mail/SubscriptionSuspendedEmail.php`
- [ ] `app/Mail/PaymentMethodUpdateEmail.php`
- [ ] `database/migrations/[timestamp]_create_payment_methods.php`
- [ ] `database/migrations/[timestamp]_create_payment_transactions.php`
- [ ] `database/migrations/[timestamp]_create_payment_failures.php`
- [ ] `database/migrations/[timestamp]_add_payment_fields_to_subscriptions.php`
- [ ] `.env.example` - Adicionar variáveis Stripe/Pix

---

## Related Documents
- `.aios-core/development/IMPROVEMENTS_SALES_PLANS.md` - Seção 7: Formas de Pagamento e Checkout
- `.aios-core/development/IMPROVEMENTS_SALES_PLANS.md` - Seção 8: Retenção (Período de Graça)
- `docs/subscription-system-specification.md` - Especificação do sistema

---

## Tasks Breakdown

1. **Stripe Setup & Configuration**
   - [ ] Criar conta Stripe (se não existir)
   - [ ] Obter chaves públicas e privadas
   - [ ] Configurar webhook endpoint
   - [ ] Testar conexão com Stripe API

2. **Database Setup**
   - [ ] Criar migrations para tabelas de pagamento
   - [ ] Criar modelos `PaymentMethod`, `PaymentTransaction`, `PaymentFailure`
   - [ ] Adicionar relacionamentos com `Subscription`

3. **Payment Form Implementation**
   - [ ] Criar componente `CardForm` com Stripe.js
   - [ ] Criar componente `PixPayment` com QR code
   - [ ] Implementar `PaymentMethod` selector
   - [ ] Adicionar `SecurityBadges`

4. **Checkout Flow**
   - [ ] Criar página de checkout
   - [ ] Integrar com Stripe para processar pagamento
   - [ ] Implementar lógica de criação de `Subscription` após pagamento bem-sucedido
   - [ ] Implementar redirecionamento baseado em resultado

5. **Webhook Handling**
   - [ ] Criar webhook controller
   - [ ] Implementar handlers: `charge.succeeded`, `charge.failed`, `invoice.payment_failed`
   - [ ] Validar assinatura de webhook Stripe
   - [ ] Testar com Stripe CLI

6. **Retry & Grace Period**
   - [ ] Criar job `ProcessPaymentRetry`
   - [ ] Criar job `CheckSuspensionGracePeriod`
   - [ ] Integrar com scheduler (rodar diariamente)
   - [ ] Implementar lógica de suspensão

7. **Payment Management UI**
   - [ ] Criar interface para visualizar formas de pagamento
   - [ ] Implementar `PaymentUpdateForm`
   - [ ] Criar página `PaymentFailed` com opções de retry/update
   - [ ] Integrar no dashboard de subscription

8. **Email Templates**
   - [ ] Criar todos os 6 templates de email
   - [ ] Testar renderização em múltiplos clientes de email
   - [ ] Configurar fila para envio assíncrono

9. **Testing & QA**
   - [ ] Testar fluxo completo com Stripe Test Mode
   - [ ] Testar todos os cenários de falha
   - [ ] Testar retry automático
   - [ ] A/B test de diferentes mensagens
   - [ ] Teste de carga no webhook handler
   - [ ] Validar PCI compliance

10. **Documentation & Deployment**
    - [ ] Documentar configuração de Stripe
    - [ ] Documentar fluxo de pagamento
    - [ ] Deploy em staging
    - [ ] Monitor de erros em produção
    - [ ] Runbook para troubleshooting de pagamentos

---

## Success Metrics
- Taxa de falha de pagamento reduzida de 40% para 24% (40% de redução)
- Taxa de recuperação de falhas com retry: > 60%
- Taxa de conversão aumentada de 3% para 3.5% (16% de aumento)
- Tempo médio de resolução de pagamento falho: < 2 dias
- Taxa de satisfação com segurança: > 95%

---

## Dependencies & Prerequisites
- [ ] Conta Stripe ativa
- [ ] Chaves de API Stripe configuradas em `.env`
- [ ] Webhook endpoint acessível publicamente
- [ ] Aceitar termos de PCI compliance
- [ ] (Optional) Integração com provider Pix (definir em Sprint Planning)

---

## Known Limitations & Future Work (V2)
- [ ] Boleto: não implementado nesta versão (considerado para V2)
- [ ] Apple Pay/Google Pay: não implementado (V2)
- [ ] Plano de pagamento em parcelas (parcelamento): V2
- [ ] Processamento de devolução (refund): simples por agora, melhorar em V2
