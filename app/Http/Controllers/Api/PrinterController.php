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
            ->whereIn('status', ['new', 'confirmed', 'preparing', 'ready', 'out_for_delivery']) // Added 'new' and 'out_for_delivery'
            ->where(function ($query) {
                $query->where('mode', '!=', 'table')
                    ->orWhere('status', 'confirmed');
            })
            ->whereNull('printed_at')
            ->where('created_at', '>=', now()->subHours(24))
            ->with(['items.complements', 'items.product', 'customer', 'address', 'payments', 'table'])
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
            try {
                $order->tenant_data = [
                    'name' => $request->tenant->name ?? 'OoDelivery',
                    'logo_url' => $request->tenant->logo_url ?? null,
                    'phone' => $request->tenant->phone ?? null,
                    'address' => $request->tenant->address ?? null,
                ];
            } catch (\Exception $e) {
                \Log::error('Error appending tenant data: ' . $e->getMessage());
                $order->tenant_data = ['name' => 'OoDelivery'];
            }

            return $order;
        });

        return response()->json($formatted);
    }

    /**
     * Get tenant profile for the printer app.
     */
    public function profile(Request $request)
    {
        try {
            $tenant = $request->tenant;

            // Direct query to avoid relationship issues
            $settings = \App\Models\StoreSetting::where('tenant_id', $tenant->id)->first();

            return response()->json([
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'plan' => $tenant->plan,
                ],
                'settings' => $settings ? [
                    'printer_paper_width' => $settings->printer_paper_width,
                    'auto_print_on_confirm' => $settings->auto_print_on_confirm,
                    'print_copies' => $settings->print_copies,
                ] : null,
            ]);
        } catch (\Exception $e) {
            \Log::error('Printer API Profile Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erro ao buscar perfil',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark an order as printed.
     *
     * FASE 1 – BLINDAGEM: Lock de reimpressão.
     * Se o pedido já foi impresso (printed_at preenchido), retorna 409 Conflict
     * em vez de reimprimir. Protege contra cliques duplos ou retries do ÓoPrint.
     */
    public function markAsPrinted(Request $request, $id)
    {
        $tenantId = $request->tenant->id;

        $order = Order::where('tenant_id', $tenantId)
            ->where('id', $id)
            ->firstOrFail();

        // ── LOCK DE REIMPRESSÃO ──────────────────────────────────────────────
        if ($order->printed && $order->printed_at) {
            \Log::warning('PrinterController: duplicate print attempt blocked', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'printed_at' => $order->printed_at,
                'tenant_id' => $tenantId,
            ]);
            return response()->json([
                'success' => true, // Retorna success=true para não travar o app ÓoPrint
                'skipped' => true, // Flag para o ÓoPrint saber que foi ignorado
                'order_number' => $order->order_number,
                'message' => 'Pedido já foi impresso anteriormente.',
            ], 200);
        }
        // ────────────────────────────────────────────────────────────────────

        $order->update([
            'printed' => true,
            'printed_at' => now(),
            // Auto-confirma se ainda estava como new/confirmed
            'status' => in_array($order->status, ['new', 'confirmed']) ? 'preparing' : $order->status,
        ]);

        return response()->json(['success' => true, 'order_number' => $order->order_number]);
    }


    /**
     * Update order status from printer terminal.
     */
    public function updateStatus(Request $request, $id)
    {
        $tenantId = $request->tenant->id;

        $order = Order::where('tenant_id', $tenantId)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:preparing,ready,out_for_delivery,delivered'
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json(['success' => true, 'status' => $order->status]);
    }
}
