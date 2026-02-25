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
     * Send order cancelled message
     */
    public function sendOrderCancelled(Order $order): bool
    {
        return $this->sendOrderNotification($order, 'order_cancelled');
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
            // Note: null means not configured yet - we treat it as enabled to not silently block messages
            $autoEnabled = $order->tenant?->settings?->whatsapp_auto_messages_enabled;
            if ($autoEnabled === false) {
                Log::info('ÓoBot - Auto-messages explicitly disabled for tenant', [
                    'tenant_id' => $order->tenant_id,
                ]);
                return false;
            }
            if ($autoEnabled === null) {
                Log::warning('ÓoBot - whatsapp_auto_messages_enabled is NULL (not configured), proceeding anyway', [
                    'tenant_id' => $order->tenant_id,
                ]);
            }

            // Get WhatsApp instance (shared for Basic/Pro, custom for Personalizado)
            $tenant = $order->tenant;
            if (!$tenant) {
                Log::error('ÓoBot - Order has no tenant', [
                    'order_id' => $order->id,
                ]);
                return false;
            }

            $instance = $this->getInstance($tenant);

            if (!$instance) {
                Log::warning('ÓoBot - No WhatsApp instance available', [
                    'tenant_id' => $order->tenant_id,
                    'order_id' => $order->id,
                ]);
                return false;
            }

            // Get active template (Tenant specific OR Global default)
            $template = WhatsAppTemplate::active()
                ->where('key', $templateKey)
                ->where(function ($query) use ($order) {
                    $query->where('tenant_id', $order->tenant_id)
                        ->orWhereNull('tenant_id');
                })
                ->orderBy('tenant_id', 'desc') // Tenant ID (UUID) will be non-null, so it comes first? actually UUID sorting is tricky.
                // Better approach: Sort by whether tenant_id is null. Non-null first.
                ->orderByRaw('CASE WHEN tenant_id IS NOT NULL THEN 1 ELSE 0 END DESC')
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

            // Get customer phone - robustly, in order of priority
            $phone = $this->resolveCustomerPhone($order);

            if (!$phone) {
                Log::warning('ÓoBot - No customer phone found', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_id' => $order->customer_id,
                    'customer_phone_field' => $order->customer_phone,
                    'customer_model_phone' => $order->customer?->phone,
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
     * Resolve the customer's phone number from the order.
     * Checks multiple sources and decrypts if necessary.
     */
    private function resolveCustomerPhone(Order $order): ?string
    {
        // 1. First try the order's own customer_phone field (plain text snapshot)
        $phone = $order->customer_phone;

        // 2. Fall back to the customer model's phone (auto-decrypts via Attribute)
        if (!$phone && $order->customer_id) {
            $phone = $order->customer?->phone;
        }

        // 3. Last resort: try the customer's default address phone
        if (!$phone && $order->customer_id) {
            $phone = $order->customer?->defaultAddress?->phone;
        }

        Log::info('ÓoBot - Phone Resolution', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_phone_raw' => $order->customer_phone ? '(set)' : '(empty)',
            'customer_model_phone' => $order->customer?->phone ? '(set)' : '(empty)',
            'resolved_phone' => $phone ? substr($phone, 0, 5) . '***' : 'NULL',
        ]);

        return $phone ?: null;
    }

    /**
     * Prepare variables for template replacement
     */
    private function prepareOrderVariables(Order $order): array
    {
        $tenant = $order->tenant;
        $customer = $order->customer;

        $totalValue = $order->total ?? 0;
        $deliveryFee = $order->delivery_fee ?? 0;

        return [
            'customer_name' => $customer?->name ?? $order->customer_name ?? 'Cliente',
            'order_number' => $order->order_number ?? $order->id,
            'order_total' => 'R$ ' . number_format((float) $totalValue, 2, ',', '.'),
            'store_name' => $tenant?->name ?? 'Nossa Loja',
            'store_phone' => $tenant?->settings?->phone ?? '',
            'store_address' => $tenant?->settings?->address ?? '',
            'delivery_address' => $order->delivery_address ?? '',
            'payment_method' => $order->payment_method ?? '',
            'delivery_fee' => 'R$ ' . number_format((float) $deliveryFee, 2, ',', '.'),
            'order_items' => ($order->items ?? collect())->map(function ($item) {
                return "{$item->quantity}x {$item->product_name}";
            })->implode("\n"),
        ];
    }
}
