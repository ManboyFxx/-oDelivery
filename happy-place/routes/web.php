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

// Customer Auth Routes (Public - Phone Only)
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


Route::get('/{slug}/menu', [TenantMenuController::class, 'show'])->name('tenant.menu');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}/print', [OrderController::class, 'print'])->name('orders.print');
    Route::post('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{order}/assign-motoboy', [OrderController::class, 'assignMotoboy'])->name('orders.assign-motoboy');
    Route::post('/orders/{order}/payment', [OrderController::class, 'updatePayment'])->name('orders.payment');
    Route::post('/orders/{order}/mode', [OrderController::class, 'updateMode'])->name('orders.mode');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');

    // PDV Routes

    Route::post('/products/{product}/toggle', [ProductController::class, 'toggle'])->name('products.toggle');
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

    // Financial
    Route::get('/relatorio', [FinancialController::class, 'index'])->name('financial.index');

    // Store Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');

    Route::resource('customers', CustomerController::class);
    Route::resource('coupons', CouponController::class);
    Route::resource('tables', TableController::class);
    Route::resource('motoboys', \App\Http\Controllers\MotoboyController::class);
    Route::post('/tables/{table}/toggle', [TableController::class, 'toggleStatus'])->name('tables.toggle');
    Route::post('/tables/{table}/open', [TableController::class, 'open'])->name('tables.open');
    Route::post('/tables/{table}/add-items', [TableController::class, 'addItems'])->name('tables.addItems');
    Route::post('/tables/{table}/close', [TableController::class, 'close'])->name('tables.close');
    Route::get('/tables/{table}', [TableController::class, 'show'])->name('tables.show');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
