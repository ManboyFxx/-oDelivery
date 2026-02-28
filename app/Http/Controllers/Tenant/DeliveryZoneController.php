<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use App\Services\GoogleMapsService;
use Illuminate\Http\Request;

class DeliveryZoneController extends Controller
{
    protected $googleMaps;

    public function __construct(GoogleMapsService $googleMaps)
    {
        $this->googleMaps = $googleMaps;
    }

    /**
     * Validate if a neighborhood is within delivery zones
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validate(Request $request)
    {
        $request->validate([
            'neighborhood' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'tenant_id' => 'required',
        ]);

        $neighborhood = trim($request->neighborhood);
        $tenantId = $request->tenant_id;
        $lat = $request->latitude;
        $lng = $request->longitude;

        $settings = \App\Models\StoreSetting::where('tenant_id', $tenantId)->first();

        // 1. If coordinates are provided, try Distance-based logic
        if ($lat && $lng && $settings && $settings->delivery_fee_mode === 'distance') {
            $origin = "{$settings->store_latitude},{$settings->store_longitude}";
            $destination = "{$lat},{$lng}";

            $matrix = $this->googleMaps->getDistanceMatrix($origin, $destination);

            if ($matrix) {
                $distanceKm = $matrix['distance_value'] / 1000;

                // Check if within radius
                if ($settings->delivery_radius_km > 0 && $distanceKm > $settings->delivery_radius_km) {
                    return response()->json([
                        'valid' => false,
                        'message' => "Desculpe, estamos fora do raio de entrega (" . round($distanceKm, 1) . "km).",
                        'distance' => round($distanceKm, 1),
                    ]);
                }

                $fee = $settings->fixed_delivery_fee + ($distanceKm * $settings->delivery_fee_per_km);

                // Check for free delivery
                if ($settings->free_delivery_min > 0 && $request->total >= $settings->free_delivery_min) {
                    $fee = 0;
                }

                return response()->json([
                    'valid' => true,
                    'message' => 'Entregamos em sua localização!',
                    'fee' => round($fee, 2),
                    'distance' => round($distanceKm, 1),
                    'duration' => $matrix['duration_text'],
                ]);
            }
        }

        // 2. Fallback to Neighborhood-based logic
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

    public function listActiveZones(Request $request)
    {
        $tenantId = $request->query('tenant_id');
        if (!$tenantId)
            return response()->json([]);

        $zones = DeliveryZone::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('neighborhood')
            ->get(['id', 'neighborhood', 'delivery_fee', 'estimated_time_min']);

        return response()->json($zones);
    }
}
