import { Notification } from '@/Hooks/useNotifications';
import { X, CheckCircle2, Package, MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead?: (id: string) => void;
    onDelete?: (id: string) => void;
    loading?: boolean;
}

export default function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    loading = false,
}: NotificationItemProps) {
    const [isHovering, setIsHovering] = useState(false);

    const getIconComponent = () => {
        switch (notification.icon) {
            case 'CheckCircle':
                return CheckCircle2;
            case 'Package':
                return Package;
            case 'MapPin':
                return MapPin;
            case 'Navigation':
                return Navigation;
            case 'AlertCircle':
                return AlertCircle;
            default:
                return Package;
        }
    };

    const getColorClasses = () => {
        const color = notification.color || '#3b82f6';
        // Convertendo hex para RGB para usar em Tailwind com opacity
        switch (notification.type) {
            case 'delivery':
                return { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200' };
            case 'order':
                return { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' };
            case 'location':
                return { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-200' };
            case 'arrived':
                return { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' };
            case 'system':
                return { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-200' };
            default:
                return { bg: 'bg-gray-50', icon: 'text-gray-600', border: 'border-gray-200' };
        }
    };

    const colors = getColorClasses();
    const IconComponent = getIconComponent();
    const isUnread = !notification.read_at;

    return (
        <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`
                relative rounded-xl border-2 p-4 transition-all
                ${colors.bg} ${colors.border}
                ${isHovering ? 'shadow-md' : ''}
                ${isUnread ? 'bg-opacity-60' : 'bg-opacity-30'}
            `}
        >
            {/* Unread indicator */}
            {isUnread && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-[#ff3d03] rounded-full"></div>
            )}

            <div className="flex gap-4">
                {/* Icon */}
                <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}
                    style={{ backgroundColor: `${notification.color}15` }}
                >
                    <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500 font-medium">
                            {notification.created_at_display || 'agora'}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase px-2 py-0.5 bg-white bg-opacity-50 rounded">
                            {notification.type}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                {isHovering && (
                    <div className="flex items-start gap-2 flex-shrink-0">
                        {isUnread && (
                            <button
                                onClick={() => onMarkAsRead?.(notification.id)}
                                disabled={loading}
                                title="Marcar como lida"
                                className="p-1 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-5 h-5 text-gray-400 hover:text-green-600" />
                            </button>
                        )}
                        <button
                            onClick={() => onDelete?.(notification.id)}
                            disabled={loading}
                            title="Deletar notificação"
                            className="p-1 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5 text-gray-400 hover:text-red-600" />
                        </button>
                    </div>
                )}
            </div>

            {/* Action URL */}
            {notification.action_url && (
                <div className="mt-3 pt-3 border-t border-gray-200 border-opacity-50">
                    <a
                        href={notification.action_url}
                        className="text-xs font-bold text-[#ff3d03] hover:underline"
                    >
                        Ver detalhes →
                    </a>
                </div>
            )}
        </div>
    );
}
