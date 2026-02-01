import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/Hooks/useNotifications';
import NotificationCenter from './NotificationCenter';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { unreadCount, notifications, markAsRead, deleteNotification, loading } = useNotifications();

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
    };

    const handleDelete = async (id: string) => {
        await deleteNotification(id);
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Notificações"
            >
                <Bell className="w-6 h-6 text-gray-700" />

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-[#ff3d03] text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Center Popup */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Center Modal */}
                    <div className="absolute right-0 top-12 z-40 w-96 max-h-96">
                        <NotificationCenter
                            notifications={notifications}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDelete}
                            loading={loading}
                            onClose={() => setIsOpen(false)}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
