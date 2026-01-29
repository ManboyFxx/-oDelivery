<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CouponController extends Controller
{
    public function index()
    {
        $coupons = Coupon::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Coupons/Index', [
            'coupons' => $coupons
        ]);
    }

    public function create()
    {
        return Inertia::render('Coupons/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code|max:50',
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'valid_until' => 'nullable|date',
        ]);

        $tenant = auth()->user()->tenant;

        // Check Plan Limits
        if (!$tenant->canAdd('coupons')) {
            return redirect()->route('coupons.index')->withErrors(['error' => 'Você atingiu o limite de cupons ativos do seu plano.']);
        }

        $validated['tenant_id'] = $tenant->id;
        Coupon::create($validated);

        return redirect()->route('coupons.index')->with('success', 'Cupom criado com sucesso!');
    }

    public function edit(Coupon $coupon)
    {
        return Inertia::render('Coupons/Edit', [
            'coupon' => $coupon
        ]);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code,' . $coupon->id,
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'valid_until' => 'nullable|date',
            'is_active' => 'boolean'
        ]);

        $coupon->update($validated);

        return redirect()->route('coupons.index')->with('success', 'Cupom atualizado com sucesso!');
    }
}
