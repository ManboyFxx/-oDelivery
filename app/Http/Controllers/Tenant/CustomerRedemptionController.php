<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerRedemptionController extends Controller
{
    /**
     * Redeem a product using loyalty points
     */
    public function redeemProduct(Request $request)
    {
        // ✅ Obter customer da SESSION
        $customerId = session('customer_id');
        if (!$customerId) {
            abort(401, 'Não autenticado');
        }

        $customer = Customer::findOrFail($customerId);

        // ✅ Obter tenant do MIDDLEWARE
        $tenant = $request->attributes->get('tenant');

        // ✅ Validar que customer pertence ao tenant
        if ($customer->tenant_id !== $tenant->id) {
            abort(403, 'Acesso negado');
        }

        // ✅ Validar request (SEM tenant_id e customer_id)
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1|max:1',
        ]);

        // ✅ Forçar tenant_id e customer_id
        $validated['tenant_id'] = $tenant->id;
        $validated['customer_id'] = $customer->id;

        // ✅ Validar produto pertence ao tenant
        $product = Product::where('id', $validated['product_id'])
            ->where('tenant_id', $tenant->id)
            ->firstOrFail();

        // Validate product is redeemable
        if (!$product->loyalty_redeemable) {
            return response()->json(['error' => 'Este produto não é resgatável com pontos'], 400);
        }

        // Validate product belongs to the tenant
        if ($product->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Produto não encontrado nesta loja'], 404);
        }

        // ✅ Customer já validado acima, não precisa buscar novamente

        $quantity = $validated['quantity'] ?? 1;
        $pointsCost = $product->loyalty_points_cost * $quantity;

        // Validate customer has sufficient points
        if ($customer->loyalty_points < $pointsCost) {
            return response()->json([
                'error' => 'Pontos insuficientes',
                'required_points' => $pointsCost,
                'current_points' => $customer->loyalty_points,
            ], 400);
        }

        // Transaction to ensure data integrity
        return DB::transaction(function () use ($customer, $product, $quantity, $pointsCost, $validated) {
            // Redeem points
            $customer->redeemPoints($pointsCost, null, "Resgate: {$product->name}");

            // Create redemption order
            $maxOrderNumber = Order::where('tenant_id', $validated['tenant_id'])->max('order_number');
            $nextOrderNumber = (int) ($maxOrderNumber ?? 0) + 1;

            $order = Order::create([
                'tenant_id' => $validated['tenant_id'],
                'customer_id' => $customer->id,
                'order_number' => $nextOrderNumber,
                'status' => 'new',
                'mode' => 'pickup', // Resgates são sempre retirada
                'address_id' => null,
                'subtotal' => 0,
                'delivery_fee' => 0,
                'total' => 0,
                'loyalty_points_used' => $pointsCost,
                'payment_status' => 'paid', // Já "pago" com pontos
                'customer_name' => $customer->name,
                'customer_phone' => $customer->phone,
            ]);

            // Create order item with redemption flag
            $order->items()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $quantity,
                'unit_price' => 0,
                'complements_price' => 0,
                'subtotal' => 0,
                'is_loyalty_redemption' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Produto resgatado com sucesso!',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'remaining_points' => $customer->loyalty_points,
            ], 201);
        });
    }
}
