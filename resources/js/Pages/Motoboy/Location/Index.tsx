import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import MapComponent from '@/Components/Motoboy/MapComponent';
import DistanceDisplay from '@/Components/Motoboy/DistanceDisplay';
import LocationTracker from '@/Components/Motoboy/LocationTracker';
import { MapPin, Navigation, History } from 'lucide-react';

interface PageProps {
    currentLocation?: {
        id: string;
        latitude: number;
        longitude: number;
        accuracy?: number;
        speed?: number;
        heading?: number;
        created_at: string;
    };
    currentDelivery?: {
        id: string;
        order_number: string;
        customer_name: string;
        customer_phone: string;
        destination_address: string;
        latitude: number;
        longitude: number;
    };
    distanceToCustomer?: number;
    distanceFormatted?: string;
    estimatedTimeMinutes?: number;
    estimatedTimeFormatted?: string;
    googleMapsApiKey?: string;
}

export default function LocationIndex({
    currentLocation,
    currentDelivery,
    distanceToCustomer,
    distanceFormatted,
    estimatedTimeMinutes,
    estimatedTimeFormatted,
    googleMapsApiKey,
}: PageProps) {
    const [isTracking, setIsTracking] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    const handleLocationUpdate = (location: any) => {
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    };

    const handleTrackerError = (error: string) => {
        console.error('Rastreamento error:', error);
    };

    return (
        <MotoboyLayout>
            <Head title="Localização" />

            {/* Tracker em background */}
            <LocationTracker
                enabled={isTracking}
                orderId={currentDelivery?.id}
                interval={10}
                onLocationUpdate={handleLocationUpdate}
                onError={handleTrackerError}
            />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Localização em Tempo Real</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Acompanhe sua posição e trajeto até o cliente
                    </p>
                </div>

                {/* Botão de rastreamento */}
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
                    {isTracking ? 'Parando...' : 'Iniciar Rastreamento'}
                </button>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna principal - Mapa */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mapa */}
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
                                zoom={currentDelivery ? 16 : 15}
                                apiKey={googleMapsApiKey}
                                height="500px"
                                showTrajectory={false}
                            />
                        </div>
                    ) : (
                        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center">
                            <MapPin className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                            <p className="text-blue-700 font-medium">
                                Google Maps API não configurada
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                                Configure a chave de API em .env
                            </p>
                        </div>
                    )}

                    {/* Informações de distância */}
                    {currentDelivery && (
                        <DistanceDisplay
                            distanceKm={distanceToCustomer}
                            distanceFormatted={distanceFormatted}
                            estimatedTimeMinutes={estimatedTimeMinutes}
                            estimatedTimeFormatted={estimatedTimeFormatted}
                            currentSpeed={currentLocation?.speed}
                        />
                    )}
                </div>

                {/* Sidebar - Info do cliente e controles */}
                <div className="space-y-4">
                    {/* Entrega atual */}
                    {currentDelivery ? (
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 p-6">
                            <h3 className="text-lg font-black text-orange-900 mb-4">
                                Pedido em Entrega
                            </h3>

                            <div className="space-y-3 text-sm">
                                {/* Número do pedido */}
                                <div>
                                    <p className="text-orange-600 font-bold uppercase text-xs">
                                        Pedido
                                    </p>
                                    <p className="text-orange-900 font-black text-lg">
                                        #{currentDelivery.order_number}
                                    </p>
                                </div>

                                {/* Cliente */}
                                <div className="border-t border-orange-200 pt-3">
                                    <p className="text-orange-600 font-bold uppercase text-xs">
                                        Cliente
                                    </p>
                                    <p className="text-orange-900 font-bold">
                                        {currentDelivery.customer_name}
                                    </p>
                                    <a
                                        href={`tel:${currentDelivery.customer_phone}`}
                                        className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 mt-1"
                                    >
                                        📞 {currentDelivery.customer_phone}
                                    </a>
                                </div>

                                {/* Endereço */}
                                <div className="border-t border-orange-200 pt-3">
                                    <p className="text-orange-600 font-bold uppercase text-xs">
                                        Endereço
                                    </p>
                                    <p className="text-orange-900 font-semibold line-clamp-2">
                                        {currentDelivery.destination_address}
                                    </p>
                                </div>

                                {/* Distância */}
                                {distanceFormatted && (
                                    <div className="border-t border-orange-200 pt-3">
                                        <p className="text-orange-600 font-bold uppercase text-xs">
                                            Distância
                                        </p>
                                        <p className="text-orange-900 font-black text-lg">
                                            {distanceFormatted}
                                        </p>
                                        {estimatedTimeFormatted && (
                                            <p className="text-orange-700 text-xs mt-1">
                                                ⏱️ {estimatedTimeFormatted}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Botões de ação */}
                            <div className="mt-4 space-y-2">
                                <Link
                                    href={route('motoboy.orders.show', currentDelivery.id)}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors block text-center"
                                >
                                    Ver Detalhes
                                </Link>

                                <Link
                                    href={route('motoboy.location.tracking')}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Rastreamento Avançado
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center">
                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">
                                Nenhum pedido em entrega
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                Aceite um pedido para começar a rastrear
                            </p>
                            <Link
                                href={route('motoboy.orders.index')}
                                className="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                            >
                                Ver Pedidos
                            </Link>
                        </div>
                    )}

                    {/* Localização atual */}
                    {currentLocation && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                Sua Localização
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs font-bold">
                                        COORDENADAS
                                    </p>
                                    <p className="text-gray-900 font-mono text-xs font-bold">
                                        {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                                    </p>
                                </div>
                                {currentLocation.accuracy && (
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold">
                                            PRECISÃO
                                        </p>
                                        <p className="text-gray-900 font-semibold">
                                            ±{currentLocation.accuracy.toFixed(1)} m
                                        </p>
                                    </div>
                                )}
                                {currentLocation.speed !== undefined && (
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold">
                                            VELOCIDADE
                                        </p>
                                        <p className="text-gray-900 font-semibold">
                                            {(currentLocation.speed * 3.6).toFixed(1)} km/h
                                        </p>
                                    </div>
                                )}
                                {lastUpdate && (
                                    <div className="border-t border-gray-200 pt-2 mt-2">
                                        <p className="text-gray-500 text-xs">
                                            Atualizado: {lastUpdate}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Botão para histórico */}
                    <Link
                        href={route('motoboy.location.history')}
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        <History className="w-4 h-4" />
                        Ver Histórico
                    </Link>
                </div>
            </div>
        </MotoboyLayout>
    );
}
