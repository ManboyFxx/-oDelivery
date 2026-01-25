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
        $validated = $request->validate([
            'neighborhood' => 'required|string|max:255',
            'delivery_fee' => 'required|numeric|min:0',
            'estimated_time_min' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $tenant = auth()->user()->tenant;

        DeliveryZone::create([
            ...$validated,
            'tenant_id' => $tenant->id,
            'is_active' => $request->input('is_active', true),
        ]);

        return back()->with('success', 'Zona de entrega adicionada com sucesso!');
    }

    public function update(Request $request, $id)
    {
        $zone = DeliveryZone::findOrFail($id);

        $validated = $request->validate([
            'neighborhood' => 'required|string|max:255',
            'delivery_fee' => 'required|numeric|min:0',
            'estimated_time_min' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $zone->update($validated);

        return back()->with('success', 'Zona de entrega atualizada com sucesso!');
    }

    public function destroy($id)
    {
        $zone = DeliveryZone::findOrFail($id);
        $zone->delete();

        return back()->with('success', 'Zona de entrega removida com sucesso!');
    }
}
