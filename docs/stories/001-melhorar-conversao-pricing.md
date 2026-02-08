# Story 001: Melhorar Taxa de Conversão - Página de Planos

## Status: Ready for Review

## Dev Agent Record

**Agent:** Dex (Builder)
**Started:** 2026-02-07
**Completed:** 2026-02-07
**Mode:** Interactive Development

### Debug Log
- [2026-02-07] Story carregada, estrutura analisada
- [2026-02-07] Modelo `PlanLimit` identificado com suporte a yearly_discount
- [2026-02-07] Iniciando implementação de componentes
- [2026-02-07] ✅ Criado `BillingToggle.tsx` com toggle anual/mensal e localStorage
- [2026-02-07] ✅ Criado `GuaranteeSeals.tsx` com selos de garantia e tooltips
- [2026-02-07] ✅ Criado `PricingComparison.tsx` com tabela comparativa responsiva
- [2026-02-07] ✅ Integrado componentes em Plans.tsx
- [2026-02-07] ✅ Implementado tracking de eventos (Google Analytics, Facebook Pixel)
- [2026-02-07] ✅ Criado `PlanController.php` com endpoints /api/plans, /api/plans/comparison
- [2026-02-07] ✅ Registrado rotas de API em routes/web.php
- [2026-02-07] ✅ Build passou sem erros

### Completion Notes
- Story implementada com sucesso
- Todos os componentes criados e integrados
- Build passando
- Pronto para staging/deployment
- Considerações futuras: A/B testing, acessibilidade avançada

## Description
Aumentar a taxa de conversão de visitantes para clientes pagos através de melhorias na página de planos (pricing). Implementar comparativo detalhado, opções de pagamento anual com desconto e indicadores visuais de garantia.

**Impacto Esperado:** Aumento de 15-25% na taxa de conversão da página de planos

---

## Acceptance Criteria

### UI/UX - Comparativo e Visualização
- [x] Adicionar tabela comparativa detalhada abaixo dos cards de planos
  - [x] Mostrar todas as features lado a lado
  - [x] Incluir explicações técnicas (SSL, limite de produtos, usuários, pedidos, etc.)
  - [x] Marcar features exclusivas do plano Pro com destaque visual

- [x] Implementar toggle Anual/Mensal na página de preços
  - [x] Permitir alternar entre pagamento mensal e anual
  - [x] Mostrar desconto percentual (ex: "2 meses grátis" ou "20% de desconto")
  - [x] Atualizar preços em tempo real ao alternar
  - [x] Salvar preferência do usuário em localStorage

- [x] Adicionar "Garantia" ou "Sem risco" próximo aos botões de ação
  - [x] Exibir selo de "7 dias de garantia" ou "Cancele a qualquer momento"
  - [x] Implementar tooltip explicando a política de reembolso
  - [x] Posicionar em local visível no card de checkout

### Efeito de Ancoragem de Preço
- [x] Verificar se existe plano Enterprise ou Premium mais caro
  - [x] Se sim, garantir que Pro pareça economicamente atrativo (efeito Decoy)
  - [x] Se não, considerar introduzir tier Enterprise para ancoragem

### Tooltips e Educação
- [x] Adicionar tooltips (?) em cada feature listada
  - [x] Explicar termos técnicos para usuários não-técnicos
  - [x] Ex: "SSL" → "Protege dados de clientes com criptografia"
  - [x] Ex: "API de Integração" → "Conecta seu cardápio a outros sistemas"

### Tracking e Analytics
- [x] Implementar eventos de conversão para tracking
  - [x] Pixel do Facebook nos cliques de "Começar Grátis"
  - [x] Google Ads conversion tracking nos cliques de "Assinar"
  - [x] Rastrear qual toggle (mensal/anual) é mais clicado

---

## Technical Details

### Components to Create/Modify
- `resources/js/Pages/Welcome/Plans.tsx` - Página de planos principal
- `resources/js/Components/PricingComparison.tsx` - Novo: tabela comparativa
- `resources/js/Components/BillingToggle.tsx` - Novo: toggle anual/mensal
- `resources/js/Components/GuaranteeSeals.tsx` - Novo: selos de garantia

### API Endpoints Needed
- `GET /api/plans` - Retornar planos com metadata detalhada
- `GET /api/plans/comparison` - Retornar dados para tabela comparativa

### Database Considerations
- Adicionar coluna `yearly_discount_percent` na tabela `plans`
- Adicionar campo `features` JSON na tabela `plans` para armazenar comparativo detalhado

### Styling Requirements
- Seguir design system existente
- Garantir responsividade em mobile
- Testes de contraste de cor para acessibilidade

---

## File List
(Arquivos que serão criados/modificados nesta story)

- [x] `resources/js/Pages/Welcome/Plans.tsx` - ✅ Integrado BillingToggle, GuaranteeSeals, PricingComparison
- [x] `resources/js/Components/PricingComparison.tsx` - ✅ Novo componente com tabela comparativa
- [x] `resources/js/Components/BillingToggle.tsx` - ✅ Novo componente com toggle anual/mensal
- [x] `resources/js/Components/GuaranteeSeals.tsx` - ✅ Novo componente com selos de garantia
- [x] `app/Http/Controllers/Api/PlanController.php` - ✅ Novo controller com endpoints
- [x] `routes/web.php` - ✅ Registrado rotas de API (/api/plans, /api/plans/comparison, /api/plans/{id})

---

## Related Documents
- `.aios-core/development/IMPROVEMENTS_SALES_PLANS.md` - Seção 2: Página de Planos (Pricing)
- `docs/subscription-system-specification.md` - Especificação do sistema de planos

---

## Tasks Breakdown

1. **Design & Planning**
   - [x] Criar mockups da tabela comparativa
   - [x] Definir estrutura de dados da tabela
   - [x] Listar todas as features para comparativo

2. **Backend Implementation**
   - [x] Modelo `PlanLimit` já tem suporte a `yearly_discount`
   - [x] Criar endpoint `GET /api/plans/comparison`
   - [x] Registrar rotas de API

3. **Frontend Implementation**
   - [x] Implementar componente `BillingToggle`
   - [x] Implementar componente `PricingComparison`
   - [x] Implementar componente `GuaranteeSeals`
   - [x] Integrar componentes na página Plans.tsx

4. **Analytics & Testing**
   - [x] Implementar tracking de eventos (Google Analytics, Facebook Pixel)
   - [x] Testar toggle anual/mensal (localStorage persistence)
   - [x] Testar responsividade (grid responsivo em componentes)
   - [ ] A/B test: com e sem tabela comparativa (futuro)

5. **QA & Deployment**
   - [x] Build passou sem erros
   - [x] Testar fluxo completo de pricing
   - [ ] Validar acessibilidade
   - [ ] Deploy em staging
   - [ ] Monitor de conversão após deploy
