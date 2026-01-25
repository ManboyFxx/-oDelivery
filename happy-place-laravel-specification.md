# 🍕 Happy Place - Especificação Completa para Laravel

> Documento de especificação para migração do projeto Happy Place de React/TypeScript + Supabase para PHP Laravel com MySQL/PostgreSQL.

---

## 📋 Visão Geral do Projeto

**Happy Place** é uma plataforma SaaS multi-tenant para gestão de restaurantes, pizzarias e estabelecimentos de delivery. O sistema oferece funcionalidades completas de PDV, gestão de pedidos, delivery, programa de fidelidade, controle de estoque, e muito mais.

### Stack Atual
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth
- **Pagamentos**: MercadoPago (PIX, Cartão)
- **Integrações**: WhatsApp (Evolution API), Mapbox, OSRM

### Stack Proposta (Laravel)
- **Framework**: Laravel 11+
- **Frontend**: Blade + Livewire ou Inertia.js + Vue/React
- **Banco de Dados**: MySQL 8+ ou PostgreSQL 15+
- **Autenticação**: Laravel Breeze/Jetstream ou Sanctum
- **Filas**: Laravel Queues (Redis)
- **Cache**: Redis
- **Pagamentos**: Laravel Cashier / MercadoPago SDK
- **PWA**: Laravel PWA Package

---

## 🏗️ Arquitetura Multi-Tenant

O sistema é **multi-tenant** onde cada estabelecimento (tenant) possui seus próprios dados isolados.

### Modelo de Tenant

```php
// Tabela: tenants
Schema::create('tenants', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('slug')->unique(); // URL única: /pizzaria-do-ze/menu
    $table->string('logo_url')->nullable();
    $table->string('email');
    $table->string('phone')->nullable();
    $table->string('whatsapp')->nullable();
    $table->json('address')->nullable();
    $table->json('operating_hours')->nullable();
    $table->string('timezone')->default('America/Sao_Paulo');
    $table->boolean('is_active')->default(true);
    $table->boolean('is_open')->default(true);
    $table->timestamp('trial_ends_at')->nullable();
    $table->timestamp('subscription_ends_at')->nullable();
    $table->string('plan')->default('free'); // free, basic, pro, enterprise
    $table->timestamps();
    $table->softDeletes();
});
```

---

## 👥 Sistema de Usuários e Roles

### Tipos de Usuário

1. **Super Admin**: Administrador da plataforma (SaaS owner)
2. **Admin/Owner**: Dono do estabelecimento
3. **Motoboy**: Entregador
4. **Employee**: Funcionário (cozinha, caixa, etc.)
5. **Customer**: Cliente final

### Estrutura de Tabelas

```php
// Tabela: users
Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id')->nullable(); // null para super_admin
    $table->string('name');
    $table->string('email')->unique();
    $table->string('phone')->nullable();
    $table->string('password');
    $table->string('avatar_url')->nullable();
    $table->enum('role', ['super_admin', 'admin', 'motoboy', 'employee']);
    $table->boolean('is_available')->default(true); // Para motoboys
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->softDeletes();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
});

// Tabela: customers (clientes do cardápio digital)
Schema::create('customers', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->string('name');
    $table->string('phone')->unique();
    $table->string('email')->nullable();
    $table->integer('loyalty_points')->default(0);
    $table->string('push_subscription')->nullable(); // Web Push
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
});

// Tabela: customer_addresses
Schema::create('customer_addresses', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('customer_id');
    $table->string('label')->default('Casa');
    $table->string('street');
    $table->string('number')->nullable();
    $table->string('complement')->nullable();
    $table->string('neighborhood')->nullable();
    $table->string('city')->nullable();
    $table->string('state', 2)->nullable();
    $table->string('zip_code', 10)->nullable();
    $table->decimal('latitude', 10, 8)->nullable();
    $table->decimal('longitude', 11, 8)->nullable();
    $table->boolean('is_default')->default(false);
    $table->timestamps();
    
    $table->foreign('customer_id')->references('id')->on('customers');
});
```

---

## 🍽️ Catálogo de Produtos

### Estrutura

