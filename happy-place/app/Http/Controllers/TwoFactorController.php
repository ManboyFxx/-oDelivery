<?php

namespace App\Http\Controllers;

use App\Services\TwoFactorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TwoFactorController extends Controller
{
    public function __construct(
        private TwoFactorService $twoFactorService
    ) {
    }

    /**
     * Show 2FA settings page
     */
    public function show()
    {
        $user = auth()->user();
        $isEnabled = $this->twoFactorService->isEnabled($user);
        $remainingCodes = $isEnabled ? $this->twoFactorService->getRemainingRecoveryCodes($user) : 0;

        return Inertia::render('Settings/TwoFactor', [
            'isEnabled' => $isEnabled,
            'remainingCodes' => $remainingCodes,
        ]);
    }

    /**
     * Start 2FA setup - generate secret and return QR code
     */
    public function enable(Request $request)
    {
        $user = $request->user();

        // Check if 2FA is already enabled
        if ($this->twoFactorService->isEnabled($user)) {
            return response()->json([
                'error' => '2FA já está ativado para sua conta',
            ], 422);
        }

        // Generate secret
        $secret = $this->twoFactorService->generateSecretKey();

        // Get QR code URL
        $qrCodeUrl = $this->twoFactorService->getQrCodeUrl($user, $secret);

        return response()->json([
            'secret' => $secret,
            'qrCodeUrl' => $qrCodeUrl,
        ]);
    }

    /**
     * Confirm 2FA setup with verification code
     */
    public function confirm(Request $request)
    {
        $validated = $request->validate([
            'secret' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        // Verify the code
        if (!$this->twoFactorService->verify($validated['secret'], $validated['code'])) {
            return response()->json([
                'error' => 'Código inválido. Tente novamente.',
            ], 422);
        }

        // Enable 2FA and get recovery codes
        $recoveryCodes = $this->twoFactorService->enable($user, $validated['secret']);

        return response()->json([
            'message' => '2FA ativado com sucesso!',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    /**
     * Disable 2FA for user
     */
    public function disable(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = $request->user();

        if (!$this->twoFactorService->isEnabled($user)) {
            return response()->json([
                'error' => '2FA não está ativado para sua conta',
            ], 422);
        }

        $this->twoFactorService->disable($user);

        return response()->json([
            'message' => '2FA foi desativado com sucesso',
        ]);
    }

    /**
     * Verify 2FA code during login
     */
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();

        // Try to verify with TOTP code
        if ($this->twoFactorService->verify($user->two_factor_secret, $validated['code'])) {
            return response()->json([
                'verified' => true,
            ]);
        }

        // Try to verify with recovery code
        if ($this->twoFactorService->verifyRecoveryCode($user, $validated['code'])) {
            return response()->json([
                'verified' => true,
                'recovery_code_used' => true,
            ]);
        }

        return response()->json([
            'error' => 'Código inválido. Tente novamente ou use um recovery code.',
        ], 422);
    }

    /**
     * Generate new recovery codes
     */
    public function regenerateRecoveryCodes(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = $request->user();

        if (!$this->twoFactorService->isEnabled($user)) {
            return response()->json([
                'error' => '2FA não está ativado para sua conta',
            ], 422);
        }

        // Generate new codes
        $secret = $user->two_factor_secret;
        $recoveryCodes = $this->twoFactorService->enable($user, $secret);

        return response()->json([
            'message' => 'Novos recovery codes gerados com sucesso',
            'recovery_codes' => $recoveryCodes,
        ]);
    }
}
