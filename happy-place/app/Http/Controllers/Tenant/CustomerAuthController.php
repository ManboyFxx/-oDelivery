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
     * 1. Check if phone exists
     * 2. If yes, login
     * 3. If no, return needs_registration flag
     */
    public function checkPhone(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $customer = Customer::where('phone', $request->phone)->first();

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
            'phone' => $request->phone,
        ]);
    }

    /**
     * Complete registration with name
     */
    public function completeRegistration(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|unique:customers',
            'name' => 'required|string|max:255',
        ]);

        $tenant = Tenant::first(); // Demo tenant

        $customer = Customer::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'loyalty_points' => 0,
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
