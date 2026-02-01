import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
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

    const handleStatusToggle = async (newStatus: boolean) => {
        setIsOnline(newStatus);
        // TODO: POST para atualizar no backend
    };

    const handleAcceptOrder = async (orderId: string) => {
        setLoadingOrders(orderId);
        try {
            // TODO: POST para aceitar pedido
            console.log('Aceitar pedido:', orderId);
        } finally {
            setLoadingOrders(null);
        }
    };

    const ratingStars = Array(Math.round(summary.average_rating))
        .fill(null)
        .map(() => '★')
        .join('');

    const [locationTracking, setLocationTracking] = useState(false);

    return (
        <MotoboyLayout title="Dashboard" subtitle="Bem-vindo ao seu painel">
            <Head title="Dashboard - ÓoDelivery Motoboy" />

            {/* Location Tracker em background */}
            <LocationTracker
                enabled={locationTracking && isOnline}
                orderId={pendingOrders[0]?.id}
                interval={30}
            />

            <div className="space-y-8">
                {/* STATUS SECTION */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4">
                        Situação Atual
                    </h2>
                    <StatusToggle
                        isOnline={isOnline}
                        status={summary.status}
                        onToggle={handleStatusToggle}
                    />
                </section>

                {/* KPI CARDS */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4">
                        Métricas do Dia
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <DashboardCard
                            icon={Zap}
                            label="Entregas"
                            value={summary.deliveries_today}
                            color="orange"
                            subtitle="completadas hoje"
                        />
                        <DashboardCard
                            icon={TrendingUp}
                            label="Ganho"
                            value={`R$ ${summary.earnings_today.toFixed(2)}`}
                            color="green"
                            subtitle="do dia"
                        />
                        <DashboardCard
                            icon={Star}
                            label="Avaliação"
                            value={summary.average_rating > 0 ? summary.average_rating.toFixed(1) : '---'}
                            subtitle={summary.average_rating > 0 ? ratingStars : 'sem avaliações'}
                            color="purple"
                        />
                        <DashboardCard
                            icon={Package}
                            label="Pendentes"
                            value={summary.pending_orders_count}
                            color="blue"
                            subtitle="em processo"
                        />
                    </div>
                </section>

                {/* GEOLOCALIZAÇÃO */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4">
                        Geolocalização
                    </h2>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Status de rastreamento */}
                            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-blue-100">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    locationTracking
                                        ? 'bg-green-100 text-green-600 animate-pulse'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    <Navigation className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-600 uppercase">Status</p>
                                    <p className="text-sm font-black text-gray-900">
                                        {locationTracking ? '🔴 Rastreando' : '⚪ Desativado'}
                                    </p>
                                    <button
                                        onClick={() => setLocationTracking(!locationTracking)}
                                        className={`text-xs font-bold mt-2 px-3 py-1 rounded transition-colors ${
                                            locationTracking
                                                ? 'text-red-600 hover:text-red-700'
                                                : 'text-blue-600 hover:text-blue-700'
                                        }`}
                                    >
                                        {locationTracking ? 'Desativar' : 'Ativar'}
                                    </button>
                                </div>
                            </div>

                            {/* Link para mapa em tempo real */}
                            <Link
                                href={route('motoboy.location.index')}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                    <Map className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-600 uppercase">Mapa</p>
                                    <p className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                        Localização Atual
                                    </p>
                                </div>
                                <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
                            </Link>

                            {/* Link para rastreamento avançado */}
                            {pendingOrders.length > 0 && (
                                <Link
                                    href={route('motoboy.location.tracking')}
                                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                        <Navigation className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-600 uppercase">Trajeto</p>
                                        <p className="text-sm font-black text-gray-900 group-hover:text-purple-600 transition-colors">
                                            Rastreamento
                                        </p>
                                    </div>
                                    <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
                                </Link>
                            )}

                            {/* Link para histórico */}
                            <Link
                                href={route('motoboy.location.history')}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <History className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-600 uppercase">Histórico</p>
                                    <p className="text-sm font-black text-gray-900 group-hover:text-green-600 transition-colors">
                                        Trajetos
                                    </p>
                                </div>
                                <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
                            </Link>
                        </div>
                        <p className="text-xs text-blue-700 mt-4 text-center">
                            ℹ️ Ative o rastreamento para começar a registrar sua localização em tempo real
                        </p>
                    </div>
                </section>

                {/* PEDIDOS DISPONÍVEIS */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-600">
                            Próximos Pedidos Disponíveis
                        </h2>
                        {availableOrders.length > 0 && (
                            <span className="text-xs font-bold bg-[#ff3d03] text-white px-3 py-1 rounded-full">
                                {availableOrders.length} pedido{availableOrders.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {availableOrders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
                            <EmptyState
                                icon={Package}
                                title="Nenhum pedido disponível"
                                description="Quando novos pedidos chegarem, eles aparecerão aqui. Fique atento!"
                            />
                        </div>
                    )}
                </section>

                {/* PEDIDOS EM ENTREGA */}
                {pendingOrders.length > 0 && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4">
                            Pedidos em Entrega
                        </h2>
                        <div className="bg-white rounded-2xl border-2 border-yellow-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-yellow-200 bg-yellow-50">
                                            <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-900">
                                                Pedido
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-900">
                                                Cliente
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-900">
                                                Endereço
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-900">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-yellow-100">
                                        {pendingOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-yellow-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-black text-gray-900">#{order.order_number}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900">{order.customer_name}</p>
                                                    <p className="text-xs text-gray-600">{order.customer_phone}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-700 line-clamp-1">
                                                        {order.delivery_address}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`
                                                        text-xs font-black px-3 py-1 rounded-full
                                                        ${order.status_code === 'out_for_delivery'
                                                            ? 'bg-green-100 text-green-700'
                                                            : order.status_code === 'motoboy_accepted'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }
                                                    `}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {/* ÚLTIMAS ENTREGAS */}
                {recentDeliveries.length > 0 && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4">
                            Últimas Entregas
                        </h2>
                        <div className="bg-white rounded-2xl border-2 border-green-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-green-200 bg-green-50">
                                            <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-900">
                                                Pedido
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-900">
                                                Cliente
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-900">
                                                Hora
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-900">
                                                Valor
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-900">
                                                Avaliação
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-green-100">
                                        {recentDeliveries.map((delivery) => (
                                            <tr key={delivery.id} className="hover:bg-green-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-black text-gray-900">#{delivery.order_number}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900">{delivery.customer_name}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {delivery.delivered_at}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-green-700">
                                                        R$ {delivery.delivery_fee.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-lg">{delivery.rating_stars}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </MotoboyLayout>
    );
}
