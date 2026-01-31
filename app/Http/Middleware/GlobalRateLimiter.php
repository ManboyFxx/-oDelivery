<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class GlobalRateLimiter
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $ip = $request->ip();

        // Determine limit and window based on user role
        if ($user) {
            if ($user->isSuperAdmin()) {
                // Super Admins: 5000 requests per minute
                $limit = 5000;
                $key = "super_admin_{$user->id}";
            } else {
                // Authenticated users: 1000 requests per minute
                $limit = 1000;
                $key = "user_{$user->id}";
            }
        } else {
            // Guests: 300 requests per minute
            $limit = 300;
            $key = "guest_{$ip}";
        }

        // Apply rate limit
        if (RateLimiter::tooManyAttempts($key, $limit)) {
            return response()->json([
                'message' => 'Too many requests. Please try again later.',
            ], 429);
        }

        RateLimiter::hit($key, 60); // 60-second window

        return $next($request);
    }
}
