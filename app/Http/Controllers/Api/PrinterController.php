<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class PrinterController extends Controller
{
    /**
     * List orders that need to be printed.
     * Status: 'confirmed' or 'preparing'
     * Check: created_at within last 24h to avoid old orders
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $orders = Order::where('tenant_id', $tenantId)
            ->whereIn('status', ['confirmed', 'preparing', 'ready']) // Statuses relevant for kitchen/printing
            ->whereNull('printed_at') // Custom field or check if we want to reprint
            ->where('created_at', '>=', now()->subHours(24))
            ->with(['items.product', 'items.complements', 'customer', 'address', 'payments'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Format for printer
        $formatted = $orders->map(function ($order) {
            $order->payment_summary = $order->payments->map(function ($p) {
                return "{$p->method}: " . number_format($p->amount, 2, ',', '.');
            })->implode(' + ');

            if ($order->change_for) {
                $change = $order->change_for - $order->total;
                if ($change > 0) {
                    $order->payment_summary .= " (Troco para " . number_format($order->change_for, 2, ',', '.') . ")";
                }
            }

            return $order;
        });

        return response()->json($formatted);
    }

    /**
     * Mark an order as printed.
     */
    public function markAsPrinted(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $order = Order::where('tenant_id', $tenantId)
            ->where('id', $id)
            ->firstOrFail();

        // If we don't have a 'printed_at' column yet, functionality might be limited
        // For now, let's assume we might adhere to a simple "acknowledge" mechanism
        // Or we can add a 'printed_at' column to the orders table via migration later.
        // For this MVP, we will try to update it if the column exists, or just return success.

        $order->forceFill(['printed_at' => now()])->save();

        return response()->json(['success' => true]);
    }
}
