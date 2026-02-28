<?php

namespace App\Observers;

use App\Events\NewOrderReceived;
use App\Events\Orders\OrderStatusChanged;
use App\Models\Order;
use App\Models\User;
use App\Notifications\NewOrderNotification;
use App\Services\NotificationService;
use App\Services\TenantPollService;
use Illuminate\Support\Facades\Log;

/**
 * FASE 2 – ESCALA REAL: OrderObserver refatorado com Domain Events.
 *
 * O switch/case de 80 linhas foi substituído por um único evento de domínio.
 * Cada efeito colateral agora vive em seu próprio Listener independente:
 *
 *  - BroadcastOrderUpdate   → Reverb WebSocket
 *  - SendWhatsAppNotification → WhatsApp Jobs (com idempotência da Fase 1)
 *  - AwardLoyaltyOnDelivery  → Pontos de fidelidade
 *  - TouchTenantPoll         → Backward compat com polling por arquivo
 *
 * Agente: @architect
 */
class OrderObserver
{
    public function __construct(
        private readonly TenantPollService $tenantPollService,
        private readonly NotificationService $notificationService,
    ) {
    }

    /**
     * Antes de criar: atribui motoboy padrão se delivery e vazio.
     */
    public function creating(Order $order): void
    {
        if ($order->mode === 'delivery' && empty($order->motoboy_id)) {
            $settings = \App\Models\StoreSetting::where('tenant_id', $order->tenant_id)->first();
            if ($settings && !empty($settings->default_motoboy_id)) {
                $order->motoboy_id = $settings->default_motoboy_id;
            }
        }
    }

    /**
     * Pedido criado: notifica merchants + emite evento NewOrderReceived.
     */
    public function created(Order $order): void
    {
        // Atualiza arquivo de polling (backward compat)
        $this->tenantPollService->touch($order->tenant_id);

        // Broadcast WebSocket para dashboards abertos
        try {
            broadcast(new NewOrderReceived($order));
        } catch (\Throwable $e) {
            Log::warning('OrderObserver: broadcast NewOrderReceived falhou', ['error' => $e->getMessage()]);
        }

        // Notificações Push (OneSignal) para admins do tenant
        $merchants = User::where('tenant_id', $order->tenant_id)
            ->whereIn('role', ['admin', 'employee'])
            ->get();

        foreach ($merchants as $merchant) {
            /** @var User $merchant */
            $merchant->notify(new NewOrderNotification($order));
        }
    }

    /**
     * Pedido atualizado: decrementa estoque e dispara Domain Event.
     *
     * Todos os side effects (WhatsApp, Reverb, loyalty, poll) são
     * delegados aos Listeners registrados no EventServiceProvider.
     */
    public function updated(Order $order): void
    {
        if (!$order->isDirty('status')) {
            // Não é mudança de status — apenas toca o poll e sai
            $this->tenantPollService->touch($order->tenant_id);
            return;
        }

        $oldStatus = $order->getOriginal('status');
        $newStatus = $order->status;

        // Decrementa estoque ao iniciar preparo
        if ($newStatus === 'preparing') {
            $order->decrementIngredientsStock();
        }

        // Notificação de status ao parceiro (OneSignal/Database)
        try {
            if ($newStatus === 'motoboy_accepted') {
                $this->notificationService->sendOrderAccepted($order, $order->motoboy);
            } elseif ($newStatus === 'delivered') {
                $this->notificationService->sendOrderDelivered($order);
            } else {
                $this->notificationService->sendOrderStatusChanged($order, $oldStatus, $newStatus);
            }
        } catch (\Throwable $e) {
            Log::error('OrderObserver: NotificationService falhou', ['error' => $e->getMessage()]);
        }

        // ── DOMAIN EVENT ─────────────────────────────────────────────────────
        // Um único dispatch substitui 80 linhas de switch/case.
        // Os Listeners registrados no EventServiceProvider cuidam de tudo.
        event(new OrderStatusChanged($order, $oldStatus, $newStatus));
        // ─────────────────────────────────────────────────────────────────────
    }

    /**
     * Soft delete: toca o poll para o frontend remover o pedido da lista.
     */
    public function deleted(Order $order): void
    {
        $this->tenantPollService->touch($order->tenant_id);
    }
}
