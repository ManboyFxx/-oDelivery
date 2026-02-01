<?php

namespace App\Services;

use App\Models\MotoboyAvailability;
use App\Models\User;

class MotoboyAvailabilityService
{
    /**
     * Obter disponibilidade atual do motoboy
     */
    public function getAvailability(string $userId): ?MotoboyAvailability
    {
        return MotoboyAvailability::where('user_id', $userId)->first();
    }

    /**
     * Atualizar status de disponibilidade
     */
    public function updateAvailability(string $userId, string $status): MotoboyAvailability
    {
        $availability = MotoboyAvailability::where('user_id', $userId)
            ->first();

        if (!$availability) {
            // Criar se não existir
            $availability = MotoboyAvailability::create([
                'user_id' => $userId,
                'availability_status' => $status,
                'is_online' => in_array($status, ['available', 'on_delivery']),
                'last_activity_at' => now(),
            ]);
        } else {
            // Atualizar
            $availability->update([
                'availability_status' => $status,
                'is_online' => in_array($status, ['available', 'on_delivery']),
                'last_activity_at' => now(),
            ]);
        }

        return $availability;
    }

    /**
     * Alternar entre online e offline
     */
    public function toggleOnline(string $userId): MotoboyAvailability
    {
        $availability = $this->getAvailability($userId);

        if (!$availability) {
            return $this->updateAvailability($userId, 'available');
        }

        $newStatus = $availability->is_online ? 'offline' : 'available';

        return $this->updateAvailability($userId, $newStatus);
    }

    /**
     * Definir como online e disponível
     */
    public function goOnline(string $userId): MotoboyAvailability
    {
        return $this->updateAvailability($userId, 'available');
    }

    /**
     * Definir como offline
     */
    public function goOffline(string $userId): MotoboyAvailability
    {
        return $this->updateAvailability($userId, 'offline');
    }

    /**
     * Definir como em pausa/intervalo
     */
    public function goOnBreak(string $userId): MotoboyAvailability
    {
        return $this->updateAvailability($userId, 'break');
    }

    /**
     * Definir como em entrega
     */
    public function setOnDelivery(string $userId): MotoboyAvailability
    {
        return $this->updateAvailability($userId, 'on_delivery');
    }

    /**
     * Verificar se está online
     */
    public function isOnline(string $userId): bool
    {
        $availability = $this->getAvailability($userId);
        return $availability?->is_online ?? false;
    }

    /**
     * Obter status em formato legível
     */
    public function getStatusLabel(string $status): string
    {
        return match ($status) {
            'available' => 'Disponível',
            'on_delivery' => 'Em Entrega',
            'break' => 'Pausa',
            'offline' => 'Offline',
            default => 'Desconhecido',
        };
    }

    /**
     * Obter cor do status
     */
    public function getStatusColor(string $status): string
    {
        return match ($status) {
            'available' => 'green',
            'on_delivery' => 'blue',
            'break' => 'yellow',
            'offline' => 'gray',
            default => 'gray',
        };
    }
}
