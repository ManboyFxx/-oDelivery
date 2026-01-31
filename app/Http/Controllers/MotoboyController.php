<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MotoboyController extends Controller
{
    /**
     * List all motoboys for the current tenant.
     */
    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant || !$tenant->hasFeature('motoboy_management')) {
            return abort(403, 'Recurso não disponível neste plano.');
        }

        $motoboys = User::where('tenant_id', $tenant->id)
            ->where('role', 'motoboy')
            ->orderBy('name')
            ->get();

        return Inertia::render('Motoboys/Index', [
            'motoboys' => $motoboys
        ]);
    }

    /**
     * Create a new motoboy for the current tenant.
     */
    public function store(Request $request)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant || !$tenant->hasFeature('motoboy_management')) {
            return abort(403, 'Recurso não disponível neste plano.');
        }

        // Check if tenant reached max_motoboys limit
        if (!$tenant->canAdd('motoboys')) {
            return back()->withErrors(['error' => 'Limite de motoboys atingido para seu plano.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->where('tenant_id', $tenant->id),
            ],
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => bcrypt($validated['password']),
            'role' => 'motoboy',
            'is_available' => true,
            'is_active' => true,
        ]);

        return back()->with('success', 'Motoboy cadastrado com sucesso!');
    }

    /**
     * Update the specified motoboy.
     */
    public function update(Request $request, User $motoboy)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant || !$tenant->hasFeature('motoboy_management')) {
            return abort(403, 'Recurso não disponível neste plano.');
        }

        if ($motoboy->tenant_id !== $tenant->id) {
            return abort(403, 'Motoboy não encontrado.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        $motoboy->update($validated);
        return back()->with('success', 'Motoboy atualizado com sucesso!');
    }

    /**
     * Delete the specified motoboy.
     */
    public function destroy(Request $request, User $motoboy)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant || !$tenant->hasFeature('motoboy_management')) {
            return abort(403, 'Recurso não disponível neste plano.');
        }

        if ($motoboy->tenant_id !== $tenant->id) {
            return abort(403, 'Motoboy não encontrado.');
        }

        $motoboy->delete();
        return back()->with('success', 'Motoboy removido com sucesso!');
    }
}
