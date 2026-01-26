<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Tenant;
use Illuminate\Http\Request;

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
            // Auto-login
            session(['customer_id' => $customer->id]);

            return response()->json([
                'exists' => true,
                'customer' => $customer,
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
            // Already exists, just login
            session(['customer_id' => $existingCustomer->id]);
            return response()->json([
                'message' => 'Login realizado com sucesso!',
                'customer' => $existingCustomer,
            ]);
        }

        $customer = Customer::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'loyalty_points' => 0,
            'loyalty_tier' => 'bronze', // Default tier for new customers
        ]);

        session(['customer_id' => $customer->id]);

        return response()->json([
            'message' => 'Cadastro realizado com sucesso!',
            'customer' => $customer,
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

        return response()->json($customer);
    }
}
