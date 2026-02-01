<?php

namespace App\Http\Controllers\Motoboy;

use App\Http\Controllers\Controller;
use App\Services\MotoboySummaryService;
use App\Services\MotoboyOrderService;
use App\Services\MotoboyAvailabilityService;
use App\Models\Notification;
use Inertia\Inertia;

class MotoboysController extends Controller
{
    protected $summaryService;
    protected $orderService;
    protected $availabilityService;

    public function __construct(
        MotoboySummaryService $summaryService,
        MotoboyOrderService $orderService,
        MotoboyAvailabilityService $availabilityService
    ) {
        $this->summaryService = $summaryService;
        $this->orderService = $orderService;
        $this->availabilityService = $availabilityService;
    }

    /**
     * Exibir o dashboard do motoboy
     */
    public function dashboard()
    {
        $user = auth()->user();
        $summary = $this->summaryService->getSummary($user->id);
        $availableOrders = $this->orderService->getAvailableOrders($user->id, 5);
        $pendingOrders = $this->orderService->getPendingOrders($user->id);
        $recentDeliveries = $this->orderService->getRecentDeliveries($user->id, 5);

        // Contar notificações não lidas
        $notificationCount = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Motoboy/Dashboard', [
            'user' => $user,
            'summary' => $summary,
            'availableOrders' => $availableOrders,
            'pendingOrders' => $pendingOrders,
            'recentDeliveries' => $recentDeliveries,
            'notificationCount' => $notificationCount,
        ]);
    }

    /**
     * Exibir o perfil do motoboy
     */
    public function profile()
    {
        $user = auth()->user();

        return Inertia::render('Motoboy/Profile', [
            'user' => $user,
        ]);
    }

    /**
     * Exibir lista de pedidos
     */
    public function orders()
    {
        return Inertia::render('Motoboy/Orders/Index');
    }

    /**
     * Exibir detalhe de um pedido
     */
    public function showOrder($orderId)
    {
        return Inertia::render('Motoboy/Orders/Show', [
            'orderId' => $orderId,
        ]);
    }

    /**
     * Exibir histórico de entregas
     */
    public function history()
    {
        return Inertia::render('Motoboy/History');
    }

    /**
     * Exibir métricas e desempenho
     */
    public function metrics()
    {
        return Inertia::render('Motoboy/Metrics');
    }

    /**
     * Exibir notificações
     */
    public function notifications()
    {
        return Inertia::render('Motoboy/Notifications');
    }
}
