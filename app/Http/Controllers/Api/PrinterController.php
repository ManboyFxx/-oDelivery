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
        // Tenant is injected by AuthPrinterToken middleware
        $tenantId = $request->tenant->id;

        $orders = Order::where('tenant_id', $tenantId)
            ->whereIn('status', ['confirmed', 'preparing', 'ready']) // Statuses relevant for kitchen/printing
            ->whereNull('printed_at')
            ->where('created_at', '>=', now()->subHours(24))
            ->with(['items.product', 'items.complements', 'customer', 'address', 'payments'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Format for printer
        $formatted = $orders->map(function ($order) use ($request) {
            $order->payment_summary = $order->payments->map(function ($p) {
                return "{$p->method}: " . number_format($p->amount, 2, ',', '.');
            })->implode(' + ');

            if ($order->change_for) {
                $change = $order->change_for - $order->total;
                if ($change > 0) {
                    $order->payment_summary .= " (Troco para " . number_format($order->change_for, 2, ',', '.') . ")";
                }
            }

            // Append tenant data for receipt header
            $order->tenant_data = [
                'name' => $request->tenant->name,
                'logo_url' => $request->tenant->logo_url,
                'phone' => $request->tenant->phone,
                'address' => $request->tenant->address,
            ];

            return $order;
        });

        return response()->json($formatted);
    }

    /**
     * Mark an order as printed.
     */
    public function markAsPrinted(Request $request, $id)
    {
        $tenantId = $request->tenant->id;

        $order = Order::where('tenant_id', $tenantId)
            ->where('id', $id)
            ->firstOrFail();

        $order->update([
            'printed' => true,
            'printed_at' => now(),
            // 'status' => $order->status === 'new' ? 'confirmed' : $order->status // Optional auto-confirm
        ]);

        return response()->json(['success' => true, 'order_number' => $order->order_number]);
    }
}
