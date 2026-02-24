# 🗺️ ÓoDelivery: Mapa Completo do Sistema

Este documento fornece uma visão técnica exaustiva de toda a arquitetura do sistema ÓoDelivery, cobrindo componentes, rotas, fluxos e integrações.

---

## 🏗️ Arquitetura Core

O sistema é um **SaaS Multi-tenant** construído com:

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React + Inertia.js + Lucide Icons + Framer Motion
- **Banco de Dados**: MySQL (com isolamento via `TenantScope`)
- **Real-time**: Polling otimizado (preparado para Reverb/Pusher)

---

## 🚦 Rotas e Endpoints

### 1. Área Pública

- `/`: Landing Page principal.
- `/demo-access`: Acesso instantâneo a ambiente de teste isolado.
- `/login` / `/register`: Portais de entrada para parceiros.
- `/planos`: Vitrine de assinaturas.

### 2. Painel Administrativo (Parceiro)

- `/dashboard`: Visão geral de métricas e alertas.
- `/orders`: Gestão de pedidos em tempo real.
- `/pdv`: Ponto de Venda para pedidos balcão.
- `/kitchen`: Tela de produção para a cozinha.
- `/products` & `/categories`: Gestão do cardápio.
- `/motoboys`: Controle de entregadores e taxas.
- `/financial`: Fluxo de caixa e fechamento de turno.
- `/settings`: Customização da loja, horários e impressão.

### 3. Cardápio Digital (Cliente Final) - `/{slug}`

- `/menu`: Seleção de produtos.
- `/cart`: Carrinho e complementos.
- `/checkout`: Identificação por WhatsApp e finalização.
- `/customer/orders`: Histórico de pedidos do cliente.

### 4. Super Admin (Platform Management)

- `/admin/tenants`: Gestão de todas as lojas cadastradas.
- `/admin/whatsapp`: Painel mestre da Evolution API.
- `/admin/api-keys`: Gestão de chaves de integração.

---

## 🧩 Componentes Principais

### Frontend (React)

- **`Sidebar.tsx`**: Navegação inteligente com detecção de permissões.
- **`MediaPickerModal.tsx`**: Banco de imagens centralizado.
- **`WhatsAppSimulator.tsx`**: Ferramenta de visualização de ROI.
- **`StoreStatusControls.tsx`**: Controle rápido de loja aberta/fechada.
- **`Boleto/Pix/CreditCardForm.tsx`**: Módulos de pagamento.

### Backend (Laravel)

- **`TenantScope.php`**: O "coração" da segurança (isolamento de dados).
- **`OrderObserver.php`**: Gatilho automático para notificações e estoque.
- **`DemoSeeder.php`**: Gerador de ambientes de demonstração.

---

## 🔄 Fluxos de Negócio

### 1. Jornada do Pedido

1. **Entrada**: Cliente faz pedido via Cardápio Digital.
2. **Notificação**: Painel do parceiro emite som e alerta visual.
3. **Produção**: Pedido vai para `Cozinha` -> `Pronto`.
4. **Logística**: Atribuição de Motoboy automática ou manual.
5. **Finalização**: Entrega confirmada -> Pontos de Fidelidade creditados.

### 2. Onboarding de Parceiro

1. **Registro**: Criação de Tenant + Admin em transação única.
2. **Setup**: Configuração de cores e logo.
3. **Ativação**: Trial grátis ou pagamento via Stripe.

---

## 🔌 Integrações e APIs

| Integração         | Função                                 | Status   |
| :----------------- | :------------------------------------- | :------- |
| **Evolution API**  | Automação de WhatsApp / ÓoBot          | ✅ Ativo |
| **Stripe**         | Gestão de Assinaturas e Pagamentos     | ✅ Ativo |
| **OneSignal**      | Notificações Push Web/Mobile           | ✅ Ativo |
| **ÓoPrint**        | Impressão Térmica Direta (Desktop App) | ✅ Ativo |
| **Google/Leaflet** | Cálculo de Frete e Zonas de Entrega    | ✅ Ativo |

---

## 🛠️ Ferramentas de Manutenção

- **`CleanupDemoTenants`**: Limpeza automática de dados de teste (24h).
- **`TenantPollService`**: Atualização inteligente do frontend sem sobrecarga.
- **`NotificationService`**: Hub central de alertas (Push, DB, WhatsApp).

---

> [!TIP]
> O sistema utiliza **UUIDs** em todas as tabelas sensíveis para garantir que links de pedidos e clientes nunca sejam previsíveis.
