<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Verify that order belongs to the authenticated user's tenant
     */
    private function authorizeOrder(Order $order): void
    {
        if ($order->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Acesso negado. Pedido não pertence ao seu établecimento.');
        }
    }

    public function index()
    {
        // Fetch orders and group by status for the Kanban
        // We focus on active orders for the board
        $tenantId = auth()->user()->tenant_id;

        $orders = Order::query()
            ->where('tenant_id', $tenantId)
            ->with(['customer', 'items.complements', 'motoboy', 'table'])
            ->whereIn('status', ['new', 'preparing', 'ready', 'waiting_motoboy', 'motoboy_accepted', 'out_for_delivery'])
            ->orderBy('created_at', 'desc') // Newest first
            ->get()
            ->map(function ($order) {
                // Ensure computed attributes are included in JSON
                $order->append(['is_late', 'elapsed_minutes', 'preparation_elapsed_minutes', 'time_status']);

                // Explicitly resolve customer_phone (plain text field on order, or decrypted from customer)
                // This is needed because the Customer model encrypts the phone field
                if (empty($order->customer_phone) && $order->customer_id) {
                    $order->customer_phone = $order->customer?->phone;
                }

                return $order;
            });

        // Fetch Motoboys for this tenant only
        $motoboys = auth()->user()->tenant->motoboys()->get();

        // Fetch Active Products for the Edit Modal
        $products = \App\Models\Product::where('tenant_id', $tenantId)
            ->where('is_available', true)
            ->with(['complementGroups.options'])
            ->get();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'motoboys' => $motoboys,
            'products' => $products
        ]);
    }

    public function updateItems(Request $request, Order $order)
    {
        $this->authorizeOrder($order);

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'items.*.id' => 'nullable|exists:order_items,id', // Existing item ID
            'items.*.complements' => 'nullable|array', // New: Complements
            'items.*.complements.*.id' => 'required|exists:complement_options,id',
            'items.*.complements.*.quantity' => 'nullable|integer|min:1',
        ]);

        $inputItems = collect($validated['items']);
        $existingItemIds = $order->items()->pluck('id')->toArray();
        $inputItemIds = $inputItems->pluck('id')->filter()->toArray();

        // 1. Delete removed items
        $itemsToDelete = array_diff($existingItemIds, $inputItemIds);
        if (!empty($itemsToDelete)) {
            $order->items()->whereIn('id', $itemsToDelete)->delete();
        }

        // 2. Update existing or Create new
        foreach ($inputItems as $itemData) {
            $complementsPrice = 0;
            $selectedComplements = $itemData['complements'] ?? [];

            // Calculate complements price
            foreach ($selectedComplements as $comp) {
                $option = \App\Models\ComplementOption::find($comp['id']);
                if ($option) {
                    $qty = $comp['quantity'] ?? 1;
                    $complementsPrice += $option->price * $qty;
                }
            }

            if (isset($itemData['id']) && in_array($itemData['id'], $existingItemIds)) {
                // Update Existing Item
                $itemModel = $order->items()->find($itemData['id']);

                // Sync complements if provided
                if (array_key_exists('complements', $itemData)) {
                    // Sync complements
                    $itemModel->complements()->delete();
                    foreach ($selectedComplements as $comp) {
                        $option = \App\Models\ComplementOption::find($comp['id']);
                        $qty = $comp['quantity'] ?? 1;
                        $itemModel->complements()->create([
                            'complement_option_id' => $option->id,
                            'name' => $option->name,
                            'price' => $option->price,
                            'quantity' => $qty,
                        ]);
                    }
                    $itemModel->complements_price = $complementsPrice;
                }

                $itemModel->update([
                    'quantity' => $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? null,
                    'complements_price' => $itemModel->complements_price,
                    'subtotal' => ($itemModel->unit_price + $itemModel->complements_price) * $itemData['quantity']
                ]);

            } else {
                // Create New Item
                $product = \App\Models\Product::find($itemData['product_id']);

                $newItem = $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $product->price,
                    'complements_price' => $complementsPrice,
                    'subtotal' => ($product->price + $complementsPrice) * $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? null,
                ]);

                // Save Complements
                foreach ($selectedComplements as $comp) {
                    $option = \App\Models\ComplementOption::find($comp['id']);
                    $qty = $comp['quantity'] ?? 1;
                    $newItem->complements()->create([
                        'complement_option_id' => $option->id,
                        'name' => $option->name,
                        'price' => $option->price,
                        'quantity' => $qty,
                    ]);
                }
            }
        }

        // 3. Recalculate Order Total
        $newTotal = $order->items()->sum('subtotal');
        // Add delivery fee logic if exists
        $order->total = $newTotal + ($order->delivery_fee ?? 0);
        $order->save();

        return back()->with('success', 'Itens do pedido atualizados!');
    }


    public function updateStatus(Request $request, Order $order)
    {
        $this->authorizeOrder($order);

        $validated = $request->validate([
            'status' => 'required|string|in:new,preparing,ready,waiting_motoboy,motoboy_accepted,out_for_delivery,delivered,cancelled'
        ]);

        $oldStatus = $order->status;
        $order->update($validated);

        // Send WhatsApp notifications based on status change
        // handled by OrderObserver


        return back()->with('success', 'Status atualizado!');
    }

    public function assignMotoboy(Request $request, Order $order)
    {
        $this->authorizeOrder($order);

        $validated = $request->validate([
            'motoboy_id' => 'required|exists:users,id'
        ]);

        $updates = ['motoboy_id' => $validated['motoboy_id']];

        // Only move to "waiting_motoboy" if the order is still in early stages
        // Don't demote an order that has already moved past this point
        $earlyStatuses = ['new', 'preparing', 'ready'];
        if (in_array($order->status, $earlyStatuses)) {
            $updates['status'] = 'waiting_motoboy';
        }

        $order->update($updates);

        return back()->with('success', 'Entregador atribuído!');
    }

    public function updatePayment(Request $request, Order $order)
    {
        $this->authorizeOrder($order);

        $validated = $request->validate([
            'payment_method' => 'required|in:cash,credit_card,debit_card,pix',
            'payment_status' => 'nullable|in:pending,paid'
        ]);

        // Update order logic if payment method changes (e.g. update Payment record)
        // Simplified:
        $order->payments()->update(['method' => $validated['payment_method']]);
        if (isset($validated['payment_status'])) {
            $order->update(['payment_status' => $validated['payment_status']]);
        }

        return back()->with('success', 'Pagamento atualizado!');
    }

    public function updateMode(Request $request, Order $order)
    {
        $this->authorizeOrder($order);

        $validated = $request->validate([
            'mode' => 'required|in:delivery,pickup,table'
        ]);

        $order->update(['mode' => $validated['mode']]);

        return back()->with('success', 'Modo de entrega atualizado!');
    }

    public function cancel(Request $request, Order $order)
    {
        $this->authorizeOrder($order);

        $validated = $request->validate([
            'reason' => 'required|string|max:255'
        ]);

        $order->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['reason'],
            'cancelled_at' => now()
        ]);

        return back()->with('success', 'Pedido cancelado.');
    }

    public function print(Order $order)
    {
        $this->authorizeOrder($order);

        $order->load(['customer', 'items.complements', 'motoboy']);
        // Return a blade view for printing would be simpler for receipt style
        return view('orders.print', compact('order'));
    }

    public function startPreparation(Order $order)
    {
        $this->authorizeOrder($order);

        $order->startPreparation();

        return back()->with('success', 'Preparo iniciado!');
    }
}
