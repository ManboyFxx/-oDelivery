<?php

namespace App\Http\Controllers;

use App\Models\Table;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index()
    {
        $tenant = auth()->user()->tenant;

        $tables = Table::where('tenant_id', $tenant->id)
            ->with(['currentOrder.items.complements'])
            ->orderBy('number')
            ->get();

        return Inertia::render('Tables/Index', [
            'tables' => $tables,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|integer',
            'capacity' => 'required|integer|min:1',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant->id;
        $validated['status'] = 'free';

        Table::create($validated);

        return back()->with('success', 'Mesa cadastrada com sucesso!');
    }

    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'number' => 'required|integer',
            'capacity' => 'required|integer|min:1',
        ]);

        $table->update($validated);

        return back()->with('success', 'Mesa atualizada!');
    }

    public function destroy(Table $table)
    {
        $table->delete();
        return back()->with('success', 'Mesa excluída!');
    }

    public function toggle(Table $table)
    {
        // Simple manual toggle if needed, though automation is better
        if ($table->isFree()) {
            $table->update([
                'status' => 'occupied',
                'occupied_at' => now(),
            ]);
        } else {
            $table->free();
        }

        return back();
    }

    public function updatePositions(Request $request)
    {
        $positions = $request->input('positions');

        foreach ($positions as $pos) {
            Table::where('id', $pos['id'])
                ->where('tenant_id', auth()->user()->tenant->id)
                ->update([
                    'position_x' => $pos['x'],
                    'position_y' => $pos['y'],
                    // Update width/height/rotation if provided
                    'width' => $pos['width'] ?? 80,
                    'height' => $pos['height'] ?? 80,
                    'shape' => $pos['shape'] ?? 'square',
                    'rotation' => $pos['rotation'] ?? 0,
                ]);
        }

        return back()->with('success', 'Layout salvo com sucesso!');
    }



    public function transfer(Request $request, Table $table)
    {
        $request->validate([
            'target_table_id' => 'required|uuid|exists:tables,id',
        ]);

        $targetTable = Table::where('id', $request->target_table_id)
            ->where('tenant_id', auth()->user()->tenant_id)
            ->firstOrFail();

        if ($table->status === 'free') {
            return back()->with('error', 'A mesa de origem está livre.');
        }

        if ($targetTable->status !== 'free') {
            return back()->with('error', 'A mesa de destino já está ocupada.');
        }

        // Move Order
        $order = $table->currentOrder;
        if (!$order) {
            // Consistency fix
            $table->update(['status' => 'free', 'current_order_id' => null, 'occupied_at' => null]);
            return back()->with('error', 'Pedido não encontrado na mesa de origem.');
        }

        // DB Transaction for safety
        \DB::transaction(function () use ($table, $targetTable, $order) {

            // 1. Occupy Target
            $targetTable->update([
                'status' => 'occupied',
                'current_order_id' => $order->id,
                'occupied_at' => $table->occupied_at, // Preserve original occupation time
            ]);

            // 2. Update Order Reference
            $order->update(['table_id' => $targetTable->id]);

            // 3. Free Source
            $table->update([
                'status' => 'free',
                'current_order_id' => null,
                'occupied_at' => null,
            ]);
        });

        return back()->with('success', "Pedido transferido da Mesa {$table->number} para a Mesa {$targetTable->number}.");
    }

    public function closeAccount(Table $table)
    {
        if ($table->isFree())
            return back();

        // Check if there is a current order to process
        if ($table->currentOrder) {
            // Logic to close/finish order could go here or be handled by a dedicated checkout flow.
            // For now, we just free the table as requested by the UI "Close Account" button which implies payment done or simple reset.
            // In a real flow, this might redirect to a payment page.
        }

        $table->free();

        return back()->with('success', 'Conta fechada e mesa liberada!');
    }



    // --- Order Management Methods (Optional/Future) ---
    // Kept from previous version if they were needed, but cleaned up to match current class structure.

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
            $customer = Customer::find($customerId);
            if ($customer) {
                $customerName = $customer->name;
            }
        }

        // Create Order
        $maxOrder = Order::max('order_number');
        $nextNum = $maxOrder ? (int) preg_replace('/\D/', '', $maxOrder) + 1 : 1;
        $orderNumber = '#' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        $tenantId = auth()->user()->tenant_id ?? 'default_tenant';

        $order = Order::create([
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
            $product = Product::find($item['id']);

            // Generate UUID for the item to ensure uniqueness or handle existing?
            // For now, simple append
            OrderItem::create([
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
        Payment::create([
            'order_id' => $order->id,
            'method' => $validated['payment_method'],
            'amount' => $order->total,
            'paid_at' => now(),
        ]);

        // Loyalty
        if ($order->customer_id) {
            $settings = StoreSetting::where('tenant_id', $order->tenant_id)->first();
            if ($settings && $settings->loyalty_enabled) {
                $points = floor($order->total * $settings->points_per_currency);
                if ($points > 0) {
                    $customer = Customer::find($order->customer_id);
                    $customer->addPoints($points, $order->id, "Consumo Mesa #{$table->number}");
                }
            }
        }

        // Free Table
        $table->free();

        return back()->with('success', "Mesa {$table->number} fechada e paga!");
    }
}
