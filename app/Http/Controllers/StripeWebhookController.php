<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use App\Services\PaymentGatewayService;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use App\Models\Tenant;
use Carbon\Carbon;

class StripeWebhookController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentGatewayService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sig_header,
                $endpoint_secret
            );
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::error('Stripe Webhook Error: Invalid payload');
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            // Invalid signature
            Log::error('Stripe Webhook Error: Invalid signature');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Set API Key for subsequent calls
        Stripe::setApiKey(config('services.stripe.secret'));

        // Handle the event
        switch ($event->type) {
            case 'invoice.payment_succeeded':
                $invoice = $event->data->object;
                $this->handlePaymentSucceeded($invoice);
                break;
            case 'invoice.payment_failed':
                $invoice = $event->data->object;
                $this->handlePaymentFailed($invoice);
                break;
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->handlePaymentIntentSucceeded($paymentIntent);
                break;
            case 'customer.subscription.deleted':
                $subscription = $event->data->object;
                $this->handleSubscriptionDeleted($subscription);
                break;
            default:
            // Unexpected event type
            // Log::info('Received unknown event type ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }

    protected function handlePaymentSucceeded($invoice)
    {
        if (!$invoice->subscription) {
            return;
        }

        try {
            $subscriptionId = $invoice->subscription;
            $customerId = $invoice->customer;

            $tenant = Tenant::where('stripe_id', $customerId)->first();

            if (!$tenant) {
                Log::error("Webhook: Tenant not found for customer {$customerId}");
                return;
            }

            // Retrieve subscription to get metadata and end date
            $stripeSub = \Stripe\Subscription::retrieve($subscriptionId);

            $plan = $stripeSub->metadata->plan ?? $tenant->plan;

            $tenant->update([
                'plan' => $plan,
                'subscription_status' => 'active',
                'subscription_ends_at' => Carbon::createFromTimestamp($stripeSub->current_period_end),
                'last_payment_attempt_at' => now(),
                'payment_retry_count' => 0,
            ]);

            Log::info("Webhook: Tenant {$tenant->id} updated to plan {$plan} (Subscription)");

            // Send success email
            // \Mail::to($tenant->owner_email)->send(new \App\Mail\PaymentSuccessMail(...));

        } catch (\Exception $e) {
            Log::error("Webhook Error handling invoice.payment_succeeded: " . $e->getMessage());
        }
    }

    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        // Handle Pix and Boleto One-Time Payments
        try {
            $metadata = $paymentIntent->metadata ?? [];
            $tenantId = $metadata->tenant_id ?? null;
            $plan = $metadata->plan ?? null;

            if (!$tenantId || !$plan) {
                // Takes care of non-subscription payment intents if any
                return;
            }

            $tenant = Tenant::find($tenantId);
            if (!$tenant) {
                Log::error("Webhook: Tenant {$tenantId} not found for PaymentIntent");
                return;
            }

            // For one-time payments (Pix/Boleto), we grant 30 days access
            $newEndsAt = $tenant->subscription_ends_at && $tenant->subscription_ends_at->isFuture()
                ? $tenant->subscription_ends_at->addDays(30)
                : now()->addDays(30);

            $tenant->update([
                'plan' => $plan,
                'subscription_status' => 'active',
                'subscription_ends_at' => $newEndsAt,
                'last_payment_attempt_at' => now(),
                'payment_retry_count' => 0,
            ]);

            Log::info("Webhook: Tenant {$tenant->id} updated to plan {$plan} (One-Time Payment)");

            // Send success email logic here...

        } catch (\Exception $e) {
            Log::error("Webhook Error handling payment_intent.succeeded: " . $e->getMessage());
        }
    }

    protected function handlePaymentFailed($invoice)
    {
        Log::info("Payment failed for invoice: " . $invoice->id);
        // Logic to notify user or update retry count
    }

    protected function handleSubscriptionDeleted($subscription)
    {
        // Cancel subscription
        Log::info("Subscription deleted: " . $subscription->id);
    }
}
