<?php

namespace App\Services;

use App\Models\Tenant;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Subscription;
use Stripe\PaymentIntent;
use Exception;

class PaymentGatewayService
{
    protected string $gateway;

    public function __construct()
    {
        // Default to Stripe, can be configured per tenant
        $this->gateway = config('services.payment.default_gateway', 'stripe');

        if ($this->gateway === 'stripe') {
            Stripe::setApiKey(config('services.stripe.secret'));
        }
    }

    /**
     * Create a customer in the payment gateway
     */
    public function createCustomer(Tenant $tenant, string $email, string $name): string
    {
        if ($this->gateway === 'stripe') {
            $customer = Customer::create([
                'email' => $email,
                'name' => $name,
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'tenant_slug' => $tenant->slug,
                ],
            ]);

            return $customer->id;
        }

        throw new Exception("Gateway {$this->gateway} not implemented");
    }

    /**
     * Create a recurring subscription
     */
    public function createSubscription(
        string $customerId,
        string $planId,
        string $paymentMethodId,
        string $billingCycle = 'monthly',
        array $metadata = []
    ): array {
        if ($this->gateway === 'stripe') {
            // Map plan to Stripe price ID
            $priceId = $this->getStripePriceId($planId, $billingCycle);

            try {
                // Create subscription
                $subscription = Subscription::create([
                    'customer' => $customerId,
                    'items' => [['price' => $priceId]],
                    'default_payment_method' => $paymentMethodId, // Set as default payment method
                    'expand' => ['latest_invoice.payment_intent'],
                    'metadata' => $metadata,
                ]);

                return [
                    'subscription_id' => $subscription->id,
                    'client_secret' => $subscription->latest_invoice->payment_intent->client_secret,
                    'status' => $subscription->status,
                ];
            } catch (\Stripe\Exception\ApiErrorException $e) {
                throw new Exception("Stripe API Error: " . $e->getMessage(), $e->getCode(), $e);
            }
        }

        throw new Exception("Gateway {$this->gateway} not implemented");
    }

    /**
     * Create a Pix payment (one-time)
     */
    public function createPixPayment(float $amount, string $description, Tenant $tenant, array $metadata = []): array
    {
        // Pix is better supported by Mercado Pago in Brazil
        // For Stripe, we'd use PaymentIntent with pix payment method

        if ($this->gateway === 'stripe') {
            try {
                $paymentIntent = PaymentIntent::create([
                    'amount' => (int) ($amount * 100), // Convert to cents
                    'currency' => 'brl',
                    'payment_method_types' => ['pix'],
                    'description' => $description,
                    'metadata' => array_merge([
                        'tenant_id' => $tenant->id,
                    ], $metadata),
                ]);

                return [
                    'payment_id' => $paymentIntent->id,
                    'qr_code' => $paymentIntent->next_action->pix_display_qr_code->data ?? null,
                    'qr_code_url' => $paymentIntent->next_action->pix_display_qr_code->hosted_voucher_url ?? null,
                    'expires_at' => $paymentIntent->next_action->pix_display_qr_code->expires_at ?? null,
                ];
            } catch (\Stripe\Exception\ApiErrorException $e) {
                throw new Exception("Stripe API Error: " . $e->getMessage(), $e->getCode(), $e);
            }
        }

        throw new Exception("Gateway {$this->gateway} not implemented");
    }

    /**
     * Create a Boleto payment (one-time)
     */
    public function createBoletoPayment(
        float $amount,
        string $description,
        Tenant $tenant,
        string $customerDocument,
        \DateTime $dueDate,
        array $metadata = []
    ): array {
        if ($this->gateway === 'stripe') {
            try {
                $paymentIntent = PaymentIntent::create([
                    'amount' => (int) ($amount * 100),
                    'currency' => 'brl',
                    'payment_method_types' => ['boleto'],
                    'description' => $description,
                    'metadata' => array_merge([
                        'tenant_id' => $tenant->id,
                        'customer_document' => $customerDocument,
                    ], $metadata),
                    'payment_method_options' => [
                        'boleto' => [
                            'expires_after_days' => 3,
                        ],
                    ],
                ]);

                return [
                    'payment_id' => $paymentIntent->id,
                    'boleto_url' => $paymentIntent->next_action->boleto_display_details->hosted_voucher_url ?? null,
                    'barcode' => $paymentIntent->next_action->boleto_display_details->number ?? null,
                    'due_date' => $dueDate->format('Y-m-d'),
                ];
            } catch (\Stripe\Exception\ApiErrorException $e) {
                throw new Exception("Stripe API Error: " . $e->getMessage(), $e->getCode(), $e);
            }
        }

        throw new Exception("Gateway {$this->gateway} not implemented");
    }

    /**
     * Cancel a subscription
     */
    public function cancelSubscription(string $subscriptionId): bool
    {
        if ($this->gateway === 'stripe') {
            $subscription = Subscription::retrieve($subscriptionId);
            $subscription->cancel();
            return true;
        }

        throw new Exception("Gateway {$this->gateway} not implemented");
    }

    /**
     * Retry a failed payment
     */
    public function retryFailedPayment(string $subscriptionId): array
    {
        if ($this->gateway === 'stripe') {
            $subscription = Subscription::retrieve($subscriptionId);

            // Get the latest invoice
            $invoice = \Stripe\Invoice::retrieve($subscription->latest_invoice);

            // Attempt to pay the invoice
            try {
                $invoice->pay();

                return [
                    'success' => true,
                    'status' => $invoice->status,
                ];
            } catch (\Stripe\Exception\CardException $e) {
                return [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'decline_code' => $e->getDeclineCode(),
                ];
            }
        }

        throw new Exception("Gateway {$this->gateway} not implemented");
    }

    /**
     * Update payment method for a subscription
     */
    public function updatePaymentMethod(string $subscriptionId, string $paymentMethodId): bool
    {
        if ($this->gateway === 'stripe') {
            $subscription = Subscription::retrieve($subscriptionId);

            // Attach new payment method to customer
            $paymentMethod = \Stripe\PaymentMethod::retrieve($paymentMethodId);
            $paymentMethod->attach(['customer' => $subscription->customer]);

            // Update customer's default payment method
            Customer::update($subscription->customer, [
                'invoice_settings' => [
                    'default_payment_method' => $paymentMethodId,
                ],
            ]);

            return true;
        }

        throw new Exception("Gateway {$this->gateway} not implemented");
    }

    /**
     * Get Stripe Price ID based on plan and billing cycle
     */
    protected function getStripePriceId(string $planId, string $billingCycle): string
    {
        // These should be configured in .env or database
        // For now, using placeholder logic
        $priceMap = [
            'basic_monthly' => config('services.stripe.price_basic_monthly'),
            'basic_yearly' => config('services.stripe.price_basic_yearly'),
            'pro_monthly' => config('services.stripe.price_pro_monthly'),
            'pro_yearly' => config('services.stripe.price_pro_yearly'),
            'custom_monthly' => config('services.stripe.price_custom_monthly'),
            'custom_yearly' => config('services.stripe.price_custom_yearly'),
        ];

        $key = "{$planId}_{$billingCycle}";

        if (!isset($priceMap[$key])) {
            throw new Exception("Price ID not configured for {$key}");
        }

        return $priceMap[$key];
    }

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        if ($this->gateway === 'stripe') {
            try {
                \Stripe\Webhook::constructEvent(
                    $payload,
                    $signature,
                    config('services.stripe.webhook_secret')
                );
                return true;
            } catch (\Exception $e) {
                return false;
            }
        }

        return false;
    }
}
