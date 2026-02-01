import { MapPin, Clock, Gauge, TrendingUp } from 'lucide-react';

interface LocationPoint {
    id: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    created_at?: string;
    created_at_display?: string;
    timestamp?: string;
}

interface LocationHistoryProps {
    locations: LocationPoint[];
    loading?: boolean;
    maxItems?: number;
}

/**
 * Componente que exibe histórico de localizações
 */
export default function LocationHistory({
    locations,
    loading = false,
    maxItems = 20,
}: LocationHistoryProps) {
    const displayLocations = locations.slice(0, maxItems);

    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="bg-gray-100 rounded-lg p-4 h-16 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (displayLocations.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm font-medium">
                    Nenhuma localização registrada
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {displayLocations.map((location, index) => (
                <div
                    key={location.id || index}
                    className="bg-white rounded-lg p-4 border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all"
                >
                    <div className="flex items-start gap-4">
                        {/* Número */}
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <span className="text-sm font-bold text-orange-600">
                                    {index + 1}
                                </span>
                            </div>
                        </div>

                        {/* Informações principais */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <p className="text-sm font-bold text-gray-800">
                                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs">
                                {/* Timestamp */}
                                {(location.created_at_display || location.timestamp) && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span>
                                            {location.created_at_display ||
                                                (location.timestamp
                                                    ? new Date(location.timestamp).toLocaleTimeString('pt-BR')
                                                    : '—')}
                                        </span>
                                    </div>
                                )}

                                {/* Accuracy */}
                                {location.accuracy && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                                        <span>
                                            {location.accuracy.toFixed(1)} m
                                        </span>
                                    </div>
                                )}

                                {/* Velocidade */}
                                {location.speed && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <Gauge className="w-3.5 h-3.5 text-gray-400" />
                                        <span>
                                            {(location.speed * 3.6).toFixed(1)} km/h
                                        </span>
                                    </div>
                                )}

                                {/* Heading */}
                                {location.heading && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <span className="inline-block w-3.5 h-3.5 bg-gray-400 rounded-full" />
                                        <span>
                                            {location.heading}°
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botão de visualizar no mapa */}
                        <button className="flex-shrink-0 p-2 hover:bg-orange-50 rounded-lg transition-colors">
                            <MapPin className="w-5 h-5 text-orange-600" />
                        </button>
                    </div>
                </div>
            ))}

            {locations.length > maxItems && (
                <div className="text-center pt-4">
                    <p className="text-sm text-gray-500">
                        Mostrando {maxItems} de {locations.length} localizações
                    </p>
                </div>
            )}
        </div>
    );
}