```php
// Tabela: categories
Schema::create('categories', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('image_url')->nullable();
    $table->integer('sort_order')->default(0);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
});

// Tabela: products
Schema::create('products', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->uuid('category_id')->nullable();
    $table->string('name');
    $table->text('description')->nullable();
    $table->decimal('price', 10, 2);
    $table->decimal('promotional_price', 10, 2)->nullable();
    $table->string('image_url')->nullable();
    $table->integer('prep_time_minutes')->default(15);
    $table->boolean('is_available')->default(true);
    $table->boolean('is_featured')->default(false);
    $table->boolean('loyalty_earns_points')->default(true);
    $table->boolean('loyalty_redeemable')->default(false);
    $table->integer('loyalty_points_cost')->nullable();
    $table->integer('stock_quantity')->nullable();
    $table->boolean('track_stock')->default(false);
    $table->integer('sort_order')->default(0);
    $table->timestamps();
    $table->softDeletes();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('category_id')->references('id')->on('categories');
});

// Tabela: complement_groups (grupos de complementos)
Schema::create('complement_groups', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->string('name');
    $table->integer('min_selections')->default(0);
    $table->integer('max_selections')->default(1);
    $table->boolean('is_required')->default(false);
    $table->integer('sort_order')->default(0);
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
});

// Tabela: complement_options (opções dentro dos grupos)
Schema::create('complement_options', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('group_id');
    $table->string('name');
    $table->decimal('price', 10, 2)->default(0);
    $table->boolean('is_available')->default(true);
    $table->integer('sort_order')->default(0);
    $table->timestamps();
    
    $table->foreign('group_id')->references('id')->on('complement_groups')->onDelete('cascade');
});

// Tabela pivot: product_complement_groups
Schema::create('product_complement_groups', function (Blueprint $table) {
    $table->uuid('product_id');
    $table->uuid('group_id');
    $table->primary(['product_id', 'group_id']);
    
    $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
    $table->foreign('group_id')->references('id')->on('complement_groups')->onDelete('cascade');
});
```

---

## 📦 Sistema de Pedidos

### Estrutura Completa

```php
// ENUMS
// order_mode: delivery, pickup, table
// order_status: new, confirmed, preparing, ready, waiting_motoboy, motoboy_accepted, out_for_delivery, delivered, ready_for_pickup, completed, cancelled
// payment_status: pending, partial, paid, cancelled
// payment_method: cash, credit_card, debit_card, pix, loyalty_points

// Tabela: orders
Schema::create('orders', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->bigInteger('order_number'); // Auto-increment por tenant
    $table->enum('mode', ['delivery', 'pickup', 'table']);
    $table->enum('status', ['new', 'confirmed', 'preparing', 'ready', 'waiting_motoboy', 
                            'motoboy_accepted', 'out_for_delivery', 'delivered', 
                            'ready_for_pickup', 'completed', 'cancelled'])->default('new');
    $table->uuid('customer_id')->nullable();
    $table->uuid('address_id')->nullable();
    $table->uuid('table_id')->nullable();
    $table->uuid('motoboy_id')->nullable();
    $table->uuid('coupon_id')->nullable();
    $table->uuid('created_by')->nullable(); // Usuário que criou (PDV)
    
    // Valores
    $table->decimal('subtotal', 10, 2);
    $table->decimal('discount', 10, 2)->default(0);
    $table->decimal('delivery_fee', 10, 2)->default(0);
    $table->decimal('service_fee', 10, 2)->default(0);
    $table->decimal('tip', 10, 2)->default(0);
    $table->decimal('total', 10, 2);
    
    // Pagamento
    $table->enum('payment_status', ['pending', 'partial', 'paid', 'cancelled'])->default('pending');
    $table->decimal('change_for', 10, 2)->nullable(); // Troco para X
    
    // Detalhes
    $table->text('notes')->nullable();
    $table->text('customer_name')->nullable(); // Para pedidos sem cadastro
    $table->text('customer_phone')->nullable();
    $table->text('delivery_address')->nullable(); // Endereço formatado
    $table->integer('estimated_time_minutes')->nullable();
    
    // Fidelidade
    $table->integer('loyalty_points_earned')->default(0);
    $table->integer('loyalty_points_used')->default(0);
    
    // Timestamps especiais
    $table->timestamp('confirmed_at')->nullable();
    $table->timestamp('ready_at')->nullable();
    $table->timestamp('delivered_at')->nullable();
    $table->timestamp('cancelled_at')->nullable();
    $table->text('cancellation_reason')->nullable();
    
    $table->timestamps();
    $table->softDeletes();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('customer_id')->references('id')->on('customers');
    $table->foreign('motoboy_id')->references('id')->on('users');
});

// Tabela: order_items
Schema::create('order_items', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('order_id');
    $table->uuid('product_id');
    $table->string('product_name'); // Snapshot do nome
    $table->integer('quantity');
    $table->decimal('unit_price', 10, 2);
    $table->decimal('complements_price', 10, 2)->default(0);
    $table->decimal('subtotal', 10, 2);
    $table->text('notes')->nullable();
    $table->timestamps();
    
    $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
    $table->foreign('product_id')->references('id')->on('products');
});

// Tabela: order_item_complements
Schema::create('order_item_complements', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('order_item_id');
    $table->uuid('complement_option_id');
    $table->string('name'); // Snapshot
    $table->decimal('price', 10, 2);
    $table->integer('quantity')->default(1);
    $table->timestamps();
    
    $table->foreign('order_item_id')->references('id')->on('order_items')->onDelete('cascade');
});

// Tabela: payments
Schema::create('payments', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('order_id');
    $table->enum('method', ['cash', 'credit_card', 'debit_card', 'pix', 'loyalty_points']);
    $table->decimal('amount', 10, 2);
    $table->decimal('change_amount', 10, 2)->nullable();
    $table->string('external_id')->nullable(); // ID MercadoPago
    $table->string('qr_code')->nullable(); // PIX
    $table->string('qr_code_base64')->nullable();
    $table->timestamp('paid_at')->nullable();
    $table->timestamps();
    
    $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
});
```

