# Pontos de Melhoria: Página de Vendas e Planos

Este documento lista sugestões de melhoria para a Landing Page (`Welcome.tsx`) e página de Planos (`Welcome/Plans.tsx`) visando aumento de conversão e melhor experiência do usuário.

## 1. Landing Page (Página de Vendas)

### Copywriting e Conteúdo
- [x] **Prova Social:** Adicionar uma seção de "Quem usa e recomenda" ou depoimentos reais de donos de restaurantes. Isso aumenta drasticamente a confiança.
- [ ] **Sensação de Urgência/Facilidade:** Reforçar o "Comece em menos de 5 minutos". Mostrar um passo a passo visual simples (Cadastro -> Cardápio -> Venda).   
- [ ] **Demonstração Interativa:** Adicionar um botão "Ver Cardápio Demo" que abre um cardápio de exemplo em uma nova aba ou modal, para o cliente sentir a experiência do usuário final.

### Visual e UX
- [ ] **Vídeo Hero:** Substituir ou complementar a imagem principal por um vídeo curto (loop) mostrando um pedido chegando no WhatsApp/Painel.
- [ ] **Animações de Scroll:** Utilizar animações sutis de entrada (fade-in, slide-up) nos elementos conforme o usuário rola a página para dar mais dinamismo.
- [ ] **Sticky CTA:** Em mobile, manter um botão "Começar Grátis" fixo no rodapé ou topo ao rolar a página.

### SEO e Performance
- [ ] **Meta Tags Otimizadas:** Garantir que títulos e descrições estejam focados em palavras-chave como "Cardápio Digital Grátis", "Sistema Delivery WhatsApp".
- [ ] **Lazy Loading:** Confirmar carregamento assíncrono de imagens fora da primeira dobra.

## 2. Página de Planos (Pricing)

### Estrutura de Oferta
- [x] **Comparativo Detalhado:** Adicionar uma tabela comparativa completa abaixo dos cards. Cards resumem, a tabela tira dúvidas técnicas (ex: Quantos produtos? Tem SSL? Tem suporte?).
- [x] **Toggle Anual/Mensal:** Implementar opção de pagamento anual com desconto (ex: "Pague o ano e ganhe 2 meses"). Isso melhora o fluxo de caixa.
- [ ] **Destaque do "Gap":** Deixar extramemente claro o que o plano Grátis **NÃO** tem que o Pro tem. Ex: "No plano Grátis você tem X, mas no Pro você desbloqueia a Gestão de Motoboys".
- [x] **Garantia:** Adicionar selo de "7 dias de garantia" ou "Cancele a qualquer momento" próximo aos botões de ação para reduzir atrito.

### UI/UX dos Cards
- [ ] **Ancoragem de Preço:** Se houver um plano 'Enterprise' ou mais caro, certifique-se que ele faça o plano 'Pro' parecer barato (efeito Decoy).
- [ ] **Tooltips:** Nos itens de feature (ícones de Check), adicionar tooltips (?) explicando o que é aquela funcionalidade técnica.

## 3. Geral / Técnico
- [ ] **Tracking:** Implementar eventos de conversão (Pixel do Facebook, Google Ads) nos botões de "Começar Grátis" e "Assinar".
- [ ] **Chat de Vendas:** Botão de WhatsApp flutuante específico para dúvidas comerciais (diferente do suporte técnico).

## 4. Gestão de Assinatura (Subscription Management)

### Painel de Assinatura do Cliente
- [ ] **Dashboard de Uso:** Exibir gráficos visuais de uso atual vs. limites do plano (produtos, usuários, pedidos, motoboys).
- [ ] **Alertas Proativos:** Notificar quando o cliente estiver próximo de atingir limites (ex: "Você usou 8 de 10 produtos disponíveis").
- [ ] **Histórico de Faturas:** Permitir visualizar e baixar faturas anteriores em PDF.
- [ ] **Próxima Cobrança:** Exibir claramente data e valor da próxima cobrança com opção de alterar forma de pagamento.

