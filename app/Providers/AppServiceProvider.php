<?php

namespace App\Providers;

use App\Events\Orders\OrderStatusChanged;
use App\Listeners\Orders\AwardLoyaltyOnDelivery;
use App\Listeners\Orders\BroadcastOrderUpdate;
use App\Listeners\Orders\SendWhatsAppNotification;
use App\Listeners\Orders\TouchTenantPoll;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \Illuminate\Notifications\Channels\DatabaseChannel::class,
            \App\Channels\DatabaseChannel::class
        );

        // FASE 2: Injetar configuração de broadcast sem precisar de config/broadcasting.php
        config([
            'broadcasting.connections.pusher-http' => [
                'driver' => 'pusher-http',
                'key' => env('PUSHER_APP_KEY'),
                'secret' => env('PUSHER_APP_SECRET'),
                'app_id' => env('PUSHER_APP_ID'),
                'cluster' => env('PUSHER_APP_CLUSTER', 'mt1'),
                'useTLS' => true,
            ]
        ]);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Polyfill for mb_split if mbregex is missing
        if (!function_exists('mb_split')) {
            function mb_split($pattern, $string, $limit = -1)
            {
                return preg_split('/' . str_replace('/', '\/', $pattern) . '/u', $string, $limit);
            }
        }

        if ($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        \Illuminate\Support\Facades\Schema::defaultStringLength(191);
        Vite::prefetch(concurrency: 3);

        // Observers
        \App\Models\Order::observe(\App\Observers\OrderObserver::class);
        \App\Models\Category::observe(\App\Observers\CategoryObserver::class);
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);

        // ── FASE 2: Domain Events ─────────────────────────────────────────────
        // OrderStatusChanged dispara todos os efeitos colaterais de mudança de status.
        // Cada Listener tem responsabilidade única e pode ser testado isoladamente.
        Event::listen(OrderStatusChanged::class, TouchTenantPoll::class);
        Event::listen(OrderStatusChanged::class, BroadcastOrderUpdate::class);
        Event::listen(OrderStatusChanged::class, SendWhatsAppNotification::class);
        Event::listen(OrderStatusChanged::class, AwardLoyaltyOnDelivery::class);
        // ─────────────────────────────────────────────────────────────────────

        // ── FASE 2: Rate Limiting por Tenant ──────────────────────────────────
        // Protege rotas públicas (cardápio, checkout) de abuso por tenant específico.
        // 120 req/min por tenant_id. Fallback para IP se tenant não identificado.
        // Aplicado via middleware throttle:tenant-public nas rotas públicas do web.php.
        RateLimiter::for('tenant-public', function (Request $request) {
            // Tenta extrair o tenant pelo slug da URL (/{slug}/...)
            $tenantSlug = $request->route('slug') ?? $request->route('tenantSlug');
            if ($tenantSlug) {
                $tenantId = \App\Models\Tenant::where('slug', $tenantSlug)->value('id');
                if ($tenantId) {
                    return Limit::perMinute(120)->by("tenant:{$tenantId}");
                }
            }
            // Fallback para IP (usuários sem tenant identificado ainda)
            return Limit::perMinute(60)->by($request->ip());
        });
        // ── FASE 2: Driver de Broadcast Customizado (Pusher Sem SDK) ──────────
        // Permite funcionar em Hostinger Shared sem precisar do SDK via composer.
        Broadcast::extend('pusher-http', function ($app, $config) {
            return new \App\Broadcasting\LightPusherBroadcaster($config);
        });
        // ─────────────────────────────────────────────────────────────────────
    }
}

