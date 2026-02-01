import { useEffect, useRef } from 'react';

interface Location {
    lat: number;
    lng: number;
}

interface MapComponentProps {
    currentLocation?: Location;
    destinationLocation?: Location;
    trajectoryCoordinates?: Array<{ lat: number; lng: number }>;
    zoom?: number;
    apiKey?: string;
    height?: string;
    showTrajectory?: boolean;
}

/**
 * Componente que exibe mapa do Google Maps
 * Mostra localização atual, destino e trajeto
 */
export default function MapComponent({
    currentLocation,
    destinationLocation,
    trajectoryCoordinates = [],
    zoom = 15,
    apiKey,
    height = '400px',
    showTrajectory = false,
}: MapComponentProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const polylineRef = useRef<any>(null);

    // Carregar Google Maps
    useEffect(() => {
        if (!mapContainerRef.current || !apiKey) return;

        // Verificar se Google Maps já foi carregado
        if (window.google?.maps) {
            initMap();
        } else {
            // Carregar script do Google Maps
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                initMap();
            };

            script.onerror = () => {
                console.error('Erro ao carregar Google Maps');
            };

            document.head.appendChild(script);

            return () => {
                // Não remover script, pode ser usado por outros componentes
            };
        }
    }, [apiKey]);

    const initMap = () => {
        if (!mapContainerRef.current || !window.google?.maps) return;

        // Localização padrão (São Paulo)
        const defaultLocation = { lat: -23.5505, lng: -46.6333 };
        const initialLocation = currentLocation || destinationLocation || defaultLocation;

        mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
            zoom,
            center: initialLocation,
            mapTypeControl: false,
            fullscreenControl: true,
            streetViewControl: false,
        });

        // Adicionar trajeto se fornecido
        if (showTrajectory && trajectoryCoordinates.length > 0) {
            drawTrajectory();
        }

        // Adicionar marcadores
        if (currentLocation) {
            addMarker(currentLocation, 'Você está aqui', '/images/icons/motoboy-marker.png');
        }

        if (destinationLocation) {
            addMarker(destinationLocation, 'Destino', '/images/icons/destination-marker.png');
        }

        // Ajustar zoom se houver dois pontos
        if (currentLocation && destinationLocation) {
            fitBounds();
        }
    };

    const addMarker = (location: Location, title: string, iconUrl?: string) => {
        if (!mapRef.current) return;

        const markerOptions: any = {
            position: location,
            map: mapRef.current,
            title,
            animation: window.google.maps.Animation.DROP,
        };

        if (iconUrl) {
            markerOptions.icon = {
                url: iconUrl,
                scaledSize: new window.google.maps.Size(32, 32),
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(16, 32),
            };
        }

        const marker = new window.google.maps.Marker(markerOptions);

        // Info window
        const infoWindow = new window.google.maps.InfoWindow({
            content: `<div style="padding: 8px;">
                <strong>${title}</strong>
                <p style="font-size: 0.85em; margin: 4px 0 0;">
                    ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
                </p>
            </div>`,
        });

        marker.addListener('click', () => {
            // Fechar outras info windows
            markersRef.current.forEach((m) => {
                if (m.infoWindow) {
                    m.infoWindow.close();
                }
            });
            infoWindow.open(mapRef.current, marker);
        });

        markersRef.current.push({ marker, infoWindow });

        return marker;
    };

    const drawTrajectory = () => {
        if (!mapRef.current || trajectoryCoordinates.length < 2) return;

        // Remover polilinha anterior
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        polylineRef.current = new window.google.maps.Polyline({
            path: trajectoryCoordinates,
            geodesic: true,
            strokeColor: '#FF3D03', // Laranja
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map: mapRef.current,
        });
    };

    const fitBounds = () => {
        if (!mapRef.current || !currentLocation || !destinationLocation) return;

        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(currentLocation);
        bounds.extend(destinationLocation);

        mapRef.current.fitBounds(bounds);
    };

    // Atualizar mapa quando localizações mudam
    useEffect(() => {
        if (!mapRef.current) return;

        // Limpar marcadores anteriores
        markersRef.current.forEach((m) => {
            m.marker.setMap(null);
        });
        markersRef.current = [];

        // Adicionar novos marcadores
        if (currentLocation) {
            addMarker(currentLocation, 'Você está aqui', '/images/icons/motoboy-marker.png');
        }

        if (destinationLocation) {
            addMarker(destinationLocation, 'Destino', '/images/icons/destination-marker.png');
        }

        // Ajustar zoom se houver dois pontos
        if (currentLocation && destinationLocation) {
            fitBounds();
        } else if (currentLocation) {
            mapRef.current.setCenter(currentLocation);
        } else if (destinationLocation) {
            mapRef.current.setCenter(destinationLocation);
        }
    }, [currentLocation, destinationLocation]);

    // Atualizar trajeto quando muda
    useEffect(() => {
        if (showTrajectory && trajectoryCoordinates.length > 0) {
            drawTrajectory();
        }
    }, [trajectoryCoordinates, showTrajectory]);

    return (
        <div
            ref={mapContainerRef}
            style={{
                width: '100%',
                height,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
        />
    );
}
