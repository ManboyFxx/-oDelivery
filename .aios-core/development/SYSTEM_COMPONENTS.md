# Visão Geral do Sistema: Componentes e Estrutura

Este documento detalha todos os arquivos PHP (Backend) e TSX (Frontend) encontrados no sistema, com uma breve descrição de suas responsabilidades.

---

## 🏗️ Backend (Laravel/PHP)

### 📦 Models (`app/Models`)
Entidades de banco de dados e lógica de negócios.

| Arquivo | Descrição |
| :--- | :--- |
| `ApiCredential.php` | Gerencia credenciais de API para integrações externas. |
| `AuditLog.php` | Registro de atividades e trilha de auditoria do sistema. |
| `CashRegister.php` | Controle de abertura e fechamento de caixa do PDV. |
| `Category.php` | Categorias de produtos do cardápio. |
| `ComplementGroup.php` | Grupos de complementos (ex: Adicionais, Molhos). |
| `ComplementOption.php` | Opções individuais dentro de um grupo de complementos. |
| `Coupon.php` | Cupons de desconto e regras de promoção. |
| `CouponUsage.php` | Registro de uso de cupons pelos clientes. |
| `Customer.php` | Clientes finais da loja (cadastro simplificado). |
| `CustomerAddress.php` | Endereços de entrega dos clientes. |
| `DeliveryZone.php` | Zonas de entrega e taxas por bairro/região. |
| `EmployeePayment.php` | Registro de pagamentos a funcionários/entregadores. |
| `Expense.php` | Controle de despesas e contas a pagar. |
| `Ingredient.php` | Ingredientes para controle de estoque e ficha técnica. |
| `LoyaltyPointsHistory.php` | Histórico de pontos do programa de fidelidade. |
| `LoyaltyPromotion.php` | Regras de pontuação e resgate de fidelidade. |
| `Media.php` | Gestão de arquivos e uploads (imagens). |
| `MotoboyAvailability.php` | Controle de disponibilidade (online/offline) dos entregadores. |
| `MotoboyLocation.php` | Rastreamento de localização em tempo real. |
| `MotoboyLocationHistory.php` | Histórico de rotas e posições. |
| `MotoboyMetrics.php` | Métricas de desempenho do entregador. |
| `MotoboyProfile.php` | Dados estendidos do perfil do motoboy. |
| `MotoboyRating.php` | Avaliações recebidas pelos motoboys. |
| `NeighborhoodFee.php` | Taxas específicas por bairro (alternativa a zonas). |
| `Notification.php` | Sistema de notificações internas. |
| `NotificationPreference.php` | Configurações de notificação por usuário. |
| `Order.php` | Pedidos realizados (central do sistema). |
| `OrderItem.php` | Itens dentro de um pedido. |
| `OrderItemComplement.php` | Complementos escolhidos para um item. |
| `Payment.php` | Transações financeiras recebidas. |
| `PaymentMethod.php` | Métodos de pagamento aceitos (Pix, Cartão, etc). |
| `Permission.php` | Permissões de acesso (ACL). |
| `PlanLimit.php` | Limites dos planos de assinatura (SaaS). |
| `Product.php` | Produtos do cardápio. |
| `PushSubscription.php` | Assinaturas de Web Push Notifications. |
| `Role.php` | Papéis de usuário (Admin, Funcionário, Motoboy). |
| `SecurityEvent.php` | Logs de segurança (login, falhas). |
| `StockMovement.php` | Histórico de entrada/saída de estoque. |
| `StoreSetting.php` | Configurações gerais da loja (Tenant). |
| `SubscriptionHistory.php` | Histórico de pagamentos da assinatura SaaS. |
| `Table.php` | Mesas para gestão de salão. |
| `Tenant.php` | A loja/estabelecimento (Multi-tenant). |
| `User.php` | Usuários do sistema administrativo. |
| `WhatsAppInstance.php` | Instâncias de conexão com WhatsApp. |
| `WhatsAppMessageLog.php` | Log de mensagens enviadas. |
| `WhatsAppTemplate.php` | Modelos de mensagens automáticas. |

### 🎮 Controllers (`app/Http/Controllers`)
Lógica de controle e rotas da aplicação.

