<?php

namespace App\Http\Controllers\Motoboy;

use App\Http\Controllers\Controller;
use App\Models\MotoboyLocationHistory;
use App\Models\Order;
use App\Services\MotoboyLocationService;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    protected $locationService;

    public function __construct(MotoboyLocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    /**
     * GET /motoboy/location
     * Página principal com mapa em tempo real
     */
    public function index(): Response
    {
        $userId = auth()->id();

        // Obter localização atual
        $currentLocation = $this->locationService->getCurrentLocation($userId);

        // Obter pedido em entrega (se houver)
        $currentDelivery = Order::where('motoboy_id', $userId)
            ->whereIn('status', ['on_delivery', 'with_motoboy'])
            ->with('customer')
            ->first();

        // Calcular distância até cliente
        $distanceToCustomer = null;
        $estimatedTimeMinutes = null;

        if ($currentLocation && $currentDelivery) {
            $distanceToCustomer = $this->locationService->calculateDistance(
                $currentLocation->latitude,
                $currentLocation->longitude,
                $currentDelivery->customer->latitude ?? -23.5505,
                $currentDelivery->customer->longitude ?? -46.6333
            );

            $estimatedTimeMinutes = $this->locationService->estimateArrivalTime($distanceToCustomer);
        }

        return Inertia::render('Motoboy/Location/Index', [
            'currentLocation' => $currentLocation ? [
                'id' => $currentLocation->id,
                'latitude' => $currentLocation->latitude,
                'longitude' => $currentLocation->longitude,
                'accuracy' => $currentLocation->accuracy,
                'speed' => $currentLocation->speed,
                'heading' => $currentLocation->heading,
                'created_at' => $currentLocation->created_at->toIso8601String(),
            ] : null,
            'currentDelivery' => $currentDelivery ? [
                'id' => $currentDelivery->id,
                'order_number' => $currentDelivery->order_number,
                'customer_name' => $currentDelivery->customer->name,
                'customer_phone' => $currentDelivery->customer->phone,
                'destination_address' => $currentDelivery->delivery_address,
                'latitude' => $currentDelivery->customer->latitude ?? -23.5505,
                'longitude' => $currentDelivery->customer->longitude ?? -46.6333,
            ] : null,
            'distanceToCustomer' => $distanceToCustomer,
            'distanceFormatted' => $distanceToCustomer ? $this->locationService->formatDistance($distanceToCustomer) : null,
            'estimatedTimeMinutes' => $estimatedTimeMinutes,
            'estimatedTimeFormatted' => $estimatedTimeMinutes ? $this->locationService->formatEstimatedTime($estimatedTimeMinutes) : null,
            'googleMapsApiKey' => config('services.google_maps.key'),
        ]);
    }

    /**
     * GET /motoboy/location/tracking
     * Página de rastreamento detalhado em tempo real
     */
    public function tracking(): Response
    {
        $userId = auth()->id();

        // Obter localização atual
        $currentLocation = $this->locationService->getCurrentLocation($userId);

        // Obter pedido em entrega
        $currentDelivery = Order::where('motoboy_id', $userId)
            ->whereIn('status', ['on_delivery', 'with_motoboy'])
            ->with(['customer', 'items'])
            ->first();

        // Se não houver pedido em entrega, obter último entregue
        if (!$currentDelivery) {
            $currentDelivery = Order::where('motoboy_id', $userId)
                ->where('status', 'delivered')
                ->with(['customer', 'items'])
                ->latest('delivered_at')
                ->first();
        }

        // Obter trajeto se houver pedido
        $trajectory = null;
        $trajectoryStatistics = null;

        if ($currentDelivery) {
            $trajectory = $this->locationService->getTrajectoryCoordinates($currentDelivery->id);

            $trajectoryStatistics = [
                'total_distance_km' => $this->locationService->getTotalDistance($currentDelivery->id),
                'average_speed_kmh' => $this->locationService->getAverageSpeed($currentDelivery->id),
                'max_speed_kmh' => $this->locationService->getMaxSpeed($currentDelivery->id),
                'duration' => $this->locationService->getTrajectoryDuration($currentDelivery->id),
                'location_points_count' => $this->locationService->getLocationPointsCount($currentDelivery->id),
            ];
        }

        return Inertia::render('Motoboy/Location/Tracking', [
            'currentLocation' => $currentLocation ? [
                'id' => $currentLocation->id,
                'latitude' => $currentLocation->latitude,
                'longitude' => $currentLocation->longitude,
                'accuracy' => $currentLocation->accuracy,
                'speed' => $currentLocation->speed,
                'heading' => $currentLocation->heading,
                'created_at' => $currentLocation->created_at->toIso8601String(),
                'created_at_display' => $currentLocation->created_at->format('d/m/Y H:i:s'),
            ] : null,
            'currentDelivery' => $currentDelivery ? [
                'id' => $currentDelivery->id,
                'order_number' => $currentDelivery->order_number,
                'status' => $currentDelivery->status,
                'customer_name' => $currentDelivery->customer->name,
                'customer_phone' => $currentDelivery->customer->phone,
                'destination_address' => $currentDelivery->delivery_address,
                'latitude' => $currentDelivery->customer->latitude ?? -23.5505,
                'longitude' => $currentDelivery->customer->longitude ?? -46.6333,
                'items_count' => $currentDelivery->items_count,
                'created_at' => $currentDelivery->created_at->toIso8601String(),
                'delivered_at' => $currentDelivery->delivered_at?->toIso8601String(),
            ] : null,
            'trajectory' => $trajectory ?? [],
            'trajectoryStatistics' => $trajectoryStatistics,
            'googleMapsApiKey' => config('services.google_maps.key'),
        ]);
    }

    /**
     * GET /motoboy/location/history
     * Página de histórico de trajetos
     */
    public function history(): Response
    {
        $userId = auth()->id();

        // Obter últimas 10 entregas
        $deliveries = Order::where('motoboy_id', $userId)
            ->where('status', 'delivered')
            ->with('customer')
            ->latest('delivered_at')
            ->limit(10)
            ->get();

        // Para cada entrega, calcular estatísticas
        $deliveriesWithStats = $deliveries->map(function ($delivery) {
            $totalDistance = $this->locationService->getTotalDistance($delivery->id);
            $duration = $this->locationService->getTrajectoryDuration($delivery->id);
            $averageSpeed = $this->locationService->getAverageSpeed($delivery->id);
            $pointsCount = $this->locationService->getLocationPointsCount($delivery->id);

            return [
                'id' => $delivery->id,
                'order_number' => $delivery->order_number,
                'customer_name' => $delivery->customer->name,
                'delivered_at' => $delivery->delivered_at->toIso8601String(),
                'delivered_at_display' => $delivery->delivered_at->format('d/m/Y H:i:s'),
                'total_distance_km' => $totalDistance,
                'total_distance_formatted' => $this->locationService->formatDistance($totalDistance),
                'duration' => $duration,
                'average_speed_kmh' => $averageSpeed,
                'location_points_count' => $pointsCount,
            ];
        })->toArray();

        // Estatísticas gerais do mês
        $monthStart = now()->startOfMonth();
        $monthLocations = MotoboyLocationHistory::where('user_id', $userId)
            ->where('created_at', '>=', $monthStart)
            ->get();

        $monthDeliveries = Order::where('motoboy_id', $userId)
            ->where('status', 'delivered')
            ->where('delivered_at', '>=', $monthStart)
            ->get();

        $totalDistanceMonth = $monthDeliveries->sum(fn($delivery) => $this->locationService->getTotalDistance($delivery->id));
        $totalDurationsMonth = $monthDeliveries->sum(fn($delivery) =>
            MotoboyLocationHistory::where('order_id', $delivery->id)->count()
        );

        return Inertia::render('Motoboy/Location/History', [
            'deliveries' => $deliveriesWithStats,
            'deliveriesCount' => count($deliveriesWithStats),
            'monthStatistics' => [
                'total_deliveries' => $monthDeliveries->count(),
                'total_distance_km' => round($totalDistanceMonth, 2),
                'total_distance_formatted' => $this->locationService->formatDistance($totalDistanceMonth),
                'average_distance_per_delivery' => $monthDeliveries->count() > 0
                    ? round($totalDistanceMonth / $monthDeliveries->count(), 2)
                    : 0,
                'location_updates_count' => $monthLocations->count(),
            ],
            'googleMapsApiKey' => config('services.google_maps.key'),
        ]);
    }

    /**
     * GET /motoboy/location/delivery/:orderId
     * Página de detalhe de um trajeto específico
     */
    public function delivery($orderId): Response
    {
        $userId = auth()->id();
        $delivery = Order::findOrFail($orderId);

        // Verificar autorização
        if ($delivery->motoboy_id !== $userId && $delivery->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Acesso negado');
        }

        // Obter trajeto
        $trajectory = $this->locationService->getTrajectoryCoordinates($orderId);

        // Obter estatísticas
        $totalDistance = $this->locationService->getTotalDistance($orderId);
        $averageSpeed = $this->locationService->getAverageSpeed($orderId);
        $maxSpeed = $this->locationService->getMaxSpeed($orderId);
        $duration = $this->locationService->getTrajectoryDuration($orderId);
        $pointsCount = $this->locationService->getLocationPointsCount($orderId);

        return Inertia::render('Motoboy/Location/DeliveryDetail', [
            'delivery' => [
                'id' => $delivery->id,
                'order_number' => $delivery->order_number,
                'customer_name' => $delivery->customer->name,
                'customer_phone' => $delivery->customer->phone,
                'destination_address' => $delivery->delivery_address,
                'status' => $delivery->status,
                'created_at' => $delivery->created_at->toIso8601String(),
                'delivered_at' => $delivery->delivered_at?->toIso8601String(),
                'delivered_at_display' => $delivery->delivered_at?->format('d/m/Y H:i:s'),
                'items_count' => $delivery->items_count,
            ],
            'trajectory' => $trajectory,
            'statistics' => [
                'total_distance_km' => $totalDistance,
                'total_distance_formatted' => $this->locationService->formatDistance($totalDistance),
                'average_speed_kmh' => $averageSpeed,
                'max_speed_kmh' => $maxSpeed,
                'duration' => $duration,
                'location_points_count' => $pointsCount,
            ],
            'googleMapsApiKey' => config('services.google_maps.key'),
        ]);
    }
}
