<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessEvolutionWebhookJob;
use App\Models\IntegrationEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

/**
 * FASE 1 – BLINDAGEM: Webhook Evolution API com HMAC Signature Validation.
 *
 * Fluxo:
 *  1. Recebe POST da Evolution API.
 *  2. Valida assinatura HMAC-SHA256 (rejeita 401 se inválida).
 *  3. Registra o evento em integration_events com status="pending".
 *  4. Despacha ProcessEvolutionWebhookJob de forma assíncrona.
 *  5. Retorna HTTP 200 imediatamente para a Evolution API (evita timeout).
 *
 * .env requerido:
 *  EVOLUTION_WEBHOOK_SECRET=seu_secret_aqui
 */
class EvolutionWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = $request->header('x-evolution-signature');

        // ── VALIDAÇÃO HMAC ──────────────────────────────────────────────────
        if (!$this->isValidSignature($payload, $signature)) {
            Log::warning('Evolution Webhook: invalid signature', [
                'ip' => $request->ip(),
                'signature' => $signature,
            ]);
            return response('Unauthorized', 401);
        }
        // ────────────────────────────────────────────────────────────────────

        $data = json_decode($payload, true) ?? [];
        $eventType = $data['event'] ?? 'unknown';
        $instance = $data['instance'] ?? null;

        // Chave de idempotência: garante que o mesmo evento não seja processado 2x
        // mesmo que a Evolution API dispare o webhook mais de uma vez (comportamento documentado).
        $idempotencyKey = $data['id'] ?? md5($payload);

        // Registra o evento. Se a chave já existir, retorna o existente sem duplicar.
        $event = IntegrationEvent::record(
            source: 'evolution',
            eventType: $eventType,
            payload: $data,
            tenantId: null, // Resolvido no job pelo instance name
            idempotencyKey: "evolution.{$idempotencyKey}",
        );

        // Só despacha o job se o evento ainda está pendente (não processado antes)
        if ($event->status === 'pending') {
            ProcessEvolutionWebhookJob::dispatch($event->id);
        }

        // Retorna 200 imediatamente — a Evolution API espera resposta rápida
        return response('OK', 200);
    }

    private function isValidSignature(?string $payload, ?string $signature): bool
    {
        $secret = config('services.evolution.webhook_secret');

        // Se não houver secret configurado em produção, bloqueia por segurança
        if (empty($secret)) {
            // Em desenvolvimento local sem secret, apenas loga o aviso
            if (app()->environment('local', 'testing')) {
                Log::debug('Evolution Webhook: signature check skipped (no secret configured)');
                return true;
            }
            Log::error('Evolution Webhook: EVOLUTION_WEBHOOK_SECRET not configured');
            return false;
        }

        if (empty($signature)) {
            return false;
        }

        $expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $signature);
    }
}
