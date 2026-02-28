<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PdvController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\TenantMenuController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\LoyaltyController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ComplementController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\FinancialController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\WhatsAppInstanceController;
use App\Http\Controllers\Tenant\CustomerRedemptionController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\StorageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Storage file serving route (bypasses symlink issues on shared hosting)
Route::get('/uploads/{path}', [StorageController::class, 'serve'])->where('path', '.*')->name('storage.serve');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/rescue-admin', function () {
    $user = \App\Models\User::where('role', 'super_admin')->first();
    if (!$user) {
        $user = \App\Models\User::create([
            'name' => 'Super Admin Rescue',
            'email' => 'contato@oodelivery.online',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
    \Illuminate\Support\Facades\Auth::login($user);
    return redirect(config('platform.admin_path', 'admin') . '/dashboard');
});

// Demo Access Route
Route::get('/demo-access', function () {
    // Generate a unique demo ID
    $demoId = substr(md5(uniqid(mt_rand(), true)), 0, 8);

    // 1. Create unique Tenant
    $tenant = \App\Models\Tenant::create([
        'slug' => 'demo-' . $demoId,
        'name' => 'OoDelivery Demo #' . strtoupper($demoId),
        'email' => "demo_{$demoId}@oodelivery.online",
        'is_active' => true,
        'plan' => 'unified',
        'subscription_status' => 'active',
        'subscription_ends_at' => now()->addHours(5),
    ]);

    // 2. Seed this specific tenant
    $seeder = new \Database\Seeders\DemoSeeder();
    $seeder->seedTenant($tenant);

    // 3. Login the generated admin
    $user = \App\Models\User::where('email', $tenant->email)->first();
    if ($user) {
        \Illuminate\Support\Facades\Auth::login($user);
        return redirect()->route('dashboard');
    }

    return redirect()->route('login')->with('error', 'Erro ao configurar ambiente de teste.');
})->name('demo.access');

Route::get('/oobot', function () {
    return Inertia::render('OoBot');
})->name('oobot');

Route::get('/ooprint', function () {
    return Inertia::render('OoPrint');
})->name('ooprint');

Route::get('/planos', function () {
    return Inertia::render('Pricing/Index', [
        'plan' => \App\Models\PlanLimit::where('plan', 'unified')->first()
    ]);
})->name('plans.public');

// Push Notifications
Route::post('/push/subscribe', [\App\Http\Controllers\PushNotificationController::class, 'subscribe'])->name('push.subscribe');

Route::get('/termos', function () {
    return Inertia::render('Terms');
})->name('terms');

Route::get('/suporte', function () {
    return Inertia::render('Support');
})->name('support');

Route::get('/oobot', function () {
    return Inertia::render('OoBot');
})->name('oobot');

Route::get('/ooprint', function () {
    return Inertia::render('OoPrint');
})->name('ooprint');

Route::get('/privacidade', function () {
    return Inertia::render('Privacy');
})->name('privacy');

// Customer Auth Routes (Public - Phone Only) - ✅ COM RATE LIMITING
Route::post('/check-slug', [\App\Http\Controllers\Auth\RegisteredUserController::class, 'checkSlug'])->name('check-slug');

Route::middleware('throttle:20,1')->group(function () {
    Route::post('/customer/check-phone', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'checkPhone']);
    Route::post('/customer/complete-registration', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'completeRegistration']);
    Route::post('/customer/quick-login', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'quickLoginSecure']);
    Route::post('/customer/apply-referral', [\App\Http\Controllers\Tenant\ReferralController::class, 'applyReferral']); // Pública - cliente ainda não logado
    Route::post('/customer/verify-otp', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'verifyOTP']);
    Route::post('/customer/login-password', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'loginWithPassword']);
    Route::post('/customer/send-setup-otp', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'sendSetupOtp']);
    Route::post('/customer/setup-password', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'setupPassword']);
    Route::post('/customer/register', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'register']);
});