---

## 🎁 Programa de Fidelidade

```php
// Tabela: loyalty_points_history
Schema::create('loyalty_points_history', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->uuid('customer_id');
    $table->uuid('order_id')->nullable();
    $table->integer('points');
    $table->enum('type', ['earn', 'redeem', 'manual_add', 'manual_remove', 'adjustment']);
    $table->text('description')->nullable();
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('customer_id')->references('id')->on('customers');
    $table->foreign('order_id')->references('id')->on('orders');
});

// Tabela: loyalty_promotions (pontos em dobro, etc)
Schema::create('loyalty_promotions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->string('name');
    $table->text('description')->nullable();
    $table->decimal('multiplier', 3, 1)->default(2); // 2x, 3x, etc
    $table->timestamp('start_date');
    $table->timestamp('end_date');
    $table->boolean('is_active')->default(true);
    $table->string('banner_gradient_start')->nullable();
    $table->string('banner_gradient_end')->nullable();
    $table->string('banner_icon')->nullable();
    $table->string('banner_image_url')->nullable();
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
});
```

---

## 🎟️ Sistema de Cupons

```php
// Tabela: coupons
Schema::create('coupons', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->string('code')->unique();
    $table->enum('discount_type', ['percentage', 'fixed']);
    $table->decimal('discount_value', 10, 2);
    $table->decimal('min_order_value', 10, 2)->default(0);
    $table->integer('max_uses')->nullable();
    $table->integer('current_uses')->default(0);
    $table->boolean('is_single_use')->default(false);
    $table->timestamp('valid_from')->nullable();
    $table->timestamp('valid_until')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
});

// Tabela: coupon_usage
Schema::create('coupon_usage', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('coupon_id');
    $table->uuid('order_id');
    $table->uuid('customer_id')->nullable();
    $table->timestamps();
    
    $table->foreign('coupon_id')->references('id')->on('coupons');
    $table->foreign('order_id')->references('id')->on('orders');
});
```

---

## 🚴 Sistema de Delivery/Motoboys

```php
// Tabela: delivery_zones
Schema::create('delivery_zones', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->string('name');
    $table->decimal('min_distance_km', 5, 2)->default(0);
    $table->decimal('max_distance_km', 5, 2);
    $table->decimal('fee', 10, 2);
    $table->integer('estimated_time_minutes')->default(30);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
});

// Tabela: neighborhood_fees (taxa por bairro)
Schema::create('neighborhood_fees', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->string('neighborhood');
    $table->string('city')->nullable();
    $table->decimal('fee', 10, 2);
    $table->integer('estimated_time_minutes')->default(30);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
});

// Tabela: motoboy_location_history
Schema::create('motoboy_location_history', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('motoboy_id');
    $table->uuid('order_id')->nullable();
    $table->decimal('latitude', 10, 8);
    $table->decimal('longitude', 11, 8);
    $table->timestamps();
    
    $table->foreign('motoboy_id')->references('id')->on('users');
    $table->foreign('order_id')->references('id')->on('orders');
});
```

