<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
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
                // mb_split uses different regex syntax, but for common use cases like \s+ 
                // we can bridge it to preg_split. 
                // Note: mb_split doesn't use delimiters like /.../
                return preg_split('/' . str_replace('/', '\/', $pattern) . '/u', $string, $limit);
            }
        }
        if ($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        \Illuminate\Support\Facades\Schema::defaultStringLength(191);
        Vite::prefetch(concurrency: 3);
        \App\Models\Order::observe(\App\Observers\OrderObserver::class);
        \App\Models\Category::observe(\App\Observers\CategoryObserver::class);
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);
    }
}
