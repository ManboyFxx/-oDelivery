import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import StatusToggle from '@/Components/Motoboy/StatusToggle';
import DashboardCard from '@/Components/Motoboy/DashboardCard';
import OrderCard from '@/Components/Motoboy/OrderCard';
import EmptyState from '@/Components/Motoboy/EmptyState';
import LocationTracker from '@/Components/Motoboy/LocationTracker';
import { Zap, MapPin, TrendingUp, Star, Clock, Package, CheckCircle, Navigation, Map, History } from 'lucide-react';

interface DashboardProps {
    user: any;
    summary: {
        deliveries_today: number;
        earnings_today: number;
        average_rating: number;
        status: string;
        is_online: boolean;
        pending_orders_count: number;
    };
    availableOrders: any[];
    pendingOrders: any[];
    recentDeliveries: any[];
    notificationCount: number;
}

export default function Dashboard({
    user,
    summary,
    availableOrders,
    pendingOrders,
    recentDeliveries,
    notificationCount,
}: DashboardProps) {
    const [isOnline, setIsOnline] = useState(summary.is_online);
    const [loadingOrders, setLoadingOrders] = useState<string | null>(null);
    const [toggleError, setToggleError] = useState<string | null>(null);

    const handleStatusToggle = useCallback(async (newStatus: boolean) => {
        setIsOnline(newStatus); // optimistic update
        setToggleError(null);

        try {
            const response = await fetch(route('motoboy.availability.toggle'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Falha ao atualizar status');

            const data = await response.json();
            // Sync with server truth in case of race condition
            setIsOnline(data.is_online);
        } catch (err) {
            // Rollback on failure
            setIsOnline(!newStatus);
            setToggleError('Não foi possível atualizar o status. Tente novamente.');
        }
    }, []);

    const handleAcceptOrder = async (orderId: string) => {
        setLoadingOrders(orderId);
        router.post(route('motoboy.orders.accept', orderId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setLoadingOrders(null);
            },
            onError: () => {
                setLoadingOrders(null);
            }
        });
    };

    const ratingStars = Array(Math.round(summary.average_rating))
        .fill(null)
        .map(() => '★')
        .join('');

    const [locationTracking, setLocationTracking] = useState(false);

    return (
        <MotoboyLayout title="Dashboard" subtitle="Bem-vindo ao seu painel">
            <Head title="Dashboard - ÓoDelivery Motoboy" />

            {/* Toggle error toast */}
            {toggleError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3 flex items-center justify-between">
                    <span>{toggleError}</span>
                    <button onClick={() => setToggleError(null)} className="ml-3 text-red-400 hover:text-red-600">✕</button>
                </div>
            )}

            {/* Location Tracker em background */}
            <LocationTracker
                enabled={locationTracking && isOnline}
                orderId={pendingOrders[0]?.id}
                interval={30}
            />

            <div className="space-y-6">
                {/* 1. STATUS TOGGLE (TOPO) */}
                <section>
                    <StatusToggle
                        isOnline={isOnline}
                        status={summary.status}
                        onToggle={handleStatusToggle}
                    />
                </section>

                {/* 2. PEDIDOS DISPONÍVEIS (PRIORIDADE MÁXIMA) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Pedidos Chegando
                        </h2>
                        {availableOrders.length > 0 && (
                            <span className="text-xs font-bold bg-[#ff3d03] text-white px-3 py-1 rounded-full">
                                {availableOrders.length}
                            </span>
                        )}
                    </div>

                    {availableOrders.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {availableOrders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    orderId={order.id}
                                    orderNumber={order.order_number}
                                    customerName={order.customer_name}
                                    customerPhone={order.customer_phone}
                                    deliveryAddress={order.delivery_address}
                                    total={order.total}
                                    deliveryFee={order.delivery_fee}
                                    itemsCount={order.items_count}
                                    estimatedTimeMinutes={order.estimated_time_minutes}
                                    createdAt={order.created_at}
                                    showActions={true}
                                    onAccept={handleAcceptOrder}
                                    loading={loadingOrders === order.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center opacity-70">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-bold text-gray-400">Aguardando novos pedidos...</p>
                        </div>
                    )}
                </section>

                {/* 3. PEDIDOS EM ANDAMENTO (SE HOUVER) */}
                {pendingOrders.length > 0 && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4">
                            Em Entrega
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {pendingOrders.map((order) => (
                                <div key={order.id} className="bg-white border-l-4 border-yellow-400 rounded-lg shadow-sm p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                                #{order.order_number}
                                            </span>
                                            <h3 className="font-bold text-gray-900 mt-1">{order.customer_name}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-1">{order.delivery_address}</p>
                                        </div>
                                        <Link
                                            href={route('motoboy.orders.show', order.id)}
                                            className="text-[#ff3d03] font-bold text-sm bg-orange-50 px-3 py-2 rounded-lg"
                                        >
                                            Detalhes
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. METRICAS SIMPLIFICADAS (GANHOS) - RODAPÉ */}
                <section className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Ganhos Hoje</p>
                            <p className="text-2xl font-black text-gray-900">R$ {summary.earnings_today.toFixed(2)}</p>
                        </div>
                        <Link
                            href={route('motoboy.metrics')}
                            className="text-xs font-bold text-gray-500 hover:text-[#ff3d03] flex items-center gap-1"
                        >
                            Ver tudo <TrendingUp className="w-3 h-3" />
                        </Link>
                    </div>
                </section>
            </div>
        </MotoboyLayout>
    );
}
