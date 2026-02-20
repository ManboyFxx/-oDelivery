<?php

namespace App\Http\Controllers;

use App\Models\ComplementGroup;
use App\Models\ComplementOption;
use App\Models\Ingredient;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplementController extends Controller
{
    public function index(Request $request)
    {
        $tenant = auth()->user()->tenant;

        $query = ComplementGroup::where('tenant_id', $tenant->id)
            ->with([
                'options' => function ($q) {
                    $q->with('ingredient')->orderBy('sort_order')->orderBy('name');
                }
            ])
            ->withCount('options');

        // Search
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort
        if ($request->has('sort') && $request->sort === 'az') {
            $query->orderBy('name');
        } else {
            $query->orderBy('sort_order')->orderBy('name');
        }

        $groups = $query->get();

        $ingredients = Ingredient::where('tenant_id', $tenant->id)
            ->where('is_available', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Complements/Index', [
            'groups' => $groups,
            'ingredients' => $ingredients,
        ]);
    }

    public function store(Request $request)
    {
        $tenant = auth()->user()->tenant;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_required' => 'boolean',
            'min_selections' => 'required|integer|min:0',
            'max_selections' => 'required|integer|min:1',
            'options' => 'required|array|min:1',
            'options.*.name' => 'required|string|max:255',
            'options.*.price' => 'nullable|numeric|min:0',
            'options.*.max_quantity' => 'nullable|integer|min:0',
            'options.*.is_available' => 'boolean',
            'options.*.ingredient_id' => 'nullable|uuid|exists:ingredients,id',
        ]);

        // Validate min <= max
        if ($validated['min_selections'] > $validated['max_selections']) {
            return redirect()->back()->withErrors(['min_selections' => 'Seleções mínimas não pode ser maior que máximas.']);
        }

        // Validate required logic
        if ($validated['is_required'] && $validated['min_selections'] < 1) {
            return redirect()->back()->withErrors(['min_selections' => 'Grupos obrigatórios devem ter no mínimo 1 seleção.']);
        }

        $group = ComplementGroup::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'is_required' => $validated['is_required'] ?? false,
            'min_selections' => $validated['min_selections'],
            'max_selections' => $validated['max_selections'],
            'sort_order' => ComplementGroup::where('tenant_id', $tenant->id)->max('sort_order') + 1,
        ]);

        // Create options
        foreach ($validated['options'] as $index => $optionData) {
            ComplementOption::create([
                'group_id' => $group->id,
                'name' => $optionData['name'],
                'price' => $optionData['price'] ?? 0,
                'max_quantity' => (!empty($optionData['max_quantity']) && $optionData['max_quantity'] > 0) ? $optionData['max_quantity'] : 0,
                'is_available' => $optionData['is_available'] ?? true,
                'ingredient_id' => $optionData['ingredient_id'] ?? null,
                'sort_order' => $index,
            ]);
        }

        return redirect()->back()->with('success', 'Grupo de complementos criado com sucesso!');
    }

    public function update(Request $request, $id)
    {
        $tenant = auth()->user()->tenant;

        $group = ComplementGroup::where('tenant_id', $tenant->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_required' => 'boolean',
            'min_selections' => 'required|integer|min:0',
            'max_selections' => 'required|integer|min:1',
            'options' => 'required|array|min:1',
            'options.*.id' => 'nullable|exists:complement_options,id',
            'options.*.name' => 'required|string|max:255',
            'options.*.price' => 'nullable|numeric|min:0',
            'options.*.max_quantity' => 'nullable|integer|min:0',
            'options.*.is_available' => 'boolean',
            'options.*.ingredient_id' => 'nullable|uuid|exists:ingredients,id',
        ]);

        // Validate min <= max
        if ($validated['min_selections'] > $validated['max_selections']) {
            return redirect()->back()->withErrors(['min_selections' => 'Seleções mínimas não pode ser maior que máximas.']);
        }

        // Validate required logic
        if ($validated['is_required'] && $validated['min_selections'] < 1) {
            return redirect()->back()->withErrors(['min_selections' => 'Grupos obrigatórios devem ter no mínimo 1 seleção.']);
        }

        $group->update([
            'name' => $validated['name'],
            'is_required' => $validated['is_required'] ?? false,
            'min_selections' => $validated['min_selections'],
            'max_selections' => $validated['max_selections'],
        ]);

        // Get existing option IDs
        $existingIds = $group->options()->pluck('id')->toArray();
        $submittedIds = collect($validated['options'])->pluck('id')->filter()->toArray();

        // Delete removed options
        $toDelete = array_diff($existingIds, $submittedIds);
        ComplementOption::whereIn('id', $toDelete)->delete();

        // Update or create options
        foreach ($validated['options'] as $index => $optionData) {
            if (isset($optionData['id'])) {
                // Update existing
                ComplementOption::where('id', $optionData['id'])
                    ->update([
                        'name' => $optionData['name'],
                        'price' => $optionData['price'] ?? 0,
                        'max_quantity' => (!empty($optionData['max_quantity']) && $optionData['max_quantity'] > 0) ? $optionData['max_quantity'] : 0,
                        'is_available' => $optionData['is_available'] ?? true,
                        'ingredient_id' => $optionData['ingredient_id'] ?? null,
                        'sort_order' => $index,
                    ]);
            } else {
                // Create new
                ComplementOption::create([
                    'group_id' => $group->id,
                    'name' => $optionData['name'],
                    'price' => $optionData['price'] ?? 0,
                    'max_quantity' => (!empty($optionData['max_quantity']) && $optionData['max_quantity'] > 0) ? $optionData['max_quantity'] : 0,
                    'is_available' => $optionData['is_available'] ?? true,
                    'ingredient_id' => $optionData['ingredient_id'] ?? null,
                    'sort_order' => $index,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Grupo de complementos atualizado com sucesso!');
    }

    public function destroy($id)
    {
        $tenant = auth()->user()->tenant;

        $group = ComplementGroup::where('tenant_id', $tenant->id)
            ->findOrFail($id);

        // Check if group is linked to any products
        $linkedProducts = $group->products()->count();

        if ($linkedProducts > 0) {
            return redirect()->back()->with('error', "Não é possível excluir este grupo pois está vinculado a {$linkedProducts} produto(s). Desvincule-os primeiro.");
        }

        $group->delete();

        return redirect()->back()->with('success', 'Grupo de complementos excluído com sucesso!');
    }

    /**
     * Duplicate a complement group
     */
    public function duplicate($id)
    {
        $tenant = auth()->user()->tenant;

        $originalGroup = ComplementGroup::where('tenant_id', $tenant->id)
            ->with('options')
            ->findOrFail($id);

        $newGroup = ComplementGroup::create([
            'tenant_id' => $tenant->id,
            'name' => $originalGroup->name . ' (Cópia)',
            'is_required' => $originalGroup->is_required,
            'min_selections' => $originalGroup->min_selections,
            'max_selections' => $originalGroup->max_selections,
            'sort_order' => ComplementGroup::where('tenant_id', $tenant->id)->max('sort_order') + 1,
        ]);

        // Duplicate options
        foreach ($originalGroup->options as $option) {
            ComplementOption::create([
                'group_id' => $newGroup->id,
                'name' => $option->name,
                'price' => $option->price,
                'max_quantity' => $option->max_quantity,
                'is_available' => $option->is_available,
                'ingredient_id' => $option->ingredient_id,
                'sort_order' => $option->sort_order,
            ]);
        }

        return redirect()->back()->with('success', 'Grupo duplicado com sucesso!');
    }

    /**
     * Toggle option availability
     */
    public function toggleOption(Request $request, $groupId, $optionId)
    {
        $tenant = auth()->user()->tenant;

        $group = ComplementGroup::where('tenant_id', $tenant->id)->findOrFail($groupId);
        $option = ComplementOption::where('group_id', $group->id)->findOrFail($optionId);

        $option->update(['is_available' => !$option->is_available]);

        return response()->json([
            'success' => true,
            'is_available' => $option->is_available
        ]);
    }
}
