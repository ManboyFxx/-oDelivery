<?php

namespace App\Services;

use App\Models\Order;
use App\Models\WhatsAppTemplate;
use App\Models\WhatsAppMessageLog;
use App\Models\WhatsAppInstance;
use Illuminate\Support\Facades\Log;

class OoBotService
{
    public function __construct(
        private EvolutionApiService $evolutionApi
    ) {
    }

    /**
     * Send order confirmation message
     */
    public function sendOrderConfirmation(Order $order): bool
    {
        return $this->sendOrderNotification($order, 'order_confirmed');
    }

    /**
     * Send order ready message
     */
    public function sendOrderReady(Order $order): bool
    {
        return $this->sendOrderNotification($order, 'order_ready');
    }

    /**
     * Send order out for delivery message
     */
    public function sendOrderOutForDelivery(Order $order): bool
    {
        return $this->sendOrderNotification($order, 'order_out_for_delivery');
    }

    /**
     * Send order delivered message
     */
    /**
     * Send order delivered message
     */
    public function sendOrderDelivered(Order $order): bool
    {
        return $this->sendOrderNotification($order, 'order_delivered');
    }

    /**
     * Send auto-reply message
     */
    public function sendAutoReply(string $phone, int $tenantId): bool
    {
        try {
            $tenant = \App\Models\Tenant::find($tenantId);

            if (!$tenant)
                return false;

            // Reuse auto-messages setting or create specific one
            if (!$tenant->settings?->whatsapp_auto_messages_enabled) {
                return false;
            }

            $instance = $this->getInstance($tenant);

            if (!$instance) {
                return false;
            }

            // Default auto-reply message
            $message = "Olá! Sou o atendente virtual do *{$tenant->name}*.\n\nNo momento não posso responder, mas já avisei nossa equipe. 👨‍💻\n\nSe for sobre um pedido, por favor informe o número ou aguarde um momento.";

            // Log attempt
            Log::info('ÓoBot - Sending Auto Reply', [
                'tenant_id' => $tenantId,
                'phone' => $phone
            ]);

            $result = $this->evolutionApi->sendTextMessage(
                $instance->instance_name,
                $phone,
                $message
            );

            return $result['success'];

        } catch (\Exception $e) {
            Log::error('ÓoBot - Auto Reply Error', [
                'tenant_id' => $tenantId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Core method to send order notifications
     */
    private function sendOrderNotification(Order $order, string $templateKey): bool
    {
        try {
            // Check if tenant has auto-messages enabled
            if (!$order->tenant->settings?->whatsapp_auto_messages_enabled) {
                Log::info('ÓoBot - Auto-messages disabled for tenant', [
                    'tenant_id' => $order->tenant_id,
                ]);
                return false;
            }

            // Get WhatsApp instance (shared for Basic/Pro, custom for Personalizado)
            $instance = $this->getInstance($order->tenant);

            if (!$instance) {
                Log::warning('ÓoBot - No WhatsApp instance available', [
                    'tenant_id' => $order->tenant_id,
                    'order_id' => $order->id,
                ]);
                return false;
            }

            // Get active template
            $template = WhatsAppTemplate::active()
                ->where('key', $templateKey)
                ->first();

            if (!$template) {
                Log::warning('ÓoBot - Template not found', [
                    'template_key' => $templateKey,
                ]);
                return false;
            }

            // Prepare template variables
            $variables = $this->prepareOrderVariables($order);

            // Replace variables in template
            $message = $template->replaceVariables($variables);

            // Get customer phone
            $phone = $order->customer_phone ?? $order->customer?->phone;

            if (!$phone) {
                Log::warning('ÓoBot - No customer phone', [
                    'order_id' => $order->id,
                ]);
                return false;
            }

            // Create log entry
            $log = WhatsAppMessageLog::create([
                'tenant_id' => $order->tenant_id,
                'order_id' => $order->id,
                'phone_number' => $phone,
                'template_key' => $templateKey,
                'message_sent' => $message,
                'status' => 'pending',
            ]);

            // Send message via Evolution API
            $result = $this->evolutionApi->sendTextMessage(
                $instance->instance_name,
                $phone,
                $message
            );

            // Update log status
            if ($result['success']) {
                $log->update(['status' => 'sent']);
                return true;
            } else {
                $log->update([
                    'status' => 'failed',
                    'error_message' => $result['error'] ?? 'Unknown error',
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('ÓoBot - Send Notification Error', [
                'order_id' => $order->id,
                'template_key' => $templateKey,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get the appropriate WhatsApp instance for a tenant
     * - Basic/Pro plans: Use shared CMS-managed instance
     * - Personalizado plan: Use tenant's custom instance
     */
    private function getInstance($tenant): ?WhatsAppInstance
    {
        // Check if tenant has custom plan (Personalizado) with own instance
        if ($tenant->plan === 'personalizado') {
            return WhatsAppInstance::where('tenant_id', $tenant->id)
                ->where('instance_type', 'custom')
                ->where('status', 'connected')
                ->first();
        }

        // For Basic/Pro plans, use shared instance
        return WhatsAppInstance::getSharedInstance();
    }

    /**
     * Prepare variables for template replacement
     */
    private function prepareOrderVariables(Order $order): array
    {
        $tenant = $order->tenant;
        $customer = $order->customer;

        return [
            'customer_name' => $customer?->name ?? $order->customer_name ?? 'Cliente',
            'order_number' => $order->order_number ?? $order->id,
            'order_total' => 'R$ ' . number_format($order->total, 2, ',', '.'),
            'store_name' => $tenant?->name ?? 'Nossa Loja',
            'store_phone' => $tenant?->settings?->phone ?? '',
            'store_address' => $tenant?->settings?->address ?? '',
            'delivery_address' => $order->delivery_address ?? '',
            'payment_method' => $order->payment_method ?? '',
            'delivery_fee' => 'R$ ' . number_format($order->delivery_fee ?? 0, 2, ',', '.'),
            'order_items' => $order->items->map(function ($item) {
                return "{$item->quantity}x {$item->name}";
            })->implode("\n"),
        ];
    }
}
