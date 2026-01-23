<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        // Admin view to organize menu
        // Fetch categories with product counts
        $categories = Category::withCount('products')
            ->orderBy('sort_order', 'asc') // Assuming we add sort_order later or use name
            ->get();

        return Inertia::render('Menu/Index', [
            'categories' => $categories
        ]);
    }

    public function reorder(Request $request)
    {
        // Logic to reorder categories would go here
        // For now just a placeholder for the logic
        return back()->with('success', 'Ordem atualizada!');
    }

    public function toggleVisibility(Request $request, Category $category)
    {
        $category->is_visible = !$category->is_visible;
        $category->save();
        return back();
    }
}
