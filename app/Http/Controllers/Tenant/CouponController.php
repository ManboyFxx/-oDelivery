<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Validate a coupon code and calculate discount
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validate(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'cart_total' => 'required|numeric|min:0',
            'tenant_id' => 'required|exists:tenants,id',
        ]);

        $code = strtoupper(trim($request->code));
        $cartTotal = (float) $request->cart_total;
        $tenantId = $request->tenant_id;

        // Find coupon
        $coupon = Coupon::where('tenant_id', $tenantId)
            ->whereRaw('UPPER(code) = ?', [$code])
            ->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Cupom inválido.',
                'discount' => 0,
                'coupon' => null,
            ]);
        }

        // Check if coupon is valid
        if (!$coupon->isValid()) {
            $message = 'Cupom expirado ou inativo.';

            if ($coupon->max_uses && $coupon->current_uses >= $coupon->max_uses) {
                $message = 'Cupom já atingiu o limite de usos.';
            } elseif ($coupon->valid_until && $coupon->valid_until->isPast()) {
                $message = 'Cupom expirado.';
            } elseif ($coupon->valid_from && $coupon->valid_from->isFuture()) {
                $message = 'Cupom ainda não está válido.';
            }

            return response()->json([
                'valid' => false,
                'message' => $message,
                'discount' => 0,
                'coupon' => null,
            ]);
        }

        // Check minimum order value
        if ($cartTotal < $coupon->min_order_value) {
            return response()->json([
                'valid' => false,
                'message' => sprintf(
                    'Valor mínimo do pedido: R$ %.2f',
                    $coupon->min_order_value
                ),
                'discount' => 0,
                'coupon' => null,
            ]);
        }

        // Calculate discount
        $discount = $coupon->calculateDiscount($cartTotal);

        return response()->json([
            'valid' => true,
            'message' => sprintf(
                'Cupom aplicado! Desconto de R$ %.2f',
                $discount
            ),
            'discount' => $discount,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
            ],
        ]);
    }
}
