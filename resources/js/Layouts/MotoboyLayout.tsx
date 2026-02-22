import { ReactNode, useState, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Motoboy/Sidebar';
import TopBar from '@/Components/Motoboy/TopBar';
import NotificationToast from '@/Components/Motoboy/NotificationToast';
import { useWebSocketNotifications } from '@/Hooks/useWebSocketNotifications';
import { usePushNotifications } from '@/Hooks/usePushNotifications';
import { Notification } from '@/Hooks/useNotifications';
import { Menu } from 'lucide-react';

interface MotoboyLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export default function MotoboyLayout({ children, title = 'Dashboard', subtitle }: MotoboyLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
    const { auth } = usePage().props as any;
    const user = auth.user;

    // Initialize Push Notifications
    usePushNotifications(user);

    // Callback para novas notificações via WebSocket
    const handleNewNotification = useCallback((notification: Notification) => { // ... (same as before)
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
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">

                {/* Mobile Header / Sandwich Button (Visible only on mobile) */}
                <div className="md:hidden flex items-center p-4 bg-white border-b border-gray-200">
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-3 font-bold text-gray-900 text-lg uppercase tracking-wide">
                        {title}
                    </span>
                    <div className="ml-auto w-8 h-8 bg-[#ff3d03] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {user.name.charAt(0)}
                    </div>
                </div>

                {/* TopBar (Hidden on mobile to save space, or kept if needed for other actions) */}
                <div className="hidden md:block">
                    <TopBar title={title} subtitle={subtitle} user={user} />
                </div>

                {/* Content */}
                <main className="flex-1 overflow-auto bg-gray-50">
                    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
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