### Transparência e Confiança
- [ ] **Cálculo de Upgrade:** Ao fazer upgrade, mostrar cálculo proporcional (pro-rata) do valor a ser cobrado.
- [ ] **Preview de Mudança:** Antes de confirmar mudança de plano, mostrar comparativo "O que você tem agora" vs. "O que você terá".
- [ ] **Confirmação de Cancelamento:** Ao cancelar, mostrar o que será perdido e oferecer alternativas (ex: pausar assinatura por 30 dias).

## 5. Fluxo de Upgrade/Downgrade

### Experiência de Upgrade
- [ ] **Upsell Contextual:** Quando o cliente atingir um limite (ex: 10 produtos), exibir modal sugerindo upgrade com benefícios claros.
- [ ] **Upgrade Sem Fricção:** Permitir upgrade com 1 clique se já houver forma de pagamento cadastrada.
- [ ] **Destaque de Benefícios:** Ao sugerir upgrade, destacar funcionalidades específicas que o cliente ganhará (não apenas "mais limites").
- [ ] **Trial do Plano Superior:** Oferecer 7 dias grátis do plano Pro para clientes do Free testarem antes de assinar.

### Experiência de Downgrade
- [x] **Análise de Impacto:** Mostrar claramente o que será desativado ao fazer downgrade (ex: "3 produtos serão desativados", "2 motoboys serão removidos").
- [ ] **Seleção de Itens:** Permitir que o cliente escolha quais itens manter/desativar ao fazer downgrade.
- [x] **Retenção Ativa:** Antes de confirmar downgrade, oferecer desconto temporário ou plano intermediário.
- [x] **Feedback de Saída:** Perguntar o motivo do downgrade (preço, funcionalidades, suporte) para melhorar o produto.

## 6. Experiência de Trial (Período de Teste)

### Onboarding do Trial
- [x] **Checklist de Ativação:** Guia passo a passo para o cliente configurar tudo durante o trial (Cardápio → Pedido Teste → Integração WhatsApp).
- [x] **Contador de Trial:** Exibir banner discreto mostrando "X dias restantes no seu período de teste".
- [ ] **Email de Boas-Vindas:** Série de emails educativos durante o trial (Dia 1: Como configurar, Dia 3: Dicas de venda, Dia 7: Lembrete de expiração).

### Conversão de Trial
- [ ] **Notificações de Expiração:** Avisar com 3 dias, 1 dia e no dia da expiração do trial.
- [ ] **Incentivo de Conversão:** Oferecer desconto especial para quem assinar antes do trial acabar (ex: "20% off no primeiro mês").
- [ ] **Demonstração de Valor:** Durante o trial, mostrar métricas de sucesso (ex: "Você já recebeu 15 pedidos! Continue vendendo assinando agora").

## 7. Formas de Pagamento e Checkout

### Métodos de Pagamento
- [ ] **Múltiplas Opções:** Suportar cartão de crédito, Pix, boleto bancário.
- [ ] **Pagamento Recorrente:** Integração com gateways (Stripe, Mercado Pago, PagSeguro) para cobrança automática.
- [ ] **Cartão Salvo:** Permitir salvar dados do cartão com segurança (tokenização) para renovações automáticas.
- [ ] **Atualização de Cartão:** Notificar e facilitar atualização quando cartão estiver próximo de expirar.

### Processo de Checkout
- [ ] **Checkout Simplificado:** Reduzir campos ao mínimo necessário (nome, email, CPF/CNPJ, forma de pagamento).
- [ ] **Indicador de Segurança:** Exibir selos de segurança (SSL, PCI Compliance) para aumentar confiança.
- [ ] **Resumo Visual:** Sidebar fixo mostrando plano selecionado, valor e próxima cobrança durante checkout.
- [ ] **Recuperação de Carrinho:** Se o cliente abandonar o checkout, enviar email lembrando de completar a assinatura.

