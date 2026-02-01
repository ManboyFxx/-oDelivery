<?php

namespace App\Services;

use App\Models\MotoboyLocationHistory;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class MotoboyLocationService
{
    /**
     * Salvar localização atual do motoboy
     */
    public function saveLocation(
        string $userId,
        float $latitude,
        float $longitude,
        ?float $accuracy = null,
        ?float $speed = null,
        ?int $heading = null,
        ?string $orderId = null
    ): MotoboyLocationHistory {
        return MotoboyLocationHistory::create([
            'user_id' => $userId,
            'order_id' => $orderId,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'accuracy' => $accuracy,
            'speed' => $speed,
            'heading' => $heading,
        ]);
    }

    /**
     * Obter localização atual (última registrada)
     */
    public function getCurrentLocation(string $userId): ?MotoboyLocationHistory
    {
        return MotoboyLocationHistory::where('user_id', $userId)
            ->latest('created_at')
            ->first();
    }

    /**
     * Obter histórico de localizações com filtros
     */
    public function getLocationHistory(
        string $userId,
        ?Carbon $fromDate = null,
        ?Carbon $toDate = null,
        int $limit = 100
    ): Collection {
        $query = MotoboyLocationHistory::where('user_id', $userId);

        if ($fromDate) {
            $query->where('created_at', '>=', $fromDate->startOfDay());
        }

        if ($toDate) {
            $query->where('created_at', '<=', $toDate->endOfDay());
        }

        return $query
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Obter histórico de um pedido específico
     */
    public function getOrderTrajectory(string $orderId): Collection
    {
        return MotoboyLocationHistory::where('order_id', $orderId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Calcular distância entre dois pontos usando Haversine
     * Retorna distância em quilômetros
     */
    public function calculateDistance(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $earthRadius = 6371; // Raio da Terra em km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return round($distance, 2);
    }

    /**
     * Estimar tempo de chegada baseado em distância
     * Assume velocidade média de 30 km/h em cidade
     * Retorna tempo em minutos
     */
    public function estimateArrivalTime(float $distanceKm, float $avgSpeedKmh = 30): int
    {
        $timeHours = $distanceKm / $avgSpeedKmh;
        $timeMinutes = (int) ceil($timeHours * 60);

        return max(1, $timeMinutes); // Mínimo 1 minuto
    }

    /**
     * Formatar distância para exibição
     */
    public function formatDistance(float $distanceKm): string
    {
        if ($distanceKm < 1) {
            return (int) ($distanceKm * 1000) . ' m';
        }

        return number_format($distanceKm, 1, ',', '.') . ' km';
    }

    /**
     * Formatar tempo estimado para exibição
     */
    public function formatEstimatedTime(int $minutes): string
    {
        if ($minutes < 60) {
            return $minutes . ' min';
        }

        $hours = (int) ($minutes / 60);
        $mins = $minutes % 60;

        if ($mins === 0) {
            return $hours . ' h';
        }

        return $hours . 'h ' . $mins . 'min';
    }

    /**
     * Obter trajeto (polyline) para exibir no mapa
     * Retorna array de [latitude, longitude] pontos
     */
    public function getTrajectoryCoordinates(string $orderId): array
    {
        $locations = $this->getOrderTrajectory($orderId);

        return $locations->map(function ($location) {
            return [
                'lat' => $location->latitude,
                'lng' => $location->longitude,
                'timestamp' => $location->created_at->format('Y-m-d H:i:s'),
                'accuracy' => $location->accuracy,
                'speed' => $location->speed,
            ];
        })->toArray();
    }

    /**
     * Obter ponto mais próximo do destino
     */
    public function getNearestPointToDestination(
        string $orderId,
        float $destinationLat,
        float $destinationLon,
        float $radiusKm = 0.5
    ): ?MotoboyLocationHistory {
        $locations = $this->getOrderTrajectory($orderId);

        $nearest = null;
        $minDistance = $radiusKm;

        foreach ($locations as $location) {
            $distance = $this->calculateDistance(
                $location->latitude,
                $location->longitude,
                $destinationLat,
                $destinationLon
            );

            if ($distance < $minDistance) {
                $minDistance = $distance;
                $nearest = $location;
            }
        }

        return $nearest;
    }

    /**
     * Verificar se motoboy chegou ao destino
     */
    public function arrivedAtDestination(
        string $orderId,
        float $destinationLat,
        float $destinationLon,
        float $radiusKm = 0.1
    ): bool {
        $lastLocation = MotoboyLocationHistory::where('order_id', $orderId)
            ->latest('created_at')
            ->first();

        if (!$lastLocation) {
            return false;
        }

        $distance = $this->calculateDistance(
            $lastLocation->latitude,
            $lastLocation->longitude,
            $destinationLat,
            $destinationLon
        );

        return $distance <= $radiusKm;
    }

    /**
     * Limpar dados de localização antigos (mais de 30 dias)
     * Executar via schedule periodicamente
     */
    public function cleanOldLocations(int $daysOld = 30): int
    {
        return MotoboyLocationHistory::where('created_at', '<', now()->subDays($daysOld))
            ->delete();
    }

    /**
     * Obter velocidade média em um trajeto
     */
    public function getAverageSpeed(string $orderId): ?float
    {
        $locations = $this->getOrderTrajectory($orderId)
            ->filter(fn($loc) => $loc->speed !== null);

        if ($locations->isEmpty()) {
            return null;
        }

        return round($locations->avg('speed'), 2);
    }

    /**
     * Obter velocidade máxima em um trajeto
     */
    public function getMaxSpeed(string $orderId): ?float
    {
        $maxSpeed = MotoboyLocationHistory::where('order_id', $orderId)
            ->whereNotNull('speed')
            ->max('speed');

        return $maxSpeed ? round($maxSpeed, 2) : null;
    }

    /**
     * Contar pontos de localização em um trajeto
     */
    public function getLocationPointsCount(string $orderId): int
    {
        return MotoboyLocationHistory::where('order_id', $orderId)->count();
    }

    /**
     * Obter tempo total de um trajeto
     */
    public function getTrajectoryDuration(string $orderId): ?string
    {
        $firstLocation = MotoboyLocationHistory::where('order_id', $orderId)
            ->oldest('created_at')
            ->first();

        $lastLocation = MotoboyLocationHistory::where('order_id', $orderId)
            ->latest('created_at')
            ->first();

        if (!$firstLocation || !$lastLocation) {
            return null;
        }

        $durationMinutes = $firstLocation->created_at->diffInMinutes($lastLocation->created_at);

        return $this->formatEstimatedTime($durationMinutes);
    }

    /**
     * Obter distância total percorrida em um trajeto
     */
    public function getTotalDistance(string $orderId): float
    {
        $locations = $this->getOrderTrajectory($orderId);

        if ($locations->count() < 2) {
            return 0;
        }

        $totalDistance = 0;
        $previousLocation = null;

        foreach ($locations as $location) {
            if ($previousLocation) {
                $totalDistance += $this->calculateDistance(
                    $previousLocation->latitude,
                    $previousLocation->longitude,
                    $location->latitude,
                    $location->longitude
                );
            }
            $previousLocation = $location;
        }

        return round($totalDistance, 2);
    }
}
