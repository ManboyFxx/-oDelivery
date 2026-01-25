<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('sort_order')->get();
        return Inertia::render('Categories/Index', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        $tenantId = auth()->user()->tenant_id;

        if (!$tenantId) {
            return redirect()->back()->withErrors(['tenant_id' => 'Erro: Usuário sem estabelecimento vinculado.']);
        }

        Category::create([
            'tenant_id' => $tenantId,
            ...$validated
        ]);

        return redirect()->back()->with('success', 'Categoria criada com sucesso!');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        $category->update($validated);
        return redirect()->back()->with('success', 'Categoria atualizada!');
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->back()->with('success', 'Categoria removida!');
    }
}
