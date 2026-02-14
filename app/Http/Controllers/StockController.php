<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index()
    {
        $products = Product::query()
            ->with(['category'])
            ->orderBy('name')
            // You might want to filter only products that track stock, or show all with an indicator
            // ->where('track_stock', true) 
            ->paginate(12);

        $metrics = [
            'total_items' => Product::count(),
            'low_stock' => Product::where('track_stock', true)->where('stock_quantity', '<=', 5)->count(),
            'total_value' => Product::sum(\DB::raw('price * COALESCE(stock_quantity, 0)')),
        ];

        return Inertia::render('Stock/Index', [
            'products' => $products,
            'metrics' => $metrics,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'stock_quantity' => 'required|integer|min:0',
            'track_stock' => 'boolean'
        ]);

        $oldQuantity = $product->stock_quantity ?? 0;
        $product->update($validated);

        // Record adjustment if quantity actually changed
        if (isset($validated['stock_quantity']) && $validated['stock_quantity'] != $oldQuantity) {
            $diff = $validated['stock_quantity'] - $oldQuantity;
            $type = $diff > 0 ? 'purchase' : 'adjustment'; // Use adjustment for manual decrease, purchase for increase (or both adjustment)
            $product->recordStockMovement($diff, $type, 'Ajuste Manual');
        }

        return back()->with('success', 'Estoque atualizado com sucesso!');
    }

    public function alerts()
    {
        $lowStockIngredients = \App\Models\Ingredient::query()
            ->whereNotNull('min_stock')
            ->where('min_stock', '>', 0)
            ->whereRaw('COALESCE(stock, 0) <= min_stock')
            ->orderBy('name')
            ->get();

        return Inertia::render('Stock/Alerts', [
            'lowStockIngredients' => $lowStockIngredients,
        ]);
    }

    public function movements(Request $request)
    {
        $movements = \App\Models\StockMovement::query()
            ->with(['product', 'ingredient', 'user', 'order'])
            ->when($request->product_id, function ($q) use ($request) {
                $q->where('product_id', $request->product_id);
            })
            ->when($request->ingredient_id, function ($q) use ($request) {
                $q->where('ingredient_id', $request->ingredient_id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Stock/Movements', [
            'movements' => $movements,
            'filters' => $request->only(['product_id', 'ingredient_id']),
            'ingredients' => \App\Models\Ingredient::where('tenant_id', auth()->user()->tenant_id)->orderBy('name')->get(),
            'products' => \App\Models\Product::where('tenant_id', auth()->user()->tenant_id)->orderBy('name')->get(),
        ]);
    }
}
