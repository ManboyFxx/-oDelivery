<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleMapsService
{
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.google_maps.api_key');
    }

    /**
     * Calculate distance and duration between two points
     */
    public function getDistanceMatrix(string $origin, string $destination)
    {
        if (empty($this->apiKey)) {
            Log::warning('Google Maps API Key is missing.');
            return null;
        }

        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/distancematrix/json', [
                'origins' => $origin,
                'destinations' => $destination,
                'key' => $this->apiKey,
                'mode' => 'driving',
                'language' => 'pt-BR',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['rows'][0]['elements'][0]['status']) && $data['rows'][0]['elements'][0]['status'] === 'OK') {
                    return [
                        'distance_value' => $data['rows'][0]['elements'][0]['distance']['value'], // meters
                        'distance_text' => $data['rows'][0]['elements'][0]['distance']['text'],
                        'duration_value' => $data['rows'][0]['elements'][0]['duration']['value'], // seconds
                        'duration_text' => $data['rows'][0]['elements'][0]['duration']['text'],
                    ];
                }
            }

            Log::error('Google Maps Distance Matrix Error', ['response' => $response->json()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Google Maps Service Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }
}
