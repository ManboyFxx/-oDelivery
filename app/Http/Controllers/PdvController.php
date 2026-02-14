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
        $tenantId = auth()->user()->tenant_id;

        $categories = Category::where('tenant_id', $tenantId)->with('products')->get();
        // Fallback if no categories but products exist: group by null or show all
        $allProducts = Product::where('tenant_id', $tenantId)
            ->where('is_available', true)
            ->with([
                'complementGroups.options' => function ($q) {
                    $q->where('is_available', true)
                        ->orderBy('sort_order')
                        ->select('id', 'group_id', 'name', 'price', 'is_available', 'max_quantity', 'sort_order');
                }
            ])
            ->get();

        // Fetch customers for the combobox
        $customers = \App\Models\Customer::where('tenant_id', $tenantId)
            ->select('id', 'name', 'phone', 'loyalty_points')
            ->orderBy('name')
            ->get();

        // Fetch tables with current order details
        $tables = \App\Models\Table::where('tenant_id', $tenantId)
            ->with(['currentOrder.items', 'currentOrder.customer'])
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
        $tenantId = auth()->user()->tenant_id;

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => "required|exists:products,id,tenant_id,{$tenantId}",
            'items.*.quantity' => 'required|integer|min:1',
            'customer_name' => 'nullable|string',
            'customer_id' => "nullable|exists:customers,id,tenant_id,{$tenantId}",
            'payment_method' => 'required|in:cash,credit_card,debit_card,pix',
            'order_mode' => 'required|in:delivery,pickup,table',
            'total' => 'required|numeric',
            'table_id' => 'required_if:order_mode,table|nullable|exists:tables,id,tenant_id,' . $tenantId
        ]);

        try {
            DB::beginTransaction();

            // 1. Create Order
            // Fix: Handle string order numbers (e.g., #0001) - NO, DB is Integer. Store Integer.
            $maxOrder = Order::where('tenant_id', $tenantId)->max('order_number');
            $nextNum = $maxOrder ? $maxOrder + 1 : 1;
            $orderNumber = $nextNum;

            // Determine customer name
            $customerName = $validated['customer_name'] ?? 'Cliente Balcão';
            $customerId = $validated['customer_id'] ?? null;

            // For Table orders, prioritize "Mesa X" if no customer name provided
            if ($validated['order_mode'] === 'table' && !empty($validated['table_id']) && empty($validated['customer_name'])) {
                $table = \App\Models\Table::find($validated['table_id']);
                if ($table) {
                    $customerName = "Mesa " . $table->number;
                }
            }

            if ($customerId) {
                $customer = \App\Models\Customer::where('id', $customerId)
                    ->where('tenant_id', $tenantId)
                    ->first();
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

            // For Table orders, status might be 'preparing' or 'open' immediately? 'new' is fine for Kitchen
            // If Table Mode, we might want to set status to something else? Standard 'new' is fine for now.

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

            // Interact with Table
            if ($validated['order_mode'] === 'table' && !empty($validated['table_id'])) {
                $table = \App\Models\Table::where('id', $validated['table_id'])
                    ->where('tenant_id', $tenantId)
                    ->first();

                if ($table) {
                    if (!$table->isFree()) {
                        throw new \Exception("A Mesa {$table->number} já está ocupada.");
                    }
                    $table->occupy($order->id);
                }
            }

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
                $product->decrementStock($item['quantity'], 'Venda PDV', $order->id);
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
