<?php

namespace App\Services;

use App\Models\User;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Support\Str;

class TwoFactorService
{
    protected Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Generate a new secret key for the user
     */
    public function generateSecretKey(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    /**
     * Get QR code URL for the user to scan with authenticator app
     */
    public function getQrCodeUrl(User $user, string $secret): string
    {
        return $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );
    }

    /**
     * Verify a code provided by the user
     */
    public function verify(string $secret, string $code): bool
    {
        // Allow window of 1 (previous/current/next time window)
        return $this->google2fa->verifyKeyNewer(
            $secret,
            $code,
            null,
            1
        );
    }

    /**
     * Enable 2FA for user and return recovery codes
     */
    public function enable(User $user, string $secret): array
    {
        $recoveryCodes = $this->generateRecoveryCodes();

        $user->update([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => json_encode($recoveryCodes),
            'two_factor_confirmed_at' => now(),
        ]);

        return $recoveryCodes;
    }

    /**
     * Disable 2FA for user
     */
    public function disable(User $user): void
    {
        $user->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);
    }

    /**
     * Check if user has 2FA enabled
     */
    public function isEnabled(User $user): bool
    {
        return !is_null($user->two_factor_confirmed_at);
    }

    /**
     * Verify using recovery code (one-time use)
     */
    public function verifyRecoveryCode(User $user, string $code): bool
    {
        if (!$user->two_factor_recovery_codes) {
            return false;
        }

        $codes = json_decode($user->two_factor_recovery_codes, true);

        if (!is_array($codes)) {
            return false;
        }

        $codeKey = array_search($code, $codes, true);

        if ($codeKey === false) {
            return false;
        }

        // Remove used code
        unset($codes[$codeKey]);
        $user->update([
            'two_factor_recovery_codes' => json_encode(array_values($codes)),
        ]);

        return true;
    }

    /**
     * Get remaining recovery codes count
     */
    public function getRemainingRecoveryCodes(User $user): int
    {
        if (!$user->two_factor_recovery_codes) {
            return 0;
        }

        $codes = json_decode($user->two_factor_recovery_codes, true);

        return is_array($codes) ? count($codes) : 0;
    }

    /**
     * Generate 8 recovery codes
     */
    private function generateRecoveryCodes(): array
    {
        $codes = [];

        for ($i = 0; $i < 8; $i++) {
            $codes[] = Str::random(8);
        }

        return $codes;
    }
}
