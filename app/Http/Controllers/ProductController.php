<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ProductController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('plan.limit:products', only: ['store']),
        ];
    }

    public function index()
    {
        $tenant = auth()->user()->tenant;

        $products = Product::with(['category', 'complementGroups'])
            ->where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        $categories = Category::where('tenant_id', $tenant->id)
            ->orderBy('name')
            ->get();

        $complementGroups = \App\Models\ComplementGroup::where('tenant_id', $tenant->id)
            ->with(['options.ingredient']) // Keep the original eager loading for complement groups
            ->orderBy('name')
            ->get();

        // Get plan limits
        $productsCount = $tenant->products()->count();
        $productsLimit = $tenant->getLimit('max_products');
        $canAddProduct = $tenant->canAdd('products');

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'complement_groups' => $complementGroups,
            'ingredients' => \App\Models\Ingredient::where('tenant_id', $tenant->id)->orderBy('name')->get(), // Keep ingredients as it was not explicitly removed
            'usage' => [
                'products' => $productsCount,
                'limit' => $productsLimit,
                'canAdd' => $canAddProduct,
            ],
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
        \Illuminate\Support\Facades\Log::info('Product Create Request:', $request->all());

        try {
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
                'loyalty_redeemable' => 'boolean',
                'loyalty_points_cost' => 'nullable|integer|min:0',
                'loyalty_points_multiplier' => 'nullable|numeric|min:1',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error('Product Create Validation Error:', $e->errors());
            throw $e;
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $tenant = auth()->user()->tenant;

        // Check Plan Limits
        if (!$tenant->canAdd('products')) {
            return back()->withErrors(['error' => 'Você atingiu o limite de produtos do seu plano. Faça upgrade para adicionar mais.']);
        }

        // Ensure boolean casting
        $validated['is_available'] = $request->boolean('is_available');
        $validated['track_stock'] = $request->boolean('track_stock');
        $validated['loyalty_redeemable'] = $request->boolean('loyalty_redeemable');

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
            'product' => $product->load(['category', 'complementGroups', 'ingredients']),
            'categories' => Category::where('tenant_id', $tenant->id)->orderBy('name')->get(),
            'complement_groups' => \App\Models\ComplementGroup::where('tenant_id', $tenant->id)->with('options')->orderBy('name')->get(),
            'ingredients' => \App\Models\Ingredient::where('tenant_id', $tenant->id)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        \Illuminate\Support\Facades\Log::info('Product Update Request:', $request->all());

        try {
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
                'loyalty_redeemable' => 'boolean',
                'loyalty_points_cost' => 'nullable|integer|min:0',
                'loyalty_points_multiplier' => 'nullable|numeric|min:1',
                'ingredients' => 'nullable|array',
                'ingredients.*.id' => 'required|exists:ingredients,id',
                'ingredients.*.quantity' => 'required|numeric|min:0',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error('Product Update Validation Error:', $e->errors());
            throw $e;
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        // Ensure boolean casting
        $validated['is_available'] = $request->boolean('is_available');
        $validated['track_stock'] = $request->boolean('track_stock');
        $validated['loyalty_redeemable'] = $request->boolean('loyalty_redeemable');

        // Handle explicit null for stock if not tracking? No, keeping it is fine.

        $product->update($validated);

        if (isset($validated['complement_groups'])) {
            $product->complementGroups()->sync($validated['complement_groups']);
        }

        if (isset($validated['ingredients'])) {
            $recipeData = [];
            foreach ($validated['ingredients'] as $item) {
                $recipeData[$item['id']] = [
                    'tenant_id' => auth()->user()->tenant_id,
                    'quantity' => $item['quantity']
                ];
            }
            $product->ingredients()->sync($recipeData);
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

        \Illuminate\Support\Facades\Cache::forget("tenant_menu_{$product->tenant_id}");

        return back()->with('success', 'Disponibilidade do produto atualizada!');
    }

    public function toggleFeatured(Product $product)
    {
        $product->update([
            'is_featured' => !$product->is_featured
        ]);

        \Illuminate\Support\Facades\Cache::forget("tenant_menu_{$product->tenant_id}");

        return back()->with('success', 'Destaque do produto atualizado!');
    }

    public function toggleBadge(Request $request, Product $product)
    {
        $badge = $request->validate([
            'badge' => 'required|in:promotional,new,exclusive'
        ])['badge'];

        $fieldMap = [
            'promotional' => 'is_promotional',
            'new' => 'is_new',
            'exclusive' => 'is_exclusive'
        ];

        $field = $fieldMap[$badge];

        $product->update([
            $field => !$product->$field
        ]);

        \Illuminate\Support\Facades\Cache::forget("tenant_menu_{$product->tenant_id}");

        return back()->with('success', 'Badge do produto atualizado!');
    }

    public function quickUpdate(Request $request, Product $product)
    {
        $validated = $request->validate([
            'price' => 'sometimes|numeric|min:0',
            'name' => 'sometimes|string|max:255',
        ]);

        $product->update($validated);

        return back()->with('success', 'Produto atualizado!');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->products as $item) {
            Product::where('id', $item['id'])
                ->where('tenant_id', auth()->user()->tenant_id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        \Illuminate\Support\Facades\Cache::forget("tenant_menu_" . auth()->user()->tenant_id);

        return back();
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $query = Product::whereIn('id', $request->ids)
            ->where('tenant_id', auth()->user()->tenant_id);

        switch ($request->action) {
            case 'activate':
                $query->update(['is_available' => true]);
                break;
            case 'deactivate':
                $query->update(['is_available' => false]);
                break;
            case 'delete':
                $query->delete();
                break;
        }

        \Illuminate\Support\Facades\Cache::forget("tenant_menu_" . auth()->user()->tenant_id);

        return back()->with('success', 'Ação em massa realizada com sucesso!');
    }

    public function bulkChangeCategory(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id',
            'category_id' => 'required|exists:categories,id',
        ]);

        // Verify category belongs to tenant
        $category = Category::where('id', $request->category_id)
            ->where('tenant_id', auth()->user()->tenant_id)
            ->firstOrFail();

        Product::whereIn('id', $request->ids)
            ->where('tenant_id', auth()->user()->tenant_id)
            ->update(['category_id' => $category->id]);

        \Illuminate\Support\Facades\Cache::forget("tenant_menu_" . auth()->user()->tenant_id);

        return back()->with('success', 'Categoria atualizada com sucesso!');
    }

    public function duplicate(Product $product)
    {
        if ($product->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        // Check limits
        $tenant = auth()->user()->tenant;
        if (!$tenant->canAdd('products')) {
            return back()->withErrors(['error' => 'Limite de produtos atingido.']);
        }

        $newProduct = $product->replicate();
        $newProduct->name = $product->name . ' (Cópia)';
        $newProduct->is_available = false; // Start as unavailable
        $newProduct->save();

        // Copy relations if needed (e.g. complements)
        if ($product->complementGroups()->exists()) {
            $newProduct->complementGroups()->sync($product->complementGroups->pluck('id'));
        }

        return back()->with('success', 'Produto duplicado com sucesso!');
    }
}
