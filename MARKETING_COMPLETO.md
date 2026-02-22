# 🚀 ÓoDelivery - Sistema Completo de Gestão para Delivery

> **Do pedido à entrega, tudo em um só lugar**

---

## 📦 VISÃO GERAL DO SISTEMA

O **ÓoDelivery** é uma plataforma SaaS **multi-tenant** completa para gestão de restaurantes, pizzarias, lanchonetes e estabelecimentos de delivery.

### Stack Técnico

| Camada | Tecnologia |
|--------|------------|
| **Backend** | Laravel 11+ (PHP) |
| **Frontend** | React 18 + TypeScript + Inertia.js |
| **UI** | Tailwind CSS + shadcn/ui |
| **Banco de Dados** | MySQL/PostgreSQL |
| **Cache** | Redis |
| **Filas** | Laravel Queues |
| **WhatsApp** | Evolution API |
| **Pagamentos** | Stripe/MercadoPago |

### Posicionamento

> *"Seu delivery rodando no automático. Do pedido à entrega, você controla tudo em uma tela só."*

---

## 🎯 MÓDULOS DO SISTEMA

1. [Cardápio Digital](#1-cardápio-digital-) 🍽️
2. [Gestão de Pedidos](#2-gestão-de-pedidos-) 🛒
3. [Cozinha Integrada](#3-cozinha-integrada-) 🍳
4. [Entregadores & Frota](#4-entregadores--frota-) 🛵
5. [Programa de Fidelidade](#5-programa-de-fidelidade-) ⭐
6. [WhatsApp Integration](#6-whatsapp-integration-) 📱
7. [PDV & Mesas](#7-pdv--mesas-) 🏪
8. [Estoque & Ingredientes](#8-estoque--ingredientes-) 📦
9. [Cupons & Promoções](#9-cupons--promoções-) 🏷️
10. [Relatórios & Analytics](#10-relatórios--analytics-) 📊
11. [Configurações & Personalização](#11-configurações--personalização-) ⚙️
12. [Assinaturas & Planos](#12-assinaturas--planos-) 💳

---

## 1. CARDÁPIO DIGITAL 🍽️

### O Que Oferece

- Cardápio online profissional 24/7
- URL personalizada: `sualoja.com/seunegocio/menu`
- Design moderno e responsivo (mobile-first)
- Personalização total de cores e marca

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Venda 24 horas** | Fatura mesmo fechado |
| **Sem taxas por pedido** | Economia de 12-27% vs iFood |
| **Marca própria** | Cliente fiel ao SEU negócio |
| **Atualização instantânea** | Mudou preço? Atualiza na hora |
| **Controle de estoque** | Produto acabou? Some automático |

### Funcionalidades

- ✅ Categorias ilimitadas
- ✅ Produtos com fotos, descrição e preços
- ✅ Preço promocional (de/por)
- ✅ Selos: Destaque, Novo, Exclusivo, Promocional
- ✅ Complementos e adicionais (ex: borda recheada, adicionais)
- ✅ Controle de estoque por produto
- ✅ Modo de visualização: Grid ou Lista
- ✅ Ordenação personalizada (arrasta e solta)
- ✅ Ativar/desativar categoria com 1 clique

### Argumentos de Venda

> *"Seu cardápio sempre aberto, vendendo sem parar. Seu cliente pede às 3 da manhã, você recebe, e entrega às 8. Sem funcionário extra, sem telefone tocando."*

### Rotas do Sistema

```php
// Público (cliente final)
GET /{slug}/menu         // Cardápio público
GET /{slug}/demo         // Demonstração

// Administrativo (lojista)
GET  /cardapio           // Gestão do cardápio
POST /cardapio/reorder   // Reordenar categorias
POST /cardapio/categories/{id}/toggle  // Ativar/desativar
POST /cardapio/settings  // Configurações de visualização
```

---

## 2. GESTÃO DE PEDIDOS 🛒

### O Que Oferece

- Kanban visual de todos os pedidos
- Status em tempo real
- Filtros inteligentes
- Edição de pedidos sem cancelar

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Zero erros de anotação** | Cliente pede exatamente o que quer |
| **Organização visual** | Sabe o que está acontecendo em 1 olhar |
| **Edição rápida** | Cliente mudou o pedido? Resolve em 30s |
| **Histórico completo** | Sabe tudo que já vendeu |

### Funcionalidades

- ✅ **Kanban Drag-and-Drop** — Arraste pedidos entre colunas
- ✅ **Status do Pedido:**
  - 🆕 Novo
  - ⏱️ Preparando
  - ✅ Pronto / Aguardando
  - 🚚 Em Entrega
- ✅ **Filtros:**
  - Por bairro
  - Por motoboy
  - Por forma de pagamento
- ✅ **Edição de Pedidos:**
  - Adicionar/remover itens
  - Ajustar complementos
  - Recalcula total automaticamente
- ✅ **Impressão de Cupons**
- ✅ **Tempo estimado de preparo**
- ✅ **Alerta de pedidos atrasando**
- ✅ **Cancelamento com motivo**

### Argumentos de Venda

> *"Antes você anotava em papel, perdia pedido, errava o endereço. Agora tudo chega organizado, você arrasta o card e sabe exatamente o que fazer. Parece mágica, mas é tecnologia trabalhando pra você."*

### Rotas do Sistema

```php
GET  /orders                      // Lista de pedidos (Kanban)
GET  /orders/{id}/print           // Imprimir cupom
POST /orders/{id}/status          // Atualizar status
POST /orders/{id}/payment         // Atualizar pagamento
POST /orders/{id}/mode            // Mudar modo (delivery/pickup/table)
POST /orders/{id}/cancel          // Cancelar pedido
PUT  /orders/{id}/items           // Editar itens do pedido
POST /orders/{id}/start-preparation  // Iniciar preparo
```

---

## 3. COZINHA INTEGRADA 🍳

### O Que Oferece

- Tela exclusiva para cozinha
- Pedidos em ordem cronológica
- Chef marca quando está pronto

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Fim do papelzinho** | Não perde mais comanda |
| **Ordem de chegada** | FIFO: primeiro que entra, primeiro que sai |
| **Sem gritaria** | Cada um vê sua tela |
| **Controle de tempo** | Sabe o que está atrasando |

### Funcionalidades

- ✅ Visualização em tempo real
- ✅ Ordenado por mais antigo primeiro
- ✅ Destaque para prioritários
- ✅ Marcar como "Pronto" com 1 clique
- ✅ Integração com tela de pedidos

### Argumentos de Venda

> *"Sua cozinha organizada igual restaurante grande. Sem papel perdido, sem 'eu não vi esse pedido'. Todo mundo vê a mesma tela, todo mundo na mesma página."*

### Rotas do Sistema

```php
GET  /kitchen                  // Tela da cozinha
POST /kitchen/{id}/status      // Atualizar status do pedido
```

---

## 4. ENTREGADORES & FROTA 🛵

### O Que Oferece

- Cadastro de motoboys
- Atribuição de entregas
- Rastreamento de status
- Histórico de entregas

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Controle total da frota** | Sabe quem está com cada entrega |
| **Rota otimizada** | Agrupa pedidos por bairro |
| **Menos KM rodado** | Economia de combustível |
| **Avaliação de entregadores** | Sabe quem é mais eficiente |

### Funcionalidades

- ✅ Cadastro ilimitado de motoboys
- ✅ Atribuir entrega com 1 clique
- ✅ Notificação automática no WhatsApp
- ✅ Status: Disponível, Em Viagem, Entregue
- ✅ Histórico por entregador
- ✅ Agrupamento por bairro
- ✅ Múltiplos pedidos por viagem
- ✅ Avaliação pós-entrega

### Argumentos de Venda

> *"Você sabe exatamente qual motoboy está com qual pedido. Se o cliente ligar perguntando, você responde na hora: 'Seu pedido está com João, chegou há 5 minutos'. Profissionalismo que fideliza."*

### Rotas do Sistema

```php
// Gestão de Motoboys
GET  /motoboys                 // Lista de motoboys
POST /motoboys                 // Cadastrar motoboy
PUT  /motoboys/{id}            // Atualizar motoboy
DELETE /motoboys/{id}          // Remover motoboy

// Atribuição de entregas
POST /orders/{id}/assign-motoboy  // Atribuir motoboy ao pedido
```

---

## 5. PROGRAMA DE FIDELIDADE ⭐

### O Que Oferece

- Pontos por compra
- Níveis de fidelidade (tiers)
- Recompensas personalizáveis
- Resgate de pontos

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Cliente volta mais** | Aumento de 30-50% em repetição |
| **Ticket médio maior** | Cliente junta pontos para prêmio |
| **Diferencial competitivo** | iFood não tem fidelidade |
| **Dados do cliente** | Sabe quem são seus melhores clientes |

### Funcionalidades

- ✅ Pontos por real gasto (configurável)
- ✅ Níveis: Bronze, Prata, Ouro, Diamante
- ✅ Multiplicador por nível (ex: Ouro ganha 2x pontos)
- ✅ Resgate de pontos em desconto
- ✅ Promoções de pontos em dobro
- ✅ Histórico de pontos do cliente
- ✅ Pontos expiram (configurável)
- ✅ Indicação premiada (indique e ganhe pontos)

### Configurações Padrão

```
Pontos por R$ 1,00: 1 ponto
Valor para resgatar 1 ponto: R$ 0,10

Níveis:
  - Bronze: 0 pontos (1x multiplicador)
  - Prata: 500 pontos (1.5x multiplicador)
  - Ouro: 1500 pontos (2x multiplicador)
  - Diamante: 3000 pontos (3x multiplicador)
```

### Argumentos de Venda

> *"Seu cliente faz 10 pedidos no iFood, não ganha nada. Aqui, cada pedido vale pontos. Na 10ª compra ele já tem desconto. Adivinha onde ele vai pedir de novo? Exato, aqui."*

### Rotas do Sistema

```php
GET  /fidelidade                    // Painel de fidelidade
POST /fidelidade/settings           // Configurações
POST /fidelidade/adjust             // Ajuste manual de pontos
```

---

## 6. WHATSAPP INTEGRATION 📱

### O Que Oferece

- Integração com WhatsApp Business
- Mensagens automáticas por status
- Templates personalizáveis
- Envio de cupom fiscal

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Cliente sempre informado** | Menos ligações perguntando status |
| **Profissionalismo** | Mensagem padronizada e bonita |
| **Automação** | Não precisa lembrar de avisar |
| **Marketing incluso** | Envia cupom junto com pedido |

### Funcionalidades

- ✅ **Mensagens Automáticas:**
  - Pedido aceito
  - Saiu para preparo
  - Saiu para entrega
  - Pedido entregue
- ✅ **Templates Personalizáveis:**
  - Edite o texto de cada mensagem
  - Adicione seu tom de voz
- ✅ **Log de Mensagens:**
  - Sabe o que foi enviado
  - Vê se teve erro
- ✅ **Ativar/Desativar:**
  - Liga e desliga quando quiser
- ✅ **Integração Evolution API:**
  - WhatsApp oficial
  - Sem risco de banimento

### Argumentos de Venda

> *"Seu cliente pede, e automaticamente recebe: 'Seu pedido foi aceito!', 'Saiu para entrega!', 'Chegou!'. Parece que você tem 5 funcionários só pra avisar cliente. Mas é o ÓoDelivery fazendo isso de graça."*

### Rotas do Sistema

```php
GET  /whatsapp                    // Gestão do WhatsApp
POST /whatsapp/toggle             // Ativar/desativar mensagens
GET  /whatsapp/logs               // Log de mensagens
POST /whatsapp/templates          // Atualizar templates
POST /whatsapp/test-send          // Enviar teste
```

---

## 7. PDV & MESAS 🏪

### O Que Oferece

- Frente de caixa para vendas presenciais
- Gestão de mesas e comandas
- Conta aberta
- Transferência de mesa

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Venda balcão rápida** | Cliente não espera no delivery |
| **Mesas organizadas** | Sabe o que cada mesa pediu |
| **Conta dividida** | Facilita pagamento em grupo |
| **Integração total** | Mesmo sistema, delivery + salão |

### Funcionalidades

- ✅ **PDV (Ponto de Venda):**
  - Venda rápida no balcão
  - Impressão de cupom
  - Baixa no estoque
- ✅ **Gestão de Mesas:**
  - Mapa de mesas visual
  - Status: Livre, Ocupada, Reservada
  - Conta aberta por mesa
  - Adicionar itens na conta
  - Transferir conta entre mesas
  - Fechar conta com pagamento
- ✅ **Pagamentos:**
  - Dividir conta
  - Múltiplas formas de pagamento
  - Troco configurado

### Argumentos de Venda

> *"Você atende no salão e no delivery com o mesmo sistema. Cliente da mesa 5 pediu mais uma cerveja? Você adiciona na conta e pronto. Na hora de fechar, tudo junto. Sem confusão."*

### Rotas do Sistema

```php
// PDV
GET  /pdv                        // Frente de caixa
POST /pdv                        // Nova venda

// Mesas
GET  /tables                     // Lista de mesas
POST /tables                     // Criar mesa
POST /tables/{id}/open           // Abrir mesa
POST /tables/{id}/add-items      // Adicionar itens
POST /tables/{id}/close          // Fechar conta
POST /tables/{from}/transfer/{to} // Transferir mesa
POST /tables/{id}/close-account  // Fechar conta
```

---

## 8. ESTOQUE & INGREDIENTES 📦

### O Que Oferece

- Controle de ingredientes
- Baixa automática por venda
- Alerta de estoque baixo
- Ficha técnica do produto

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Não fica sem ingrediente** | Alerta antes de acabar |
| **Baixa automática** | Vendeu hambúrguer? Baixa pão, carne, queijo |
| **Precificação correta** | Sabe quanto custa cada produto |
| **Menos desperdício** | Sabe o que está parado |

### Funcionalidades

- ✅ Cadastro de ingredientes
- ✅ Ficha técnica por produto:
  - Hambúrguer = 1 pão + 1 carne + 1 fatia queijo
- ✅ Baixa automática ao vender
- ✅ Alerta de estoque mínimo
- ✅ Movimentações de estoque:
  - Entrada (compra)
  - Saída (venda/perda)
- ✅ Relatório de consumo
- ✅ Custo por produto

### Argumentos de Venda

> *"Vendeu 10 pizzas? O sistema já baixou 10kg de farinha, 5kg de queijo, 2kg de calabresa. Você sabe exatamente o que precisa comprar. Nunca mais fica sem ingrediente no meio do expediente."*

### Rotas do Sistema

```php
// Estoque
GET  /estoque                    // Lista de estoque
POST /estoque                    // Criar item de estoque
PUT  /estoque/{id}               // Atualizar estoque
DELETE /estoque/{id}             // Remover estoque

// Movimentações
GET  /stock/alerts               // Alertas de estoque baixo
GET  /stock/movements            // Histórico de movimentações

// Ingredientes
GET  /ingredients                // Lista de ingredientes
POST /ingredients                // Criar ingrediente
PUT  /ingredients/{id}           // Atualizar ingrediente
DELETE /ingredients/{id}         // Remover ingrediente
POST /ingredients/{id}/toggle    // Ativar/desativar
GET  /ingredients/{id}/impact    // Ver impacto nos produtos
```

---

## 9. CUPONS & PROMOÇÕES 🏷️

### O Que Oferece

- Criação de cupons de desconto
- Campanhas promocionais
- Validação automática
- Limite de usos

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Campanhas controladas** | Você define regras e validade |
| **Atrai novos clientes** | Cupom de primeira compra |
| **Recupera clientes** | Cupom pra quem não pede há 30 dias |
| **Aumenta ticket médio** | Cupom acima de R$ 50 |

### Funcionalidades

- ✅ **Tipos de Cupom:**
  - Desconto fixo (R$ 10 off)
  - Desconto percentual (15% off)
- ✅ **Regras:**
  - Valor mínimo do pedido
  - Válido até data X
  - Limite de usos (ex: 100 cupons)
  - Uso único por cliente
- ✅ **Códigos:**
  - Personalizados (PRIMEIRO10)
  - Aleatórios (X7K9M2)
- ✅ **Ativar/Desativar:**
  - Liga e desliga campanhas
- ✅ **Relatório de Uso:**
  - Quantos foram usados
  - Quanto descontou

### Argumentos de Venda

> *"Quer encher a casa na terça-feira fraca? Cria cupom 'TERCA20' com 20% de desconto. Manda no WhatsApp dos clientes. Em 2 horas você lota. Você controla quando, quanto e pra quem."*

### Rotas do Sistema

```php
// Cupons
GET  /coupons                    // Lista de cupons
POST /coupons                    // Criar cupom
PUT  /coupons/{id}               // Atualizar cupom
DELETE /coupons/{id}             // Remover cupom

// Validação
POST /subscription/validate-coupon  // Validar cupom
```

---

## 10. RELATÓRIOS & ANALYTICS 📊

### O Que Oferece

- Vendas por período
- Produtos mais vendidos
- Ticket médio
- Horário de pico
- Performance de motoboys

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Sabe o que vende** | Foca nos produtos lucrativos |
| **Identifica gargalos** | Sabe onde está perdendo tempo |
| **Previsão de demanda** | Sabe quanto comprar pra semana |
| **Decisão com dado** | Não chuta, sabe |

### Funcionalidades

- ✅ **Vendas:**
  - Hoje, semana, mês
  - Comparativo com período anterior
- ✅ **Produtos:**
  - Mais vendidos
  - Mais lucrativos
  - Parados (sem venda há 30 dias)
- ✅ **Clientes:**
  - Top 10 clientes
  - Clientes inativos (não pedem há X dias)
- ✅ **Entregas:**
  - Tempo médio de entrega
  - Bairro que mais pede
  - Performance por motoboy
- ✅ **Financeiro:**
  - Faturamento por dia/semana/mês
  - Forma de pagamento preferida
  - Ticket médio

### Argumentos de Venda

> *"Você acha que hambúrguer é o que mais vende. O relatório mostra que é pizza. Você muda o foco, destaca pizza no cardápio, e vende 40% a mais. Dado é poder."*

### Rotas do Sistema

```php
GET  /financeiro                 // Relatório financeiro
GET  /relatorios                 // Dashboard de relatórios
```

---

## 11. CONFIGURAÇÕES & PERSONALIZAÇÃO ⚙️

### O Que Oferece

- Personalização da marca
- Horário de funcionamento
- Zonas de entrega
- Formas de pagamento

### Benefícios para o Lojista

| Benefício | Impacto no Negócio |
|-----------|-------------------|
| **Cara de app grande** | Profissional desde o primeiro dia |
| **Regras do seu jeito** | Você manda no seu negócio |
| **Entrega controlada** | Cobra por bairro corretamente |
| **Pagamento flexível** | Aceita o que seu cliente quer |

### Funcionalidades

- ✅ **Marca:**
  - Logo e banner
  - Cores do tema
  - Redes sociais
  - Descrição da loja
- ✅ **Horário:**
  - Segunda a domingo
  - Intervalos
  - Aberto/fechado manual
  - Pausar delivery temporariamente
- ✅ **Entrega:**
  - Zonas por bairro
  - Taxa fixa ou por KM
  - Raio de entrega
  - Tempo estimado
- ✅ **Pagamento:**
  - PIX, Cartão, Dinheiro
  - Troco para quanto
  - Taxa de serviço (opcional)

### Argumentos de Venda

> *"Seu cardápio tem SUA cara. Sua cor, seu logo, seu jeito. Cliente abre e sabe que é VOCÊ. Não é um app genérico onde você é só mais um."*

### Rotas do Sistema

```php
GET  /settings                 // Configurações
POST /settings                 // Salvar configurações
POST /settings/upload-logo     // Upload de logo
DELETE /settings/remove-logo   // Remover logo
POST /settings/upload-banner   // Upload de banner
DELETE /settings/remove-banner // Remover banner

// Zonas de entrega
GET  /delivery-zones           // Lista de zonas
POST /delivery-zones           // Criar zona
PUT  /delivery-zones/{id}      // Atualizar zona
DELETE /delivery-zones/{id}    // Remover zona

// Formas de pagamento
GET  /payment-methods          // Lista de formas de pagamento
POST /payment-methods          // Criar forma de pagamento
PUT  /payment-methods/{id}     // Atualizar
DELETE /payment-methods/{id}   // Remover
```

---

## 12. ASSINATURAS & PLANOS 💳

### Plano Único - R$ 129,90/mês

**Tudo Ilimitado:**

| Recurso | Limite |
|---------|--------|
| Pedidos | Ilimitados |
| Produtos | Ilimitados |
| Usuários | Ilimitados |
| Motoboys | Ilimitados |
| Cupons | Ilimitados |
| Armazenamento | 999GB |

**Todas as Features Inclusas:**

- ✅ Gestão de motoboys
- ✅ Integração WhatsApp
- ✅ Impressão automática
- ✅ Programa de fidelidade
- ✅ Cardápio digital
- ✅ API de acesso
- ✅ Domínio personalizado
- ✅ Kanban view
- ✅ Suporte prioritário

**Sem Taxas Escondidas:**

- ❌ Sem taxa por pedido
- ❌ Sem taxa de instalação
- ❌ Sem fidelidade (cancela quando quiser)
- ❌ Sem watermark

### Argumentos de Venda

> *"iFood cobra 12-27% por pedido. Faz 100 pedidos de R$ 50 = R$ 5.000. Eles levam R$ 600-1.350. No ÓoDelivery você paga R$ 129,90 FIXO. Economia: R$ 470-1.220 POR MÊS. Em 1 ano: R$ 5.640-14.640 no bolso."*

### Rotas do Sistema

```php
GET  /assinatura               // Página de assinatura
GET  /subscription/upgrade     // Upgrade de plano
POST /subscription/validate-coupon  // Validar cupom
GET  /subscription/checkout/{plan}  // Checkout
POST /subscription/checkout/process // Processar pagamento
GET  /subscription/status      // Status da assinatura
```

---

## 🎯 PÚBLICO-ALVO

### Perfis de Clientes Ideais

| Perfil | Características | Dor Principal |
|--------|----------------|---------------|
| **Hamburgueria** | 50-200 pedidos/dia, 2-5 motoboys | Perde pedido, demora pra entregar |
| **Pizzaria** | 100-300 pedidos/noite, cozinha grande | Cozinha caótica, atrasos |
| **Restaurante** | Delivery + Salão, mesas | Dois sistemas, dupla trabalho |
| **Lanchonete** | Balcão + WhatsApp | Anota no papel, erra muito |
| **Confeitaria** | Pedidos sob encomenda | Controle de produção |
| **Cervejaria** | Mesas + Delivery | Conta de mesa bagunçada |
| **Delivery Japonês** | Ticket alto, cliente exigente | Erro no pedido = cliente perdido |

---

## 💰 ROI & ECONOMIA

### Comparativo: ÓoDelivery vs. iFood

| Cenário | iFood | ÓoDelivery | Economia |
|---------|-------|------------|----------|
| 100 pedidos/mês (R$ 50) | R$ 600 (12%) | R$ 129,90 | R$ 470,10 |
| 300 pedidos/mês (R$ 50) | R$ 1.800 (12%) | R$ 129,90 | R$ 1.670,10 |
| 500 pedidos/mês (R$ 50) | R$ 4.500 (18%) | R$ 129,90 | R$ 4.370,10 |
| 1000 pedidos/mês (R$ 50) | R$ 9.000 (18%) | R$ 129,90 | R$ 8.870,10 |

### Benefícios Financeiros

```
Economia Anual (300 pedidos/mês): R$ 20.041,20
Economia Anual (500 pedidos/mês): R$ 52.441,20
Economia Anual (1000 pedidos/mês): R$ 106.441,20
```

### Outras Economias

| Item | Economia Mensal |
|------|-----------------|
| Não precisa de 2 funcionários pra atender telefone | R$ 3.000,00 |
| Não perde mais pedido por anotação errada | R$ 2.000,00 |
| Não precisa de sistema separado pra cozinha | R$ 200,00 |
| Não usa planilha pra controle de estoque | R$ 100,00 |

**Economia Total Mensal: R$ 5.300+**

---

## 🔥 DIFERENCIAIS COMPETITIVOS

### ÓoDelivery vs. Concorrência

| Feature | ÓoDelivery | iFood | Sistema Genérico |
|---------|------------|-------|------------------|
| Taxa por pedido | 0% | 12-27% | 0% |
| Mensalidade | R$ 129 | Grátis (mas taxa alta) | R$ 200-500 |
| Cardápio próprio | ✅ Sim | ❌ Não | ✅ Sim |
| WhatsApp incluso | ✅ Sim | ❌ Não | ❌ À parte |
| Fidelidade | ✅ Sim | ❌ Não | ❌ À parte |
| Kanban visual | ✅ Sim | ❌ Não | ❌ Não |
| Edição de pedidos | ✅ Sim | ❌ Não | ⚠️ Às vezes |
| Tela de cozinha | ✅ Sim | ❌ Não | ❌ À parte |
| Frota própria | ✅ Sim | ⚠️ iFood Entregas | ❌ À parte |
| Suporte | ✅ Humanizado | ❌ Robô | ⚠️ Variável |
| Setup | ✅ 1 dia | ✅ Instantâneo | ⚠️ 1-2 semanas |
| Fidelidade (contrato) | ❌ Sem | ✅ 12 meses | ✅ 12 meses |

---

## 📈 MÉTRICAS DE SUCESSO

### O Que o Cliente Ganha

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Pedidos perdidos/dia | 5-10 | 0-1 | -90% |
| Tempo de atendimento | 10-15 min | 2-3 min | -80% |
| Erros de pedido | 15% | 2% | -87% |
| Ticket médio | R$ 45 | R$ 55 | +22% |
| Repetição de clientes | 20% | 45% | +125% |
| Tempo de entrega | 50 min | 35 min | -30% |

---

## 🎬 SCRIPTS DE VENDA

### Elevator Pitch (30 segundos)

> *"ÓoDelivery é um sistema completo pra quem vive de delivery. Você recebe pedidos do cardápio online, organiza num quadro visual, manda pra cozinha, atribui pro motoboy e avisa o cliente no WhatsApp. Tudo automático. E o melhor: sem taxa por pedido. Você paga R$ 129 fixo e vende o quanto quiser."*

### Quebra de Objeção: "Tá caro"

> *"Caro é pagar 27% pro iFood. Faz 200 pedidos de R$ 50 lá = R$ 2.700 de taxa. Aqui você paga R$ 129. Economia de R$ 2.571. Caro é perder 10 pedidos por dia porque atende no papel. Cada pedido perdido é R$ 50. Em 30 dias: R$ 15.000. ÓoDelivery se paga em 3 dias. O resto é lucro."*

### Fechamento

> *"Você quer continuar perdendo pedido, errando endereço e pagando taxa abusiva? Ou quer ter controle total, cliente feliz e mais lucro no bolso? Posso liberar seu acesso hoje. Amanhã você já tá vendendo pelo sistema. Bora?"*

---

## 📱 CONTEÚDO PARA REDES SOCIAIS

### Instagram - Posts Sugeridos

#### Post 1: Dor

> *"Quantos pedidos você perdeu hoje porque tava atendendo telefone? 📞❌ Cada pedido perdido é dinheiro no bolso do concorrente. Com ÓoDelivery, pedido chega automático. Você só confirma e manda preparar. Quer parar de perder venda? Comenta 'EU QUERO'."*

#### Post 2: Prova Social

> *"A Hamburgueria X faturava R$ 30k/mês no iFood. Pagava R$ 6.600 de taxa. Migrou pro ÓoDelivery, hoje fatura R$ 45k e paga R$ 129 fixo. Economia anual: R$ 77.400. Quer ser o próximo? Link na bio."*

#### Post 3: Feature

> *"Sabia que seu cliente pode pedir às 3 da manhã e você só confirma às 8? 🌙 Cardápio ÓoDelivery fica aberto 24h. Você programa, esquece, e continua vendendo. Isso é liberdade. Quer no seu negócio? Manda DM."*

#### Post 4: Comparação

> *"iFood: 27% de taxa. ÓoDelivery: R$ 129/mês.
> 100 pedidos de R$ 50 = R$ 1.350 vs R$ 129.
> 500 pedidos de R$ 50 = R$ 6.750 vs R$ 129.
> A conta é simples. Qual você escolhe? 🤔"*

### WhatsApp - Mensagens Prontas

#### Para Lead Quente

> *"Oi [Nome]! Tudo bem? Aqui é [Seu Nome] do ÓoDelivery. Vi que você tem interesse em organizar seu delivery. Posso te mostrar como a [Hamburgueria X] economizou R$ 5.000/mês migrando pro nosso sistema? Me diz um horário que te ligo rapidinho!"*

#### Follow-up

> *"Oi [Nome]! Passando pra saber se você conseguiu ver aquela proposta. Lembra que você me disse que perde uns 5 pedidos por dia? Com ÓoDelivery isso acaba. E o sistema se paga em 3 dias. Bora agendar uma demonstração? Essa semana tô com condição especial de implantação!"*

---

## 🎯 CALL TO ACTION

### Para o Site

> *"Pare de pagar taxa abusiva. Comece hoje mesmo. 7 dias grátis, sem cartão de crédito."*

### Para WhatsApp

> *"Quer ver funcionando? Manda 'DEMO' que te mostro em 5 minutos como seu delivery vai rodar no automático."*

### Para Instagram

> *"Link na bio pra testar grátis. Em 10 minutos você tá com cardápio no ar."*

---

## 📚 MATERIAIS DE APOIO SUGERIDOS

1. **Vídeo Demo (2 min)** — Tour completo pelo sistema
2. **Case de Sucesso (PDF)** — História de clientes reais
3. **Calculadora de Economia** — Quanto você economiza vs iFood
4. **Checklist de Migração** — Como migrar em 1 dia
5. **Template de Cardápio** — Modelos prontos pra usar
6. **Guia de WhatsApp** — Como configurar mensagens automáticas
7. **Planilha de ROI** — Retorno em 30/60/90 dias

---

## ✅ CHECKLIST DE IMPLANTAÇÃO

### Dia 1

- [ ] Criar conta
- [ ] Cadastrar produtos
- [ ] Subir logo e banner
- [ ] Configurar zonas de entrega
- [ ] Cadastrar motoboys
- [ ] Configurar WhatsApp

### Dia 2

- [ ] Testar pedido demo
- [ ] Treinar equipe
- [ ] Imprimir cardápio físico com QR Code
- [ ] Mandar mensagem pra base de clientes

### Dia 3

- [ ] Ir pra produção
- [ ] Monitorar primeiros pedidos
- [ ] Ajustar tempos de preparo
- [ ] Celebrar primeira venda! 🎉

---

## 📖 GLOSSÁRIO TÉCNICO

| Termo | Significado |
|-------|-------------|
| **Tenant** | Um estabelecimento/cliente no sistema |
| **Multi-tenant** | Arquitetura onde múltiplos clientes usam o mesmo sistema com dados isolados |
| **Kanban** | Quadro visual de colunas para organizar fluxo de trabalho |
| **FIFO** | First In, First Out (primeiro que entra, primeiro que sai) |
| **Ticket médio** | Valor médio gasto por pedido |
| **ROI** | Return on Investment (Retorno sobre Investimento) |
| **Lead** | Cliente potencial interessado |
| **Follow-up** | Acompanhamento de vendas |
| **CTA** | Call to Action (Chamada para ação) |

---

## 📞 SUPORTE & CONTATO

### Canais de Atendimento

- **WhatsApp:** (XX) XXXXX-XXXX
- **E-mail:** suporte@oodelivery.com.br
- **Horário:** Seg-Sex, 9h às 18h
- **Tempo de Resposta:** Até 2 horas úteis

### Base de Conhecimento

- Tutoriais em vídeo
- FAQ completo
- Guias de configuração
- API Documentation

---

**Documento criado:** Fevereiro de 2026  
**Versão:** 1.0  
**Última atualização:** 22/02/2026

---

*© 2026 ÓoDelivery. Todos os direitos reservados.*