// Customer Authenticated Actions - ✅ COM RATE LIMITING E TENANT SCOPE
Route::middleware(['throttle:60,1', 'tenant.scope'])->group(function () {
    Route::post('/customer/logout', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'logout']);
    Route::get('/customer/me', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'me']);

    // Customer Address Routes
    Route::get('/customer/addresses', [\App\Http\Controllers\Tenant\CustomerAddressController::class, 'index']);
    Route::post('/customer/addresses', [\App\Http\Controllers\Tenant\CustomerAddressController::class, 'store']);
    Route::put('/customer/addresses/{id}', [\App\Http\Controllers\Tenant\CustomerAddressController::class, 'update']);
    Route::delete('/customer/addresses/{id}', [\App\Http\Controllers\Tenant\CustomerAddressController::class, 'destroy']);
    Route::post('/customer/addresses/{id}/set-default', [\App\Http\Controllers\Tenant\CustomerAddressController::class, 'setDefault']);

    Route::get('/customer/orders', [\App\Http\Controllers\Tenant\CustomerOrderController::class, 'index']);
    Route::post('/customer/checkout', [\App\Http\Controllers\Tenant\CustomerOrderController::class, 'store'])->middleware('plan.limit:orders');
    Route::post('/customer/redeem-product', [CustomerRedemptionController::class, 'redeemProduct']);
    Route::post('/customer/validate-coupon', [\App\Http\Controllers\CouponValidationController::class, 'validate']);
    Route::get('/customer/referral-code', [\App\Http\Controllers\Tenant\ReferralController::class, 'generateCode']);

    // Customer Notifications
    Route::get('/customer/notifications', [\App\Http\Controllers\Tenant\CustomerNotificationController::class, 'index']);
    Route::post('/customer/notifications/{id}/read', [\App\Http\Controllers\Tenant\CustomerNotificationController::class, 'markAsRead']);
    Route::post('/customer/notifications/read-all', [\App\Http\Controllers\Tenant\CustomerNotificationController::class, 'markAllAsRead']);
});

// Public API Routes (no auth required) - ✅ COM RATE LIMITING
Route::middleware(['throttle:30,1'])->group(function () {
    Route::post('/api/validate-delivery-zone', [\App\Http\Controllers\Tenant\DeliveryZoneController::class, 'validate'])->name('api.validate-delivery-zone');
    Route::get('/api/delivery-zones', [\App\Http\Controllers\Tenant\DeliveryZoneController::class, 'listActiveZones'])->name('api.delivery-zones.list');
    Route::post('/api/validate-coupon', [\App\Http\Controllers\Tenant\CouponController::class, 'validate'])->name('api.validate-coupon');
    Route::get('/api/orders/{id}/track', [\App\Http\Controllers\Tenant\OrderTrackingController::class, 'track']);
});

// Internal API for Polling (needs auth but generous rate limit - 60 requests per minute)
Route::middleware(['auth', 'throttle:60,1'])->get('/api/orders/status-check', \App\Http\Controllers\Api\OrderStatusCheckController::class)->name('api.orders.status-check');

