import { Notification } from '@/Hooks/useNotifications';
import { X, CheckCircle2, Package, MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationToastProps {
    notification: Notification;
    onDismiss?: () => void;
    autoCloseDuration?: number; // ms, 0 = no auto close
}

export default function NotificationToast({
    notification,
    onDismiss,
    autoCloseDuration = 5000,
}: NotificationToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoCloseDuration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onDismiss?.();
            }, autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [autoCloseDuration, onDismiss]);

    if (!isVisible) return null;

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
        switch (notification.type) {
            case 'delivery':
                return { bg: 'bg-green-100', border: 'border-green-400', icon: 'text-green-600', text: 'text-green-900' };
            case 'order':
                return { bg: 'bg-blue-100', border: 'border-blue-400', icon: 'text-blue-600', text: 'text-blue-900' };
            case 'location':
                return { bg: 'bg-red-100', border: 'border-red-400', icon: 'text-red-600', text: 'text-red-900' };
            case 'arrived':
                return { bg: 'bg-purple-100', border: 'border-purple-400', icon: 'text-purple-600', text: 'text-purple-900' };
            case 'system':
                return { bg: 'bg-yellow-100', border: 'border-yellow-400', icon: 'text-yellow-600', text: 'text-yellow-900' };
            default:
                return { bg: 'bg-gray-100', border: 'border-gray-400', icon: 'text-gray-600', text: 'text-gray-900' };
        }
    };

    const colors = getColorClasses();
    const IconComponent = getIconComponent();

    return (
        <div
            className={`
                fixed bottom-6 right-6 z-50 max-w-sm
                rounded-xl border-2 ${colors.border} ${colors.bg}
                p-4 shadow-xl
                animate-in slide-in-from-bottom-5 duration-300
            `}
            role="alert"
        >
            <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className={`font-bold text-sm ${colors.text}`}>{notification.title}</h3>
                    <p className={`text-sm mt-1 line-clamp-2 opacity-90 ${colors.text}`}>
                        {notification.message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => {
                        setIsVisible(false);
                        onDismiss?.();
                    }}
                    className={`flex-shrink-0 p-1 rounded-lg transition-colors hover:opacity-70`}
                >
                    <X className={`w-5 h-5 ${colors.icon}`} />
                </button>
            </div>

            {/* Progress bar */}
            {autoCloseDuration > 0 && (
                <div
                    className={`absolute bottom-0 left-0 right-0 h-1 ${colors.border} rounded-b-lg`}
                    style={{
                        background: `linear-gradient(to right, ${notification.color || '#3b82f6'}, transparent)`,
                        animation: `progress ${autoCloseDuration}ms linear forwards`,
                    }}
                />
            )}

            <style>{`
                @keyframes progress {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0;
                    }
                }
                @keyframes slide-in-from-bottom-5 {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
