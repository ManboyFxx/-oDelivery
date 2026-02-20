import { ReactNode, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
// Trial components removed
import { NotificationSettingsSync } from '@/Components/Toast/NotificationSettingsSync';
import { useToast } from '@/Hooks/useToast';
import { useAudio } from '@/Hooks/useAudio';
import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import ImpersonationBanner from '@/Components/ImpersonationBanner';

import { PageProps } from '@/types';

export default function Authenticated({ user, header, children, tenant: propTenant }: { user?: any, header?: ReactNode, children: ReactNode, tenant?: any }) {
    const { auth, tenant: contextTenant } = usePage<PageProps>().props;
    const tenant = propTenant || contextTenant;
    const authUser = auth.user;
    const [hasUnread, setHasUnread] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { success, error, info, soundEnabled } = useToast();
    const { play } = useAudio();
    const { flash, toast } = usePage<any>().props;
    const prevFlashRef = useRef<any>(null);
    const prevToastRef = useRef<any>(null);

    // Flash message handling is global via this layout

    // 2. Handle Flash Messages & Backend Toasts Globally
    useEffect(() => {
        // Avoid duplicate toasts if strict mode runs effect twice or props haven't changed meaningfully
        const flashChanged = JSON.stringify(flash) !== JSON.stringify(prevFlashRef.current);
        const toastChanged = JSON.stringify(toast) !== JSON.stringify(prevToastRef.current);

        if (flashChanged) {
            if (flash?.success) success('Sucesso', flash.success);
            if (flash?.error) error('Erro', flash.error);
            prevFlashRef.current = flash;
        }

        if (toastChanged && toast) {
            if (toast.type === 'success') success(toast.title || 'Sucesso', toast.message);
            else if (toast.type === 'error') error(toast.title || 'Erro', toast.message);
            else info(toast.title || 'Info', toast.message);
            prevToastRef.current = toast;
        }
    }, [flash, toast, success, error, info]);

    // 3. Global Order Polling (New Orders & Ready Orders)
    // Safe implementation using Refs to avoid Strict Mode double-firing
    useEffect(() => {
        if (!tenant) return;

        const tenantId = tenant.id;
        let lastTimestamp = 0;

        const checkForUpdates = async () => {
            // Basic strict check to avoid running if tab is hidden/inactive? 
            // Ideally we want sound even if hidden, so we keep running.
            try {
                // 1. First check public lightweight endpoint (File based, no DB)
                const pollResponse = await fetch(`/api/poll/${tenantId}`);
                if (!pollResponse.ok) return;

                const { timestamp } = await pollResponse.json();

                // If nothing changed since last check, stop here.
                // We initialize lastTimestamp with the server value on first run to avoid fake alerts
                if (lastTimestamp === 0) {
                    lastTimestamp = timestamp;
                    return;
                }

                if (timestamp <= lastTimestamp) {
                    return;
                }

                // 2. Something changed! Now verify what changed with the secure DB endpoint
                // We only hit the DB if the file timestamp changed
                const response = await fetch(route('api.orders.status-check'));

                if (!response.ok) return;

                const data = await response.json();

                // Logic to trigger notifications
                // We trust the backend "last 20s" logic to deduplicate over time, 
                // but we can add client side debouncing if needed.
                // For now, rely on backend window.

                if (data.hasNewOrders) {
                    if (soundEnabled) play('new-order');
                    success('Novo Pedido!', 'Chegou um novo pedido!');
                    setHasUnread(true);
                }

                if (data.hasReadyOrders) {
                    if (soundEnabled) play('ready');
                    info('Pedido Pronto!', 'Um pedido está pronto.');
                    setHasUnread(true);
                }

                if (data.hasCanceledOrders) {
                    if (soundEnabled) play('error');
                    error('Pedido Cancelado', 'Um pedido foi cancelado.');
                    setHasUnread(true);
                }

                // Update timestamp
                lastTimestamp = timestamp;

            } catch (err) {
                console.error("Polling error", err);
            }
        };

        // Run immediately to set initial timestamp
        checkForUpdates();

        // Set interval
        const intervalId = setInterval(checkForUpdates, 15000); // 15 seconds

        return () => clearInterval(intervalId);
    }, [tenant?.id]); // Only re-run if tenant ID changes, NOT on every render/prop change

    // Trial logic removed

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-premium-dark transition-colors">
            <NotificationSettingsSync />
            {/* Sidebar */}
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden lg:pl-72 transition-all duration-300">
                {/* Impersonation Banner */}
                {auth.is_impersonating && (
                    <ImpersonationBanner />
                )}

                <TopBar user={user || authUser} onMenuClick={() => setIsMobileMenuOpen(true)} hasUnread={hasUnread} onRead={() => setHasUnread(false)} />

                {/* Trial Banner Global Removed */}

                {header && (
                    <header className="bg-white dark:bg-premium-card shadow">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Trial Expiring Modal Removed */}
        </div>
    );
}
