<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponValidationController extends Controller
{
    /**
     * Validate coupon code and return discount information
     */
    public function validate(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'order_total' => 'required|numeric|min:0',
            'tenant_id' => 'required|exists:tenants,id',
        ]);

        $coupon = Coupon::where('tenant_id', $validated['tenant_id'])
            ->where('code', strtoupper($validated['code']))
            ->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Cupom não encontrado',
            ], 404);
        }

        // Check if coupon is valid
        if (!$coupon->isValid()) {
            return response()->json([
                'valid' => false,
                'message' => 'Este cupom não está válido ou expirou',
            ], 400);
        }

        // Check minimum order value
        if ($validated['order_total'] < $coupon->min_order_value) {
            return response()->json([
                'valid' => false,
                'message' => "Compra mínima de R$ {$coupon->min_order_value} necessária para usar este cupom",
            ], 400);
        }

        return response()->json([
            'valid' => true,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
                'min_order_value' => $coupon->min_order_value,
            ]
        ]);
    }
}
