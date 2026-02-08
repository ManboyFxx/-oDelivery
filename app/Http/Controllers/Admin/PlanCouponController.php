<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlanCoupon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanCouponController extends Controller
{
    public function index()
    {
        $coupons = PlanCoupon::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Admin/PlanCoupons/Index', [
            'coupons' => $coupons
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:plan_coupons,code|uppercase',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'valid_until' => 'nullable|date|after:today',
            'plan_restriction' => 'nullable|string|in:pro,custom'
        ]);

        PlanCoupon::create($validated);

        return back()->with('success', 'Cupom criado com sucesso!');
    }

    public function update(Request $request, PlanCoupon $coupon)
    {
        $validated = $request->validate([
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'valid_until' => 'nullable|date|after:today',
            'plan_restriction' => 'nullable|string|in:pro,custom',
            'is_active' => 'boolean'
        ]);

        $coupon->update($validated);

        return back()->with('success', 'Cupom atualizado!');
    }

    public function destroy(PlanCoupon $coupon)
    {
        if ($coupon->current_uses > 0) {
            return back()->with('error', 'Não é possível excluir um cupom que já foi utilizado. Desative-o em vez disso.');
        }

        $coupon->delete();

        return back()->with('success', 'Cupom excluído.');
    }

    public function toggle(PlanCoupon $coupon)
    {
        $coupon->update(['is_active' => !$coupon->is_active]);
        return back()->with('success', 'Status do cupom alterado.');
    }
}
