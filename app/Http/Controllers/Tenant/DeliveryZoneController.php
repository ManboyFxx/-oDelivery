<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use Illuminate\Http\Request;

class DeliveryZoneController extends Controller
{
    /**
     * Validate if a neighborhood is within delivery zones
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validate(Request $request)
    {
        $request->validate([
            'neighborhood' => 'required|string',
            'tenant_id' => 'required|exists:tenants,id',
        ]);

        $neighborhood = trim($request->neighborhood);
        $tenantId = $request->tenant_id;

        // Case-insensitive search for neighborhood
        $zone = DeliveryZone::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereRaw('LOWER(neighborhood) = ?', [strtolower($neighborhood)])
            ->first();

        if (!$zone) {
            return response()->json([
                'valid' => false,
                'message' => 'Desculpe, não entregamos neste bairro.',
                'zone' => null,
                'fee' => 0,
                'estimated_time' => 0,
            ]);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Entregamos neste bairro!',
            'zone' => [
                'id' => $zone->id,
                'neighborhood' => $zone->neighborhood,
                'delivery_fee' => $zone->delivery_fee,
                'estimated_time_min' => $zone->estimated_time_min,
            ],
            'fee' => (float) $zone->delivery_fee,
            'estimated_time' => $zone->estimated_time_min,
        ]);
    }
}
