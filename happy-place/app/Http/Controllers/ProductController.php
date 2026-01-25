<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $tenant = auth()->user()->tenant;

        $products = Product::query()
            ->with(['category', 'complementGroups'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => Category::where('tenant_id', $tenant->id)->orderBy('name')->get(),
            'complement_groups' => \App\Models\ComplementGroup::where('tenant_id', $tenant->id)->with(['options.ingredient'])->orderBy('name')->get(),
            'ingredients' => \App\Models\Ingredient::where('tenant_id', $tenant->id)->orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        $tenant = auth()->user()->tenant;

        return Inertia::render('Products/Create', [
            'categories' => Category::where('tenant_id', $tenant->id)->orderBy('name')->get(),
            'complement_groups' => \App\Models\ComplementGroup::where('tenant_id', $tenant->id)->with('options')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'complement_groups' => 'nullable|array',
            'complement_groups.*' => 'string|exists:complement_groups,id',
            'is_available' => 'boolean',
            'track_stock' => 'boolean',
            'stock_quantity' => 'nullable|integer',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        $validated['tenant_id'] = auth()->user()->tenant_id;

        // Ensure boolean casting
        $validated['is_available'] = $request->boolean('is_available');
        $validated['track_stock'] = $request->boolean('track_stock');

        $product = Product::create($validated);

        if (isset($validated['complement_groups'])) {
            $product->complementGroups()->sync($validated['complement_groups']);
        }


        flash_success('Produto Criado!', 'O produto foi adicionado ao cardápio com sucesso.');
        return redirect()->route('products.index');
    }

    public function edit(Product $product)
    {
        $tenant = auth()->user()->tenant;

        return Inertia::render('Products/Edit', [
            'product' => $product->load(['category', 'complementGroups']),
            'categories' => Category::where('tenant_id', $tenant->id)->orderBy('name')->get(),
            'complement_groups' => \App\Models\ComplementGroup::where('tenant_id', $tenant->id)->with('options')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'complement_groups' => 'nullable|array',
            'complement_groups.*' => 'string|exists:complement_groups,id',
            'is_available' => 'boolean',
            'track_stock' => 'boolean',
            'stock_quantity' => 'nullable|integer',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        // Ensure boolean casting
        $validated['is_available'] = $request->boolean('is_available');
        $validated['track_stock'] = $request->boolean('track_stock');

        // Handle explicit null for stock if not tracking? No, keeping it is fine.

        $product->update($validated);

        if (isset($validated['complement_groups'])) {
            $product->complementGroups()->sync($validated['complement_groups']);
        }

        return redirect()->route('products.index')->with('success', 'Produto atualizado com sucesso!');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('products.index')->with('success', 'Produto excluído com sucesso!');
    }

    public function toggle(Product $product)
    {
        $product->update([
            'is_available' => !$product->is_available
        ]);

        return back()->with('success', 'Disponibilidade do produto atualizada!');
    }

    public function toggleFeatured(Product $product)
    {
        $product->update([
            'is_featured' => !$product->is_featured
        ]);

        return back()->with('success', 'Destaque do produto atualizado!');
    }
}
