import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'order' | 'delivery' | 'location' | 'arrived' | 'system';
    icon: string;
    color: string;
    data: Record<string, any>;
    action_url?: string;
    read_at?: string;
    created_at: string;
    created_at_display?: string;
}

export interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    fetchNotifications: (limit?: number) => Promise<void>;
    addNotification: (notification: Notification) => void;
}

export function useNotifications(): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Buscar notificações do servidor
    const fetchNotifications = useCallback(async (limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                route('api.motoboy.notifications.index'),
                { params: { limit } }
            );
            setNotifications(response.data.data || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (err) {
            setError('Erro ao buscar notificações');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Marcar como lida
    const markAsRead = useCallback(async (id: string) => {
        try {
            await axios.post(route('api.motoboy.notifications.mark-read', id));
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, read_at: new Date().toISOString() } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Erro ao marcar como lida:', err);
        }
    }, []);

    // Marcar todas como lidas
    const markAllAsRead = useCallback(async () => {
        try {
            await axios.post(route('api.motoboy.notifications.mark-all-read'));
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Erro ao marcar todas como lidas:', err);
        }
    }, []);

    // Deletar notificação
    const deleteNotification = useCallback(async (id: string) => {
        try {
            await axios.delete(route('api.motoboy.notifications.destroy', id));
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Erro ao deletar:', err);
        }
    }, []);

    // Adicionar notificação (para WebSocket)
    const addNotification = useCallback((notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        if (!notification.read_at) {
            setUnreadCount((prev) => prev + 1);
        }
    }, []);

    // Buscar inicialmente
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        addNotification,
    };
}
