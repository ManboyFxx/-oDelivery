<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IngredientController extends Controller
{
    public function index()
    {
        $tenant = auth()->user()->tenant; // Demo: get first tenant

        $ingredients = Ingredient::where('tenant_id', $tenant->id)
            ->withCount('complementOptions')
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Ingredients/Index', [
            'ingredients' => $ingredients,
        ]);
    }

    public function store(Request $request)
    {
        $tenant = auth()->user()->tenant;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_available' => 'boolean',
            'stock' => 'nullable|numeric',
            'min_stock' => 'nullable|numeric',
        ]);

        $ingredient = Ingredient::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'is_available' => $validated['is_available'] ?? true,
            'stock' => $validated['stock'] ?? 0,
            'min_stock' => $validated['min_stock'] ?? 0,
            'display_order' => Ingredient::where('tenant_id', $tenant->id)->max('display_order') + 1,
        ]);

        return redirect()->back()->with('success', 'Ingrediente criado com sucesso!');
    }

    public function update(Request $request, $id)
    {
        $tenant = auth()->user()->tenant;

        $ingredient = Ingredient::where('tenant_id', $tenant->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_available' => 'boolean',
            'stock' => 'nullable|numeric',
            'min_stock' => 'nullable|numeric',
        ]);

        $oldStock = $ingredient->stock;
        $ingredient->update($validated);

        // Record adjustment if quantity actually changed
        if (isset($validated['stock']) && $validated['stock'] != $oldStock) {
            $diff = $validated['stock'] - $oldStock;
            $type = $diff > 0 ? 'manual' : 'adjustment';
            $ingredient->recordStockMovement($diff, $type, 'Ajuste Manual');
        }

        return redirect()->back()->with('success', 'Ingrediente atualizado com sucesso!');
    }

    public function destroy($id)
    {
        $tenant = auth()->user()->tenant;

        $ingredient = Ingredient::where('tenant_id', $tenant->id)
            ->findOrFail($id);

        // Check if ingredient is linked to any complement options
        $linkedCount = $ingredient->complementOptions()->count();

        if ($linkedCount > 0) {
            return redirect()->back()->with('error', "Não é possível excluir este ingrediente pois está vinculado a {$linkedCount} opção(ões) de complemento. Desvincule-as primeiro.");
        }

        $ingredient->delete();

        return redirect()->back()->with('success', 'Ingrediente excluído com sucesso!');
    }

    /**
     * Toggle ingredient availability and cascade to linked complement options
     */
    public function toggle(Request $request, $id)
    {
        $tenant = auth()->user()->tenant;

        $ingredient = Ingredient::where('tenant_id', $tenant->id)
            ->with('complementOptions')
            ->findOrFail($id);

        $newStatus = !$ingredient->is_available;

        // Update ingredient
        $ingredient->update(['is_available' => $newStatus]);

        // Cascade to all linked complement options
        $affectedCount = $ingredient->complementOptions()->update([
            'is_available' => $newStatus
        ]);

        $message = $newStatus
            ? "Ingrediente ativado! {$affectedCount} opção(ões) de complemento também foram ativadas."
            : "Ingrediente desativado! {$affectedCount} opção(ões) de complemento também foram desativadas.";

        return redirect()->back()->with('success', $message);
    }

    /**
     * Get impact preview before toggling
     */
    public function getImpact($id)
    {
        $tenant = auth()->user()->tenant;

        $ingredient = Ingredient::where('tenant_id', $tenant->id)
            ->findOrFail($id);

        return response()->json($ingredient->getImpactCount());
    }

    /**
     * Reorder ingredients
     */
    public function reorder(Request $request)
    {
        $tenant = auth()->user()->tenant;

        $validated = $request->validate([
            'ingredients' => 'required|array',
            'ingredients.*.id' => 'required|exists:ingredients,id',
            'ingredients.*.display_order' => 'required|integer',
        ]);

        foreach ($validated['ingredients'] as $item) {
            Ingredient::where('tenant_id', $tenant->id)
                ->where('id', $item['id'])
                ->update(['display_order' => $item['display_order']]);
        }

        return response()->json(['message' => 'Ordem atualizada com sucesso!']);
    }
}
