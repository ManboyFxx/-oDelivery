import { ReactNode, useState, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Motoboy/Sidebar';
import TopBar from '@/Components/Motoboy/TopBar';
import NotificationToast from '@/Components/Motoboy/NotificationToast';
import { useWebSocketNotifications } from '@/Hooks/useWebSocketNotifications';
import { Notification } from '@/Hooks/useNotifications';

interface MotoboyLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export default function MotoboyLayout({ children, title = 'Dashboard', subtitle }: MotoboyLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
    const { auth } = usePage().props as any;
    const user = auth.user;

    // Callback para novas notificações via WebSocket
    const handleNewNotification = useCallback((notification: Notification) => {
        console.log('📲 New notification to display as toast:', notification);

        // Adicionar à fila de toasts (máximo 3 simultâneos)
        setToastNotifications((prev) => {
            const updated = [notification, ...prev].slice(0, 3);
            return updated;
        });

        // Auto-remover após 6 segundos
        setTimeout(() => {
            setToastNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        }, 6000);
    }, []);

    // Configurar listeners WebSocket
    useWebSocketNotifications({
        onNewNotification: handleNewNotification,
        onOrderStatusChanged: (data) => {
            console.log('📋 Order status changed via WebSocket:', data);
        },
        onLocationUpdated: (data) => {
            console.log('📍 Location updated via WebSocket:', data);
        },
    });

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TopBar */}
                <TopBar title={title} subtitle={subtitle} user={user} />

                {/* Content */}
                <main className="flex-1 overflow-auto">
                    <div className="p-8 max-w-7xl mx-auto w-full">{children}</div>
                </main>
            </div>

            {/* Toast Notifications */}
            {toastNotifications.map((notification) => (
                <NotificationToast
                    key={notification.id}
                    notification={notification}
                    autoCloseDuration={6000}
                    onDismiss={() => {
                        setToastNotifications((prev) =>
                            prev.filter((n) => n.id !== notification.id)
                        );
                    }}
                />
            ))}
        </div>
    );
}
