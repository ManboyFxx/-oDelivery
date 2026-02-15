<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use App\Models\ComplementOption;
use App\Models\LoyaltyPromotion;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerOrderController extends Controller
{
    /**
     * Get paginated customer orders (excluding soft-deleted)
     */
    public function index(Request $request)
    {
        // ✅ Obter customer da SESSION (não do request)
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(['error' => 'Não autenticado'], 401);
        }

        $customer = Customer::findOrFail($customerId);

        // ✅ Obter tenant do MIDDLEWARE (não do request)
        $tenant = $request->attributes->get('tenant');

        // ✅ Validar que customer pertence ao tenant
        if ($customer->tenant_id !== $tenant->id) {
            \Log::warning('Tentativa de acesso cross-tenant em orders', [
                'customer_id' => $customer->id,
                'customer_tenant' => $customer->tenant_id,
                'requested_tenant' => $tenant->id,
                'ip' => $request->ip()
            ]);
            abort(403, 'Acesso negado');
        }

        $page = $request->get('page', 1);
        $perPage = 10;

        // ✅ Double-check: filtrar por customer_id E tenant_id
        $orders = Order::where('customer_id', $customer->id)
            ->where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'orders' => $orders->items(),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'has_more' => $orders->hasMorePages(),
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        // ✅ Validar customer via SESSION
        $customerId = session('customer_id');
        if (!$customerId) {
            abort(401, 'Não autenticado');
        }

        $customer = Customer::findOrFail($customerId);

        // ✅ Obter tenant do MIDDLEWARE
        $tenant = $request->attributes->get('tenant');

        // ✅ Validar que customer pertence ao tenant
        if ($customer->tenant_id !== $tenant->id) {
            \Log::warning('Tentativa de checkout cross-tenant', [
                'customer_id' => $customer->id,
                'customer_tenant' => $customer->tenant_id,
                'requested_tenant' => $tenant->id,
                'ip' => $request->ip()
            ]);
            abort(403, 'Acesso negado');
        }

        // ✅ Validar request (SEM tenant_id e customer_id)
        $validated = $request->validate([
            'mode' => 'required|in:delivery,pickup',
            'address_id' => 'required_if:mode,delivery|nullable|exists:customer_addresses,id',
            'payment_method' => 'required|in:cash,credit_card,debit_card,pix',
            'change_for' => 'nullable|numeric|min:0',
            'coupon_id' => 'nullable|exists:coupons,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'items.*.complements' => 'nullable|array',
            'items.*.complements.*.id' => 'required|exists:complement_options,id',
            'items.*.complements.*.quantity' => 'required|integer|min:1',
            'loyalty_points_used' => 'nullable|integer|min:0',
        ]);

        // ✅ Forçar tenant_id e customer_id da SESSION/MIDDLEWARE
        $validated['tenant_id'] = $tenant->id;
        $validated['customer_id'] = $customer->id;

        $settings = \App\Models\StoreSetting::where('tenant_id', $tenant->id)->first();

        // Transaction to ensure data integrity
        return DB::transaction(function () use ($validated, $tenant, $settings) {
            $customer = \App\Models\Customer::find($validated['customer_id']);
            $orderTotal = 0;
            $orderItems = [];

            // 1. Process Items and Calculate Subtotal
            foreach ($validated['items'] as $itemData) {
                // ✅ Validar que produto pertence ao tenant
                $product = Product::where('id', $itemData['product_id'])
                    ->where('tenant_id', $tenant->id)
                    ->firstOrFail();

                // Verify stock if enabled
                if ($product->track_stock && ($product->stock_quantity < $itemData['quantity'])) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'items' => "O produto {$product->name} não tem estoque suficiente."
                    ]);
                }

                $itemSubtotal = $product->price;
                $complementsPrice = 0;
                $processedComplements = [];

                if (!empty($itemData['complements'])) {
                    foreach ($itemData['complements'] as $compData) {
                        $option = ComplementOption::find($compData['id']);
                        $compQty = $compData['quantity'];
                        $itemSubtotal += $option->price * $compQty;
                        $complementsPrice += $option->price * $compQty;

                        $processedComplements[] = [
                            'complement_option_id' => $option->id,
                            'name' => $option->name,
                            'price' => $option->price,
                            'quantity' => $compQty
                        ];
                    }
                }

                $lineTotal = $itemSubtotal * $itemData['quantity'];
                $orderTotal += $lineTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $product->price,
                    'complements_price' => $complementsPrice,
                    'subtotal' => $lineTotal,
                    'notes' => $itemData['notes'] ?? null,
                    'complements' => $processedComplements
                ];

            }

            // 2. Fees
            $deliveryFee = 0;
            if ($validated['mode'] === 'delivery' && $settings) {
                // If using delivery zones, calculate based on zone
                // The frontend should pass address_id, so we look up the zone from the address
                if ($validated['address_id']) {
                    $address = \App\Models\CustomerAddress::find($validated['address_id']);
                    // Ideally we match by zip_code or neighborhood. 
                    // For now, let's try to find a matching zone by neighborhood name or assume a default.

                    // Simple lookup: Find zone matching neighborhood
                    $zone = \App\Models\DeliveryZone::where('tenant_id', $tenant->id)
                        ->where('neighborhood', 'LIKE', '%' . $address->neighborhood . '%') // Simple match
                        ->where('is_active', true)
                        ->first();

                    if ($zone) {
                        $deliveryFee = $zone->price;
                    } else {
                        // Fallback: Check for a "default" or "all other neighborhoods" zone if exists, or keep $5 as fallback but log it?
                        // Let's keep 5.00 as fallback but ideally this should be 0 or configurable.
                        $deliveryFee = $settings->default_delivery_fee ?? 5.00;
                    }
                } else {
                    $deliveryFee = 5.00;
                }
            }

            $total = $orderTotal + $deliveryFee;

            // Apply Coupon Discount
            $discount = 0;
            $coupon = null;
            if ($validated['coupon_id']) {
                // ✅ Validar que coupon pertence ao tenant
                $coupon = Coupon::where('id', $validated['coupon_id'])
                    ->where('tenant_id', $tenant->id)
                    ->first();
                if ($coupon && $coupon->isValid()) {
                    $discount = $coupon->calculateDiscount($total);
                }
            }

            $total = max(0, $total - $discount);

            // 2. Calculate Loyalty Points (using consolidated LoyaltyService)
            $loyaltyPointsEarned = 0;
            $loyaltyService = app(\App\Services\LoyaltyService::class);

            // Handle POINT-BASED DISCOUNT (Cashback)
            if ($validated['loyalty_points_used'] > 0) {
                if ($customer->loyalty_points < $validated['loyalty_points_used']) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'loyalty_points_used' => 'Você não tem pontos suficientes.'
                    ]);
                }

                $pointsDiscount = $loyaltyService->calculateDiscountForPoints($tenant->id, $validated['loyalty_points_used']);
                $discount += $pointsDiscount;

                // Deduct points immediately (within transaction)
                $customer->redeemPoints($validated['loyalty_points_used'], null, 'Desconto em pedido online');
            }

            if ($settings && $settings->loyalty_enabled && $orderTotal > 0) {
                // The awardPointsForOrder method itself will be called AFTER the order is completed (delivered)
                // However, we pre-calculate here to show the user or store it in the order initially.
                // We'll use a simplified version for the 'initial' estimate, or just wait for the Observer.
                // Actually, the original code pre-calculated it here. Let's keep it consistent but use better logic.

                $pointsRate = $settings->points_per_currency ?? 1.0;
                $activePromotion = \App\Models\LoyaltyPromotion::where('tenant_id', $tenant->id)
                    ->where('is_active', true)
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
                    ->first();

                $promoMultiplier = $activePromotion ? $activePromotion->multiplier : 1.0;
                $tierMultiplier = $customer->getTierBonusMultiplier();

                $loyaltyPointsEarned = (int) ceil(($orderTotal - $discount) * $pointsRate * $promoMultiplier * $tierMultiplier);
            }

            // 3. Create Order
            $maxOrderNumber = Order::where('tenant_id', $validated['tenant_id'])->max('order_number');
            $nextOrderNumber = (int) ($maxOrderNumber ?? 0) + 1;

            $order = Order::create([
                'tenant_id' => $validated['tenant_id'],
                'customer_id' => $validated['customer_id'],
                'order_number' => $nextOrderNumber,
                'status' => 'new',
                'mode' => $validated['mode'],
                'address_id' => $validated['address_id'],
                'subtotal' => $orderTotal,
                'delivery_fee' => $deliveryFee,
                'discount' => $discount,
                'total' => $total,
                'loyalty_points_earned' => $loyaltyPointsEarned,
                'loyalty_points_used' => $validated['loyalty_points_used'] ?? 0,
                'payment_status' => 'pending',
                'change_for' => $validated['payment_method'] === 'cash' ? ($validated['change_for'] ?? null) : null,
                'customer_name' => $customer->name,
                'customer_phone' => $customer->phone,
                'delivery_address' => $validated['mode'] === 'delivery' ? $this->formatAddress($validated['address_id']) : null,
            ]);

            // 4. Create Order Items
            foreach ($orderItems as $item) {
                $orderItem = $order->items()->create(\Illuminate\Support\Arr::except($item, ['complements']));

                foreach ($item['complements'] as $comp) {
                    $orderItem->complements()->create($comp);
                }

                // Decrement stock after order and item are created
                $product = Product::find($item['product_id']);
                $product->decrementStock($item['quantity'], 'Venda Online', $order->id);
            }

            // 5. Create Payment Record
            $order->payments()->create([
                'method' => $validated['payment_method'],
                'amount' => $total,
            ]);

            // 5.1 Register Coupon Usage
            if ($coupon) {
                CouponUsage::create([
                    'coupon_id' => $coupon->id,
                    'order_id' => $order->id,
                    'customer_id' => $customer->id,
                ]);
                $coupon->increment('current_uses');
            }

            // 6. Points Awarded Notification (Points are officially awarded via OrderObserver on status change to 'delivered')
            // No need to call addPoints here if they should only be awarded on delivery.
            // If the user wants them awarded on creation, we'd do it here. 
            // The OrderObserver already has logic to award them.

            // 7. Notify
            // Using OrderCreated event which should trigger WhatsApp notification if configured
            // event(new OrderCreated($order)); 
            // Note: OrderObserver already handles 'created' event if registered?
            // Usually Observables fire on 'created'. 'OrderCreated' event is for Broadcast/WebSockets.
            // Let's ensure Observer is active.

            // ✅ Regenerar session após ação sensível
            session()->regenerate();

            return response()->json([
                'message' => 'Pedido realizado com sucesso!',
                'order_id' => $order->id,
                'loyalty_points_earned' => $loyaltyPointsEarned,
                'redirect_url' => route('tenant.menu', ['slug' => $tenant->slug]) . "?order_placed={$order->id}"
            ], 201);
        });
    }

    private function formatAddress($addressId)
    {
        $address = \App\Models\CustomerAddress::find($addressId);
        if (!$address)
            return null;
        return "{$address->street}, {$address->number} - {$address->neighborhood}, {$address->city}";
    }
}
