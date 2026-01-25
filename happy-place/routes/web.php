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
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/planos', function () {
    return Inertia::render('Welcome/Plans'); // Creating a dedicated folder for welcome related pages
})->name('plans');

// Customer Auth Routes (Public - Phone Only)
Route::post('/check-slug', [\App\Http\Controllers\Auth\RegisteredUserController::class, 'checkSlug'])->name('check-slug');

Route::post('/customer/check-phone', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'checkPhone']);
Route::post('/customer/complete-registration', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'completeRegistration']);
Route::post('/customer/logout', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'logout']);
Route::get('/customer/me', [\App\Http\Controllers\Tenant\CustomerAuthController::class, 'me']);

// Customer Address Routes
Route::get('/customer/addresses', [\App\Http\Controllers\Tenant\CustomerAddressController::class, 'index']);
Route::post('/customer/addresses', [\App\Http\Controllers\Tenant\CustomerAddressController::class, 'store']);
Route::put('/customer/addresses/{id}', [\App\Http\Controllers\Tenant\CustomerAddressController::class, 'update']);
Route::delete('/customer/addresses/{id}', [\App\Http\Controllers\Tenant\CustomerAddressController::class, 'destroy']);
Route::post('/customer/addresses/{id}/set-default', [\App\Http\Controllers\Tenant\CustomerAddressController::class, 'setDefault']);


// Super Admin Routes
Route::middleware(['auth', \App\Http\Middleware\SuperAdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');

    // Tenants Management
    Route::get('/tenants', [\App\Http\Controllers\Admin\AdminTenantController::class, 'index'])->name('tenants.index');
    Route::post('/tenants', [\App\Http\Controllers\Admin\AdminTenantController::class, 'store'])->name('tenants.store');
    Route::put('/tenants/{tenant}', [\App\Http\Controllers\Admin\AdminTenantController::class, 'update'])->name('tenants.update');
    Route::post('/tenants/{tenant}/suspend', [\App\Http\Controllers\Admin\AdminTenantController::class, 'suspend'])->name('tenants.suspend');
    Route::post('/tenants/{tenant}/restore', [\App\Http\Controllers\Admin\AdminTenantController::class, 'restore'])->name('tenants.restore');
    Route::get('/tenants/{tenant}/metrics', [\App\Http\Controllers\Admin\AdminTenantController::class, 'metrics'])->name('tenants.metrics');

    // API Keys Management
    Route::get('/api-keys', [\App\Http\Controllers\Admin\AdminApiKeysController::class, 'index'])->name('api-keys.index');
    Route::post('/api-keys', [\App\Http\Controllers\Admin\AdminApiKeysController::class, 'store'])->name('api-keys.store');
    Route::put('/api-keys/{credential}', [\App\Http\Controllers\Admin\AdminApiKeysController::class, 'update'])->name('api-keys.update');
    Route::delete('/api-keys/{credential}', [\App\Http\Controllers\Admin\AdminApiKeysController::class, 'destroy'])->name('api-keys.destroy');
    Route::get('/api-keys/{credential}/show', [\App\Http\Controllers\Admin\AdminApiKeysController::class, 'show'])->name('api-keys.show');

    // Logs
    Route::get('/logs/security', [\App\Http\Controllers\Admin\AdminLogsController::class, 'security'])->name('logs.security');
    Route::get('/logs/audit', [\App\Http\Controllers\Admin\AdminLogsController::class, 'audit'])->name('logs.audit');
});

Route::get('/{slug}/menu', [TenantMenuController::class, 'show'])->name('tenant.menu');

Route::get('/dashboard', function () {
    if (auth()->user()->isSuperAdmin()) {
        return redirect()->route('admin.dashboard');
    }
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'subscription'])->name('dashboard');

// Subscription Management (accessible even if expired)
Route::middleware(['auth', 'tenant.required'])->group(function () {
    Route::get('/assinatura', [\App\Http\Controllers\SubscriptionController::class, 'index'])->name('subscription.index');
    Route::post('/assinatura/downgrade', [\App\Http\Controllers\SubscriptionController::class, 'downgradeToFree'])->name('subscription.downgrade');
});

