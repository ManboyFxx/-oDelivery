<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiCredential;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminApiKeysController extends Controller
{
    public function index()
    {
        $credentials = ApiCredential::with('tenant:id,name')
            ->orderBy('service')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($credential) {
                return [
                    'id' => $credential->id,
                    'tenant_id' => $credential->tenant_id,
                    'tenant_name' => $credential->tenant?->name ?? 'Global',
                    'service' => $credential->service,
                    'key_name' => $credential->key_name,
                    'is_active' => $credential->is_active,
                    'last_used_at' => $credential->last_used_at,
                    'created_at' => $credential->created_at,
                    // Não expor o valor descriptografado na listagem
                ];
            });

        $tenants = Tenant::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/ApiKeys/Index', [
            'credentials' => $credentials,
            'tenants' => $tenants,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'nullable|exists:tenants,id',
            'service' => 'required|in:evolution,mercadopago,mapbox',
            'key_name' => 'required|string|max:255',
            'value' => 'required|string',
            'is_active' => 'boolean',
        ]);

        ApiCredential::create([
            'tenant_id' => $validated['tenant_id'],
            'service' => $validated['service'],
            'key_name' => $validated['key_name'],
            'encrypted_value' => $validated['value'], // Auto-encrypted by mutator
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Credencial adicionada com sucesso!');
    }

    public function update(Request $request, ApiCredential $credential)
    {
        $validated = $request->validate([
            'key_name' => 'required|string|max:255',
            'value' => 'nullable|string', // Opcional na edição
            'is_active' => 'boolean',
        ]);

        $updateData = [
            'key_name' => $validated['key_name'],
            'is_active' => $validated['is_active'] ?? $credential->is_active,
        ];

        // Só atualizar o valor se fornecido
        if (!empty($validated['value'])) {
            $updateData['encrypted_value'] = $validated['value'];
        }

        $credential->update($updateData);

        return back()->with('success', 'Credencial atualizada!');
    }

    public function destroy(ApiCredential $credential)
    {
        $credential->delete();

        return back()->with('success', 'Credencial removida.');
    }

    public function show(ApiCredential $credential)
    {
        // Endpoint para visualizar valor descriptografado (com cuidado!)
        return response()->json([
            'id' => $credential->id,
            'service' => $credential->service,
            'key_name' => $credential->key_name,
            'decrypted_value' => $credential->decrypted_value,
        ]);
    }
}
