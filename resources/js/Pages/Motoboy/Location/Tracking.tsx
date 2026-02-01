import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import MapComponent from '@/Components/Motoboy/MapComponent';
import LocationTracker from '@/Components/Motoboy/LocationTracker';
import LocationHistory from '@/Components/Motoboy/LocationHistory';
import { ArrowLeft, Gauge, Zap, Clock, Activity } from 'lucide-react';

interface TrajectoryStatistics {
    total_distance_km: number;
    average_speed_kmh?: number;
    max_speed_kmh?: number;
    duration?: string;
    location_points_count: number;
}

interface PageProps {
    currentLocation?: {
        id: string;
        latitude: number;
        longitude: number;
        accuracy?: number;
        speed?: number;
        heading?: number;
        created_at: string;
        created_at_display: string;
    };
    currentDelivery?: {
        id: string;
        order_number: string;
        status: string;
        customer_name: string;
        customer_phone: string;
        destination_address: string;
        latitude: number;
        longitude: number;
        items_count: number;
        created_at: string;
        delivered_at?: string;
    };
    trajectory: Array<{
        lat: number;
        lng: number;
        timestamp: string;
        accuracy?: number;
        speed?: number;
    }>;
    trajectoryStatistics?: TrajectoryStatistics;
    googleMapsApiKey?: string;
}

export default function Tracking({
    currentLocation,
    currentDelivery,
    trajectory,
    trajectoryStatistics,
    googleMapsApiKey,
}: PageProps) {
    const [isTracking, setIsTracking] = useState(true);

    return (
        <MotoboyLayout>
            <Head title="Rastreamento Avançado" />

            {/* Tracker em background */}
            <LocationTracker
                enabled={isTracking}
                orderId={currentDelivery?.id}
                interval={5} // A cada 5 segundos em rastreamento avançado
            />

            {/* Header */}
            <div className="mb-6">
                <Link
                    href={route('motoboy.location.index')}
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Rastreamento Avançado</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {currentDelivery
                                ? `Acompanhe o trajeto para ${currentDelivery.customer_name}`
                                : 'Últimas localizações rastreadas'}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsTracking(!isTracking)}
                        className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                            isTracking
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                    >
                        <div
                            className={`w-3 h-3 rounded-full ${
                                isTracking ? 'bg-red-500' : 'bg-green-500'
                            } animate-pulse`}
                        />
                        {isTracking ? 'Parando...' : 'Iniciar'}
                    </button>
                </div>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Mapa - 3 colunas */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Mapa com trajeto */}
                    {googleMapsApiKey ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <MapComponent
                                currentLocation={
                                    currentLocation
                                        ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
                                        : undefined
                                }
                                destinationLocation={
                                    currentDelivery
                                        ? { lat: currentDelivery.latitude, lng: currentDelivery.longitude }
                                        : undefined
                                }
                                trajectoryCoordinates={trajectory}
                                zoom={15}
                                apiKey={googleMapsApiKey}
                                height="600px"
                                showTrajectory={trajectory.length > 0}
                            />
                        </div>
                    ) : (
                        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center">
                            <p className="text-blue-700 font-medium">
                                Google Maps API não configurada
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar - Estatísticas */}
                <div className="space-y-4">
                    {/* Informações do pedido */}
                    {currentDelivery && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 p-4">
                            <h3 className="font-bold text-blue-900 mb-3 text-sm uppercase">
                                Pedido #{currentDelivery.order_number}
                            </h3>

                            <div className="space-y-2 text-sm">
                                <div>
                                    <p className="text-blue-600 text-xs font-bold">CLIENTE</p>
                                    <p className="text-blue-900 font-bold">
                                        {currentDelivery.customer_name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-blue-600 text-xs font-bold">TELEFONE</p>
                                    <a
                                        href={`tel:${currentDelivery.customer_phone}`}
                                        className="text-blue-700 hover:text-blue-900 font-semibold"
                                    >
                                        {currentDelivery.customer_phone}
                                    </a>
                                </div>

                                <div>
                                    <p className="text-blue-600 text-xs font-bold">STATUS</p>
                                    <p className="text-blue-900 font-bold capitalize">
                                        {currentDelivery.status === 'on_delivery' && 'Em Entrega'}
                                        {currentDelivery.status === 'delivered' && '✅ Entregue'}
                                        {currentDelivery.status === 'with_motoboy' && 'Com Motoboy'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-blue-600 text-xs font-bold">ITENS</p>
                                    <p className="text-blue-900 font-bold">
                                        {currentDelivery.items_count}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Estatísticas do trajeto */}
                    {trajectoryStatistics && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                            <h4 className="font-bold text-gray-900 text-sm uppercase mb-4">
                                Estatísticas
                            </h4>

                            {/* Distância total */}
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-green-600 text-xs font-bold">DISTÂNCIA</p>
                                    <p className="text-green-900 font-black text-lg">
                                        {trajectoryStatistics.total_distance_km.toFixed(2)} km
                                    </p>
                                </div>
                            </div>

                            {/* Velocidade média */}
                            {trajectoryStatistics.average_speed_kmh && (
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <Gauge className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-blue-600 text-xs font-bold">VEL. MÉDIA</p>
                                        <p className="text-blue-900 font-black text-lg">
                                            {trajectoryStatistics.average_speed_kmh.toFixed(1)} km/h
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Velocidade máxima */}
                            {trajectoryStatistics.max_speed_kmh && (
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <Activity className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-orange-600 text-xs font-bold">VEL. MÁXIMA</p>
                                        <p className="text-orange-900 font-black text-lg">
                                            {trajectoryStatistics.max_speed_kmh.toFixed(1)} km/h
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Duração */}
                            {trajectoryStatistics.duration && (
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-purple-600 text-xs font-bold">DURAÇÃO</p>
                                        <p className="text-purple-900 font-black text-lg">
                                            {trajectoryStatistics.duration}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Pontos de localização */}
                            <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                                <strong>{trajectoryStatistics.location_points_count}</strong> pontos
                                de localização
                            </div>
                        </div>
                    )}

                    {/* Localização atual */}
                    {currentLocation && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase">
                                Localização Atual
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="p-2 bg-gray-50 rounded font-mono">
                                    <p>{currentLocation.latitude.toFixed(6)}</p>
                                    <p>{currentLocation.longitude.toFixed(6)}</p>
                                </div>
                                {currentLocation.accuracy && (
                                    <p className="text-gray-600">
                                        Precisão: ±{currentLocation.accuracy.toFixed(1)} m
                                    </p>
                                )}
                                {currentLocation.speed !== undefined && (
                                    <p className="text-gray-600">
                                        Velocidade: {(currentLocation.speed * 3.6).toFixed(1)} km/h
                                    </p>
                                )}
                                <p className="text-gray-500 pt-2 border-t border-gray-200">
                                    {currentLocation.created_at_display}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Histórico de localizações */}
            {trajectory.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-4">
                        Histórico de Posições
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
                        maxItems={30}
                    />
                </div>
            )}
        </MotoboyLayout>
    );
}
