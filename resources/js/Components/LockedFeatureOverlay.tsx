import { Lock } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

interface Props {
    title?: string;
    description?: string;
    children: React.ReactNode;
    isLocked: boolean;
}

export default function LockedFeatureOverlay({
    title = "Funcionalidade Premium",
    description = "Disponível no plano PRO.",
    children,
    isLocked
}: Props) {
    if (!isLocked) return <>{children}</>;

    return (
        <div className="relative group overflow-hidden rounded-xl border border-gray-200">
            {/* Blured Content */}
            <div className="filter blur-sm select-none pointer-events-none opacity-40 transition-all duration-300">
                {children}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-gray-900/60 transition-opacity">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl text-center max-w-sm border border-gray-100 dark:border-gray-700 transform scale-100 transition-transform">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 dark:text-gray-400">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{description}</p>

                    <Link href={route('subscription.plans')}>
                        <PrimaryButton className="w-full justify-center bg-gray-900 hover:bg-gray-800">
                            Fazer Upgrade
                        </PrimaryButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}
