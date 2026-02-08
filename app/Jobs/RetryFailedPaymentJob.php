<?php

namespace App\Jobs;

use App\Models\Tenant;
use App\Services\PaymentGatewayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class RetryFailedPaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Tenant $tenant;
    protected int $attemptNumber;

    /**
     * Create a new job instance.
     */
    public function __construct(Tenant $tenant, int $attemptNumber = 1)
    {
        $this->tenant = $tenant;
        $this->attemptNumber = $attemptNumber;
    }

    /**
     * Execute the job.
     */
    public function handle(PaymentGatewayService $paymentService): void
    {
        $maxAttempts = config('services.payment.retry_attempts', 3);

        // Check if we've exceeded max attempts
        if ($this->attemptNumber > $maxAttempts) {
            $this->handleFinalFailure();
            return;
        }

        Log::info("Retrying payment for tenant {$this->tenant->id}, attempt {$this->attemptNumber}/{$maxAttempts}");

        try {
            // Attempt to retry the payment
            $result = $paymentService->retryFailedPayment($this->tenant->stripe_subscription_id);

            if ($result['success']) {
                // Payment succeeded
                $this->handleSuccessfulRetry();
            } else {
                // Payment failed again
                $this->handleFailedRetry($result['error'] ?? 'Unknown error');
            }
        } catch (\Exception $e) {
            Log::error("Payment retry exception for tenant {$this->tenant->id}: " . $e->getMessage());
            $this->handleFailedRetry($e->getMessage());
        }
    }

    /**
     * Handle successful payment retry
     */
    protected function handleSuccessfulRetry(): void
    {
        $this->tenant->update([
            'subscription_status' => 'active',
            'payment_retry_count' => 0,
            'last_payment_attempt_at' => now(),
            'payment_failure_reason' => null,
        ]);

        // Send success email
        Mail::to($this->tenant->email)->send(new \App\Mail\PaymentSuccessEmail($this->tenant));

        Log::info("Payment retry successful for tenant {$this->tenant->id}");
    }

    /**
     * Handle failed payment retry
     */
    protected function handleFailedRetry(string $errorMessage): void
    {
        $this->tenant->update([
            'payment_retry_count' => $this->attemptNumber,
            'last_payment_attempt_at' => now(),
            'payment_failure_reason' => $errorMessage,
        ]);

        $maxAttempts = config('services.payment.retry_attempts', 3);
        $retryIntervalDays = config('services.payment.retry_interval_days', 2);

        if ($this->attemptNumber < $maxAttempts) {
            // Schedule next retry
            $nextAttempt = $this->attemptNumber + 1;
            $delay = now()->addDays($retryIntervalDays);

            self::dispatch($this->tenant, $nextAttempt)->delay($delay);

            // Send failure notification
            Mail::to($this->tenant->email)->send(
                new \App\Mail\PaymentFailedEmail($this->tenant, $nextAttempt, $maxAttempts)
            );

            Log::info("Payment retry {$this->attemptNumber} failed for tenant {$this->tenant->id}. Next attempt scheduled for {$delay}");
        } else {
            // This was the last attempt
            $this->handleFinalFailure();
        }
    }

    /**
     * Handle final failure after all retries exhausted
     */
    protected function handleFinalFailure(): void
    {
        $this->tenant->update([
            'subscription_status' => 'past_due',
            'is_active' => false, // Suspend account
        ]);

        // Send final failure email
        Mail::to($this->tenant->email)->send(
            new \App\Mail\PaymentRetryFinalEmail($this->tenant)
        );

        Log::warning("All payment retries exhausted for tenant {$this->tenant->id}. Account suspended.");
    }
}
