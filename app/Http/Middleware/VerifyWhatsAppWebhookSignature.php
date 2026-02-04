<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VerifyWhatsAppWebhookSignature
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Get signature from Evolution API header
        // Evolution sends X-API-Key header or signature in X-Signature
        $signature = $request->header('X-Signature') ?? $request->header('x-signature');
        $apiKey = config('services.evolution.api_key');

        if (!$apiKey) {
            Log::warning('WhatsApp Webhook: Evolution API key not configured');
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // If signature header exists, validate it
        if ($signature) {
            $body = $request->getContent();
            $expectedSignature = hash_hmac('sha256', $body, $apiKey);

            if (!hash_equals($expectedSignature, $signature)) {
                Log::warning('WhatsApp Webhook: Invalid signature', [
                    'received' => $signature,
                    'expected' => $expectedSignature,
                ]);
                return response()->json(['error' => 'Unauthorized'], 401);
            }
        } else {
            // Alternative: Check API key in body or query
            $receivedKey = $request->input('api_key') ?? $request->query('api_key');

            if (!$receivedKey || !hash_equals($receivedKey, $apiKey)) {
                Log::warning('WhatsApp Webhook: Missing or invalid API key');
                return response()->json(['error' => 'Unauthorized'], 401);
            }
        }

        return $next($request);
    }
}
