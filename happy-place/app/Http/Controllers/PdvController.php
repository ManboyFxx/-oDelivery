<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PdvController extends Controller
{
    public function index()
    {
        $categories = Category::with('products')->get();
        // Fallback if no categories but products exist: group by null or show all
        $allProducts = Product::where('is_available', true)
            ->with([
                'complementGroups.options' => function ($q) {
                    $q->where('is_available', true)
                        ->orderBy('sort_order')
                        ->select('id', 'group_id', 'name', 'price', 'is_available', 'max_quantity', 'sort_order');
                }
            ])
            ->get();

        // Fetch customers for the combobox
        $customers = \App\Models\Customer::select('id', 'name', 'phone', 'loyalty_points')->orderBy('name')->get();

        // Fetch tables with current order details
        $tables = \App\Models\Table::with(['currentOrder.items', 'currentOrder.customer'])
            ->orderBy('number')
            ->get();

        return Inertia::render('PDV/Index', [
            'categories' => $categories,
            'allProducts' => $allProducts,
            'tables' => $tables,
            'customers' => $customers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'customer_name' => 'nullable|string',
            'customer_id' => 'nullable|exists:customers,id', // Validate customer_id
            'payment_method' => 'required|in:cash,credit_card,debit_card,pix',
            'order_mode' => 'required|in:delivery,pickup,table',
            'total' => 'required|numeric'
        ]);

        try {
            DB::beginTransaction();

            // 1. Create Order
            // Fix: Handle string order numbers (e.g., #0001)
            $maxOrder = Order::max('order_number');
            // Extract numeric part or default to 0
            $nextNum = $maxOrder ? (int) preg_replace('/\D/', '', $maxOrder) + 1 : 1;
            $orderNumber = '#' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

            // Dummy tenant ID handling for now since we are in single-tenant dev mode mostly
            // In real app, get from auth user or middleware
            $tenantId = auth()->user()->tenant_id ?? 'default_tenant';

            // Determine customer name
            $customerName = $validated['customer_name'] ?? 'Cliente Balcão';
            $customerId = $validated['customer_id'] ?? null;

            if ($customerId) {
                $customer = \App\Models\Customer::find($customerId);
                if ($customer) {
                    $customerName = $customer->name;
                }
            }

            // Fetch settings to check for default motoboy
            $settings = \App\Models\StoreSetting::where('tenant_id', $tenantId)->first();

            $motoboyId = null;
            $status = 'new'; // Default status

            // Auto-assign motoboy if delivery mode and setting exists
            if ($validated['order_mode'] === 'delivery' && $settings && $settings->default_motoboy_id) {
                $motoboyId = $settings->default_motoboy_id;
                $status = 'waiting_motoboy'; // Set status to waiting for pickup/delivery start
            }

            $order = Order::create([
                'tenant_id' => $tenantId,
                'order_number' => $orderNumber,
                'status' => $status,
                'customer_name' => $customerName,
                'customer_id' => $customerId, // Save link
                'total' => $validated['total'],
                'subtotal' => $validated['total'], // Simplified for now
                'mode' => $validated['order_mode'],
                'payment_status' => 'paid', // PDV usually assumes immediate payment or promise of payment
                'created_at' => now(),
                'motoboy_id' => $motoboyId,
            ]);

            // 2. Create Order Items
            foreach ($validated['items'] as $item) {
                $product = Product::find($item['id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'subtotal' => $product->price * $item['quantity'],
                ]);

                // Decrement stock if tracked
                if ($product->track_stock) {
                    $product->decrement('stock_quantity', $item['quantity']);
                }
            }

            // 3. Create Payment Record
            Payment::create([
                'order_id' => $order->id,
                'method' => $validated['payment_method'],
                'amount' => $validated['total'],
                'paid_at' => now(),
            ]);

            // 4. Loyalty Points Integration
            if ($customerId) {
                // Calculate points based on settings
                if ($settings && $settings->loyalty_enabled) {
                    $points = floor($validated['total'] * $settings->points_per_currency);
                    if ($points > 0) {
                        $customer = \App\Models\Customer::find($customerId);
                        $customer->addPoints($points, $order->id, "Compra PDV #{$orderNumber}");
                    }
                }
            }

            DB::commit();

            return redirect()->route('pdv.index')->with('success', 'Pedido realizado com sucesso! #' . $orderNumber);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erro ao processar pedido: ' . $e->getMessage()]);
        }
    }
}
