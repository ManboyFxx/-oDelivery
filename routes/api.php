<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/login', [AuthController::class, 'login']);

// Public Polling (File-based, no auth required, very lightweight)
Route::get('/poll/{tenantId}', [\App\Http\Controllers\Api\PublicPollController::class, 'check']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

});

// Printer System Routes (Token Authentication)
Route::middleware(['printer'])->prefix('printer')->group(function () {
    Route::get('/orders', [\App\Http\Controllers\Api\PrinterController::class, 'index']); // GET pending orders
    Route::get('/profile', [\App\Http\Controllers\Api\PrinterController::class, 'profile']); // GET tenant profile
    Route::post('/orders/{id}/printed', [\App\Http\Controllers\Api\PrinterController::class, 'markAsPrinted']); // Mark as printed
    Route::post('/orders/{id}/status', [\App\Http\Controllers\Api\PrinterController::class, 'updateStatus']); // Update order status
});

