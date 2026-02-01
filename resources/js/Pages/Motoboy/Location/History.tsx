import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import { ArrowLeft, Map, Zap, Clock, Gauge } from 'lucide-react';

interface Delivery {
    id: string;
    order_number: string;
    customer_name: string;
    delivered_at: string;
    delivered_at_display: string;
    total_distance_km: number;
    total_distance_formatted: string;
    duration?: string;
    average_speed_kmh?: number;
    location_points_count: number;
}

interface MonthStatistics {
    total_deliveries: number;
    total_distance_km: number;
    total_distance_formatted: string;
    average_distance_per_delivery: number;
    location_updates_count: number;
}

interface PageProps {
    deliveries: Delivery[];
    deliveriesCount: number;
    monthStatistics: MonthStatistics;
    googleMapsApiKey?: string;
}

export default function History({
    deliveries,
    deliveriesCount,
    monthStatistics,
    googleMapsApiKey,
}: PageProps) {
    const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

    return (
        <MotoboyLayout>
            <Head title="Histórico de Trajetos" />

            {/* Header */}
            <div className="mb-6">
                <Link
                    href={route('motoboy.location.index')}
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </Link>

                <h1 className="text-3xl font-black text-gray-900">Histórico de Trajetos</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Acompanhe todos os seus trajetos e entregas
                </p>
            </div>

            {/* Estatísticas do mês */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Total de entregas */}
                <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
                    <p className="text-blue-600 text-xs font-bold uppercase">Entregas Mês</p>
                    <p className="text-3xl font-black text-blue-900 mt-2">
                        {monthStatistics.total_deliveries}
                    </p>
                </div>

                {/* Distância total */}
                <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
                    <p className="text-green-600 text-xs font-bold uppercase">Distância Total</p>
                    <p className="text-2xl font-black text-green-900 mt-2">
                        {monthStatistics.total_distance_formatted}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                        {monthStatistics.total_distance_km.toFixed(1)} km
                    </p>
                </div>

                {/* Distância média por entrega */}
                <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4">
                    <p className="text-orange-600 text-xs font-bold uppercase">Média por Entrega</p>
                    <p className="text-2xl font-black text-orange-900 mt-2">
                        {monthStatistics.average_distance_per_delivery.toFixed(1)} km
                    </p>
                </div>

                {/* Total de pontos de localização */}
                <div className="bg-purple-50 rounded-2xl border border-purple-200 p-4">
                    <p className="text-purple-600 text-xs font-bold uppercase">Localizações</p>
                    <p className="text-3xl font-black text-purple-900 mt-2">
                        {monthStatistics.location_updates_count}
                    </p>
                </div>
            </div>

            {/* Lista de entregas */}
            <div className="space-y-3">
                {deliveries.length > 0 ? (
                    deliveries.map((delivery) => (
                        <div
                            key={delivery.id}
                            className="bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden"
                        >
                            <button
                                onClick={() =>
                                    setSelectedDelivery(
                                        selectedDelivery === delivery.id ? null : delivery.id
                                    )
                                }
                                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    {/* Informações principais */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-bold text-orange-600">
                                                    #{delivery.order_number}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">
                                                    {delivery.customer_name}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {delivery.delivered_at_display}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Distância */}
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p className="text-sm font-bold text-gray-900">
                                            {delivery.total_distance_formatted}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {delivery.total_distance_km.toFixed(1)} km
                                        </p>
                                    </div>
                                </div>

                                {/* Detalhes expandidos */}
                                {selectedDelivery === delivery.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {/* Duração */}
                                            {delivery.duration && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Duração
                                                        </p>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {delivery.duration}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Velocidade média */}
                                            {delivery.average_speed_kmh && (
                                                <div className="flex items-center gap-2">
                                                    <Gauge className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Vel. Média
                                                        </p>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {delivery.average_speed_kmh.toFixed(1)}{' '}
                                                            km/h
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Pontos de localização */}
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Pontos
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {delivery.location_points_count}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Botão de visualizar */}
                                            <Link
                                                href={route(
                                                    'motoboy.location.delivery',
                                                    delivery.id
                                                )}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-lg transition-colors"
                                            >
                                                <Map className="w-4 h-4" />
                                                Ver Mapa
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 text-center">
                        <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">
                            Nenhum trajeto registrado
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Complete entregas para ver o histórico de trajetos
                        </p>
                    </div>
                )}
            </div>

            {/* Info adicional */}
            {deliveries.length > 0 && (
                <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-200 p-4 text-center text-sm text-blue-700">
                    Mostrando {deliveriesCount} entregas do mês. Clique em uma entrega para ver
                    mais detalhes.
                </div>
            )}
        </MotoboyLayout>
    );
}