| Arquivo | Descrição |
| :--- | :--- |
| **Admin/** | **Gestão da Plataforma (Super Admin)** |
| `Admin/AdminDashboardController.php` | Dashboard geral da plataforma. |
| `Admin/AdminTenantController.php` | Gestão de lojas (Tenants). |
| `Admin/AdminUserController.php` | Gestão de usuários da plataforma. |
| **Api/** | **API Externa e Mobile** |
| `Api/AuthController.php` | Autenticação para aplicativos mobile. |
| `Api/Motoboy/...` | Endpoints do app do entregador. |
| `Api/PrinterController.php` | Integração com software de impressão. |
| **Auth/** | **Autenticação Web** |
| `Auth/AuthenticatedSessionController.php` | Login/Logout. |
| `Auth/RegisteredUserController.php` | Registro de novos usuários/lojas. |
| **Principal** | **Painel do Cliente (Tenant)** |
| `CategoryController.php` | CRUD e reordenação de categorias. |
| `ComplementController.php` | Gestão de complementos. |
| `CouponController.php` | Gestão de cupons. |
| `DashboardController.php` | Home do painel da loja. |
| `DeliveryZoneController.php` | Configuração de taxas de entrega. |
| `FinancialController.php` | Relatórios financeiros e caixa. |
| `KitchenController.php` | Tela da cozinha (KDS). |
| `MenuController.php` | Gestão do cardápio digital. |
| `MotoboyController.php` | Gestão da frota de entregadores. |
| `OrderController.php` | Kanban de pedidos e fluxo de venda. |
| `ProductController.php` | CRUD de produtos e estoque. |
| `SettingsController.php` | Configurações da loja, horários e branding. |
| `SubscriptionController.php` | Gestão da assinatura e upgrade de plano. |
| `TableController.php` | Gestão de mesas e pedidos de mesa. |
| `WhatsAppController.php` | Integração e envio de mensagens. |

*(Nota: Alguns controllers auxiliares foram omitidos para brevidade, focando nos principais fluxos.)*

---

## 🎨 Frontend (React/Inertia)

### 📄 Pages (`resources/js/Pages`)
Telas principais da aplicação.

| Diretório/Arquivo | Descrição |
| :--- | :--- |
| `Admin/` | Telas do Super Admin (Tenants, Usuários). |
| `Auth/` | Telas de Login, Registro e Recuperação de Senha. |
| `Dashboard.tsx` | Visão geral da loja (Gráficos, Resumo). |
| `Kitchen/Index.tsx` | Tela de produção (KDS) para cozinha. |
| `Menu/Public/` | Interface pública do cardápio (Loja Online). |
| `Orders/Index.tsx` | Kanban de pedidos (Gestão de fluxo). |
| `PDV/Index.tsx` | Ponto de Venda (Frente de Caixa). |
| `Products/Index.tsx` | Gestão de Produtos e Cardápio. |
| `Products/Tabs/` | Abas de organização (Produtos, Categorias, Complementos). |
| `Settings/Index.tsx` | Painel de controle e configurações. |
| `Stock/Index.tsx` | Controle de inventário. |
| `Subscription/` | Planos e cobrança. |
| `Welcome.tsx` | Landing page da plataforma. |

### 🧩 Components (`resources/js/Components`)
Blocos de construção da interface.

| Arquivo | Descrição |
| :--- | :--- |
| **UI Base** | **Elementos Visuais Básicos** |
| `PrimaryButton.tsx`, `SecondaryButton.tsx` | Botões padrão do sistema. |
| `TextInput.tsx`, `Checkbox.tsx` | Entradas de formulário. |
| `Modal.tsx` | Base para janelas modais. |
| `Card.tsx` (Inferred) | Container padrão. |
| **Funcionais** | **Componentes com Lógica Espcífica** |
| `ActivationChecklist.tsx` | Lista de tarefas para ativar a loja. |
| `BillingToggle.tsx` | Alternar entre cobrança mensal/anual. |
| `BoletoPayment.tsx`, `PixPayment.tsx` | Interfaces de pagamento. |
| `CreditCardForm.tsx` | Formulário de cartão seguro. |
| `DateRangeFilter.tsx` | Seletor de período para relatórios. |
| `Sidebar.tsx` | Menu lateral de navegação. |
| `TopBar.tsx` | Barra superior (Notificações, Perfil). |
| `StoreStatusControls.tsx` | Botão para abrir/fechar loja. |
| `TableMapEditor.tsx` | Editor visual de layout de mesas. |
| `TrialBanner.tsx` | Aviso de período de testes. |
| `UpgradeModal.tsx` | Modal para oferecer planos superiores. |

### 📂 Estrutura de Diretórios Frontend
- `Components/Motoboy/`: Componentes específicos do app do entregador (Mapa, Lista de Entregas).
- `Components/Toast/`: Sistema de notificações (Sonner).
- `Components/Admin/`: Componentes exclusivos do painel administrativo.
