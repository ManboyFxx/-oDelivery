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

        $product->update($validated);

        return back()->with('success', 'Estoque atualizado com sucesso!');
    }
}
