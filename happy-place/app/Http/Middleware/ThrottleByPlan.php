<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class ThrottleByPlan
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $resource = 'api'): Response
    {
        $tenant = $request->user()?->tenant;

        if (!$tenant) {
            return $next($request);
        }

        // Definir limites por plano
        $limits = $this->getLimitsForPlan($tenant->plan, $resource);

        if ($limits === null) {
            // Ilimitado
            return $next($request);
        }

        $key = $this->resolveRequestSignature($request, $tenant, $resource);

        if (RateLimiter::tooManyAttempts($key, $limits['max'])) {
            return response()->json([
                'error' => 'Limite de requisições excedido.',
                'message' => "Você atingiu o limite de {$limits['max']} requisições por {$limits['decay']} minuto(s) para o plano {$tenant->plan}.",
                'retry_after' => RateLimiter::availableIn($key)
            ], 429);
        }

        RateLimiter::hit($key, $limits['decay'] * 60);

        $response = $next($request);

        return $this->addHeaders(
            $response,
            $limits['max'],
            RateLimiter::remaining($key, $limits['max'])
        );
    }

    /**
     * Get rate limits for a specific plan and resource.
     */
    private function getLimitsForPlan(string $plan, string $resource): ?array
    {
        $limits = [
            'free' => [
                'api' => ['max' => 100, 'decay' => 60],      // 100 req/hora
                'orders' => ['max' => 50, 'decay' => 60],
            ],
            'basic' => [
                'api' => ['max' => 1000, 'decay' => 60],     // 1000 req/hora
                'orders' => ['max' => 500, 'decay' => 60],
            ],
            'pro' => [
                'api' => ['max' => 10000, 'decay' => 60],    // 10k req/hora
                'orders' => ['max' => 5000, 'decay' => 60],
            ],
            'enterprise' => [
                'api' => null,  // Ilimitado
                'orders' => null,
            ],
        ];

        return $limits[$plan][$resource] ?? $limits['free'][$resource];
    }

    /**
     * Resolve request signature.
     */
    private function resolveRequestSignature(Request $request, $tenant, string $resource): string
    {
        return sha1(
            $tenant->id . '|' .
            $resource . '|' .
            $request->ip()
        );
    }

    /**
     * Add rate limit headers to response.
     */
    private function addHeaders(Response $response, int $maxAttempts, int $remainingAttempts): Response
    {
        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => max(0, $remainingAttempts),
        ]);

        return $response;
    }
}
