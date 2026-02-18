<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\LoyaltyPointsHistory;
use App\Models\Referral;
use App\Models\StoreSetting;
use Illuminate\Support\Str;

class ReferralService
{
    /**
     * Generate a unique referral code for a customer.
     */
    public function generateCode(Customer $customer): string
    {
        if ($customer->referral_code) {
            return $customer->referral_code;
        }

        $base = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $customer->name), 0, 4));
        if (strlen($base) < 2) {
            $base = 'REF';
        }

        do {
            $code = $base . strtoupper(Str::random(4));
        } while (
            Customer::where('tenant_id', $customer->tenant_id)
                ->where('referral_code', $code)
                ->exists()
        );

        $customer->update(['referral_code' => $code]);

        return $code;
    }

    /**
     * Apply a referral code when a new customer registers.
     * Returns true if applied, false if invalid/fraud.
     */
    public function applyReferral(
        Customer $referred,
        string $code,
        string $ip,
        string $deviceFingerprint
    ): bool {
        $settings = StoreSetting::where('tenant_id', $referred->tenant_id)->first();

        if (!$settings || !$settings->referral_enabled) {
            return false;
        }

        // Find referrer by code in same tenant
        $referrer = Customer::where('tenant_id', $referred->tenant_id)
            ->where('referral_code', $code)
            ->first();

        if (!$referrer || $referrer->id === $referred->id) {
            return false;
        }

        // Anti-fraud: referrer must have at least 1 order
        if ($referrer->orders()->count() < 1) {
            return false;
        }

        // Anti-fraud: check max referrals per customer
        $referralCount = Referral::where('referrer_id', $referrer->id)
            ->whereIn('status', ['pending', 'completed'])
            ->count();

        if ($referralCount >= ($settings->referral_max_per_customer ?? 10)) {
            return false;
        }

        // Anti-fraud: same IP as referrer
        if ($referrer->last_known_ip && $referrer->last_known_ip === $ip) {
            return false;
        }

        // Anti-fraud: same device fingerprint as referrer
        if ($referrer->device_fingerprint && $referrer->device_fingerprint === $deviceFingerprint) {
            return false;
        }

        // Anti-fraud: referred already has a referral in this tenant
        $alreadyReferred = Referral::where('tenant_id', $referred->tenant_id)
            ->where('referred_id', $referred->id)
            ->exists();

        if ($alreadyReferred) {
            return false;
        }

        // Calculate expiry
        $expiresAt = null;
        if ($settings->referral_code_expiry_days) {
            $expiresAt = now()->addDays($settings->referral_code_expiry_days);
        }

        Referral::create([
            'tenant_id' => $referred->tenant_id,
            'referrer_id' => $referrer->id,
            'referred_id' => $referred->id,
            'referral_code' => $code,
            'status' => 'pending',
            'referred_ip' => $ip,
            'referred_device_fingerprint' => $deviceFingerprint,
            'referrer_ip' => $referrer->last_known_ip,
            'referrer_device_fingerprint' => $referrer->device_fingerprint,
            'expires_at' => $expiresAt,
        ]);

        return true;
    }

    /**
     * Process referral reward after referred customer's first order.
     * Called from CustomerOrderController after order creation.
     */
    public function processReward(Customer $referred, float $orderTotal): void
    {
        // Only trigger on first order
        $orderCount = $referred->orders()->count();
        if ($orderCount !== 1) {
            return;
        }

        $referral = Referral::where('tenant_id', $referred->tenant_id)
            ->where('referred_id', $referred->id)
            ->where('status', 'pending')
            ->first();

        if (!$referral) {
            return;
        }

        // Check expiry
        if ($referral->isExpired()) {
            $referral->update(['status' => 'expired']);
            return;
        }

        $settings = StoreSetting::where('tenant_id', $referred->tenant_id)->first();

        if (!$settings || !$settings->referral_enabled) {
            return;
        }

        // Check minimum order value
        if ($settings->referral_min_order_value && $orderTotal < $settings->referral_min_order_value) {
            return;
        }

        $referrerPoints = $settings->referral_referrer_points ?? 50;
        $referredPoints = $settings->referral_referred_points ?? 20;

        // Ensure referred gets less than referrer
        $referredPoints = min($referredPoints, $referrerPoints - 1);

        // Award points to referrer
        $referral->referrer->increment('loyalty_points', $referrerPoints);
        LoyaltyPointsHistory::create([
            'tenant_id' => $referred->tenant_id,
            'customer_id' => $referral->referrer_id,
            'points' => $referrerPoints,
            'type' => 'earn',
            'description' => "Indicação aceita: {$referred->name} fez o primeiro pedido!",
        ]);

        // Award points to referred
        $referred->increment('loyalty_points', $referredPoints);
        LoyaltyPointsHistory::create([
            'tenant_id' => $referred->tenant_id,
            'customer_id' => $referred->id,
            'points' => $referredPoints,
            'type' => 'earn',
            'description' => "Bônus de boas-vindas por indicação!",
        ]);

        // Mark referral as completed
        $referral->update([
            'status' => 'completed',
            'referrer_points_awarded' => $referrerPoints,
            'referred_points_awarded' => $referredPoints,
            'completed_at' => now(),
        ]);
    }
}