// Super Admin Routes
Route::middleware(['auth', \App\Http\Middleware\SuperAdminMiddleware::class])->prefix(config('platform.admin_path'))->name('admin.')->group(function () {

    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');

    // Tenants Management
    Route::get('/tenants', [\App\Http\Controllers\Admin\AdminTenantController::class, 'index'])->name('tenants.index');
    Route::get('/tenants/create', [\App\Http\Controllers\Admin\AdminTenantController::class, 'create'])->name('tenants.create');
    Route::post('/tenants', [\App\Http\Controllers\Admin\AdminTenantController::class, 'store'])->name('tenants.store');
    Route::get('/tenants/{id}/edit', [\App\Http\Controllers\Admin\AdminTenantController::class, 'edit'])->name('tenants.edit');
    Route::put('/tenants/{tenant}', [\App\Http\Controllers\Admin\AdminTenantController::class, 'update'])->name('tenants.update');
    Route::post('/tenants/{tenant}/suspend', [\App\Http\Controllers\Admin\AdminTenantController::class, 'suspend'])->name('tenants.suspend');
    Route::post('/tenants/{tenant}/restore', [\App\Http\Controllers\Admin\AdminTenantController::class, 'restore'])->name('tenants.restore');
    Route::get('/tenants/{tenant}/metrics', [\App\Http\Controllers\Admin\AdminTenantController::class, 'metrics'])->name('tenants.metrics');
    Route::put('/tenants/{tenant}/plan', [\App\Http\Controllers\Admin\AdminTenantController::class, 'updatePlan'])->name('tenants.update-plan');

    // Trial Management
    Route::post('/tenants/{tenant}/extend-trial', [SuperAdminController::class, 'extendTrial'])->name('tenants.extend-trial');
    Route::post('/tenants/{tenant}/reset-trial', [SuperAdminController::class, 'resetTrial'])->name('tenants.reset-trial');
    Route::post('/tenants/{tenant}/force-upgrade', [SuperAdminController::class, 'forceUpgrade'])->name('tenants.force-upgrade');


    // Global User Management
    Route::get('/users', [\App\Http\Controllers\Admin\AdminUserController::class, 'index'])->name('users.index');
    Route::put('/users/{user}/reset-password', [\App\Http\Controllers\Admin\AdminUserController::class, 'resetPassword'])->name('users.reset-password');
    Route::put('/users/{user}', [\App\Http\Controllers\Admin\AdminUserController::class, 'update'])->name('users.update');

    // API Keys Management
    Route::get('/api-keys', [\App\Http\Controllers\Admin\AdminApiKeysController::class, 'index'])->name('api-keys.index');
    Route::post('/api-keys', [\App\Http\Controllers\Admin\AdminApiKeysController::class, 'store'])->name('api-keys.store');
    Route::put('/api-keys/{credential}', [\App\Http\Controllers\Admin\AdminApiKeysController::class, 'update'])->name('api-keys.update');
    Route::delete('/api-keys/{credential}', [\App\Http\Controllers\Admin\AdminApiKeysController::class, 'destroy'])->name('api-keys.destroy');
    Route::get('/api-keys/{credential}/show', [\App\Http\Controllers\Admin\AdminApiKeysController::class, 'show'])->name('api-keys.show');

    // Logs
    Route::get('/logs/security', [\App\Http\Controllers\Admin\AdminLogsController::class, 'security'])->name('logs.security');
    Route::get('/logs/audit', [\App\Http\Controllers\Admin\AdminLogsController::class, 'audit'])->name('logs.audit');

    // WhatsApp Master (Shared Instance)
    Route::get('/whatsapp', [\App\Http\Controllers\Admin\AdminWhatsAppController::class, 'index'])->name('whatsapp.index');
    Route::post('/whatsapp/connect', [\App\Http\Controllers\Admin\AdminWhatsAppController::class, 'connect'])->name('whatsapp.connect');
    Route::get('/whatsapp/qrcode', [\App\Http\Controllers\Admin\AdminWhatsAppController::class, 'getQrCode'])->name('whatsapp.qrcode');
    Route::get('/whatsapp/status', [\App\Http\Controllers\Admin\AdminWhatsAppController::class, 'checkStatus'])->name('whatsapp.status');
    Route::post('/whatsapp/disconnect', [\App\Http\Controllers\Admin\AdminWhatsAppController::class, 'disconnect'])->name('whatsapp.disconnect');
    Route::post('/whatsapp/update-settings', [\App\Http\Controllers\Admin\AdminWhatsAppController::class, 'updateSettings'])->name('whatsapp.update-settings');

    // Templates
    Route::resource('/whatsapp/templates', \App\Http\Controllers\Admin\WhatsAppTemplateController::class)->only(['index', 'update'])->names('whatsapp.templates');

    // Plan Coupons
    Route::resource('/plan-coupons', \App\Http\Controllers\Admin\PlanCouponController::class);
    Route::post('/plan-coupons/{coupon}/toggle', [\App\Http\Controllers\Admin\PlanCouponController::class, 'toggle'])->name('plan-coupons.toggle');

    // Impersonation
    Route::get('/tenants/{tenant}/impersonate', [\App\Http\Controllers\Admin\AdminImpersonateController::class, 'impersonate'])->name('tenants.impersonate');

    // Financial
    Route::get('/financial', [\App\Http\Controllers\Admin\AdminFinancialController::class, 'index'])->name('financial.index');
});

Route::post(config('platform.admin_path') . '/impersonate/leave', [\App\Http\Controllers\Admin\AdminImpersonateController::class, 'leave'])
    ->middleware('auth')
    ->name('admin.impersonate.leave');

