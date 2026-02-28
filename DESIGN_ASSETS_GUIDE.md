# 🎨 Guia de Artes Visuais — ÓoDelivery

> **Briefing completo para designer ou produção própria**  
> **Versão:** 26/02/2026

---

## 📋 Índice

1. [Identidade Visual](#identidade-visual)
2. [Paleta de Cores](#paleta-de-cores)
3. [Tipografia](#tipografia)
4. [Posts Instagram (10)](#posts-instagram-10)
5. [Stories (15)](#stories-15)
6. [Reels (5)](#reels-5)
7. [Facebook Ads (4)](#facebook-ads-4)
8. [Google Ads Display](#google-ads-display)
9. [Email Header](#email-header)
10. [Landing Page Assets](#landing-page-assets)

---

## 🎨 Identidade Visual

### Conceito da Marca

**ÓoDelivery** = **Automação + Profissionalismo + Agilidade**

**Elementos Chave:**
- 🤖 Robô amigável (ÓoBot) — personificação da automação
- 🚀 Foguete — velocidade, crescimento
- 📱 Smartphone — tecnologia mobile-first
- 🍕 Food icons — contexto de restaurante/delivery

### Estilo Visual

| Atributo | Descrição |
|----------|-----------|
| **Estilo** | Moderno, clean, tech |
| **Tom** | Profissional mas acessível |
| **Vibe** | Startup tech + food service |
| **Referências** | iFood (cores), Stripe (clean), Nubank (tech) |

---

## 🎨 Paleta de Cores

### Cores Primárias

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Óo Purple** | `#7C3AED` | 124, 58, 237 | Cor principal, CTAs |
| **Óo Dark** | `#1F2937` | 31, 41, 55 | Textos, fundos escuros |
| **Óo White** | `#FFFFFF` | 255, 255, 255 | Fundos, textos escuros |

### Cores Secundárias

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Success Green** | `#10B981` | 16, 185, 129 | Confirmações, sucesso |
| **Alert Orange** | `#F59E0B` | 245, 158, 11 | Alertas, atenção |
| **Error Red** | `#EF4444` | 239, 68, 68 | Erros, urgência |
| **Info Blue** | `#3B82F6` | 59, 130, 246 | Informações, links |

### Cores de Apoio

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Light Gray** | `#F3F4F6` | 243, 244, 246 | Fundos secundários |
| **Medium Gray** | `#9CA3AF` | 156, 163, 175 | Textos secundários |
| **Border Gray** | `#E5E7EB` | 229, 231, 235 | Bordas, divisórias |

### Gradientes

```css
/* Gradiente Principal (Hero, CTAs) */
background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);

/* Gradiente Secundário (Features) */
background: linear-gradient(135deg, #10B981 0%, #059669 100%);

/* Gradiente Alerta (Ofertas) */
background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
```

---

## 📝 Tipografia

### Fontes Principais

| Uso | Fonte | Peso | Tamanho |
|-----|-------|------|---------|
| **Títulos** | Inter Bold | 700 | 32-48px |
| **Subtítulos** | Inter SemiBold | 600 | 24-32px |
| **Corpo** | Inter Regular | 400 | 16-18px |
| **Legendas** | Inter Light | 300 | 14px |
| **CTA Buttons** | Inter Bold | 700 | 18px |

### Hierarquia

```
H1: 48px / Bold / #1F2937
H2: 36px / Bold / #1F2937
H3: 24px / SemiBold / #1F2937
Body: 16px / Regular / #4B5563
Small: 14px / Regular / #6B7280
```

---

## 📸 Posts Instagram (10)

### Post 1 — Lançamento

**Formato:** Quadrado 1080x1080px

**Layout:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Roxo]    │
│                              │
│      🚀                     │
│                              │
│   CHEGOU A REVOLUÇÃO        │
│      DO DELIVERY!           │
│                              │
│   [Mockup Dashboard]         │
│   (imagem do sistema)        │
│                              │
│   ✅ Cardápio Digital        │
│   ✅ WhatsApp Automático     │
│   ✅ PDV Integrado           │
│   ✅ Motoboy                 │
│   ✅ Fidelidade              │
│                              │
│   R$129,90/mês               │
│                              │
│   [BOTÃO: TESTE GRÁTIS]      │
│                              │
│   @oodelivery | #OoDelivery  │
└─────────────────────────────┘
```

**Elementos:**
- Fundo: Gradiente `#7C3AED → #6D28D9`
- Ícone foguete: Emoji ou SVG branco
- Mockup: Dashboard real do sistema (captura de tela)
- Checkmarks: `#10B981` (verde)
- Preço: Branco, 32px Bold
- Botão: Branco com texto roxo

**Arquivos necessários:**
- `post-01-lancamento.png`
- Mockup dashboard (exportar do Figma/Photoshop)

---

### Post 2 — Dor do Cliente

**Formato:** Quadrado 1080x1080px

**Layout:**
```
┌─────────────────────────────┐
│  [Fundo: Cinza Claro]       │
│                              │
│   😫 CANSADO DE...          │
│                              │
│   [Foto: Dono estressado    │
│    com 5 celulares]          │
│                              │
│   ❌ Perder vendas no WhatsApp?  │
│   ❌ Pagar 27% pro iFood?   │
│   ❌ Não controlar entregas?│
│   ❌ Clientes que não voltam?│
│                              │
│   [Seta apontando pra baixo]│
│                              │
│   ✨ TEMOS A SOLUÇÃO!        │
│                              │
│   @oodelivery                │
└─────────────────────────────┘
```

**Elementos:**
- Foto: Banco de imagens (dono de restaurante estressado)
- Ícones: ❌ em vermelho `#EF4444`
- Seta: Animada (se for carrossel) ou estática
- Texto solução: Gradiente verde

**Arquivos necessários:**
- `post-02-dor.png`
- Foto stock (Unsplash/Pexels)

---

### Post 3 — Feature: ÓoBot

**Formato:** Carrossel 1080x1080px (3 slides)

**Slide 1:**
```
┌─────────────────────────────┐
│  [Fundo: Azul Tech]         │
│                              │
│      🤖                     │
│                              │
│   CONHEÇA O ÓOBOT           │
│                              │
│   Seu atendente 24/7        │
│                              │
│   [Ícone WhatsApp]          │
│                              │
│   Arrasta →                 │
│                              │
└─────────────────────────────┘
```

**Slide 2:**
```
┌─────────────────────────────┐
│  [Fundo: Branco]            │
│                              │
│   [Mockup conversa WhatsApp]│
│                              │
│   Cliente: "Quero pizza"    │
│   ÓoBot: "Qual sabor?"      │
│   Cliente: "Calabresa"      │
│   ÓoBot: "Pedido confirmado!│
│          30-40 min 🍕"      │
│                              │
│   [Setas entre mensagens]   │
│                              │
└─────────────────────────────┘
```

**Slide 3:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Roxo]    │
│                              │
│   ✅ Confirma pedidos       │
│   ✅ Atualiza status        │
│   ✅ Responde dúvidas       │
│   ✅ Envia cardápio         │
│                              │
│   [BOTÃO: QUERO O ÓOBOT]    │
│                              │
│   @oodelivery                │
└─────────────────────────────┘
```

**Arquivos necessários:**
- `post-03-oobot-1.png`
- `post-03-oobot-2.png`
- `post-03-oobot-3.png`
- Mockup WhatsApp (criar no Figma)

---

### Post 4 — Feature: Fidelidade

**Formato:** Quadrado 1080x1080px

**Layout:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Dourado] │
│                              │
│   🎁 CLIENTE FIEL           │
│      PEDE MAIS!             │
│                              │
│   [4 Medalhas alinhadas]    │
│   🥉 Bronze  0-499 pts      │
│   🥈 Silver  500-1999 pts   │
│   🥇 Gold    2000-4999 pts  │
│   💎 Platinum 5000+ pts     │
│                              │
│   📈 +40% recorrência       │
│   📈 +25% ticket médio      │
│   📈 +60% LTV               │
│                              │
│   [BOTÃO: FIDELIZAR]        │
│                              │
└─────────────────────────────┘
```

**Elementos:**
- Medalhas: SVGs coloridos (bronze, prata, ouro, diamante)
- Gradiente: `#F59E0B → #D97706`
- Ícones gráfico: `#10B981`

**Arquivos necessários:**
- `post-04-fidelidade.png`
- SVGs medalhas

---

### Post 5 — Comparação

**Formato:** Quadrado 1080x1080px

**Layout:**
```
┌─────────────────────────────┐
│  [Fundo: Branco]            │
│                              │
│   💰 FAÇA AS CONTAS         │
│                              │
│   [Tabela comparativa]      │
│                              │
│   ┌─────────┬─────────┐     │
│   │  iFood  │  ÓoDelivery│   │
│   ├─────────┼─────────┤     │
│   │  27%    │   0%    │     │
│   │  R$2.700│  R$129  │     │
│   │   ❌    │   ✅    │     │
│   └─────────┴─────────┘     │
│                              │
│   Economia: R$3.270/mês!    │
│                              │
│   [BOTÃO: QUERO ECONOMIZAR] │
│                              │
└─────────────────────────────┘
```

**Elementos:**
- iFood: Coluna com fundo vermelho claro
- ÓoDelivery: Coluna com fundo verde claro
- Números: Grandes, em destaque
- Economia: Destaque em gradiente verde

**Arquivos necessários:**
- `post-05-comparacao.png`

---

### Post 6 — Feature: Zonas de Entrega

**Formato:** Quadrado 1080x1080px

**Layout:**
```
┌─────────────────────────────┐
│  [Fundo: Azul Tech]         │
│                              │
│   🗺️ ENTREGA INTELIGENTE    │
│                              │
│   [Mapa Google com          │
│    polígonos coloridos]     │
│                              │
│   ✅ Zonas personalizadas   │
│   ✅ Taxas por região       │
│   ✅ Validação automática   │
│   ✅ Tempo estimado         │
│                              │
│   [BOTÃO: CONFIGURAR ZONAS] │
│                              │
└─────────────────────────────┘
```

**Elementos:**
- Mapa: Screenshot do Google Maps com polígonos
- Polígonos: Cores diferentes para cada zona
- Ícones: Branco com sombra

**Arquivos necessários:**
- `post-06-zonas.png`
- Mapa com polígonos (exportar do sistema)

---

### Post 7 — Feature: PDV

**Formato:** Quadrado 1080x1080px

**Layout:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Escuro]  │
│                              │
│   🖥️ SEU PDV DIGITAL        │
│                              │
│   [Foto: Touch screen PDV]  │
│                              │
│   ✅ Frente de caixa        │
│   ✅ Controle de estoque    │
│   ✅ Fechamento de turno    │
│   ✅ Impressão térmica      │
│                              │
│   [BOTÃO: VER DEMO]         │
│                              │
└─────────────────────────────┘
```

**Elementos:**
- Foto: Mockup de touch screen ou tablet
- Gradiente: `#1F2937 → #374151`
- Ícones: Branco

**Arquivos necessários:**
- `post-07-pdv.png`
- Mockup PDV (foto ou render)

---

### Post 8 — Feature: Motoboy

**Formato:** Quadrado 1080x1080px

**Layout:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Laranja] │
│                              │
│   🛵 GESTÃO DE MOTOBOYS     │
│                              │
│   [Mockup App Motoboy]      │
│   (mapa com localização)    │
│                              │
│   📍 Tracking em tempo real │
│   🗺️ Rotas otimizadas      │
│   📦 Histórico de entregas  │
│   ⭐ Sistema de avaliação   │
│                              │
│   [BOTÃO: GERENCIAR FROTA]  │
│                              │
└─────────────────────────────┘
```

**Elementos:**
- Gradiente: `#F59E0B → #D97706`
- Mockup: App do motoboy com mapa
- Ícones: Branco

**Arquivos necessários:**
- `post-08-motoboy.png`
- Mockup app (exportar do sistema)

---

### Post 9 — Prova Social

**Formato:** Quadrado 1080x1080px

**Layout:**
```
┌─────────────────────────────┐
│  [Fundo: Branco]            │
│                              │
│   ⭐⭐⭐⭐⭐                  │
│                              │
│   [Foto do Cliente]         │
│   (Ricardo, Pizzaria)       │
│                              │
│   "Mudou meu delivery!      │
│   +45% de vendas em 3       │
│   meses."                   │
│                              │
│   — Ricardo                 │
│   Pizzaria Bella Napoli     │
│                              │
│   📊 Resultados:            │
│   +45% vendas               │
│   -80% tempo WhatsApp       │
│   +60% fidelização          │
│                              │
└─────────────────────────────┘
```

**Elementos:**
- Foto: Cliente real (ou banco de imagens)
- Estrelas: `#F59E0B` (dourado)
- Citação: Itálico, aspas grandes
- Resultados: Verde `#10B981`

**Arquivos necessários:**
- `post-09-depoimento.png`
- Foto cliente (autorização necessária)

---

### Post 10 — Oferta Especial

**Formato:** Quadrado 1080x1080px

**Layout:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Vermelho]│
│                              │
│   🎉 OFERTA DE LANÇAMENTO!  │
│                              │
│   [Badge: 50% OFF]          │
│   (grande, centralizado)    │
│                              │
│   1º mês: R$64,95           │
│   (de R$129,90)             │
│                              │
│   ⏰ Só 100 vagas!          │
│   [Contador regressivo]     │
│                              │
│   [BOTÃO: QUERO DESCONTO]   │
│                              │
│   @oodelivery                │
└─────────────────────────────┘
```

**Elementos:**
- Gradiente: `#EF4444 → #DC2626`
- Badge: Círculo dourado com texto
- Contador: Números grandes
- Urgência: Ícone relógio

**Arquivos necessários:**
- `post-10-oferta.png`
- Badge SVG

---

## 📱 Stories (15)

### Story 1 — Enquete

**Formato:** Vertical 1080x1920px

**Frame 1:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Roxo]    │
│                              │
│   Qual sua maior dor        │
│   no delivery?              │
│                              │
│   [ENQUETE]                 │
│   ┌─────────┐               │
│   │WhatsApp │               │
│   └─────────┘               │
│   ┌─────────┐               │
│   │Entregas │               │
│   └─────────┘               │
│                              │
│   [Sticker: Enquete]        │
│                              │
└─────────────────────────────┘
```

**Frame 2:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Verde]   │
│                              │
│   WhatsApp venceu! 📱       │
│                              │
│   Sabia que o ÓoBot         │
│   resolve isso?             │
│                              │
│   [Sticker: Link]           │
│   "Quero saber mais"        │
│                              │
└─────────────────────────────┘
```

**Arquivos:**
- `story-01-enquete-1.png`
- `story-01-enquete-2.png`

---

### Story 2 — Quiz

**Formato:** Vertical 1080x1920px

**Frame 1:**
```
┌─────────────────────────────┐
│  [Fundo: Azul Tech]         │
│                              │
│   🤓 QUIZ DO DELIVERY       │
│                              │
│   Quanto você paga de       │
│   comissão no iFood?        │
│                              │
│   [QUIZ STICKER]            │
│   A) 12%                    │
│   B) 27% ← Correta          │
│   C) 35%                    │
│                              │
└─────────────────────────────┘
```

**Frame 2:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Laranja] │
│                              │
│   Resposta: B) 27%! 😱      │
│                              │
│   Com ÓoDelivery:           │
│   0% de comissão!           │
│                              │
│   [Sticker: Link]           │
│   "Quero 0% de comissão"    │
│                              │
└─────────────────────────────┘
```

**Arquivos:**
- `story-02-quiz-1.png`
- `story-02-quiz-2.png`

---

### Story 3 — Bastidores

**Formato:** Vertical 1080x1920px

```
┌─────────────────────────────┐
│  [Foto: Equipe no computador]│
│                              │
│   👨‍💻 BASTIDORES            │
│                              │
│   Nossa equipe desenvolvendo │
│   o novo dashboard de       │
│   analytics!                │
│                              │
│   [Sticker: Countdown]      │
│   "Em breve..."             │
│                              │
│   [Sticker: Reação]         │
│   🔥 ❤️ 😮                  │
│                              │
└─────────────────────────────┘
```

**Arquivos:**
- `story-03-bastidores.png`
- Foto real da equipe

---

### Story 4 — Feature Flash

**Formato:** Vertical 1080x1920px

```
┌─────────────────────────────┐
│  [Fundo: Gradiente Roxo]    │
│                              │
│   ⚡ FEATURE FLASH           │
│                              │
│   Você sabia que...         │
│                              │
│   O ÓoDelivery tem          │
│   programa de fidelidade    │
│   com 4 níveis?             │
│                              │
│   [GIF: Medalhas animadas]  │
│                              │
│   [Sticker: Link]           │
│   "Saber mais"              │
│                              │
└─────────────────────────────┘
```

**Arquivos:**
- `story-04-feature.png`
- GIF medalhas (opcional)

---

### Story 5 — Countdown

**Formato:** Vertical 1080x1920px

```
┌─────────────────────────────┐
│  [Fundo: Gradiente Vermelho]│
│                              │
│   ⏰ FALTA POUCO!           │
│                              │
│   Oferta de lançamento      │
│   termina em:               │
│                              │
│   [COUNTDOWN STICKER]       │
│   02 : 14 : 32 : 15         │
│   D   H   M   S             │
│                              │
│   [Sticker: Link]           │
│   "Garanta 50% OFF"         │
│                              │
└─────────────────────────────┘
```

**Arquivos:**
- `story-05-countdown.png`

---

### Stories 6-15 — Variações

Criar variações dos modelos acima com:

- **Stories 6-7:** Feature ÓoBot (2 frames cada)
- **Stories 8-9:** Feature Fidelidade (2 frames cada)
- **Stories 10-11:** Feature Zonas (2 frames cada)
- **Stories 12-13:** Depoimentos (1 frame cada)
- **Stories 14-15:** Urgência/Oferta (2 frames cada)

**Template base:**
```
┌─────────────────────────────┐
│  [Fundo: Cor da Feature]    │
│                              │
│   [Ícone Feature]           │
│                              │
│   TÍTULO IMPACTANTE         │
│                              │
│   1-3 bullets de benefício  │
│                              │
│   [Sticker: Link]           │
│   CTA claro                 │
│                              │
│   [Sticker: Reação/Enquete] │
│                              │
└─────────────────────────────┘
```

---

## 🎬 Reels (5)

### Reel 1 — "Um Dia no Delivery"

**Duração:** 30 segundos  
**Formato:** Vertical 1080x1920px  
**Áudio:** Trending audio motivacional

**Storyboard:**

| Tempo | Visual | Texto na Tela |
|-------|--------|---------------|
| 0-3s | Dono atendendo 5 celulares | "Seu celular não para de tocar..." |
| 3-6s | Comida queimando | "Você tenta cozinhar e atender..." |
| 6-9s | Cliente bravo olhando relógio | "Pedidos se perdem, clientes reclamam" |
| 9-12s | Transição mágica (snap) | "E se fosse diferente?" |
| 12-20s | Dashboard ÓoDelivery | "Com ÓoDelivery:" + ícones |
| 20-25s | Dono tranquilo na cozinha | "Você só prepara. O resto é automático." |
| 25-30s | Logo + CTA | "Teste grátis por 7 dias!" |

**Arquivos necessários:**
- `reel-01-um-dia.mp4`
- Vídeo stock ou gravado
- Áudio trending (baixar da biblioteca do Instagram)

---

### Reel 2 — "Antes vs Depois"

**Duração:** 15 segundos  
**Formato:** Vertical 1080x1920px

**Storyboard:**

| Tempo | Visual | Texto |
|-------|--------|-------|
| 0-4s | DONO ESTRESSADO | "ANTES" + ícones ❌ |
| 4-8s | DONO TRANQUILO | "DEPOIS" + ícones ✅ |
| 8-12s | Dashboard ÓoDelivery | "Seu delivery pode ser assim!" |
| 12-15s | Logo + Link | "Link na bio 👆" |

**Arquivos necessários:**
- `reel-02-antes-depois.mp4`

---

### Reel 3 — "ÓoBot em Ação"

**Duração:** 25 segundos  
**Formato:** Vertical 1080x1920px

**Storyboard:**

| Tempo | Visual | Texto |
|-------|--------|-------|
| 0-5s | Tela WhatsApp | "Conheça o ÓoBot!" |
| 5-15s | Conversa automática | Mensagens aparecendo |
| 15-20s | Checkmarks verdes | "Tudo automático!" |
| 20-25s | Logo + CTA | "Teste grátis! Link na bio" |

**Arquivos necessários:**
- `reel-03-oobot.mp4`
- Gravação de tela do WhatsApp

---

### Reel 4 — "Comparação iFood vs ÓoDelivery"

**Duração:** 20 segundos  
**Formato:** Vertical 1080x1920px

**Storyboard:**

| Tempo | Visual | Texto |
|-------|--------|-------|
| 0-5s | Logo iFood + 27% | "iFood: R$2.700/mês" |
| 5-10s | Logo ÓoDelivery + R$129 | "ÓoDelivery: R$129/mês" |
| 10-15s | Calculadora mostrando economia | "Economia: R$30.000/ano" |
| 15-20s | Logo + CTA | "Quer essa economia? Link na bio" |

**Arquivos necessários:**
- `reel-04-comparacao.mp4`

---

### Reel 5 — "Tour pelo Dashboard"

**Duração:** 30 segundos  
**Formato:** Vertical 1080x1920px

**Storyboard:**

| Tempo | Visual | Texto |
|-------|--------|-------|
| 0-5s | Dashboard overview | "Tour pelo ÓoDelivery" |
| 5-10s | Pedidos em tempo real | "Pedidos em tempo real" |
| 10-15s | ÓoBot configurado | "WhatsApp automático" |
| 15-20s | Mapa de motoboys | "Rastreamento de entregas" |
| 20-25s | Gráficos de vendas | "Analytics completo" |
| 25-30s | Logo + CTA | "Teste grátis! Link na bio" |

**Arquivos necessários:**
- `reel-05-tour.mp4`
- Gravação de tela do dashboard

---

## 📘 Facebook Ads (4)

### Anúncio 1 — Vídeo (Conscientização)

**Formato:** Vídeo 30s  
**Tamanho:** 1080x1080px (quadrado) ou 1920x1080px (paisagem)

**Usar o mesmo vídeo do Reel 1**

**Arquivos:**
- `fb-ad-01-video.mp4`
- Thumbnail: `fb-ad-01-thumb.jpg`

---

### Anúncio 2 — Carrossel (Consideração)

**Formato:** Carrossel 5 cards  
**Tamanho:** 1080x1080px cada

**Card 1:**
```
┌─────────────────────────────┐
│  [Fundo: Branco]            │
│                              │
│   💰 QUANTO VOCÊ PAGA       │
│      DE COMISSÃO?           │
│                              │
│   [Logos lado a lado]       │
│   iFood: 27%                │
│   Rappi: 25%                │
│   ÓoDelivery: 0%            │
│                              │
│   [Seta: Ver comparação]    │
│                              │
└─────────────────────────────┘
```

**Card 2:**
```
┌─────────────────────────────┐
│  [Fundo: Verde Claro]       │
│                              │
│   R$10.000/mês em vendas:   │
│                              │
│   iFood: R$2.700/mês        │
│   ÓoDelivery: R$129/mês     │
│                              │
│   Economia: R$2.571/mês     │
│                              │
└─────────────────────────────┘
```

**Card 3:**
```
┌─────────────────────────────┐
│  [Fundo: Branco]            │
│                              │
│   O que você faz com        │
│   R$30.000/ano?             │
│                              │
│   [Ícones]                  │
│   ✈️ Viaja                  │
│   🔧 Reforma                │
│   👥 Contrata               │
│   ✅ Tudo acima             │
│                              │
└─────────────────────────────┘
```

**Card 4:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Roxo]    │
│                              │
│   +1.247 deliveries         │
│   já economizaram           │
│                              │
│   ⭐⭐⭐⭐⭐ 4.9/5            │
│                              │
│   [Ícones de clientes]      │
│                              │
└─────────────────────────────┘
```

**Card 5:**
```
┌─────────────────────────────┐
│  [Fundo: Gradiente Laranja] │
│                              │
│   🎉 50% OFF NO             │
│   PRIMEIRO MÊS!             │
│                              │
│   Só para as primeiras      │
│   100 lojas                 │
│                              │
│   [BOTÃO: Quero Economizar] │
│                              │
└─────────────────────────────┘
```

**Arquivos:**
- `fb-ad-02-card-1.png`
- `fb-ad-02-card-2.png`
- `fb-ad-02-card-3.png`
- `fb-ad-02-card-4.png`
- `fb-ad-02-card-5.png`

---

### Anúncio 3 — Lead Gen (Conversão)

**Formato:** Imagem única  
**Tamanho:** 1080x1080px

```
┌─────────────────────────────┐
│  [Fundo: Gradiente Roxo]    │
│                              │
│   🚀 ÚLTIMAS VAGAS!         │
│                              │
│   50% OFF + Setup Grátis    │
│                              │
│   [Mockup Dashboard]        │
│                              │
│   ✅ Demonstração grátis    │
│   ✅ Setup incluso          │
│   ✅ Treinamento completo   │
│   ✅ Suporte prioritário    │
│                              │
│   De R$129,90               │
│   Por R$64,95 no 1º mês     │
│                              │
│   [BOTÃO: Garantir Desconto]│
│                              │
└─────────────────────────────┘
```

**Arquivos:**
- `fb-ad-03-leadgen.png`

---

### Anúncio 4 — Retargeting (Dynamic)

**Formato:** Imagem única  
**Tamanho:** 1080x1080px

```
┌─────────────────────────────┐
│  [Fundo: Branco]            │
│                              │
│   👀 VIU QUEM PASSOU...     │
│                              │
│   [Ícone: Olho ou Pegada]   │
│                              │
│   Você conheceu o           │
│   ÓoDelivery mas ainda      │
│   não testou.               │
│                              │
│   7 dias GRÁTIS             │
│   Sem cartão. Sem compromisso│
│                              │
│   [BOTÃO: Começar Agora]    │
│                              │
└─────────────────────────────┘
```

**Arquivos:**
- `fb-ad-04-retargeting.png`

---

## 🔍 Google Ads Display

### Banners

#### Banner 1 — 300x250px

```
┌─────────────────────┐
│  [Fundo: Roxo]      │
│                     │
│  🚀 Delivery no     │
│     Automático      │
│                     │
│  [Ícones]           │
│  ✅ WhatsApp        │
│  ✅ Cardápio        │
│  ✅ PDV             │
│  ✅ Entregas        │
│                     │
│  R$129,90/mês       │
│                     │
│  [BOTÃO: Teste]     │
│                     │
└─────────────────────┘
```

**Arquivo:** `google-display-300x250.png`

---

#### Banner 2 — 728x90px

```
┌────────────────────────────────────────────┐
│  [Fundo: Gradiente Roxo]                   │
│                                            │
│  ÓoBot: Seu Atendente 24/7 🤖              │
│                                            │
│  Atende WhatsApp automaticamente.          │
│  Não perca mais vendas!                    │
│                                            │
│  [BOTÃO: Comece Grátis →]                  │
│                                            │
└────────────────────────────────────────────┘
```

**Arquivo:** `google-display-728x90.png`

---

#### Banner 3 — 300x600px (Vertical)

```
┌─────────────────────┐
│  [Fundo: Roxo]      │
│                     │
│  🚀 ÓoDelivery      │
│                     │
│  Tudo que seu       │
│  delivery precisa   │
│                     │
│  [Ícones grandes]   │
│  🤖 ÓoBot           │
│  📱 Cardápio        │
│  🖥️ PDV             │
│  🛵 Motoboy         │
│  🎁 Fidelidade      │
│                     │
│  R$129,90/mês       │
│  0% de comissão     │
│                     │
│  [BOTÃO: Teste]     │
│                     │
└─────────────────────┘
```

**Arquivo:** `google-display-300x600.png`

---

#### Banner 4 — 970x250px

```
┌──────────────────────────────────────────────────────┐
│  [Fundo: Branco]                                     │
│                                                      │
│  [Logo ÓoDelivery]                                   │
│                                                      │
│  Seu delivery no automático.                         │
│  Cardápio, WhatsApp, PDV e entregas.                 │
│  Tudo em um lugar.                                   │
│                                                      │
│  [BOTÃO: Teste Grátis por 7 Dias]                    │
│                                                      │
│  ⭐⭐⭐⭐⭐ 4.9/5 (1.247 lojas)                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Arquivo:** `google-display-970x250.png`

---

## 📧 Email Header

### Template de Email Header

**Formato:** 600x200px

```
┌────────────────────────────────────────────┐
│  [Fundo: Gradiente Roxo]                   │
│                                            │
│  [Logo ÓoDelivery]                         │
│                                            │
│  Seu delivery no automático.               │
│                                            │
└────────────────────────────────────────────┘
```

**Arquivo:** `email-header.png`

### Variação para Ofertas

**Formato:** 600x200px

```
┌────────────────────────────────────────────┐
│  [Fundo: Gradiente Laranja]                │
│                                            │
│  [Logo ÓoDelivery]                         │
│                                            │
│  🎉 50% OFF NO PRIMEIRO MÊS!               │
│                                            │
└────────────────────────────────────────────┘
```

**Arquivo:** `email-header-oferta.png`

---

## 🌐 Landing Page Assets

### Hero Section

**Formato:** 1920x800px (desktop), 750x600px (mobile)

**Desktop:**
```
┌─────────────────────────────────────────────────────────┐
│  [Fundo: Gradiente Roxo com pattern geométrico]         │
│                                                          │
│  [Logo]                                                  │
│                                                          │
│  H1: Seu Delivery no Automático                         │
│                                                          │
│  Sub: Cardápio digital, WhatsApp automático,            │
│       PDV e entregas. Tudo em um só lugar.              │
│                                                          │
│  [BOTÃO: Teste Grátis por 7 Dias]                       │
│  [BOTÃO SECUNDÁRIO: Ver demonstração]                   │
│                                                          │
│  ⭐⭐⭐⭐⭐ 4.9/5 (1.247 lojas)                           │
│                                                          │
│  [Mockup Dashboard em perspectiva]                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Arquivos:**
- `landing-hero-desktop.png`
- `landing-hero-mobile.png`
- `landing-hero-bg.jpg` (background pattern)

---

### Feature Icons

**Formato:** 128x128px cada (SVG preferencialmente)

Criar ícones para:
- `icon-oobot.svg` — Robô amigável
- `icon-cardapio.svg` — Smartphone com cardápio
- `icon-pdv.svg` — Touch screen/registradora
- `icon-motoboy.svg` — Motocicleta com caixa
- `icon-fidelidade.svg` — Medalha/coroa
- `icon-zonas.svg` — Mapa com pinos

**Estilo:** Line art, 2px stroke, cor `#7C3AED`

---

### Mockups

**Formato:** PNG com fundo transparente

Criar mockups de:
- `mockup-dashboard.png` — Dashboard principal
- `mockup-whatsapp.png` — Conversa WhatsApp
- `mockup-app-motoboy.png` — App do motoboy
- `mockup-pdv.png` — PDV em touch screen
- `mockup-mobile.png` — Cardápio no celular

---

### Social Proof

**Formato:** 1920x400px

```
┌─────────────────────────────────────────────────────────┐
│  [Fundo: Branco]                                        │
│                                                          │
│  H2: Quem usa, aprova                                   │
│                                                          │
│  [Card Depoimento 1] [Card Depoimento 2]               │
│  [Foto + Texto]    [Foto + Texto]                       │
│                                                          │
│  [Logos de clientes]                                    │
│  [Logo 1] [Logo 2] [Logo 3] [Logo 4] [Logo 5]          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Arquivos:**
- `landing-social-proof.png`
- `logos-clientes/` (pasta com logos individuais)

---

## 📦 Entrega de Arquivos

### Estrutura de Pastas

```
/design-assets/
├── /instagram/
│   ├── /posts/
│   │   ├── post-01-lancamento.png
│   │   ├── post-02-dor.png
│   │   └── ...
│   ├── /stories/
│   │   ├── story-01-enquete-1.png
│   │   └── ...
│   └── /reels/
│       ├── reel-01-um-dia.mp4
│       └── ...
├── /facebook/
│   ├── fb-ad-01-video.mp4
│   └── ...
├── /google-ads/
│   ├── google-display-300x250.png
│   └── ...
├── /email/
│   ├── email-header.png
│   └── ...
├── /landing-page/
│   ├── landing-hero-desktop.png
│   ├── /icons/
│   └── /mockups/
├── /brand/
│   ├── logo-oodelivery.svg
│   ├── logo-oodelivery.png
│   └── palette.png
└── README.md
```

---

## 🎯 Checklist de Produção

### Fase 1: Branding (2 dias)

- [ ] Definir logo final
- [ ] Criar guia de estilo
- [ ] Exportar ícones principais
- [ ] Criar pattern de background

### Fase 2: Instagram (3 dias)

- [ ] Produzir 10 posts
- [ ] Produzir 15 stories
- [ ] Produzir 5 reels (vídeo)
- [ ] Revisar e aprovar

### Fase 3: Facebook/Google (2 dias)

- [ ] Adaptar posts para Facebook
- [ ] Criar banners Google Ads
- [ ] Configurar tamanhos múltiplos

### Fase 4: Landing Page (2 dias)

- [ ] Criar hero section
- [ ] Produzir mockups
- [ ] Criar ícones de features
- [ ] Exportar assets para dev

### Fase 5: Email (1 dia)

- [ ] Criar header template
- [ ] Criar variações
- [ ] Exportar para HTML

---

## 🛠️ Ferramentas Recomendadas

### Design

| Ferramenta | Uso | Custo |
|-----------|-----|-------|
| **Figma** | Design principal | Gratuito |
| **Canva** | Posts rápidos | Gratuito/Pro |
| **Photoshop** | Edição avançada | Pago |
| **Illustrator** | Vetores/ícones | Pago |

### Vídeo

| Ferramenta | Uso | Custo |
|-----------|-----|-------|
| **CapCut** | Edição Reels | Gratuito |
| **Premiere** | Edição avançada | Pago |
| **After Effects** | Motion graphics | Pago |

### Mockups

| Ferramenta | Uso | Custo |
|-----------|-----|-------|
| **Placeit** | Mockups prontos | Pago |
| **Smartmockups** | Mockups online | Freemium |
| **Figma** | Mockups custom | Gratuito |

---

## 📐 Especificações Técnicas

### Instagram

| Tipo | Tamanho | Formato | Max |
|------|---------|---------|-----|
| Post quadrado | 1080x1080 | PNG/JPG | 30MB |
| Post retrato | 1080x1350 | PNG/JPG | 30MB |
| Story | 1080x1920 | PNG/JPG | 30MB |
| Reel | 1080x1920 | MP4 | 4GB |

### Facebook

| Tipo | Tamanho | Formato | Max |
|------|---------|---------|-----|
| Post | 1080x1080 | PNG/JPG | 30MB |
| Anúncio | 1080x1080 | PNG/JPG | 30MB |
| Vídeo | 1080x1080 | MP4 | 4GB |

### Google Ads

| Tipo | Tamanho | Formato | Max |
|------|---------|---------|-----|
| Display | Variado | PNG/JPG | 150KB |
| Responsive | Múltiplos | PNG/JPG | 150KB |

### Email

| Tipo | Tamanho | Formato | Max |
|------|---------|---------|-----|
| Header | 600x200 | PNG | 100KB |
| Banner | 600x300 | PNG | 100KB |

---

## 🎨 Dicas de Design

### Cores

✅ **Faça:**
- Use roxo como cor primária
- Mantenha contraste alto para legibilidade
- Use verde para CTAs positivos
- Use vermelho/laranja para urgência

❌ **Não faça:**
- Não use mais de 3 cores principais
- Não use cores muito saturadas juntas
- Não esqueça de verificar contraste

### Tipografia

✅ **Faça:**
- Use Inter em todos os materiais
- Mantenha hierarquia clara
- Use bold para destaque

❌ **Não faça:**
- Não use mais de 2 pesos por peça
- Não use fontes decorativas
- Não esqueça do mobile

### Composição

✅ **Faça:**
- Deixe espaço em branco (respiro)
- Alinhe elementos à grade
- Use regra dos terços

❌ **Não faça:**
- Não sobrecarregue com texto
- Não ignore margens de segurança
- Não esqueça da área segura (stories)

---

**Documento criado em:** 26/02/2026  
**Última atualização:** 26/02/2026

*ÓoDelivery — Seu delivery no automático.* 🚀