### Falhas de Pagamento
- [ ] **Retry Automático:** Tentar cobrar novamente automaticamente após falha (3x em dias alternados).
- [ ] **Notificação de Falha:** Email e notificação no painel alertando sobre falha de pagamento.
- [ ] **Atualização Fácil:** Link direto para atualizar forma de pagamento sem precisar fazer login.
- [ ] **Período de Graça:** Dar 5-7 dias de período de graça antes de suspender a conta por falta de pagamento.

## 8. Retenção e Redução de Churn

### Estratégias de Retenção
- [ ] **Pesquisa de Satisfação:** Enviar NPS (Net Promoter Score) periodicamente para identificar clientes insatisfeitos.
- [ ] **Programa de Indicação:** Oferecer desconto ou créditos para clientes que indicarem novos usuários.
- [ ] **Suporte Proativo:** Identificar clientes inativos (sem pedidos há 7 dias) e oferecer ajuda via WhatsApp.
- [ ] **Conteúdo Educativo:** Blog, vídeos e webinars ensinando boas práticas de vendas online.

### Prevenção de Cancelamento
- [ ] **Oferta de Retenção:** Ao tentar cancelar, oferecer desconto de 20-30% por 3 meses.
- [ ] **Pausa de Assinatura:** Permitir pausar assinatura por 30-60 dias ao invés de cancelar definitivamente.
- [ ] **Downgrade ao invés de Cancelar:** Sugerir plano gratuito ao invés de cancelamento total.
- [ ] **Entrevista de Saída:** Para clientes que cancelarem, agendar call rápida para entender motivos e melhorar.

### Reativação de Clientes
- [ ] **Campanha de Winback:** Email automático 30 dias após cancelamento oferecendo retorno com desconto.
- [ ] **Novidades e Melhorias:** Avisar clientes cancelados sobre novas funcionalidades que podem interessá-los.
- [ ] **Oferta Especial:** Desconto agressivo (50% off por 3 meses) para clientes que cancelaram há mais de 6 meses.

## 9. Analytics e Otimização

### Métricas de Conversão
- [ ] **Funil de Conversão:** Rastrear Landing Page → Cadastro → Trial → Assinatura Paga.
- [ ] **Taxa de Abandono:** Identificar em que etapa os clientes abandonam o processo.
- [ ] **A/B Testing:** Testar diferentes versões de copy, preços e CTAs para otimizar conversão.
- [ ] **Heatmaps:** Usar ferramentas como Hotjar para entender comportamento na página de preços.

### Métricas de Retenção
- [ ] **Churn Rate:** Calcular taxa de cancelamento mensal e identificar padrões.
- [ ] **LTV (Lifetime Value):** Calcular valor médio que cada cliente gera ao longo do tempo.
- [ ] **MRR (Monthly Recurring Revenue):** Acompanhar receita recorrente mensal e crescimento.
- [ ] **Cohort Analysis:** Analisar retenção por coorte (mês de cadastro) para identificar melhorias.

## 10. Prioridades de Implementação (Roadmap Atualizado)

### Alta Prioridade (Impacto Imediato na Receita)
1. **Conversão:** Comparativo Detalhado de Planos, Toggle Anual/Mensal, Garantia Visível.
2. **Retenção:** Alertas Proativos de Limite, Oferta de Retenção ao Cancelar, Período de Graça.
3. **Pagamento:** Múltiplas Formas de Pagamento, Retry Automático, Notificação de Falha.

### Média Prioridade (Melhoria de Experiência)
4. **Trial:** Checklist de Ativação, Contador de Trial, Incentivo de Conversão.
5. **Upgrade/Downgrade:** Upsell Contextual, Análise de Impacto, Trial do Plano Superior.
6. **Transparência:** Histórico de Faturas, Cálculo de Upgrade, Preview de Mudança.

### Baixa Prioridade (Otimização e Crescimento)
7. **Marketing:** Prova Social, Vídeo Hero, Demonstração Interativa.
8. **Analytics:** Funil de Conversão, A/B Testing, Cohort Analysis.
9. **Reativação:** Campanha de Winback, Oferta Especial, Entrevista de Saída.