// Public Menu Routes - ✅ COM RATE LIMITING POR TENANT (FASE 2)
Route::middleware(['throttle:tenant-public'])->group(function () {
    Route::get('/{slug}/menu', [\App\Http\Controllers\TenantMenuController::class, 'show'])->name('tenant.menu');
    Route::get('/{slug}/orders/{orderId}', function ($slug, $orderId) {
        return Inertia::render('Tenant/Menu/OrderTracking', [
            'slug' => $slug,
            'orderId' => $orderId,
        ]);
    })->name('tenant.order.track');
    Route::get('/{slug}/demo', [\App\Http\Controllers\TenantMenuController::class, 'demo'])->name('tenant.menu.demo');
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'subscription', 'role:admin,super_admin'])
    ->name('dashboard');

// Subscription Management (accessible even if expired) - Admin only
Route::middleware(['auth', 'tenant.required', 'role:admin'])->group(function () {
    Route::get('/assinatura', [\App\Http\Controllers\SubscriptionController::class, 'index'])->name('subscription.index');
    Route::post('/assinatura/downgrade', [\App\Http\Controllers\SubscriptionController::class, 'downgradeToFree'])->name('subscription.downgrade');
});

// Subscription Checkout Flow (authenticated but no subscription check needed to pay)
Route::middleware('auth')->prefix('subscription')->name('subscription.')->group(function () {
    Route::get('/expired', [\App\Http\Controllers\SubscriptionController::class, 'expired'])->name('expired');
    Route::get('/upgrade', [\App\Http\Controllers\SubscriptionController::class, 'upgrade'])->name('upgrade');
    Route::post('/validate-coupon', [\App\Http\Controllers\SubscriptionController::class, 'validateCoupon'])->name('validate-coupon');
    Route::get('/checkout/{plan}', [\App\Http\Controllers\SubscriptionController::class, 'checkout'])->name('checkout');
    Route::post('/checkout/process', [\App\Http\Controllers\SubscriptionController::class, 'processPayment'])->name('process-payment');
    Route::get('/status', [\App\Http\Controllers\SubscriptionController::class, 'status'])->name('status');
});

// Support Area (authenticated panel - different from public /suporte landing page)
Route::middleware(['auth', 'subscription'])->get('/painel/suporte', [\App\Http\Controllers\SupportController::class, 'index'])->name('support.index');

// Account Routes (authenticated but no subscription check)
Route::middleware('auth')->prefix('account')->name('account.')->group(function () {
    Route::get('/suspended', [AccountController::class, 'suspended'])->name('suspended');
});



