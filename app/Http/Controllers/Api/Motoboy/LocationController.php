<?php

namespace App\Http\Controllers\Api\Motoboy;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MotoboyLocationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    protected $locationService;

    public function __construct(MotoboyLocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    /**
     * POST /api/motoboy/location
     * Salvar localização atual do motoboy
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric|min:0',
            'speed' => 'nullable|numeric|min:0',
            'heading' => 'nullable|integer|between:0,360',
            'order_id' => 'nullable|uuid|exists:orders,id',
        ]);

        try {
            $userId = auth()->id();

            $location = $this->locationService->saveLocation(
                $userId,
                $validated['latitude'],
                $validated['longitude'],
                $validated['accuracy'] ?? null,
                $validated['speed'] ?? null,
                $validated['heading'] ?? null,
                $validated['order_id'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Localização salva com sucesso',
                'location' => [
                    'id' => $location->id,
                    'latitude' => $location->latitude,
                    'longitude' => $location->longitude,
                    'accuracy' => $location->accuracy,
                    'speed' => $location->speed,
                    'heading' => $location->heading,
                    'created_at' => $location->created_at->toIso8601String(),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao salvar localização: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/motoboy/location
     * Obter localização atual do motoboy
     */
    public function show(): JsonResponse
    {
        try {
            $userId = auth()->id();
            $location = $this->locationService->getCurrentLocation($userId);

            if (!$location) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nenhuma localização registrada',
                    'location' => null,
                ], 404);
            }

            return response()->json([
                'success' => true,
                'location' => [
                    'id' => $location->id,
                    'latitude' => $location->latitude,
                    'longitude' => $location->longitude,
                    'accuracy' => $location->accuracy,
                    'speed' => $location->speed,
                    'heading' => $location->heading,
                    'created_at' => $location->created_at->toIso8601String(),
                    'created_at_display' => $location->created_at->format('d/m/Y H:i:s'),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter localização: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/motoboy/location/history
     * Obter histórico de localizações
     */
    public function history(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'limit' => 'nullable|integer|between:1,500',
        ]);

        try {
            $userId = auth()->id();

            $fromDate = $validated['from_date'] ? Carbon::parse($validated['from_date']) : null;
            $toDate = $validated['to_date'] ? Carbon::parse($validated['to_date']) : null;
            $limit = $validated['limit'] ?? 100;

            $locations = $this->locationService->getLocationHistory(
                $userId,
                $fromDate,
                $toDate,
                $limit
            );

            return response()->json([
                'success' => true,
                'count' => $locations->count(),
                'locations' => $locations->map(function ($location) {
                    return [
                        'id' => $location->id,
                        'latitude' => $location->latitude,
                        'longitude' => $location->longitude,
                        'accuracy' => $location->accuracy,
                        'speed' => $location->speed,
                        'heading' => $location->heading,
                        'order_id' => $location->order_id,
                        'created_at' => $location->created_at->toIso8601String(),
                        'created_at_display' => $location->created_at->format('d/m/Y H:i:s'),
                    ];
                })->toArray(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter histórico: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/motoboy/location/distance
     * Calcular distância até um destino
     */
    public function distance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destination_latitude' => 'required|numeric|between:-90,90',
            'destination_longitude' => 'required|numeric|between:-180,180',
            'order_id' => 'nullable|uuid|exists:orders,id',
        ]);

        try {
            $userId = auth()->id();

            // Obter localização atual
            $currentLocation = $this->locationService->getCurrentLocation($userId);

            if (!$currentLocation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nenhuma localização registrada',
                ], 404);
            }

            // Calcular distância
            $distance = $this->locationService->calculateDistance(
                $currentLocation->latitude,
                $currentLocation->longitude,
                $validated['destination_latitude'],
                $validated['destination_longitude']
            );

            // Estimar tempo
            $estimatedTimeMinutes = $this->locationService->estimateArrivalTime($distance);

            // Se houver order_id, calcular se chegou ao destino
            $arrivedAtDestination = false;
            if ($validated['order_id'] ?? null) {
                $order = Order::find($validated['order_id']);
                if ($order) {
                    $arrivedAtDestination = $this->locationService->arrivedAtDestination(
                        $validated['order_id'],
                        $validated['destination_latitude'],
                        $validated['destination_longitude'],
                        0.15 // 150 metros de raio
                    );
                }
            }

            return response()->json([
                'success' => true,
                'distance' => [
                    'km' => $distance,
                    'formatted' => $this->locationService->formatDistance($distance),
                    'estimated_time_minutes' => $estimatedTimeMinutes,
                    'estimated_time_formatted' => $this->locationService->formatEstimatedTime($estimatedTimeMinutes),
                    'arrived_at_destination' => $arrivedAtDestination,
                ],
                'current_location' => [
                    'latitude' => $currentLocation->latitude,
                    'longitude' => $currentLocation->longitude,
                    'accuracy' => $currentLocation->accuracy,
                    'speed' => $currentLocation->speed,
                    'heading' => $currentLocation->heading,
                ],
                'destination' => [
                    'latitude' => $validated['destination_latitude'],
                    'longitude' => $validated['destination_longitude'],
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao calcular distância: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/motoboy/location/trajectory
     * Obter trajeto completo de um pedido
     */
    public function trajectory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|uuid|exists:orders,id',
        ]);

        try {
            $orderId = $validated['order_id'];

            // Verificar se o motoboy tem acesso ao pedido
            $order = Order::find($orderId);
            if ($order->motoboy_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acesso negado',
                ], 403);
            }

            // Obter coordenadas
            $coordinates = $this->locationService->getTrajectoryCoordinates($orderId);

            // Obter estatísticas
            $totalDistance = $this->locationService->getTotalDistance($orderId);
            $averageSpeed = $this->locationService->getAverageSpeed($orderId);
            $maxSpeed = $this->locationService->getMaxSpeed($orderId);
            $duration = $this->locationService->getTrajectoryDuration($orderId);
            $pointsCount = $this->locationService->getLocationPointsCount($orderId);

            return response()->json([
                'success' => true,
                'order_id' => $orderId,
                'coordinates' => $coordinates,
                'statistics' => [
                    'total_distance_km' => $totalDistance,
                    'total_distance_formatted' => $this->locationService->formatDistance($totalDistance),
                    'average_speed_kmh' => $averageSpeed,
                    'max_speed_kmh' => $maxSpeed,
                    'duration' => $duration,
                    'location_points_count' => $pointsCount,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter trajeto: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/motoboy/location/arrived
     * Verificar se chegou ao destino
     */
    public function checkArrived(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|uuid|exists:orders,id',
            'destination_latitude' => 'required|numeric|between:-90,90',
            'destination_longitude' => 'required|numeric|between:-180,180',
            'radius_km' => 'nullable|numeric|min:0.01|max:1',
        ]);

        try {
            $orderId = $validated['order_id'];
            $radiusKm = $validated['radius_km'] ?? 0.15; // 150 metros por padrão

            $arrived = $this->locationService->arrivedAtDestination(
                $orderId,
                $validated['destination_latitude'],
                $validated['destination_longitude'],
                $radiusKm
            );

            // Obter distância até destino
            $currentLocation = $this->locationService->getCurrentLocation(auth()->id());
            $distance = null;

            if ($currentLocation) {
                $distance = $this->locationService->calculateDistance(
                    $currentLocation->latitude,
                    $currentLocation->longitude,
                    $validated['destination_latitude'],
                    $validated['destination_longitude']
                );
            }

            return response()->json([
                'success' => true,
                'arrived' => $arrived,
                'distance_km' => $distance,
                'distance_formatted' => $distance ? $this->locationService->formatDistance($distance) : null,
                'radius_km' => $radiusKm,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao verificar chegada: ' . $e->getMessage(),
            ], 500);
        }
    }
}
