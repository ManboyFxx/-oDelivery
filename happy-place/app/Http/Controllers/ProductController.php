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
        $products = Product::query()
            ->with(['category', 'complementGroups'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => Category::orderBy('name')->get(),
            'complement_groups' => \App\Models\ComplementGroup::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Products/Create', [
            'categories' => Category::all(),
            'complement_groups' => \App\Models\ComplementGroup::with('options')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048', // 2MB Max
            'complement_groups' => 'nullable|array',
            'complement_groups.*' => 'exists:complement_groups,id',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        // Fix for local dev/demo
        $tenantId = auth()->user()->tenant_id;
        if (!$tenantId) {
            $tenant = \App\Models\Tenant::first();
            $tenantId = $tenant ? $tenant->id : null;
        }
        $validated['tenant_id'] = $tenantId;

        $product = Product::create($validated);

        if (isset($validated['complement_groups'])) {
            $product->complementGroups()->sync($validated['complement_groups']);
        }

        return redirect()->route('products.index')->with('success', 'Produto criado com sucesso!');
    }

    public function edit(Product $product)
    {
        return Inertia::render('Products/Edit', [
            'product' => $product->load(['category', 'complementGroups']),
            'categories' => Category::all(),
            'complement_groups' => \App\Models\ComplementGroup::all(),
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
            'complement_groups.*' => 'exists:complement_groups,id',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

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
}
