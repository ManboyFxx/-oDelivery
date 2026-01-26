import { ReactNode, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import TrialExpiringModal from '@/Components/TrialExpiringModal';
import { NotificationSettingsSync } from '@/Components/Toast/NotificationSettingsSync';
import { useToast } from '@/Hooks/useToast';
import { useAudio } from '@/Hooks/useAudio';
import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

import { PageProps } from '@/types';

export default function Authenticated({ user, header, children }: { user?: any, header?: ReactNode, children: ReactNode }) {
    const { auth, tenant } = usePage<PageProps>().props;
    const authUser = auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Global Audio & Toast Logic
    const { success, error, info } = useToast();
    const { play, initializeAudio } = useAudio();
    const { flash, toast } = usePage<any>().props;
    const prevFlashRef = useRef<any>(null);

    // 1. Initialize Audio on Interaction (Global)
    useEffect(() => {
        const enableAudio = () => initializeAudio();
        window.addEventListener('click', enableAudio, { once: true });
        window.addEventListener('touchstart', enableAudio, { once: true });
        return () => {
            window.removeEventListener('click', enableAudio);
            window.removeEventListener('touchstart', enableAudio);
        };
    }, [initializeAudio]);

    // 2. Handle Flash Messages & Backend Toasts Globally
    useEffect(() => {
        // Avoid duplicate toasts if strict mode runs effect twice or props haven't changed meaningfully
        if (JSON.stringify(flash) === JSON.stringify(prevFlashRef.current)) return;

        if (flash?.success) success('Sucesso', flash.success);
        if (flash?.error) error('Erro', flash.error);
        if (toast) {
            if (toast.type === 'success') success(toast.title || 'Sucesso', toast.message);
            else if (toast.type === 'error') error(toast.title || 'Erro', toast.message);
            else info(toast.title || 'Info', toast.message);
        }

        prevFlashRef.current = flash;
    }, [flash, toast, success, error, info]);

    // 3. Global Order Polling (New Orders & Ready Orders)
    // Safe implementation using Refs to avoid Strict Mode double-firing
    useEffect(() => {
        if (!tenant) return;

        const checkForUpdates = async () => {
            // Basic strict check to avoid running if tab is hidden/inactive? 
            // Ideally we want sound even if hidden, so we keep running.
            try {
                const response = await fetch(route('api.orders.status-check'));

                if (!response.ok) return;

                const data = await response.json();

                // Logic to trigger notifications
                // We trust the backend "last 20s" logic to deduplicate over time, 
                // but we can add client side debouncing if needed.
                // For now, rely on backend window.

                if (data.hasNewOrders) {
                    play('new-order');
                    success('Novo Pedido!', 'Chegou um novo pedido!');
                }

                if (data.hasReadyOrders) {
                    play('ready');
                    info('Pedido Pronto!', 'Um pedido está pronto.');
                }

                if (data.hasCanceledOrders) {
                    play('error');
                    error('Pedido Cancelado', 'Um pedido foi cancelado.');
                }

            } catch (err) {
                console.error("Polling error", err);
            }
        };

        // Run immediately
        checkForUpdates();

        // Set interval
        const intervalId = setInterval(checkForUpdates, 15000); // 15 seconds

        return () => clearInterval(intervalId);
    }, [tenant?.id]); // Only re-run if tenant ID changes, NOT on every render/prop change

    const showTrialModal = tenant?.is_trial_expiring_soon && (tenant?.trial_days_remaining ?? 0) > 0;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-premium-dark transition-colors">
            <NotificationSettingsSync />
            {/* Sidebar */}
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <TopBar user={user || authUser} onMenuClick={() => setIsMobileMenuOpen(true)} />
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

            {/* Trial Expiring Modal */}
            {showTrialModal && (
                <TrialExpiringModal
                    daysRemaining={tenant?.trial_days_remaining ?? 0}
                    planName={tenant?.plan_display_name}
                />
            )}
        </div>
    );
}
