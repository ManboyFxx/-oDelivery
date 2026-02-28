<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global middleware - applied to all routes
        // $middleware->append(\App\Http\Middleware\GlobalRateLimiter::class);
    
        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeadersMiddleware::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'webhooks/*',
        ]);

        // Register middleware aliases
        $middleware->alias([
            'subscription' => \App\Http\Middleware\CheckSubscription::class,
            'plan.limit' => \App\Http\Middleware\CheckPlanLimit::class,
            'feature' => \App\Http\Middleware\CheckFeature::class,
            'tenant.required' => \App\Http\Middleware\EnsureTenantExists::class,
            'tenant.scope' => \App\Http\Middleware\TenantScopeMiddleware::class,
            'two-factor' => \App\Http\Middleware\EnsureTwoFactorEnabled::class,
            'throttle.plan' => \App\Http\Middleware\ThrottleByPlan::class,
            'is_motoboy' => \App\Http\Middleware\IsMotoboyMiddleware::class,
            'check_subscription' => \App\Http\Middleware\CheckSubscription::class,
            'role' => \App\Http\Middleware\RoleBasedAccessMiddleware::class,
            'printer' => \App\Http\Middleware\AuthPrinterToken::class,
            // FASE 3 – PBAC
            'permission' => \App\Http\Middleware\CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