---

## 🪑 Sistema de Mesas

```php
// Tabela: tables
Schema::create('tables', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->integer('number');
    $table->integer('capacity')->default(4);
    $table->enum('status', ['free', 'occupied', 'waiting_payment'])->default('free');
    $table->uuid('current_order_id')->nullable();
    $table->timestamp('occupied_at')->nullable();
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->unique(['tenant_id', 'number']);
});
```

---

## 📊 Configurações da Loja

```php
// Tabela: store_settings
Schema::create('store_settings', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id')->unique();
    
    // Informações básicas
    $table->string('store_name')->nullable();
    $table->string('logo_url')->nullable();
    $table->string('banner_url')->nullable();
    $table->text('address')->nullable();
    $table->string('phone')->nullable();
    $table->string('whatsapp')->nullable();
    
    // Horários
    $table->json('operating_hours')->nullable();
    $table->json('special_hours')->nullable(); // Feriados
    
    // Delivery
    $table->decimal('delivery_radius_km', 5, 2)->default(10);
    $table->decimal('min_order_delivery', 10, 2)->default(0);
    $table->decimal('free_delivery_min', 10, 2)->nullable();
    $table->decimal('delivery_fee_per_km', 10, 2)->default(2);
    $table->enum('delivery_fee_mode', ['fixed', 'per_km', 'by_zone', 'by_neighborhood'])->default('fixed');
    $table->decimal('fixed_delivery_fee', 10, 2)->default(5);
    
    // Mesa
    $table->decimal('service_fee_percentage', 5, 2)->default(10);
    $table->decimal('suggested_tip_percentage', 5, 2)->default(10);
    
    // Fidelidade
    $table->decimal('points_per_currency', 5, 2)->default(1);
    $table->decimal('currency_per_point', 5, 4)->default(0.01);
    $table->boolean('loyalty_enabled')->default(true);
    
    // Impressão
    $table->integer('printer_paper_width')->default(80);
    $table->boolean('auto_print_on_confirm')->default(true);
    $table->integer('print_copies')->default(1);
    $table->text('print_footer_message')->nullable();
    
    // Integrações
    $table->string('mapbox_token')->nullable();
    $table->decimal('store_latitude', 10, 8)->nullable();
    $table->decimal('store_longitude', 11, 8)->nullable();
    $table->string('mercadopago_access_token')->nullable();
    $table->string('mercadopago_public_key')->nullable();
    $table->string('evolution_api_url')->nullable();
    $table->string('evolution_api_key')->nullable();
    $table->string('evolution_instance_name')->nullable();
    
    // Tema do cardápio
    $table->json('menu_theme')->nullable();
    
    // PWA
    $table->string('pwa_name')->nullable();
    $table->string('pwa_short_name')->nullable();
    $table->string('pwa_theme_color')->default('#f97316');
    $table->string('pwa_background_color')->default('#ffffff');
    
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
});
```

---

## 💰 Sistema Financeiro

```php
// Tabela: cash_registers (caixa)
Schema::create('cash_registers', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->uuid('opened_by');
    $table->uuid('closed_by')->nullable();
    $table->decimal('opening_balance', 10, 2);
    $table->decimal('closing_balance', 10, 2)->nullable();
    $table->decimal('expected_balance', 10, 2)->nullable();
    $table->decimal('difference', 10, 2)->nullable();
    $table->text('notes')->nullable();
    $table->timestamp('opened_at');
    $table->timestamp('closed_at')->nullable();
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('opened_by')->references('id')->on('users');
    $table->foreign('closed_by')->references('id')->on('users');
});

// Tabela: expenses (despesas)
Schema::create('expenses', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->uuid('cash_register_id')->nullable();
    $table->string('description');
    $table->decimal('amount', 10, 2);
    $table->string('category')->nullable();
    $table->uuid('created_by');
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('cash_register_id')->references('id')->on('cash_registers');
});

// Tabela: employee_payments (pagamento funcionários)
Schema::create('employee_payments', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->uuid('employee_id');
    $table->decimal('amount', 10, 2);
    $table->enum('type', ['salary', 'advance', 'bonus', 'commission']);
    $table->text('description')->nullable();
    $table->date('reference_date');
    $table->uuid('created_by');
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('employee_id')->references('id')->on('users');
});
```

