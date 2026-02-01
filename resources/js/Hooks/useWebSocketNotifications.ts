import { useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import echo from '@/echo';
import { Notification } from './useNotifications';

interface UseWebSocketNotificationsProps {
    onNewNotification?: (notification: Notification) => void;
    onOrderStatusChanged?: (data: any) => void;
    onLocationUpdated?: (data: any) => void;
}

export function useWebSocketNotifications({
    onNewNotification,
    onOrderStatusChanged,
    onLocationUpdated,
}: UseWebSocketNotificationsProps) {
    const { auth } = usePage().props as any;
    const userId = auth?.user?.id;

    useEffect(() => {
        if (!userId) {
            console.warn('useWebSocketNotifications: User not authenticated');
            return;
        }

        console.log(`🔗 Listening to notifications for user: ${userId}`);

        // Channel privado para notificações do usuário
        const userChannel = echo.private(`user.${userId}`);

        // Listener para notificações de banco de dados
        const notificationListener = userChannel.listen(
            'Illuminate.Notifications.Events.BroadcastNotificationCreated',
            (event: any) => {
                console.log('📬 Notification received:', event);
                const notification: Notification = {
                    id: event.notification?.id || event.id,
                    user_id: userId,
                    title: event.notification?.data?.title || 'Nova notificação',
                    message: event.notification?.data?.message || '',
                    type: event.notification?.data?.type || 'system',
                    icon: event.notification?.data?.icon || 'Bell',
                    color: event.notification?.data?.color || '#3b82f6',
                    data: event.notification?.data?.data || {},
                    action_url: event.notification?.data?.action_url,
                    read_at: null,
                    created_at: new Date().toISOString(),
                    created_at_display: 'agora',
                };
                onNewNotification?.(notification);
            }
        );

        // Listener para eventos customizados de pedido
        const orderListener = userChannel.listen('OrderStatusChangedEvent', (event: any) => {
            console.log('📋 Order status changed:', event);
            onOrderStatusChanged?.(event);
        });

        // Listener para atualizações de localização
        const locationListener = userChannel.listen('LocationUpdatedEvent', (event: any) => {
            console.log('📍 Location updated:', event);
            onLocationUpdated?.(event);
        });

        // Listener para chegada ao destino
        const arrivedListener = userChannel.listen('ArrivedAtDestinationEvent', (event: any) => {
            console.log('🎯 Arrived at destination:', event);
            const notification: Notification = {
                id: event.id || `arrived-${Date.now()}`,
                user_id: userId,
                title: 'Chegou ao Destino!',
                message: `Você chegou ao endereço de entrega para o pedido #${event.order?.number}`,
                type: 'arrived',
                icon: 'Navigation',
                color: '#8b5cf6',
                data: event.data || {},
                action_url: `/motoboy/pedidos/${event.order?.id}`,
                read_at: null,
                created_at: new Date().toISOString(),
                created_at_display: 'agora',
            };
            onNewNotification?.(notification);
        });

        // Listener para entrega confirmada
        const deliveredListener = userChannel.listen('OrderDeliveredEvent', (event: any) => {
            console.log('✅ Order delivered:', event);
            const notification: Notification = {
                id: event.id || `delivered-${Date.now()}`,
                user_id: userId,
                title: 'Entrega Confirmada!',
                message: `Pedido #${event.order?.number} entregue com sucesso`,
                type: 'delivery',
                icon: 'CheckCircle',
                color: '#10b981',
                data: event.data || {},
                action_url: `/motoboy/pedidos/${event.order?.id}`,
                read_at: null,
                created_at: new Date().toISOString(),
                created_at_display: 'agora',
            };
            onNewNotification?.(notification);
        });

        // Listener para novo pedido
        const acceptedListener = userChannel.listen('OrderAcceptedEvent', (event: any) => {
            console.log('📦 Order accepted:', event);
            const notification: Notification = {
                id: event.id || `accepted-${Date.now()}`,
                user_id: userId,
                title: 'Novo Pedido!',
                message: `Você aceitou o pedido #${event.order?.number}. Valor: R$ ${event.order?.total}`,
                type: 'order',
                icon: 'Package',
                color: '#3b82f6',
                data: event.data || {},
                action_url: `/motoboy/pedidos/${event.order?.id}`,
                read_at: null,
                created_at: new Date().toISOString(),
                created_at_display: 'agora',
            };
            onNewNotification?.(notification);
        });

        // Cleanup: Remover listeners ao desmontar
        return () => {
            console.log('🔌 Disconnecting WebSocket listeners');
            userChannel.stopListening(
                'Illuminate.Notifications.Events.BroadcastNotificationCreated'
            );
            userChannel.stopListening('OrderStatusChangedEvent');
            userChannel.stopListening('LocationUpdatedEvent');
            userChannel.stopListening('ArrivedAtDestinationEvent');
            userChannel.stopListening('OrderDeliveredEvent');
            userChannel.stopListening('OrderAcceptedEvent');
        };
    }, [userId, onNewNotification, onOrderStatusChanged, onLocationUpdated]);
}
