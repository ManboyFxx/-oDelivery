<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerDevice;
use App\Models\OtpCode;
use App\Models\Tenant;
use App\Services\WhatsAppOTPService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class CustomerAuthController extends Controller
{
    /**
     * Phone-only login/register flow
     * 1. Check if phone exists for this tenant
     * 2. If yes, login
     * 3. If no, return needs_registration flag
     */
    public function checkPhone(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'tenant_slug' => 'nullable|string',
            'device_fingerprint' => 'required|string', // Enviado pelo Frontend
        ]);

        // Get tenant from slug or referer
        $tenantSlug = $validated['tenant_slug'] ?? null;

        if (!$tenantSlug) {
            $referer = $request->headers->get('referer');
            if ($referer && preg_match('/\/([^\/]+)\/menu/', $referer, $matches)) {
                $tenantSlug = $matches[1];
            }
        }

        $tenant = Tenant::where('slug', $tenantSlug)->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada.',
            ], 404);
        }

        // Store tenant slug in session for later use
        session(['current_tenant_slug' => $tenantSlug]);

        $customer = Customer::where('tenant_id', $tenant->id)
            ->where('phone', $validated['phone'])
            ->first();

        if ($customer) {
            // ✅ Verificar se dispositivo é confiável
            $deviceToken = $request->cookie('device_token');
            if ($deviceToken && $this->isDeviceTrusted($customer->id, $deviceToken)) {
                // Login direto (dispositivo confiável)
                $request->session()->regenerate();
                session([
                    'customer_id' => $customer->id,
                    'customer_tenant_id' => $customer->tenant_id,
                    'current_tenant_slug' => $tenantSlug
                ]);

                return response()->json([
                    'exists' => true,
                    'trusted_device' => true,
                    'customer' => [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'loyalty_points' => $customer->loyalty_points,
                        'loyalty_tier' => $customer->loyalty_tier,
                    ],
                ]);
            }

            // Check if OTP is enabled in store settings (Tenant specific or Global Fallback)
            $storeSettings = \App\Models\StoreSetting::where('tenant_id', $tenant->id)->first();

            if ($storeSettings) {
                $otpEnabled = $storeSettings->enable_otp_verification;
            } else {
                // Fallback to Global setting (tenant_id is null)
                $globalSettings = \App\Models\StoreSetting::whereNull('tenant_id')->first();
                $otpEnabled = $globalSettings ? $globalSettings->enable_otp_verification : true;
            }

            if (!$otpEnabled) {
                // OTP disabled -> Check for Password
                if ($customer->password) {
                    return response()->json([
                        'exists' => true,
                        'requires_password' => true,
                        'name' => $customer->name, // Help UX
                        'message' => 'Digite sua senha para entrar'
                    ]);
                } else {
                    // Start Password Setup Flow (One-time OTP)
                    // We can trigger OTP sending here or ask user to confirm
                    return response()->json([
                        'exists' => true,
                        'requires_setup' => true,
                        'message' => 'Precisamos configurar uma senha segura para você.'
                    ]);
                }
            }

            // ❌ Dispositivo desconhecido E OTP Ligado: Enviar OTP
            $otpCode = $this->generateAndSendOTP($customer->phone, $tenant->id);

            return response()->json([
                'exists' => true,
                'trusted_device' => false,
                'requires_otp' => true,
                'message' => 'Código enviado via WhatsApp'
            ]);
        }

        return response()->json([
            'exists' => false,
            'phone' => $validated['phone'],
        ]);
    }

    /**
     * Complete registration with name
     */
    public function completeRegistration(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'name' => 'required|string|max:255',
            'tenant_slug' => 'nullable|string', // Optional: pass from frontend
        ]);

        // Get tenant from slug or session
        $tenantSlug = $validated['tenant_slug'] ?? session('current_tenant_slug');

        if (!$tenantSlug) {
            // Fallback: try to get from referer URL
            $referer = $request->headers->get('referer');
            if ($referer && preg_match('/\/([^\/]+)\/menu/', $referer, $matches)) {
                $tenantSlug = $matches[1];
            }
        }

        $tenant = Tenant::where('slug', $tenantSlug)->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Loja não encontrada. Tente novamente.',
            ], 404);
        }

        // Check if customer already exists for this tenant
        $existingCustomer = Customer::where('tenant_id', $tenant->id)
            ->where('phone', $validated['phone'])
            ->first();

        if ($existingCustomer) {
            // If already exists, we redirect to login flow
            return response()->json([
                'exists' => true,
                'message' => 'Cliente já cadastrado. Faça login.',
            ]);
        }

        $customer = Customer::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'loyalty_points' => 0,
            'loyalty_tier' => 'bronze', // Default tier for new customers
        ]);

        // After registration, we don't login immediately if password is required by policy?
        // Actually, for better UX, let's login but mark as "needs password setup"
        // But for consistency with Security, let's Redirect to Setup

        return response()->json([
            'message' => 'Cadastro inicial realizado!',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $validated['phone'] // Return phone for next step
            ],
            'requires_setup' => true // Trigger setup flow
        ]);
    }

    public function logout()
    {
        session()->forget('customer_id');

        return response()->json([
            'message' => 'Desconectado.',
        ]);
    }

    public function me()
    {
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(null, 401);
        }

        $customer = Customer::with([
            'orders' => function ($q) {
                $q->latest()->limit(5);
            }
        ])->find($customerId);

        // ✅ Sanitizar dados
        return response()->json([
            'id' => $customer->id,
            'name' => $customer->name,
            'loyalty_points' => $customer->loyalty_points,
            'loyalty_tier' => $customer->loyalty_tier,
            'orders' => $customer->orders,
            'referral_code' => $customer->referral_code,
            // ❌ NÃO expor: phone, email, tenant_id
        ]);
    }

    /**
     * Verify OTP code and create trusted device
     */
    public function verifyOTP(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string|size:6',
            'tenant_slug' => 'required|string',
            'device_fingerprint' => 'required|string',
        ]);

        $tenant = Tenant::where('slug', $validated['tenant_slug'])->firstOrFail();
        $customer = Customer::where('tenant_id', $tenant->id)
            ->where('phone', $validated['phone'])
            ->firstOrFail();

        // Validar OTP
        $otp = OtpCode::where('phone', $validated['phone'])
            ->where('code', $validated['code'])
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return response()->json([
                'valid' => false,
                'message' => 'Código inválido ou expirado'
            ], 422);
        }

        // Marcar como usado
        $otp->markAsUsed();

        // ✅ Criar dispositivo confiável
        $deviceToken = $this->createTrustedDevice(
            $customer->id,
            $validated['device_fingerprint'],
            $request->userAgent(),
            $request->ip()
        );

        // Login
        $request->session()->regenerate();
        session([
            'customer_id' => $customer->id,
            'customer_tenant_id' => $customer->tenant_id,
            'current_tenant_slug' => $validated['tenant_slug']
        ]);

        return response()->json([
            'valid' => true,
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'loyalty_points' => $customer->loyalty_points,
                'loyalty_tier' => $customer->loyalty_tier,
            ],
        ])->cookie('device_token', $deviceToken, 60 * 24 * 90); // 90 dias
    }

    /**
     * Login with Password
     */
    public function loginWithPassword(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
            'tenant_slug' => 'required|string',
            'device_fingerprint' => 'required|string',
        ]);

        $tenant = Tenant::where('slug', $validated['tenant_slug'])->firstOrFail();
        $customer = Customer::where('tenant_id', $tenant->id)
            ->where('phone', $validated['phone'])
            ->firstOrFail();

        if (!$customer->password || !\Illuminate\Support\Facades\Hash::check($validated['password'], $customer->password)) {
            return response()->json([
                'message' => 'Senha incorreta.'
            ], 401);
        }

        // Success - Create trusted device implicitly or explicit?
        // Let's create trusted device to avoid future checks if needed
        $deviceToken = $this->createTrustedDevice(
            $customer->id,
            $validated['device_fingerprint'],
            $request->userAgent(),
            $request->ip()
        );

        $request->session()->regenerate();
        session([
            'customer_id' => $customer->id,
            'customer_tenant_id' => $customer->tenant_id,
            'current_tenant_slug' => $validated['tenant_slug']
        ]);

        return response()->json([
            'success' => true,
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'loyalty_points' => $customer->loyalty_points,
            ]
        ])->cookie('device_token', $deviceToken, 60 * 24 * 90);
    }

    /**
     * Send OTP for Password Setup
     */
    public function sendSetupOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'tenant_slug' => 'required|string',
        ]);

        $tenant = Tenant::where('slug', $validated['tenant_slug'])->firstOrFail();

        // Ensure customer exists or is new
        // We actually only need phone.

        $this->generateAndSendOTP($validated['phone'], $tenant->id);

        return response()->json(['message' => 'Código de verificação enviado!']);
    }

    /**
     * Setup Password (Requires OTP)
     */
    public function setupPassword(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:6',
            'tenant_slug' => 'required|string',
            'device_fingerprint' => 'required|string',
        ]);

        // Verify OTP first
        $otp = OtpCode::where('phone', $validated['phone'])
            ->where('code', $validated['code'])
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return response()->json([
                'message' => 'Código inválido ou expirado'
            ], 422);
        }

        $otp->markAsUsed();

        $tenant = Tenant::where('slug', $validated['tenant_slug'])->firstOrFail();
        $customer = Customer::where('tenant_id', $tenant->id)
            ->where('phone', $validated['phone'])
            ->firstOrFail();

        // Set Password
        $customer->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        $customer->save();

        // Auto Login
        $deviceToken = $this->createTrustedDevice(
            $customer->id,
            $validated['device_fingerprint'],
            $request->userAgent(),
            $request->ip()
        );

        $request->session()->regenerate();
        session([
            'customer_id' => $customer->id,
            'customer_tenant_id' => $customer->tenant_id,
            'current_tenant_slug' => $validated['tenant_slug']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Senha definida com sucesso!',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'loyalty_points' => $customer->loyalty_points,
            ]
        ])->cookie('device_token', $deviceToken, 60 * 24 * 90);
    }

    /**
     * Quick Login Secure (Last 4 digits validation)
     */
    public function quickLoginSecure(Request $request)
    {
        $validated = $request->validate([
            'phone_last_4' => 'required|string|size:4',
            'customer_id' => 'required|string',
            'device_fingerprint' => 'required|string',
        ]);

        $customer = Customer::find($validated['customer_id']);

        if (!$customer) {
            return response()->json(['message' => 'Cliente não encontrado.'], 404);
        }

        // Validate Phone (Last 4 digits)
        // Phone is encrypted/decrypted via accessor, so $customer->phone is plain text here
        if (substr($customer->phone, -4) !== $validated['phone_last_4']) {
            return response()->json(['message' => 'Dígitos incorretos.'], 401);
        }

        // Create Trusted Device (if not exists)
        $deviceToken = $this->createTrustedDevice(
            $customer->id,
            $validated['device_fingerprint'],
            $request->userAgent(),
            $request->ip()
        );

        // Login
        $request->session()->regenerate();
        session([
            'customer_id' => $customer->id,
            'customer_tenant_id' => $customer->tenant_id,
            'current_tenant_slug' => session('current_tenant_slug')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Identidade confirmada!',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
            ]
        ])->cookie('device_token', $deviceToken, 60 * 24 * 90);
    }

    /**
     * Check if device is trusted
     */
    private function isDeviceTrusted(string $customerId, string $deviceToken): bool
    {
        $device = CustomerDevice::where('customer_id', $customerId)
            ->where('device_token', $deviceToken)
            ->where('expires_at', '>', now())
            ->first();

        if ($device) {
            // Update last used timestamp
            $device->touch();
            return true;
        }

        return false;
    }

    /**
     * Generate and send OTP code via WhatsApp
     */
    private function generateAndSendOTP(string $phone, string $tenantId): string
    {
        try {
            // Generate 6-digit code
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Store OTP in database
            OtpCode::create([
                'phone' => $phone,
                'code' => $code,
                'expires_at' => now()->addMinutes(5),
                'ip_address' => request()->ip(),
            ]);

            // Send via WhatsApp
            $whatsappService = app(WhatsAppOTPService::class);
            $whatsappService->sendOTP($phone, $code, $tenantId);

            return $code;

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error generating/sending OTP', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-throw to ensure we don't proceed with invalid state, but now we have logs.
        }
    }

    /**
     * Create trusted device token
     */
    private function createTrustedDevice(
        string $customerId,
        string $deviceFingerprint,
        ?string $userAgent = null,
        ?string $ipAddress = null
    ): string {
        // Generate unique device token
        $deviceToken = hash('sha256', $customerId . $deviceFingerprint . Str::random(32));

        CustomerDevice::create([
            'customer_id' => $customerId,
            'device_token' => $deviceToken,
            'device_fingerprint' => $deviceFingerprint,
            'user_agent' => $userAgent,
            'ip_address' => $ipAddress,
            'last_used_at' => now(),
            'expires_at' => now()->addDays(90),
        ]);

        return $deviceToken;
    }
}
