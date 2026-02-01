import { Head } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import { useNotifications, Notification } from '@/Hooks/useNotifications';
import { useState, useMemo } from 'react';
import NotificationItem from '@/Components/Motoboy/NotificationItem';
import { Bell, Loader2, CheckCircle2 } from 'lucide-react';

type FilterType = 'all' | 'unread' | 'read' | 'order' | 'delivery' | 'location' | 'arrived' | 'system';

export default function Notifications() {
    const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredNotifications = useMemo(() => {
        return notifications.filter((n) => {
            if (filter === 'all') return true;
            if (filter === 'unread') return !n.read_at;
            if (filter === 'read') return !!n.read_at;
            return n.type === filter;
        });
    }, [notifications, filter]);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read_at).length,
        [notifications]
    );

    const filterOptions: Array<{ value: FilterType; label: string; count: number }> = [
        { value: 'all', label: 'Todas', count: notifications.length },
        { value: 'unread', label: 'Não lidas', count: unreadCount },
        { value: 'read', label: 'Lidas', count: notifications.length - unreadCount },
        {
            value: 'order',
            label: 'Pedidos',
            count: notifications.filter((n) => n.type === 'order').length,
        },
        {
            value: 'delivery',
            label: 'Entregas',
            count: notifications.filter((n) => n.type === 'delivery').length,
        },
        {
            value: 'location',
            label: 'Localização',
            count: notifications.filter((n) => n.type === 'location').length,
        },
        {
            value: 'arrived',
            label: 'Chegada',
            count: notifications.filter((n) => n.type === 'arrived').length,
        },
        {
            value: 'system',
            label: 'Sistema',
            count: notifications.filter((n) => n.type === 'system').length,
        },
    ];

    return (
        <MotoboyLayout title="Notificações" subtitle="Gerencie suas notificações">
            <Head title="Notificações - ÓoDelivery Motoboy" />

            <div className="space-y-6">
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                                    Não lidas
                                </p>
                                <p className="text-4xl font-black text-[#ff3d03] mt-2">{unreadCount}</p>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <Bell className="w-8 h-8 text-[#ff3d03]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                                    Total
                                </p>
                                <p className="text-4xl font-black text-blue-600 mt-2">{notifications.length}</p>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <CheckCircle2 className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {filterOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`
                                px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all
                                ${
                                    filter === option.value
                                        ? 'bg-[#ff3d03] text-white shadow-md'
                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#ff3d03]'
                                }
                            `}
                        >
                            {option.label}
                            <span className="ml-2 text-xs opacity-70">({option.count})</span>
                        </button>
                    ))}
                </div>

                {/* Actions Bar */}
                {unreadCount > 0 && (
                    <div className="flex items-center justify-between bg-blue-50 rounded-xl border-2 border-blue-200 p-4">
                        <p className="text-sm font-bold text-blue-900">
                            Você tem {unreadCount} notificação{unreadCount !== 1 ? 's' : ''} não lida
                            {unreadCount !== 1 ? 's' : ''}
                        </p>
                        <button
                            onClick={() => markAllAsRead()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
                        >
                            Marcar todas como lidas
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-[#ff3d03] animate-spin" />
                        <p className="ml-3 text-gray-600 font-medium">Carregando notificações...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Bell className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Nenhuma notificação</h3>
                        <p className="text-gray-600 font-medium">
                            {filter === 'unread'
                                ? 'Você está em dia com todas as notificações!'
                                : 'Nenhuma notificação nesta categoria'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={() => markAsRead(notification.id)}
                                onDelete={() => deleteNotification(notification.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </MotoboyLayout>
    );
}