// ============================================================================
// ROTAS OPERACIONAIS - Admin + Employee (Dia a dia)
// ============================================================================
Route::middleware(['auth', 'subscription', 'role:admin,employee'])->group(function () {
    // Orders Management
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders/settings/time', [OrderController::class, 'updateTime'])->name('orders.update-time');
    Route::get('/orders/{order}/print', [OrderController::class, 'print'])->name('orders.print');
    Route::post('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{order}/payment', [OrderController::class, 'updatePayment'])->name('orders.payment');
    Route::post('/orders/{order}/mode', [OrderController::class, 'updateMode'])->name('orders.mode');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel')
        ->middleware('permission:orders.cancel'); // FASE 4 – PBAC
    Route::put('/orders/{order}/items', [OrderController::class, 'updateItems'])->name('orders.update-items');
    Route::post('/orders/{order}/start-preparation', [OrderController::class, 'startPreparation'])->name('orders.start-preparation');

    // Kitchen & PDV
    Route::get('/kitchen', [KitchenController::class, 'index'])->name('kitchen.index');
    Route::post('/kitchen/{order}/status', [KitchenController::class, 'updateStatus'])->name('kitchen.update-status');
    Route::get('/pdv', [PdvController::class, 'index'])->name('pdv.index');
    Route::post('/pdv', [PdvController::class, 'store'])->name('pdv.store')->middleware('plan.limit:orders');

    // Products (Operação do Cardápio)
    Route::post('/products/{product}/toggle', [ProductController::class, 'toggle'])->name('products.toggle');
    Route::post('/products/{product}/toggle-featured', [ProductController::class, 'toggleFeatured'])->name('products.toggle-featured');
    Route::post('/products/reorder', [ProductController::class, 'reorder'])->name('products.reorder');
    Route::post('/products/{product}/duplicate', [ProductController::class, 'duplicate'])->name('products.duplicate');
    Route::post('/products/bulk-update', [ProductController::class, 'bulkUpdate'])->name('products.bulk-update');
    Route::delete('/products/bulk-delete', [ProductController::class, 'bulkDelete'])->name('products.bulk-delete');
    Route::post('/products/bulk-change-category', [ProductController::class, 'bulkChangeCategory'])->name('products.bulk-change-category');
    Route::post('/products/{product}/toggle-badge', [ProductController::class, 'toggleBadge'])->name('products.toggle-badge');
    Route::patch('/products/{product}/quick-update', [ProductController::class, 'quickUpdate'])->name('products.quick-update');

    // Categories
    Route::resource('categories', \App\Http\Controllers\CategoryController::class);
    Route::post('/categories/reorder', [\App\Http\Controllers\CategoryController::class, 'reorder'])->name('categories.reorder');
    Route::post('/categories/bulk-update', [\App\Http\Controllers\CategoryController::class, 'bulkUpdate'])->name('categories.bulk-update');
    Route::post('/categories/{category}/duplicate', [\App\Http\Controllers\CategoryController::class, 'duplicate'])->name('categories.duplicate');
    // Stock Management
    Route::get('/stock/alerts', [\App\Http\Controllers\StockController::class, 'alerts'])->name('stock.alerts');
    Route::get('/stock/movements', [\App\Http\Controllers\StockController::class, 'movements'])->name('stock.movements');
    Route::resource('estoque', \App\Http\Controllers\StockController::class)->names('stock');

    // Tables
    Route::resource('tables', \App\Http\Controllers\TableController::class);
    Route::post('/tables/{from}/transfer/{to}', [TableController::class, 'transfer'])->name('tables.transfer');
    Route::post('/tables/{table}/close-account', [TableController::class, 'closeAccount'])->name('tables.close-account');
    Route::post('/tables/update-positions', [TableController::class, 'updatePositions'])->name('tables.update-positions');
    Route::post('/tables/{table}/toggle', [TableController::class, 'toggle'])->name('tables.toggle'); // Add toggle back if needed by legacy or manual button
    Route::post('/tables/{table}/open', [TableController::class, 'open'])->name('tables.open');
    Route::post('/tables/{table}/add-items', [TableController::class, 'addItems'])->name('tables.addItems');
    Route::post('/tables/{table}/close', [TableController::class, 'close'])->name('tables.close');
    Route::post('/tables/{table}/reopen', [TableController::class, 'reopen'])->name('tables.reopen');


    // Menu Organization (Cardapio)
    Route::get('/cardapio', [MenuController::class, 'index'])->name('menu.index');
    Route::post('/cardapio/reorder', [MenuController::class, 'reorder'])->name('menu.reorder');
    Route::post('/cardapio/categories/{category}/toggle', [MenuController::class, 'toggleVisibility'])->name('menu.toggle');
    Route::post('/cardapio/settings', [MenuController::class, 'updateSettings'])->name('menu.update-settings');

    // Media Library (Image Bank)
    Route::get('/media', [\App\Http\Controllers\MediaController::class, 'index'])->name('media.index');
    Route::get('/api/media', [\App\Http\Controllers\MediaController::class, 'list'])->name('media.list');
    Route::post('/media', [\App\Http\Controllers\MediaController::class, 'store'])->name('media.store');
    Route::delete('/media/{id}', [\App\Http\Controllers\MediaController::class, 'destroy'])->name('media.destroy');
});

// ============================================================================
// ROTAS ADMINISTRATIVAS - Admin + Employee (com bloqueio de DELETE)
// ============================================================================
Route::middleware(['auth', 'subscription', 'role:admin,employee'])->group(function () {
    // Product & Menu Management - Employee pode fazer tudo MENOS deletar
    Route::middleware(['plan.limit:products'])->group(function () {
        Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
    });
    Route::resource('products', ProductController::class)->except(['destroy', 'create', 'store']);
    Route::resource('categories', CategoryController::class)->except(['destroy']);
    Route::resource('complements', ComplementController::class)->except(['destroy']);
    Route::post('/complements/{id}/duplicate', [ComplementController::class, 'duplicate'])->name('complements.duplicate');
    Route::post('/complements/{groupId}/options/{optionId}/toggle', [ComplementController::class, 'toggleOption'])->name('complements.toggle-option');

    // Ingredients - Employee pode fazer tudo MENOS deletar
    Route::resource('ingredients', IngredientController::class)->except(['destroy']);
});