---

## 📦 Controle de Estoque

```php
// Tabela: stock_movements
Schema::create('stock_movements', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->uuid('product_id');
    $table->integer('quantity'); // Positivo = entrada, Negativo = saída
    $table->enum('type', ['purchase', 'sale', 'adjustment', 'loss', 'return']);
    $table->text('reason')->nullable();
    $table->uuid('order_id')->nullable();
    $table->uuid('created_by');
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('product_id')->references('id')->on('products');
    $table->foreign('order_id')->references('id')->on('orders');
});
```

---

## 🖼️ Biblioteca de Mídia

```php
// Tabela: media
Schema::create('media', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->string('name');
    $table->string('file_path');
    $table->string('file_url');
    $table->string('mime_type');
    $table->bigInteger('file_size');
    $table->integer('width')->nullable();
    $table->integer('height')->nullable();
    $table->string('folder')->nullable();
    $table->uuid('uploaded_by');
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('uploaded_by')->references('id')->on('users');
});
```

---

## 🔔 Sistema de Notificações

```php
// Tabela: notifications
Schema::create('notifications', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->uuid('user_id')->nullable();
    $table->string('title');
    $table->text('message');
    $table->string('type')->default('info'); // info, success, warning, error
    $table->string('action_url')->nullable();
    $table->json('data')->nullable();
    $table->timestamp('read_at')->nullable();
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('user_id')->references('id')->on('users');
});

// Tabela: push_subscriptions
Schema::create('push_subscriptions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->string('endpoint');
    $table->string('p256dh_key');
    $table->string('auth_token');
    $table->uuid('user_id')->nullable();
    $table->uuid('customer_id')->nullable();
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
});
```

---

## 🔐 Segurança e Auditoria

```php
// Tabela: security_events
Schema::create('security_events', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id')->nullable();
    $table->uuid('user_id')->nullable();
    $table->string('event_type'); // login, logout, failed_login, password_reset, etc
    $table->string('ip_address')->nullable();
    $table->string('user_agent')->nullable();
    $table->json('details')->nullable();
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('user_id')->references('id')->on('users');
});

// Tabela: audit_logs
Schema::create('audit_logs', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('tenant_id');
    $table->uuid('user_id');
    $table->string('action'); // create, update, delete
    $table->string('model_type');
    $table->uuid('model_id');
    $table->json('old_values')->nullable();
    $table->json('new_values')->nullable();
    $table->timestamps();
    
    $table->foreign('tenant_id')->references('id')->on('tenants');
    $table->foreign('user_id')->references('id')->on('users');
});
```

---

## 📱 Páginas da Aplicação

### Públicas (sem autenticação)
| Rota | Descrição |
|------|-----------|
| `/` | Landing page da plataforma |
| `/auth` | Login |
| `/register` | Registro de novo estabelecimento |
| `/termos` | Termos de uso |
| `/{slug}/menu` | Cardápio digital do tenant |
| `/{slug}/menu/payment-confirmation` | Confirmação de pagamento |

### Admin (autenticado)
| Rota | Descrição |
|------|-----------|
| `/dashboard` | Dashboard principal com métricas |
| `/pdv` | Ponto de Venda |
| `/orders` | Gestão de pedidos |
| `/kitchen` | Painel da cozinha |
| `/products` | Cadastro de produtos |
| `/cardapio` | Edição do cardápio digital |
| `/customers` | Gestão de clientes |
| `/coupons` | Gestão de cupons |
| `/fidelidade` | Programa de fidelidade |
| `/funcionarios` | Gestão de funcionários |
| `/deliveries` | Gestão de entregas |
| `/stock` | Controle de estoque |
| `/relatorio` | Relatórios financeiros |
| `/media` | Biblioteca de mídia |
| `/settings` | Configurações da loja |
| `/security` | Segurança e auditoria |
| `/badges` | Medalhas/conquistas |
| `/subscription` | Gerenciar assinatura |

