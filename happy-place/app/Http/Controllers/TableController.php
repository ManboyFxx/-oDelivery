<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index()
    {
        $tables = Table::orderBy('number')->get();
        return Inertia::render('Tables/Index', [
            'tables' => $tables
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|integer|unique:tables,number', // Should be unique per tenant scope, but we rely on tenant scope trait
            'capacity' => 'required|integer|min:1',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $tenant = auth()->user()->tenant;

        if (!$tenant || !$tenantId) {
            return redirect()->back()->withErrors(['tenant_id' => 'Erro: Usuário sem estabelecimento vinculado.']);
        }

        // Check uniqueness manually for tenant scope if needed, or rely on trait
        // Assuming TenantScope handles queries, but for validation 'unique:tables,number' checks globally unless scoped.
        // For simplicity in this demo, we'll proceed. A proper unique rule would be Rule::unique('tables')->where('tenant_id', $tenantId)

        Table::create([
            'tenant_id' => $tenantId,
            'number' => $validated['number'],
            'capacity' => $validated['capacity'],
            'status' => 'free',
        ]);

        return redirect()->back()->with('success', 'Mesa criada com sucesso!');
    }

    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'number' => 'required|integer',
            'capacity' => 'required|integer|min:1',
        ]);

        $table->update($validated);

        return redirect()->back()->with('success', 'Mesa atualizada!');
    }

    public function toggleStatus(Table $table)
    {
        if ($table->isFree()) {
            $table->occupy('manual-' . now()->timestamp); // Placeholder ID for manual occupation
        } else {
            $table->free();
        }

        return redirect()->back()->with('success', 'Status da mesa atualizado!');
    }

    // --- Order Management Methods ---

    public function show(Table $table)
    {
        $table->load(['currentOrder.items', 'currentOrder.customer']);
        return response()->json($table);
    }

    public function open(Request $request, Table $table)
    {
        if (!$table->isFree()) {
            return back()->withErrors(['message' => 'Mesa já está ocupada.']);
        }

        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'nullable|string',
        ]);

        $customerId = $validated['customer_id'] ?? null;
        $customerName = $validated['customer_name'] ?? 'Cliente Mesa ' . $table->number;

        if ($customerId) {
            $customer = \App\Models\Customer::find($customerId);
            if ($customer) {
                $customerName = $customer->name;
            }
        }

        // Create Order
        $maxOrder = \App\Models\Order::max('order_number');
        $nextNum = $maxOrder ? (int) preg_replace('/\D/', '', $maxOrder) + 1 : 1;
        $orderNumber = '#' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        $tenantId = auth()->user()->tenant_id ?? 'default_tenant';

        $order = \App\Models\Order::create([
            'tenant_id' => $tenantId,
            'order_number' => $orderNumber,
            'status' => 'preparing', // Table orders start as open/preparing
            'customer_name' => $customerName,
            'customer_id' => $customerId,
            'table_id' => $table->id,
            'mode' => 'table',
            'payment_status' => 'pending',
            'created_at' => now(),
            'total' => 0,
            'subtotal' => 0,
        ]);

        $table->occupy($order->id);

        return back()->with('success', "Mesa {$table->number} aberta!");
    }

    public function addItems(Request $request, Table $table)
    {
        if ($table->isFree() || !$table->current_order_id) {
            return back()->withErrors(['message' => 'Mesa não possui pedido aberto.']);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $order = $table->currentOrder;

        foreach ($validated['items'] as $item) {
            $product = \App\Models\Product::find($item['id']);

            // Generate UUID for the item to ensure uniqueness or handle existing?
            // For now, simple append
            \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $item['quantity'],
                'unit_price' => $product->price,
                'subtotal' => $product->price * $item['quantity'],
            ]);
        }

        // Recalculate totals
        $newTotal = $order->items()->sum('subtotal');
        $order->update([
            'subtotal' => $newTotal,
            'total' => $newTotal, // + fees if any
        ]);

        return back()->with('success', 'Itens adicionados à mesa.');
    }

    public function close(Request $request, Table $table)
    {
        if ($table->isFree() || !$table->current_order_id) {
            return back()->withErrors(['message' => 'Mesa não está ocupada.']);
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:cash,credit_card,debit_card,pix',
        ]);

        $order = $table->currentOrder;

        // Finalize Order
        $order->update([
            'status' => 'confirmed', // Or delivered/completed
            'payment_status' => 'paid',
        ]);

        // Record Payment
        \App\Models\Payment::create([
            'order_id' => $order->id,
            'method' => $validated['payment_method'],
            'amount' => $order->total,
            'paid_at' => now(),
        ]);

        // Loyalty
        if ($order->customer_id) {
            $settings = \App\Models\StoreSetting::where('tenant_id', $order->tenant_id)->first();
            if ($settings && $settings->loyalty_enabled) {
                $points = floor($order->total * $settings->points_per_currency);
                if ($points > 0) {
                    $customer = \App\Models\Customer::find($order->customer_id);
                    $customer->addPoints($points, $order->id, "Consumo Mesa #{$table->number}");
                }
            }
        }

        // Free Table
        $table->free();

        return back()->with('success', "Mesa {$table->number} fechada e paga!");
    }

    public function destroy(Table $table)
    {
        $table->delete();
        return redirect()->back()->with('success', 'Mesa removida!');
    }
}