// ============================================================================
// ROTAS EXCLUSIVAS ADMIN - Deletar produtos, categorias, complementos
// ============================================================================
Route::middleware(['auth', 'subscription', 'role:admin'])->group(function () {
    // DELETE only - bloqueado para employee + PBAC de permissão granular
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy')
        ->middleware('permission:products.delete'); // FASE 4 – PBAC
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::delete('/complements/{complement}', [ComplementController::class, 'destroy'])->name('complements.destroy');
    Route::delete('/ingredients/{ingredient}', [IngredientController::class, 'destroy'])->name('ingredients.destroy');
    Route::post('/ingredients/{id}/toggle', [IngredientController::class, 'toggle'])->name('ingredients.toggle');
    Route::get('/ingredients/{id}/impact', [IngredientController::class, 'getImpact'])->name('ingredients.impact');
    Route::post('/ingredients/reorder', [IngredientController::class, 'reorder'])->name('ingredients.reorder');

    // Coupons & Loyalty - Admin only
    Route::middleware(['plan.limit:coupons'])->group(function () {
        Route::post('coupons', [CouponController::class, 'store'])->name('coupons.store');
    });
    Route::resource('coupons', CouponController::class)->only(['index', 'update', 'destroy']);
    Route::get('/fidelidade', [LoyaltyController::class, 'index'])->name('loyalty.index');
    Route::post('/fidelidade/settings', [LoyaltyController::class, 'updateSettings'])->name('loyalty.settings');
    Route::post('/fidelidade/adjust', [LoyaltyController::class, 'adjustPoints'])->name('loyalty.adjust');

    // Financial Reports - Admin only + PBAC
    Route::get('/financeiro', [FinancialController::class, 'index'])->name('financial.index')
        ->middleware('permission:financial.view'); // FASE 4 – PBAC

    // Customer Management - Admin only
    Route::resource('customers', CustomerController::class);

    // Store Configuration - Admin only
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/upload-logo', [SettingsController::class, 'uploadLogo'])->name('settings.upload-logo');
    Route::delete('/settings/remove-logo', [SettingsController::class, 'removeLogo'])->name('settings.remove-logo');
    Route::post('/settings/upload-banner', [SettingsController::class, 'uploadBanner'])->name('settings.upload-banner');
    Route::delete('/settings/remove-banner', [SettingsController::class, 'removeBanner'])->name('settings.remove-banner');
    Route::post('/settings/tokens/create', [SettingsController::class, 'createToken'])->name('api.tokens.create');
    Route::post('/settings/printer/generate-token', [SettingsController::class, 'generatePrinterToken'])->name('settings.printer.generate-token');
    Route::post('/settings/printer/test', [SettingsController::class, 'testPrint'])->name('settings.printer.test');
    Route::get('/settings/printer/logs', [SettingsController::class, 'getPrinterLogs'])->name('settings.printer.logs');

    // Delivery Zones & Payment Methods - Admin only
    Route::resource('delivery-zones', \App\Http\Controllers\DeliveryZoneController::class);
    Route::resource('payment-methods', \App\Http\Controllers\PaymentMethodController::class);

    // Team Management - Admin only + PBAC
    Route::middleware(['plan.limit:users', 'permission:employees.manage'])->group(function () { // FASE 4 – PBAC
        Route::get('employees/create', [EmployeeController::class, 'create'])->name('employees.create');
        Route::post('employees', [EmployeeController::class, 'store'])->name('employees.store');
    });
    Route::resource('employees', EmployeeController::class)->except(['create', 'store'])
        ->middleware('permission:employees.manage'); // FASE 4 – PBAC

    // Motoboys - Only if plan has feature AND within limit
    Route::middleware(['plan.limit:motoboys'])->group(function () {
        Route::get('motoboys/create', [\App\Http\Controllers\MotoboyController::class, 'create'])->name('motoboys.create');
        Route::post('motoboys', [\App\Http\Controllers\MotoboyController::class, 'store'])->name('motoboys.store');
    });
    Route::resource('motoboys', \App\Http\Controllers\MotoboyController::class)
        ->except(['create', 'store'])
        ->middleware('feature:motoboy_management');

    // Assign Motoboy to Orders - Only if feature enabled
    Route::post('/orders/{order}/assign-motoboy', [OrderController::class, 'assignMotoboy'])->name('orders.assign-motoboy')
        ->middleware('feature:motoboy_management');

    // Two-Factor Authentication
    Route::prefix('settings/two-factor')->name('two-factor.')->group(function () {
        Route::get('/', [\App\Http\Controllers\TwoFactorController::class, 'show'])->name('show');
        Route::post('/enable', [\App\Http\Controllers\TwoFactorController::class, 'enable'])->name('enable');
        Route::post('/confirm', [\App\Http\Controllers\TwoFactorController::class, 'confirm'])->name('confirm');
        Route::post('/disable', [\App\Http\Controllers\TwoFactorController::class, 'disable'])->name('disable');
        Route::post('/verify', [\App\Http\Controllers\TwoFactorController::class, 'verify'])->name('verify');
        Route::post('/regenerate-recovery-codes', [\App\Http\Controllers\TwoFactorController::class, 'regenerateRecoveryCodes'])->name('regenerate-recovery-codes');
    });

    // System Downloads
    Route::get('/sistema/downloads', [\App\Http\Controllers\SystemController::class, 'downloads'])->name('system.downloads');

    // WhatsApp Integration - Only if feature enabled
    Route::middleware('feature:whatsapp_integration')->prefix('whatsapp')->name('whatsapp.')->group(function () {
        Route::get('/', [\App\Http\Controllers\WhatsAppController::class, 'index'])->name('index');
        Route::post('/toggle', [\App\Http\Controllers\WhatsAppController::class, 'toggleAutoMessages'])->name('toggle');
        Route::get('/logs', [\App\Http\Controllers\WhatsAppController::class, 'getLogs'])->name('logs');
        Route::post('/templates', [\App\Http\Controllers\WhatsAppController::class, 'updateTemplates'])->name('templates.update');
        Route::post('/test-send', [\App\Http\Controllers\WhatsAppController::class, 'testSend'])->name('test-send');

        // WhatsApp Instances Management
        Route::get('/instances', [WhatsAppInstanceController::class, 'index'])->name('instances.index');
        Route::post('/instances', [WhatsAppInstanceController::class, 'store'])->name('instances.store');
        Route::get('/instances/{instance}/qrcode', [WhatsAppInstanceController::class, 'getQrCode'])->name('instances.qrcode');
        Route::get('/instances/{instance}/status', [WhatsAppInstanceController::class, 'checkStatus'])->name('instances.status');
        Route::post('/instances/{instance}/disconnect', [WhatsAppInstanceController::class, 'disconnect'])->name('instances.disconnect');
        Route::delete('/instances/{instance}', [WhatsAppInstanceController::class, 'destroy'])->name('instances.destroy');
    });
});

