<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $tenant = auth()->user()->tenant;

        // Fetch categories with products, ordered by sort_order
        $categories = Category::with([
            'products' => function ($query) {
                $query->orderBy('sort_order', 'asc');
            }
        ])
            ->withCount('products')
            ->orderBy('sort_order', 'asc')
            ->get();

        // Calculate stats
        $totalProducts = $categories->sum('products_count');
        $activeCategories = $categories->where('is_active', true)->count();
        $featuredProducts = $categories
            ->flatMap(fn($cat) => $cat->products)
            ->where('is_featured', true)
            ->count();

        return Inertia::render('Menu/Index', [
            'categories' => $categories,
            'tenantSlug' => $tenant->slug,
            'menuViewMode' => $tenant->menu_view_mode ?? 'grid',
            'stats' => [
                'totalCategories' => $categories->count(),
                'totalProducts' => $totalProducts,
                'activeCategories' => $activeCategories,
                'featuredProducts' => $featuredProducts,
            ]
        ]);
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:categories,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['items'] as $item) {
            Category::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        // Manual invalidation because update() doesn't trigger observers
        \Illuminate\Support\Facades\Cache::forget("tenant_menu_" . auth()->user()->tenant_id);

        return back();
    }

    public function toggleVisibility(Request $request, Category $category)
    {
        $category->is_active = !$category->is_active;
        $category->save(); // This SHOULD trigger the observer, but adding manual for certainty

        \Illuminate\Support\Facades\Cache::forget("tenant_menu_{$category->tenant_id}");

        return back();
    }
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'menu_view_mode' => 'required|in:grid,list',
        ]);

        $tenant = auth()->user()->tenant;
        $tenant->update(['menu_view_mode' => $validated['menu_view_mode']]);

        // Invalidate cache
        \Illuminate\Support\Facades\Cache::forget("tenant_menu_{$tenant->id}");

        return back()->with('success', 'Configuração de visualização atualizada!');
    }
}
