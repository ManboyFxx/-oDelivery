<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Referral;
use App\Models\StoreSetting;
use App\Services\ReferralService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReferralController extends Controller
{
    public function __construct(private ReferralService $referralService)
    {
    }

    /**
     * Generate or return the referral code for the authenticated customer.
     */
    public function generateCode(Request $request)
    {
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $customer = Customer::find($customerId);
        if (!$customer) {
            return response()->json(['message' => 'Cliente não encontrado.'], 404);
        }

        // Only customers with at least 1 order can generate referral codes
        if ($customer->orders()->count() < 1) {
            return response()->json(['message' => 'Faça seu primeiro pedido para liberar o código de indicação.'], 403);
        }

        $code = $this->referralService->generateCode($customer);

        return response()->json([
            'referral_code' => $code,
            'referral_count' => Referral::where('referrer_id', $customer->id)
                ->where('status', 'completed')
                ->count(),
        ]);
    }

    /**
     * Apply a referral code when a customer registers.
     */
    public function applyReferral(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20',
            'customer_id' => 'required|string',
            'device_fingerprint' => 'nullable|string',
        ]);

        $customer = Customer::find($validated['customer_id']);
        if (!$customer) {
            return response()->json(['message' => 'Cliente não encontrado.'], 404);
        }

        $applied = $this->referralService->applyReferral(
            $customer,
            strtoupper($validated['code']),
            $request->ip(),
            $validated['device_fingerprint'] ?? 'unknown'
        );

        return response()->json([
            'applied' => $applied,
            'message' => $applied
                ? 'Código de indicação aplicado! Você ganhará pontos após seu primeiro pedido.'
                : 'Código inválido ou não aplicável.',
        ]);
    }

    /**
     * Admin dashboard: list all referrals for the tenant.
     */
    public function index(Request $request)
    {
        $tenantId = Auth::user()->tenant_id;

        $referrals = Referral::with(['referrer:id,name,phone', 'referred:id,name,phone'])
            ->where('tenant_id', $tenantId)
            ->orderByDesc('created_at')
            ->paginate(50);

        $stats = [
            'total' => Referral::where('tenant_id', $tenantId)->count(),
            'completed' => Referral::where('tenant_id', $tenantId)->where('status', 'completed')->count(),
            'pending' => Referral::where('tenant_id', $tenantId)->where('status', 'pending')->count(),
            'total_points_awarded' => Referral::where('tenant_id', $tenantId)
                ->where('status', 'completed')
                ->sum('referrer_points_awarded'),
        ];

        return Inertia::render('Loyalty/Index', [
            'referrals' => $referrals,
            'referralStats' => $stats,
        ]);
    }
}