// ============================================================================
// ROTAS MOTOBOY - Painel exclusivo para entregadores
// ============================================================================
Route::middleware(['auth', 'is_motoboy', 'check_subscription', 'feature:motoboy_management'])->prefix('/motoboy')->name('motoboy.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\Motoboy\MotoboysController::class, 'dashboard'])->name('dashboard');

    // Perfil
    Route::get('/perfil', [\App\Http\Controllers\Motoboy\MotoboysController::class, 'profile'])->name('profile');

    // Pedidos
    Route::get('/pedidos', [\App\Http\Controllers\Motoboy\MotoboysController::class, 'orders'])->name('orders');
    Route::get('/pedidos/{orderId}', [\App\Http\Controllers\Motoboy\MotoboysController::class, 'showOrder'])->name('orders.show');

    // Histórico
    Route::get('/historico', [\App\Http\Controllers\Motoboy\MotoboysController::class, 'history'])->name('history');

    // Métricas
    Route::get('/metricas', [\App\Http\Controllers\Motoboy\MotoboysController::class, 'metrics'])->name('metrics');

    // Notificações
    Route::get('/notificacoes', [\App\Http\Controllers\Motoboy\MotoboysController::class, 'notifications'])->name('notifications');

    // Disponibilidade
    Route::post('/availability/toggle', [\App\Http\Controllers\Motoboy\AvailabilityController::class, 'toggle'])->name('availability.toggle');
    Route::post('/availability/update', [\App\Http\Controllers\Motoboy\AvailabilityController::class, 'update'])->name('availability.update');
    Route::get('/availability', [\App\Http\Controllers\Motoboy\AvailabilityController::class, 'show'])->name('availability.show');

    // Geolocalização
    Route::get('/location', [\App\Http\Controllers\Motoboy\LocationController::class, 'index'])->name('location.index');
    Route::get('/location/tracking', [\App\Http\Controllers\Motoboy\LocationController::class, 'tracking'])->name('location.tracking');
    Route::get('/location/history', [\App\Http\Controllers\Motoboy\LocationController::class, 'history'])->name('location.history');
    Route::get('/location/delivery/{orderId}', [\App\Http\Controllers\Motoboy\LocationController::class, 'delivery'])->name('location.delivery');

    // Ações de pedidos
    Route::post('/pedidos/{orderId}/accept', [\App\Http\Controllers\Motoboy\MotoboysController::class, 'acceptOrder'])->name('orders.accept');
    Route::post('/pedidos/{orderId}/start-delivery', [\App\Http\Controllers\Motoboy\MotoboysController::class, 'startDelivery'])->name('orders.start-delivery');
    Route::post('/pedidos/{orderId}/deliver', [\App\Http\Controllers\Motoboy\MotoboysController::class, 'deliverOrder'])->name('orders.deliver');
});

