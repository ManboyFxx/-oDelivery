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
        $user = auth()->user();
        $pendingOrders = $this->orderService->getPendingOrders($user->id);
        $recentDeliveries = $this->orderService->getRecentDeliveries($user->id, 20);

        return Inertia::render('Motoboy/Orders/Index', [
            'pendingOrders' => $pendingOrders,
            'recentDeliveries' => $recentDeliveries,
        ]);
    }

    /**
     * Exibir detalhe de um pedido
     */
    public function showOrder($orderId)
    {
        $order = $this->orderService->getOrderDetail($orderId);

        return Inertia::render('Motoboy/Orders/Show', [
            'order' => $order,
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
        $user = auth()->user();
        $summary = $this->summaryService->getSummary($user->id);
        $recentDeliveries = $this->orderService->getRecentDeliveries($user->id, 10); // More history for metrics page

        return Inertia::render('Motoboy/Metrics', [
            'summary' => $summary,
            'recentDeliveries' => $recentDeliveries,
        ]);
    }

    /**
     * Exibir notificações
     */
    public function notifications()
    {
        return Inertia::render('Motoboy/Notifications');
    }

    /**
     * Aceitar um pedido
     */
    public function acceptOrder($orderId)
    {
        $user = auth()->user();
        try {
            $this->orderService->acceptOrder($orderId, $user->id);
            return back()->with('success', 'Pedido aceito com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erro ao aceitar pedido: ' . $e->getMessage()]);
        }
    }

    /**
     * Iniciar entrega
     */
    public function startDelivery($orderId)
    {
        try {
            $this->orderService->startDelivery($orderId);
            return back()->with('success', 'Entrega iniciada!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erro ao iniciar entrega: ' . $e->getMessage()]);
        }
    }

    /**
     * Confirmar entrega
     */
    public function deliverOrder($orderId)
    {
        try {
            $this->orderService->deliverOrder($orderId);
            return back()->with('success', 'Pedido entregue com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erro ao confirmar entrega: ' . $e->getMessage()]);
        }
    }
}