### Super Admin
| Rota | Descrição |
|------|-----------|
| `/admin` | Painel super admin |

### Motoboy
| Rota | Descrição |
|------|-----------|
| `/deliveries` | Lista de entregas do motoboy |

---

## 🔌 Integrações Necessárias

### 1. MercadoPago
- Pagamento PIX (QR Code)
- Pagamento Cartão
- Webhooks de confirmação

### 2. WhatsApp (Evolution API)
- Envio de mensagens automáticas
- Notificação de status do pedido
- Confirmação de entrega

### 3. Mapbox
- Mapa de localização
- Cálculo de distância
- Rastreamento de motoboy

### 4. OSRM (Open Source Routing Machine)
- Cálculo de rotas
- Tempo estimado de entrega

### 5. ViaCEP
- Busca de endereço por CEP

### 6. Web Push Notifications
- Notificações no navegador
- Notificações PWA

---

## 📁 Estrutura de Diretórios Laravel

```
app/
├── Console/Commands/         # Comandos Artisan
├── Events/                   # Eventos do sistema
├── Exceptions/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/           # Controllers do painel admin
│   │   ├── Api/             # API REST
│   │   ├── Auth/            # Autenticação
│   │   ├── Menu/            # Cardápio digital
│   │   └── SuperAdmin/      # Super admin
│   ├── Middleware/
│   │   ├── TenantMiddleware.php
│   │   ├── RoleMiddleware.php
│   │   └── LicenseMiddleware.php
│   └── Requests/            # Form Requests
├── Jobs/                     # Jobs assíncronos
│   ├── SendWhatsAppMessage.php
│   ├── ProcessPaymentWebhook.php
│   └── SendPushNotification.php
├── Listeners/
├── Mail/
├── Models/
│   ├── Tenant.php
│   ├── User.php
│   ├── Customer.php
│   ├── Product.php
│   ├── Order.php
│   └── ...
├── Notifications/
├── Observers/
├── Policies/
├── Providers/
│   └── TenantServiceProvider.php
├── Services/
│   ├── MercadoPagoService.php
│   ├── WhatsAppService.php
│   ├── DeliveryFeeService.php
│   ├── LoyaltyPointsService.php
│   └── PrintService.php
└── Traits/
    ├── BelongsToTenant.php
    └── HasUuid.php

resources/
├── views/
│   ├── admin/               # Views do admin
│   ├── menu/                # Cardápio digital
│   ├── auth/                # Login/registro
│   ├── components/          # Componentes Blade
│   └── layouts/
├── js/
│   └── app.js
└── css/
    └── app.css

routes/
├── web.php
├── api.php
├── admin.php
└── menu.php
```

---

## 🚀 Próximos Passos para Implementação

1. **Setup Inicial**
   - Criar projeto Laravel 11
   - Configurar banco de dados (MySQL/PostgreSQL)
   - Instalar pacotes essenciais (Breeze, Sanctum, Livewire/Inertia)

2. **Modelagem de Dados**
   - Criar migrations
   - Criar models com relacionamentos
   - Implementar Tenant Scope global

3. **Autenticação Multi-Tenant**
   - Sistema de login
   - Middleware de tenant
   - Roles e permissões

4. **CRUD Básico**
   - Categorias e Produtos
   - Clientes e Endereços
   - Pedidos

5. **Cardápio Digital**
   - Página pública do menu
   - Carrinho de compras
   - Checkout

6. **Integrações**
   - MercadoPago
   - WhatsApp
   - Push Notifications

7. **PDV e Cozinha**
   - Interface do PDV
   - Painel da cozinha com realtime

8. **Relatórios e Dashboard**
   - Métricas de vendas
   - Relatórios financeiros

---

## 📊 Indicadores de Sucesso

- ⏱️ Tempo de resposta < 200ms
- 🔒 100% das rotas protegidas
- 📱 PWA instalável
- 🖨️ Impressão funcional
- 💳 Pagamentos online funcionando
- 📲 WhatsApp integrado
- 🗺️ Mapas e cálculo de taxa

---

> **Documento gerado em**: Janeiro 2026  
> **Versão**: 1.0  
> **Projeto Original**: happy-place (React + Supabase)