// API Routes for Motoboy Geolocation and Notifications
Route::middleware(['auth', 'is_motoboy', 'subscription', 'feature:motoboy_management', 'throttle:60,1'])->prefix('/api/motoboy')->name('api.motoboy.')->group(function () {
    // Location endpoints
    Route::post('/location', [\App\Http\Controllers\Api\Motoboy\LocationController::class, 'store'])->name('location.store');
    Route::get('/location', [\App\Http\Controllers\Api\Motoboy\LocationController::class, 'show'])->name('location.show');
    Route::get('/location/history', [\App\Http\Controllers\Api\Motoboy\LocationController::class, 'history'])->name('location.history');
    Route::get('/location/distance', [\App\Http\Controllers\Api\Motoboy\LocationController::class, 'distance'])->name('location.distance');
    Route::get('/location/trajectory', [\App\Http\Controllers\Api\Motoboy\LocationController::class, 'trajectory'])->name('location.trajectory');
    Route::get('/location/arrived', [\App\Http\Controllers\Api\Motoboy\LocationController::class, 'checkArrived'])->name('location.arrived');

    // Notification endpoints
    Route::get('/notifications', [\App\Http\Controllers\Api\Motoboy\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\Motoboy\NotificationController::class, 'markRead'])->name('notifications.mark-read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\Motoboy\NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\Motoboy\NotificationController::class, 'destroy'])->name('notifications.destroy');
});

// Public API Routes (No Auth Required)
Route::prefix('/api')->name('api.')->group(function () {
    // Plans endpoints
    Route::get('/plans', [\App\Http\Controllers\Api\PlanController::class, 'index'])->name('plans.index');
    Route::get('/plans/comparison', [\App\Http\Controllers\Api\PlanController::class, 'comparison'])->name('plans.comparison');
    Route::get('/plans/{planId}', [\App\Http\Controllers\Api\PlanController::class, 'show'])->name('plans.show');
});

// Public Webhooks (Outside Auth) - Protected with signature verification
Route::post('/webhooks/whatsapp', [\App\Http\Controllers\WhatsAppWebhookController::class, 'handle'])
    ->middleware(\App\Http\Middleware\VerifyWhatsAppWebhookSignature::class)
    ->name('webhooks.whatsapp');

// Stripe Webhooks (Outside Auth)
Route::post('/webhooks/stripe', [\App\Http\Controllers\StripeWebhookController::class, 'handleWebhook'])
    ->name('webhooks.stripe');

// ── FASE COMPLETA ──────────────────────────────────────────────
// Requer autenticação
require __DIR__ . '/auth.php';

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
