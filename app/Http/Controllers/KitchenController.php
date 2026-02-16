<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KitchenController extends Controller
{
    public function index()
    {
        // Fetch orders that are relevant to the kitchen: 'new' and 'preparing'
        // Ordered by oldest first (FIFO)
        $orders = Order::with(['items', 'items.complements', 'table'])
            ->whereIn('status', ['new', 'preparing', 'ready'])
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Kitchen/Index', [
            'orders' => $orders
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:preparing,ready,delivered'
        ]);

        $order->update(['status' => $validated['status']]);

        return back()->with('success', 'Status do pedido atualizado!');
    }
}
