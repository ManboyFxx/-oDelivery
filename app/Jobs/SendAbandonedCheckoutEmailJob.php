<?php

namespace App\Jobs;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendAbandonedCheckoutEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Tenant $tenant;
    protected string $abandonedPlan;

    /**
     * Create a new job instance.
     */
    public function __construct(Tenant $tenant, string $abandonedPlan)
    {
        $this->tenant = $tenant;
        $this->abandonedPlan = $abandonedPlan;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Check if tenant has already completed checkout
        if ($this->tenant->subscription_status === 'active' || $this->tenant->subscription_status === 'trialing') {
            Log::info("Skipping abandoned checkout email for tenant {$this->tenant->id} - already active");
            return;
        }

        // Check if checkout is still marked as abandoned
        if (!$this->tenant->checkout_abandoned_at) {
            Log::info("Skipping abandoned checkout email for tenant {$this->tenant->id} - checkout no longer abandoned");
            return;
        }

        // Generate discount coupon for recovery
        $couponCode = $this->generateRecoveryCoupon();

        // Send abandoned checkout email
        Mail::to($this->tenant->email)->send(
            new \App\Mail\CheckoutAbandonedEmail($this->tenant, $this->abandonedPlan, $couponCode)
        );

        Log::info("Sent abandoned checkout email to tenant {$this->tenant->id} for plan {$this->abandonedPlan}");
    }

    /**
     * Generate a recovery coupon code
     */
    protected function generateRecoveryCoupon(): string
    {
        // For now, return a static coupon code
        // In production, this should create an actual coupon in the system
        return 'VOLTE10';
    }

    /**
     * Calculate delay before sending email
     */
    public static function getDelay(): \DateTimeInterface
    {
        $hours = config('services.payment.checkout_abandonment_hours', 1);
        return now()->addHours($hours);
    }
}
