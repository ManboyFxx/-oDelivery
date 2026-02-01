import { Navigation, Clock, AlertCircle } from 'lucide-react';

interface DistanceDisplayProps {
    distanceKm?: number;
    distanceFormatted?: string;
    estimatedTimeMinutes?: number;
    estimatedTimeFormatted?: string;
    currentSpeed?: number;
    arrived?: boolean;
    loading?: boolean;
}

/**
 * Componente que exibe distância, tempo estimado e velocidade
 */
export default function DistanceDisplay({
    distanceKm,
    distanceFormatted,
    estimatedTimeMinutes,
    estimatedTimeFormatted,
    currentSpeed,
    arrived = false,
    loading = false,
}: DistanceDisplayProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-gray-100 rounded-lg p-4 h-24 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-4">
            {/* Distância */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    <p className="text-xs font-bold text-blue-600 uppercase">Distância</p>
                </div>
                <p className="text-2xl font-black text-blue-900">
                    {distanceFormatted || '—'}
                </p>
                {distanceKm && (
                    <p className="text-xs text-blue-600 mt-1">
                        {distanceKm} km
                    </p>
                )}
            </div>

            {/* Tempo Estimado */}
            <div className={`rounded-lg p-4 border ${
                arrived
                    ? 'bg-green-50 border-green-200'
                    : 'bg-orange-50 border-orange-200'
            }`}>
                <div className="flex items-center gap-2 mb-2">
                    <Clock className={`w-5 h-5 ${
                        arrived ? 'text-green-600' : 'text-orange-600'
                    }`} />
                    <p className={`text-xs font-bold uppercase ${
                        arrived ? 'text-green-600' : 'text-orange-600'
                    }`}>
                        {arrived ? 'Chegou!' : 'Tempo Est.'}
                    </p>
                </div>
                <p className={`text-2xl font-black ${
                    arrived ? 'text-green-900' : 'text-orange-900'
                }`}>
                    {estimatedTimeFormatted || '—'}
                </p>
                {estimatedTimeMinutes && (
                    <p className={`text-xs mt-1 ${
                        arrived ? 'text-green-600' : 'text-orange-600'
                    }`}>
                        {estimatedTimeMinutes} minutos
                    </p>
                )}
            </div>

            {/* Velocidade Atual */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-purple-600" />
                    <p className="text-xs font-bold text-purple-600 uppercase">Velocidade</p>
                </div>
                <p className="text-2xl font-black text-purple-900">
                    {currentSpeed !== undefined && currentSpeed !== null
                        ? `${(currentSpeed * 3.6).toFixed(1)} km/h`
                        : '—'}
                </p>
                {currentSpeed && (
                    <p className="text-xs text-purple-600 mt-1">
                        {(currentSpeed * 3.6).toFixed(1)} km/h
                    </p>
                )}
            </div>
        </div>
    );
}
