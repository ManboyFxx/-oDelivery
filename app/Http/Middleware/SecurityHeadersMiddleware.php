<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // HSTS (Force HTTPS) - 1 Year
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

        // X-Frame-Options (Prevent Clickjacking)
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // X-Content-Type-Options (Prevent MIME Sniffing)
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // X-XSS-Protection (Legacy but good defense in depth)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Content Security Policy (Basic permissive but secure baseline)
        // Adjust 'self' and allowed domains as needed.
        // For now, we are generous to avoid breaking scripts/images.
        // $response->headers->set('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:;");

        return $response;
    }
}
