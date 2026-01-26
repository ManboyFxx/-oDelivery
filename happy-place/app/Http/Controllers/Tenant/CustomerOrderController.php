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
use App\Events\OrderCreated;

class CustomerOrderController extends Controller
{
    /**
     * Get paginated customer orders (excluding soft-deleted)
     */
    public function index(Request $request)
    {
        $customer = Customer::findOrFail($request->get('customer_id'));

        // Validate customer belongs to this tenant
        if ($customer->tenant_id !== $request->get('tenant_id')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $page = $request->get('page', 1);
        $perPage = 10;

        $orders = Order::where('customer_id', $customer->id)
            ->where('tenant_id', $request->get('tenant_id'))
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
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'customer_id' => 'required|exists:customers,id',
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
        ]);

        $tenant = \App\Models\Tenant::find($validated['tenant_id']);
        $settings = \App\Models\StoreSetting::where('tenant_id', $tenant->id)->first();

        // Transaction to ensure data integrity
        return DB::transaction(function () use ($validated, $tenant, $settings) {
            $customer = \App\Models\Customer::find($validated['customer_id']);
            $orderTotal = 0;
            $orderItems = [];

            // 1. Process Items and Calculate Subtotal
            foreach ($validated['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);

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

                // Decrement stock
                if ($product->track_stock) {
                    $product->decrement('stock_quantity', $itemData['quantity']);
                }
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
                $coupon = Coupon::find($validated['coupon_id']);
                if ($coupon && $coupon->isValid()) {
                    $discount = $coupon->calculateDiscount($total);
                }
            }

            $total = max(0, $total - $discount);

            // Calculate Loyalty Points (FASE 1 Implementation with FASE 4 tier bonus)
            $loyaltyPointsEarned = 0;
            $activePromotion = null;

            if ($settings && $settings->loyalty_enabled && $orderTotal > 0) {
                $pointsRate = $settings->points_per_currency ?? 1.0;

                // Check for active promotion
                $activePromotion = LoyaltyPromotion::where('tenant_id', $validated['tenant_id'])
                    ->where('is_active', true)
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
                    ->first();

                $promotionMultiplier = $activePromotion ? $activePromotion->multiplier : 1.0;

                // Apply tier bonus multiplier (FASE 4)
                $tierMultiplier = $customer->getTierBonusMultiplier();

                $loyaltyPointsEarned = (int) ceil($orderTotal * $pointsRate * $promotionMultiplier * $tierMultiplier);
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
            }

            // 5. Create Payment Record
            $order->payments()->create([
                'tenant_id' => $validated['tenant_id'],
                'method' => $validated['payment_method'],
                'amount' => $total,
                'status' => 'pending'
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

            // 6. Award Loyalty Points (FASE 1 Implementation with FASE 4 tier updates)
            if ($loyaltyPointsEarned > 0) {
                $pointsDescription = $activePromotion
                    ? "Pedido #{$order->order_number} (Promoção {$activePromotion->name})"
                    : "Pedido #{$order->order_number}";

                $customer->addPoints($loyaltyPointsEarned, $order->id, $pointsDescription);

                // Update loyalty tier based on new points (FASE 4)
                $customer->updateLoyaltyTier();
            }

            // 7. Notify
            // Using OrderCreated event which should trigger WhatsApp notification if configured
            // event(new OrderCreated($order)); 
            // Note: OrderObserver already handles 'created' event if registered?
            // Usually Observables fire on 'created'. 'OrderCreated' event is for Broadcast/WebSockets.
            // Let's ensure Observer is active.

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