// Subscription Checkout Flow (authenticated but no subscription check needed to pay)
Route::middleware('auth')->prefix('subscription')->name('subscription.')->group(function () {
    Route::get('/expired', [\App\Http\Controllers\SubscriptionController::class, 'expired'])->name('expired');
    Route::get('/upgrade', [\App\Http\Controllers\SubscriptionController::class, 'upgrade'])->name('upgrade');
    Route::get('/checkout/{plan}', [\App\Http\Controllers\SubscriptionController::class, 'checkout'])->name('checkout');
    Route::get('/status', [\App\Http\Controllers\SubscriptionController::class, 'status'])->name('status');
});

// Account Routes (authenticated but no subscription check)
Route::middleware('auth')->prefix('account')->name('account.')->group(function () {
    Route::get('/suspended', [AccountController::class, 'suspended'])->name('suspended');
});



Route::middleware(['auth', 'subscription'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}/print', [OrderController::class, 'print'])->name('orders.print');
    Route::post('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{order}/assign-motoboy', [OrderController::class, 'assignMotoboy'])->name('orders.assign-motoboy');
    Route::post('/orders/{order}/payment', [OrderController::class, 'updatePayment'])->name('orders.payment');
    Route::post('/orders/{order}/mode', [OrderController::class, 'updateMode'])->name('orders.mode');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::put('/orders/{order}/items', [OrderController::class, 'updateItems'])->name('orders.update-items');
    Route::post('/orders/{order}/start-preparation', [OrderController::class, 'startPreparation'])->name('orders.start-preparation');

    // PDV Routes

    Route::post('/products/{product}/toggle', [ProductController::class, 'toggle'])->name('products.toggle');
    Route::post('/products/{product}/toggle-featured', [ProductController::class, 'toggleFeatured'])->name('products.toggle-featured');
    Route::resource('products', ProductController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('complements', ComplementController::class);
    Route::post('/complements/{id}/duplicate', [ComplementController::class, 'duplicate'])->name('complements.duplicate');
    Route::post('/complements/{groupId}/options/{optionId}/toggle', [ComplementController::class, 'toggleOption'])->name('complements.toggle-option');

    // Ingredients Routes
    Route::resource('ingredients', IngredientController::class);
    Route::post('/ingredients/{id}/toggle', [IngredientController::class, 'toggle'])->name('ingredients.toggle');
    Route::get('/ingredients/{id}/impact', [IngredientController::class, 'getImpact'])->name('ingredients.impact');
    Route::post('/ingredients/reorder', [IngredientController::class, 'reorder'])->name('ingredients.reorder');

    Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
    Route::put('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');

    // Loyalty Routes
    Route::get('/fidelidade', [LoyaltyController::class, 'index'])->name('loyalty.index');
    Route::post('/fidelidade/settings', [LoyaltyController::class, 'updateSettings'])->name('loyalty.settings');
    Route::post('/fidelidade/adjust', [LoyaltyController::class, 'adjustPoints'])->name('loyalty.adjust');

    // Customer Loyalty View (Agora via index)
    // Route::get('/meus-pontos', [LoyaltyController::class, 'myPoints'])->name('loyalty.customer');

    Route::get('/pdv', [PdvController::class, 'index'])->name('pdv.index');
    Route::post('/pdv', [PdvController::class, 'store'])->name('pdv.store');

    // Kitchen Routes
    Route::get('/kitchen', [KitchenController::class, 'index'])->name('kitchen.index');
    Route::post('/kitchen/{order}/status', [KitchenController::class, 'updateStatus'])->name('kitchen.update-status');

    // Menu Management (Organize)
    Route::get('/cardapio', [MenuController::class, 'index'])->name('menu.index');
    Route::post('/cardapio/reorder', [MenuController::class, 'reorder'])->name('menu.reorder');
    Route::post('/cardapio/categories/{category}/toggle', [MenuController::class, 'toggleVisibility'])->name('menu.toggle');

    // Financial
    Route::get('/financeiro', [FinancialController::class, 'index'])->name('financial.index');

    // Store Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/upload-logo', [SettingsController::class, 'uploadLogo'])->name('settings.upload-logo');
    Route::delete('/settings/remove-logo', [SettingsController::class, 'removeLogo'])->name('settings.remove-logo');
    Route::post('/settings/upload-banner', [SettingsController::class, 'uploadBanner'])->name('settings.upload-banner');
    Route::delete('/settings/remove-banner', [SettingsController::class, 'removeBanner'])->name('settings.remove-banner');

    Route::resource('delivery-zones', \App\Http\Controllers\DeliveryZoneController::class);
    Route::resource('payment-methods', \App\Http\Controllers\PaymentMethodController::class);

    Route::resource('customers', CustomerController::class);
    Route::resource('coupons', CouponController::class);
    Route::resource('tables', TableController::class);

    // Motoboys - Only for plans with motoboy_management feature (Básico+)
    Route::resource('motoboys', \App\Http\Controllers\MotoboyController::class)
        ->middleware('feature:motoboy_management');

    Route::resource('employees', EmployeeController::class);
    Route::resource('estoque', \App\Http\Controllers\StockController::class)->names('stock');
    Route::post('/tables/{table}/toggle', [TableController::class, 'toggleStatus'])->name('tables.toggle');
    Route::post('/tables/{table}/open', [TableController::class, 'open'])->name('tables.open');
    Route::post('/tables/{table}/add-items', [TableController::class, 'addItems'])->name('tables.addItems');
    Route::post('/tables/{table}/close', [TableController::class, 'close'])->name('tables.close');
    Route::get('/tables/{table}', [TableController::class, 'show'])->name('tables.show');

    // Two-Factor Authentication
    Route::prefix('settings/two-factor')->name('two-factor.')->group(function () {
        Route::get('/', [\App\Http\Controllers\TwoFactorController::class, 'show'])->name('show');
        Route::post('/enable', [\App\Http\Controllers\TwoFactorController::class, 'enable'])->name('enable');
        Route::post('/confirm', [\App\Http\Controllers\TwoFactorController::class, 'confirm'])->name('confirm');
        Route::post('/disable', [\App\Http\Controllers\TwoFactorController::class, 'disable'])->name('disable');
        Route::post('/verify', [\App\Http\Controllers\TwoFactorController::class, 'verify'])->name('verify');
        Route::post('/regenerate-recovery-codes', [\App\Http\Controllers\TwoFactorController::class, 'regenerateRecoveryCodes'])->name('regenerate-recovery-codes');
    });

    // WhatsApp - Only for plans with whatsapp_integration feature (Básico+)
    Route::middleware('feature:whatsapp_integration')->prefix('whatsapp')->name('whatsapp.')->group(function () {
        Route::get('/', [\App\Http\Controllers\WhatsAppController::class, 'index'])->name('index');
        Route::post('/toggle', [\App\Http\Controllers\WhatsAppController::class, 'toggleAutoMessages'])->name('toggle');
        Route::get('/logs', [\App\Http\Controllers\WhatsAppController::class, 'getLogs'])->name('logs');

        // WhatsApp Instances Management
        Route::get('/instances', [WhatsAppInstanceController::class, 'index'])->name('instances.index');
        Route::post('/instances', [WhatsAppInstanceController::class, 'store'])->name('instances.store');
        Route::get('/instances/{instance}/qrcode', [WhatsAppInstanceController::class, 'getQrCode'])->name('instances.qrcode');
        Route::get('/instances/{instance}/status', [WhatsAppInstanceController::class, 'checkStatus'])->name('instances.status');
        Route::post('/instances/{instance}/disconnect', [WhatsAppInstanceController::class, 'disconnect'])->name('instances.disconnect');
        Route::delete('/instances/{instance}', [WhatsAppInstanceController::class, 'destroy'])->name('instances.destroy');
    });


});

require __DIR__ . '/auth.php';
