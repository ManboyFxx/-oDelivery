<?php

namespace App\Jobs;

use App\Models\IntegrationEvent;
use App\Models\WhatsAppInstance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * FASE 1 – BLINDAGEM: Processamento assíncrono de webhooks da Evolution API.
 *
 * Cada evento recebido pelo EvolutionWebhookController é processado aqui,
 * de forma desacoplada do ciclo HTTP do request.
 *
 * A tabela integration_events atua como "inbox" persistente:
 * se o job falhar, o evento permanece com status="failed" e pode ser
 * reprocessado manualmente ou por um comando de retry.
 */
class ProcessEvolutionWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 30;
    public $backoff = [10, 30, 60];
    public $maxExceptions = 3;

    public function __construct(
        private string $integrationEventId
    ) {
    }

    public function handle(): void
    {
        $event = IntegrationEvent::find($this->integrationEventId);

        if (!$event) {
            Log::warning('ProcessEvolutionWebhookJob: IntegrationEvent not found', [
                'id' => $this->integrationEventId,
            ]);
            return;
        }

        // Evita reprocessamento se já foi tratado
        if (in_array($event->status, ['processed', 'processing'])) {
            Log::info('ProcessEvolutionWebhookJob: skipped (already processed)', [
                'id' => $this->integrationEventId,
                'status' => $event->status,
            ]);
            return;
        }

        $event->markProcessing();

        try {
            $this->processEvent($event);
            $event->markProcessed();
        } catch (\Throwable $e) {
            $event->markFailed($e->getMessage());
            Log::error('ProcessEvolutionWebhookJob: failed to process event', [
                'id' => $this->integrationEventId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function processEvent(IntegrationEvent $event): void
    {
        $payload = $event->payload ?? [];
        $eventType = $event->event_type;
        $instanceName = $payload['instance'] ?? null;

        Log::info('ProcessEvolutionWebhookJob: processing', [
            'event_type' => $eventType,
            'instance' => $instanceName,
        ]);

        // Resolve qual tenant é dono desta instância
        if ($instanceName) {
            $instance = WhatsAppInstance::where('instance_name', $instanceName)->first();
            if ($instance) {
                $event->update(['tenant_id' => $instance->tenant_id]);
            }
        }

        match ($eventType) {
            'connection.update' => $this->handleConnectionUpdate($payload, $event),
            'messages.upsert' => $this->handleMessageReceived($payload, $event),
            default => Log::debug('ProcessEvolutionWebhookJob: unhandled event type', ['type' => $eventType]),
        };
    }

    private function handleConnectionUpdate(array $payload, IntegrationEvent $event): void
    {
        $instance = $payload['instance'] ?? null;
        $state = $payload['data']['state'] ?? null;

        if (!$instance || !$state) {
            return;
        }

        WhatsAppInstance::where('instance_name', $instance)->update([
            'status' => $state === 'open' ? 'connected' : 'disconnected',
            'last_seen_at' => now(),
        ]);

        Log::info('ProcessEvolutionWebhookJob: connection updated', [
            'instance' => $instance,
            'state' => $state,
        ]);
    }

    private function handleMessageReceived(array $payload, IntegrationEvent $event): void
    {
        // Extensão futura: processar mensagens recebidas pelo OoBot
        // Por ora, apenas loga o evento para rastreabilidade
        Log::info('ProcessEvolutionWebhookJob: message received', [
            'instance' => $payload['instance'] ?? null,
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessEvolutionWebhookJob failed after all retries', [
            'integration_event_id' => $this->integrationEventId,
            'error' => $exception->getMessage(),
        ]);

        // Garante que o registro seja marcado como falha mesmo se o job expirar
        IntegrationEvent::find($this->integrationEventId)?->markFailed(
            'Job failed after all retries: ' . $exception->getMessage()
        );
    }
}
