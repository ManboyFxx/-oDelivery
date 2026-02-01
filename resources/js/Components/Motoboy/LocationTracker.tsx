import { useEffect, useRef } from 'react';
import axios from 'axios';

interface LocationTrackerProps {
    orderId?: string;
    enabled?: boolean;
    interval?: number; // em segundos
    onLocationUpdate?: (location: any) => void;
    onError?: (error: string) => void;
}

/**
 * Componente que rastreia localização em tempo real
 * Usa Geolocation API do navegador e salva via API
 */
export default function LocationTracker({
    orderId,
    enabled = true,
    interval = 10, // Padrão: a cada 10 segundos
    onLocationUpdate,
    onError,
}: LocationTrackerProps) {
    const watchIdRef = useRef<number | null>(null);
    const lastSavedRef = useRef<number>(0);

    useEffect(() => {
        if (!enabled || !navigator.geolocation) {
            if (!navigator.geolocation) {
                onError?.('Geolocalização não disponível neste navegador');
            }
            return;
        }

        // Obter localização imediatamente
        getCurrentLocation();

        // Configurar observação contínua
        const watchOptions = {
            enableHighAccuracy: true, // GPS mais preciso
            timeout: 30000, // 30 segundos timeout
            maximumAge: 0, // Sem cache
        };

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy, speed, heading } = position.coords;

                // Enviar apenas se passou o intervalo mínimo
                const now = Date.now();
                if (now - lastSavedRef.current >= interval * 1000) {
                    saveLocation({
                        latitude,
                        longitude,
                        accuracy,
                        speed,
                        heading,
                    });
                    lastSavedRef.current = now;
                }

                onLocationUpdate?.({
                    latitude,
                    longitude,
                    accuracy,
                    speed,
                    heading,
                    timestamp: new Date().toISOString(),
                });
            },
            (error) => {
                let message = 'Erro ao obter localização';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Permissão de localização negada';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Localização indisponível';
                        break;
                    case error.TIMEOUT:
                        message = 'Timeout ao obter localização';
                        break;
                }

                onError?.(message);
                console.error('Geolocation error:', error);
            },
            watchOptions
        );

        // Cleanup
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [enabled, interval, onLocationUpdate, onError]);

    const getCurrentLocation = async () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy, speed, heading } = position.coords;

                saveLocation({
                    latitude,
                    longitude,
                    accuracy,
                    speed,
                    heading,
                });

                onLocationUpdate?.({
                    latitude,
                    longitude,
                    accuracy,
                    speed,
                    heading,
                    timestamp: new Date().toISOString(),
                });
            },
            (error) => {
                console.error('Erro ao obter localização:', error);
            }
        );
    };

    const saveLocation = async (locationData: any) => {
        try {
            await axios.post(route('api.motoboy.location.store'), {
                ...locationData,
                order_id: orderId || null,
            });
        } catch (error) {
            console.error('Erro ao salvar localização:', error);
        }
    };

    // Este componente não renderiza nada visível
    // Apenas fornece rastreamento em background
    return null;
}
