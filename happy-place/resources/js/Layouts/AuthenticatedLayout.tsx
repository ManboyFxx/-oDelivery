import { ReactNode, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import TrialExpiringModal from '@/Components/TrialExpiringModal';
import { NotificationSettingsSync } from '@/Components/Toast/NotificationSettingsSync';

interface PageProps {
    auth: {
        user: any;
    };
    tenant?: {
        trial_days_remaining?: number;
        is_trial_expiring_soon?: boolean;
        plan_display_name?: string;
    };
}

export default function Authenticated({ user, header, children }: { user?: any, header?: ReactNode, children: ReactNode }) {
    const { auth, tenant } = usePage<PageProps>().props;
    const authUser = auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
