<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        // Fetch orders and group by status for the Kanban
        // We focus on active orders for the board
        $orders = Order::query()
            ->with(['customer', 'items.product', 'motoboy'])
            ->whereIn('status', ['new', 'preparing', 'ready', 'waiting_motoboy', 'motoboy_accepted', 'out_for_delivery'])
            ->orderBy('created_at', 'asc') // Oldest first for kitchen
            ->get();

        // Fetch Motoboys (Assuming generic user model doesn't have roles yet, catching all or hardcoded for now)
        // Ideally: User::where('role', 'motoboy')->get();
        // For this environment, let's assume all users are potentially assignable or create a dummy list if role missing
        // Checking User model next. For now, returning all users as potential assignees.
        $motoboys = \App\Models\User::all(); // Simple for now

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'motoboys' => $motoboys
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:new,preparing,ready,waiting_motoboy,motoboy_accepted,out_for_delivery,delivered,cancelled'
        ]);

        $order->update($validated);

        // Log status change if needed

        return back()->with('success', 'Status atualizado!');
    }

    public function assignMotoboy(Request $request, Order $order)
    {
        $validated = $request->validate([
            'motoboy_id' => 'required|exists:users,id'
        ]);

        $order->update([
            'motoboy_id' => $validated['motoboy_id'],
            'status' => 'waiting_motoboy' // Automatically move to waiting list
        ]);

        return back()->with('success', 'Entregador atribuído!');
    }

    public function updatePayment(Request $request, Order $order)
    {
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
        $validated = $request->validate([
            'mode' => 'required|in:delivery,pickup,table'
        ]);

        $order->update(['mode' => $validated['mode']]);

        return back()->with('success', 'Modo de entrega atualizado!');
    }

    public function cancel(Request $request, Order $order)
    {
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
        $order->load(['customer', 'items.product', 'motoboy']);
        // Return a blade view for printing would be simpler for receipt style
        return view('orders.print', compact('order'));
    }
}
