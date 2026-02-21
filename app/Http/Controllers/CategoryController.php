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
            'image_url' => 'nullable|string|max:2048',
        ]);

        $tenantId = auth()->user()->tenant_id;

        if (!$tenantId) {
            return redirect()->back()->withErrors(['tenant_id' => 'Erro: Usuário sem estabelecimento vinculado.']);
        }

        $tenant = auth()->user()->tenant;

        // Check Plan Limits
        if (!$tenant->canAdd('categories')) {
            return redirect()->back()->withErrors(['error' => 'Você atingiu o limite de categorias do seu plano. Faça upgrade para adicionar mais.']);
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
            'image_url' => 'nullable|string|max:2048',
        ]);

        $category->update($validated);
        return redirect()->back()->with('success', 'Categoria atualizada!');
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->back()->with('success', 'Categoria removida!');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->categories as $item) {
            Category::where('id', $item['id'])
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
            'ids.*' => 'exists:categories,id',
            'action' => 'required|in:delete',
        ]);

        $query = Category::whereIn('id', $request->ids)
            ->where('tenant_id', auth()->user()->tenant_id);

        switch ($request->action) {
            case 'delete':
                // Check if categories have products before deleting? 
                // For now, let's just delete (database cascade might handle or not, ideally set null)
                // Assuming standard behavior
                $query->delete();
                break;
        }

        \Illuminate\Support\Facades\Cache::forget("tenant_menu_" . auth()->user()->tenant_id);

        return back()->with('success', 'Ação em massa realizada com sucesso!');
    }

    public function duplicate(Category $category)
    {
        if ($category->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $tenant = auth()->user()->tenant;
        if (!$tenant->canAdd('categories')) {
            return back()->withErrors(['error' => 'Limite de categorias atingido.']);
        }

        $newCategory = $category->replicate();
        $newCategory->name = $category->name . ' (Cópia)';
        $newCategory->save();

        return back()->with('success', 'Categoria duplicada com sucesso!');
    }
}
