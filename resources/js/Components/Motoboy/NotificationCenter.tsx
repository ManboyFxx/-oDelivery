import { Notification } from '@/Hooks/useNotifications';
import { X, CheckCircle2, ChevronRight } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { Link } from '@inertiajs/react';

interface NotificationCenterProps {
    notifications: Notification[];
    onMarkAsRead?: (id: string) => void;
    onDelete?: (id: string) => void;
    loading?: boolean;
    onClose?: () => void;
}

export default function NotificationCenter({
    notifications,
    onMarkAsRead,
    onDelete,
    loading = false,
    onClose,
}: NotificationCenterProps) {
    const unreadNotifications = notifications.filter((n) => !n.read_at);

    return (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden flex flex-col max-h-96">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black text-gray-900">Notificações</h2>
                    <p className="text-xs text-gray-600 font-medium">
                        {unreadNotifications.length} não lida{unreadNotifications.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-white transition-colors"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Content */}
            {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-600">Nenhuma notificação</p>
                    <p className="text-xs text-gray-500 mt-1">Você está em dia com tudo!</p>
                </div>
            ) : (
                <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
                    {notifications.map((notification) => (
                        <div key={notification.id} className="p-3">
                            <NotificationItem
                                notification={notification}
                                onMarkAsRead={onMarkAsRead}
                                onDelete={onDelete}
                                loading={loading}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="border-t-2 border-gray-200 px-6 py-3 flex items-center">
                    <Link
                        href={route('motoboy.notifications')}
                        onClick={onClose}
                        className="flex-1 flex items-center justify-between text-sm font-bold text-[#ff3d03] hover:text-orange-700 transition-colors"
                    >
                        Ver todas as notificações
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
