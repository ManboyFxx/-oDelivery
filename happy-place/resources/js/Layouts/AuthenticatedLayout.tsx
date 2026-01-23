import { ReactNode, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';

export default function Authenticated({ user, header, children }: { user?: any, header?: ReactNode, children: ReactNode }) {
    const authUser = usePage().props.auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Sidebar */}
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <TopBar user={user || authUser} onMenuClick={() => setIsMobileMenuOpen(true)} />
                {header && (
                    <header className="bg-white dark:bg-[#1a1b1e] shadow">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
