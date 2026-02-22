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
                // Prepare subscription params
                $params = [
                    'customer' => $customerId,
                    'items' => [['price' => $priceId]],
                    'default_payment_method' => $paymentMethodId, // Set as default payment method
                    'expand' => ['latest_invoice.payment_intent'],
                    'metadata' => $metadata,
                ];

                // Add coupon if provided
                if (isset($metadata['coupon_code'])) {
                    // Try to find coupon by code in Stripe or use ID passed in params if we changed signature
                    // For now, let's assume the controller passed the Stripe Coupon ID in metadata as 'stripe_coupon_id'
                    if (isset($metadata['stripe_coupon_id'])) {
                        $params['coupon'] = $metadata['stripe_coupon_id'];
                    }
                }

                // Create subscription
                $subscription = Subscription::create($params);

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
     * Create a Stripe Checkout Session
     */
    public function createCheckoutSession(
        string $customerId,
        string $planId,
        string $billingCycle = 'monthly',
        array $metadata = [],
        string $successUrl = null,
        string $cancelUrl = null
    ): string {
        if ($this->gateway === 'stripe') {
            $priceId = $this->getStripePriceId($planId, $billingCycle);

            try {
                $session = \Stripe\Checkout\Session::create([
                    'customer' => $customerId,
                    'line_items' => [
                        [
                            'price' => $priceId,
                            'quantity' => 1,
                        ]
                    ],
                    'mode' => 'subscription',
                    'success_url' => $successUrl ?? route('dashboard'),
                    'cancel_url' => $cancelUrl ?? route('subscription.checkout', ['plan' => $planId]),
                    'metadata' => $metadata,
                    'subscription_data' => [
                        'metadata' => $metadata,
                    ],
                ]);

                return $session->url;
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
            'unified_monthly' => config('services.stripe.price_unified_monthly'),
            'unified_yearly' => config('services.stripe.price_unified_yearly'),
            // Legacy mapping
            'basic_monthly' => config('services.stripe.price_basic_monthly'),
            'basic_yearly' => config('services.stripe.price_basic_yearly'),
            'pro_monthly' => config('services.stripe.price_pro_monthly'),
            'pro_yearly' => config('services.stripe.price_pro_yearly'),
            'custom_monthly' => config('services.stripe.price_custom_monthly'),
            'custom_yearly' => config('services.stripe.price_custom_yearly'),
        ];

        $key = "{$planId}_{$billingCycle}";

        if (!isset($priceMap[$key])) {
            // Fallback for unified if not configured in env yet to avoid crash during dev
            if ($planId === 'unified') {
                // return 'price_dummy_unified'; // Uncomment for testing without env
            }
            throw new Exception("Price ID not configured for {$key}");
        }

        return $priceMap[$key];
    }

    /**
     * Create a coupon in Stripe
     */
    public function createStripeCoupon(array $data): string
    {
        if ($this->gateway === 'stripe') {
            try {
                $couponData = [
                    'name' => $data['code'],
                    'duration' => 'once', // Default to once for simplicity in this implementation
                ];

                if ($data['discount_type'] === 'percentage') {
                    $couponData['percent_off'] = $data['discount_value'];
                } else {
                    $couponData['amount_off'] = (int) ($data['discount_value'] * 100);
                    $couponData['currency'] = 'brl';
                }

                if (!empty($data['max_uses'])) {
                    $couponData['max_redemptions'] = $data['max_uses'];
                }

                if (!empty($data['valid_until'])) {
                    $couponData['redeem_by'] = \Carbon\Carbon::parse($data['valid_until'])->timestamp;
                }

                // Add metadata for syncing
                $couponData['metadata'] = [
                    'local_id' => $data['id'] ?? null,
                    'code' => $data['code']
                ];

                $coupon = \Stripe\Coupon::create($couponData);
                return $coupon->id;
            } catch (\Stripe\Exception\ApiErrorException $e) {
                throw new Exception("Stripe Coupon Error: " . $e->getMessage());
            }
        }
        return '';
    }

    /**
     * Delete a coupon in Stripe
     */
    public function deleteStripeCoupon(string $stripeCouponId): bool
    {
        if ($this->gateway === 'stripe' && $stripeCouponId) {
            try {
                $coupon = \Stripe\Coupon::retrieve($stripeCouponId);
                $coupon->delete();
                return true;
            } catch (\Exception $e) {
                // Coupon might already be deleted
                return false;
            }
        }
        return false;
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
