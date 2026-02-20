<?php

namespace App\Http\Controllers;

use App\Models\DeliveryZone;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryZoneController extends Controller
{
    public function index()
    {
        $tenant = auth()->user()->tenant;
        $zones = DeliveryZone::where('tenant_id', $tenant->id)
            ->orderBy('display_order')
            ->orderBy('neighborhood')
            ->get();

        return Inertia::render('Settings/DeliveryZones', [
            'zones' => $zones
        ]);
    }

    public function store(Request $request)
    {
        try {
            $tenant = auth()->user()->tenant;
            if (!$tenant) {
                return back()->with('error', 'Erro: Usuário não vinculado a uma loja.');
            }

            // Sanitize currency input (R$ 5,00 -> 5.00)
            $inputs = $request->all();
            if (isset($inputs['delivery_fee'])) {
                $inputs['delivery_fee'] = str_replace(',', '.', $inputs['delivery_fee']);
            }

            $validator = \Illuminate\Support\Facades\Validator::make($inputs, [
                'neighborhood' => [
                    'required',
                    'string',
                    'max:255',
                    \Illuminate\Validation\Rule::unique('delivery_zones')->where(function ($query) use ($tenant) {
                        return $query->where('tenant_id', $tenant->id);
                    }),
                ],
                'delivery_fee' => 'required|numeric|min:0',
                'estimated_time_min' => 'required|integer|min:0',
                'is_active' => 'boolean',
            ], [
                'neighborhood.unique' => 'Este bairro já possui um cadastro de entrega.',
                'delivery_fee.numeric' => 'A taxa de entrega deve ser um número válido.',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();

            DeliveryZone::create([
                ...$validated,
                'tenant_id' => $tenant->id,
                'is_active' => $request->input('is_active', true),
            ]);

            return back()->with('success', 'Zona de entrega adicionada com sucesso!');

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Erro ao criar zona de entrega: ' . $e->getMessage());
            return back()->with('error', 'Erro ao salvar: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $tenant = auth()->user()->tenant;
            if (!$tenant) {
                return back()->with('error', 'Erro: Usuário não vinculado a uma loja.');
            }

            $zone = DeliveryZone::where('tenant_id', $tenant->id)->findOrFail($id);

            // Sanitize currency input
            $inputs = $request->all();
            if (isset($inputs['delivery_fee'])) {
                $inputs['delivery_fee'] = str_replace(',', '.', $inputs['delivery_fee']);
            }

            $validator = \Illuminate\Support\Facades\Validator::make($inputs, [
                'neighborhood' => [
                    'required',
                    'string',
                    'max:255',
                    \Illuminate\Validation\Rule::unique('delivery_zones')->where(function ($query) use ($tenant) {
                        return $query->where('tenant_id', $tenant->id);
                    })->ignore($zone->id),
                ],
                'delivery_fee' => 'required|numeric|min:0',
                'estimated_time_min' => 'required|integer|min:0',
                'is_active' => 'boolean',
            ], [
                'neighborhood.unique' => 'Este bairro já possui um cadastro de entrega.',
                'delivery_fee.numeric' => 'A taxa de entrega deve ser um número válido.',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();

            $zone->update($validated);

            return back()->with('success', 'Zona de entrega atualizada com sucesso!');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Erro ao atualizar zona de entrega: ' . $e->getMessage());
            return back()->with('error', 'Erro ao salvar: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $zone = DeliveryZone::findOrFail($id);
        $zone->delete();

        return back()->with('success', 'Zona de entrega removida com sucesso!');
    }
}
