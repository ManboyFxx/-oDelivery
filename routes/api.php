<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Printer System Routes
    Route::prefix('printer')->group(function () {
        Route::get('/orders', [\App\Http\Controllers\Api\PrinterController::class, 'index']);
        Route::post('/orders/{id}/printed', [\App\Http\Controllers\Api\PrinterController::class, 'markAsPrinted']);
    });
});

