import { Head, Link } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import MapComponent from '@/Components/Motoboy/MapComponent';
import LocationHistory from '@/Components/Motoboy/LocationHistory';
import { ArrowLeft, User, Phone, MapPin, Package, Calendar, Zap, Gauge, Clock, Activity } from 'lucide-react';

interface DeliveryData {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    destination_address: string;
    status: string;
    created_at: string;
    delivered_at_display: string;
    items_count: number;
}

interface TrajectoryPoint {
    lat: number;
    lng: number;
    timestamp: string;
    accuracy?: number;
    speed?: number;
}

interface Statistics {
    total_distance_km: number;
    total_distance_formatted: string;
    average_speed_kmh?: number;
    max_speed_kmh?: number;
    duration?: string;
    location_points_count: number;
}

interface PageProps {
    delivery: DeliveryData;
    trajectory: TrajectoryPoint[];
    statistics: Statistics;
    googleMapsApiKey?: string;
}

export default function DeliveryDetail({
    delivery,
    trajectory,
    statistics,
    googleMapsApiKey,
}: PageProps) {
    return (
        <MotoboyLayout>
            <Head title={`Trajeto #${delivery.order_number}`} />

            {/* Header */}
            <div className="mb-6">
                <Link
                    href={route('motoboy.location.history')}
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">
                            Trajeto da Entrega #{delivery.order_number}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Detalhes completos do trajeto
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Mapa - 2 colunas */}
                <div className="lg:col-span-2">
                    {googleMapsApiKey ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <MapComponent
                                destinationLocation={{
                                    lat: parseFloat(delivery.customer_name), // Placeholder
                                    lng: parseFloat(delivery.destination_address), // Placeholder
                                }}
                                trajectoryCoordinates={trajectory}
                                zoom={15}
                                apiKey={googleMapsApiKey}
                                height="500px"
                                showTrajectory={trajectory.length > 0}
                            />
                        </div>
                    ) : (
                        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center h-500">
                            <p className="text-blue-700 font-medium">
                                Google Maps API não configurada
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar - Informações da entrega */}
                <div className="space-y-4">
                    {/* Card de entrega */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 p-5">
                        <h3 className="text-lg font-black text-orange-900 mb-4">
                            Informações da Entrega
                        </h3>

                        <div className="space-y-4">
                            {/* Número do pedido */}
                            <div className="flex items-center gap-3 pb-3 border-b border-orange-200">
                                <Package className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                <div>
                                    <p className="text-orange-600 text-xs font-bold">PEDIDO</p>
                                    <p className="text-orange-900 font-black text-lg">
                                        #{delivery.order_number}
                                    </p>
                                </div>
                            </div>

                            {/* Cliente */}
                            <div className="flex items-center gap-3 pb-3 border-b border-orange-200">
                                <User className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-orange-600 text-xs font-bold">CLIENTE</p>
                                    <p className="text-orange-900 font-bold">
                                        {delivery.customer_name}
                                    </p>
                                </div>
                            </div>

                            {/* Telefone */}
                            <div className="flex items-center gap-3 pb-3 border-b border-orange-200">
                                <Phone className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                <a
                                    href={`tel:${delivery.customer_phone}`}
                                    className="text-orange-700 hover:text-orange-900 font-semibold flex-1"
                                >
                                    {delivery.customer_phone}
                                </a>
                            </div>

                            {/* Endereço */}
                            <div className="flex gap-3">
                                <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-orange-600 text-xs font-bold">ENDEREÇO</p>
                                    <p className="text-orange-900 font-bold text-sm line-clamp-2">
                                        {delivery.destination_address}
                                    </p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="pt-3 border-t border-orange-200">
                                <p className="text-orange-600 text-xs font-bold">STATUS</p>
                                <p className="text-orange-900 font-bold capitalize">
                                    {delivery.status === 'delivered' && '✅ Entregue'}
                                    {delivery.status === 'on_delivery' && '📍 Em Entrega'}
                                </p>
                            </div>

                            {/* Datas */}
                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-orange-200">
                                <div>
                                    <p className="text-orange-600 text-xs font-bold">CRIADO</p>
                                    <p className="text-orange-900 font-bold text-xs">
                                        {new Date(delivery.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                {delivery.delivered_at_display && (
                                    <div>
                                        <p className="text-orange-600 text-xs font-bold">ENTREGUE</p>
                                        <p className="text-orange-900 font-bold text-xs">
                                            {delivery.delivered_at_display.split(' ')[0]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Itens */}
                            <div className="pt-3 border-t border-orange-200">
                                <p className="text-orange-600 text-xs font-bold">ITENS</p>
                                <p className="text-orange-900 font-bold text-lg">
                                    {delivery.items_count}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card de estatísticas */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                        <h4 className="font-bold text-gray-900 text-sm uppercase">
                            Estatísticas do Trajeto
                        </h4>

                        {/* Distância */}
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-green-600 text-xs font-bold">DISTÂNCIA</p>
                                <p className="text-green-900 font-black">
                                    {statistics.total_distance_formatted}
                                </p>
                            </div>
                        </div>

                        {/* Velocidade média */}
                        {statistics.average_speed_kmh && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <Gauge className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-blue-600 text-xs font-bold">VEL. MÉDIA</p>
                                    <p className="text-blue-900 font-black">
                                        {statistics.average_speed_kmh.toFixed(1)} km/h
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Velocidade máxima */}
                        {statistics.max_speed_kmh && (
                            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <Activity className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-orange-600 text-xs font-bold">VEL. MÁXIMA</p>
                                    <p className="text-orange-900 font-black">
                                        {statistics.max_speed_kmh.toFixed(1)} km/h
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Duração */}
                        {statistics.duration && (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-purple-600 text-xs font-bold">DURAÇÃO</p>
                                    <p className="text-purple-900 font-black">
                                        {statistics.duration}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Pontos de localização */}
                        <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded border border-gray-200">
                            <strong>{statistics.location_points_count}</strong> pontos de
                            localização registrados
                        </div>
                    </div>
                </div>
            </div>

            {/* Histórico de localizações */}
            {trajectory.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-4">
                        Histórico Completo de Posições
                    </h2>
                    <LocationHistory
                        locations={trajectory.map((point, index) => ({
                            id: `point-${index}`,
                            latitude: point.lat,
                            longitude: point.lng,
                            timestamp: point.timestamp,
                            accuracy: point.accuracy,
                            speed: point.speed,
                        }))}
                        maxItems={50}
                    />
                </div>
            )}
        </MotoboyLayout>
    );
}
