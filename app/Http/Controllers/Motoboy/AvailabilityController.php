<?php

namespace App\Http\Controllers\Motoboy;

use App\Http\Controllers\Controller;
use App\Services\MotoboyAvailabilityService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class AvailabilityController extends Controller
{
    protected $availabilityService;

    public function __construct(MotoboyAvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }

    /**
     * Alternar status de disponibilidade (online/offline)
     */
    public function toggle(Request $request): JsonResponse
    {
        $user = auth()->user();

        try {
            $availability = $this->availabilityService->toggleOnline($user->id);

            return response()->json([
                'success' => true,
                'message' => $availability->is_online ? 'Você está ONLINE' : 'Você está OFFLINE',
                'is_online' => $availability->is_online,
                'status' => $availability->availability_status,
                'status_label' => $this->availabilityService->getStatusLabel($availability->availability_status),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Definir status específico de disponibilidade
     */
    public function update(Request $request): JsonResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'status' => 'required|in:available,on_delivery,break,offline',
        ]);

        try {
            $availability = $this->availabilityService->updateAvailability(
                $user->id,
                $validated['status']
            );

            return response()->json([
                'success' => true,
                'message' => 'Status atualizado para: ' . $this->availabilityService->getStatusLabel($validated['status']),
                'is_online' => $availability->is_online,
                'status' => $availability->availability_status,
                'status_label' => $this->availabilityService->getStatusLabel($availability->availability_status),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obter status atual
     */
    public function show(Request $request): JsonResponse
    {
        $user = auth()->user();
        $availability = $this->availabilityService->getAvailability($user->id);

        if (!$availability) {
            // Criar se não existir
            $availability = $this->availabilityService->updateAvailability($user->id, 'offline');
        }

        return response()->json([
            'is_online' => $availability->is_online,
            'status' => $availability->availability_status,
            'status_label' => $this->availabilityService->getStatusLabel($availability->availability_status),
            'last_activity_at' => $availability->last_activity_at?->format('Y-m-d H:i:s'),
        ], 200);
    }
}
