import { Lock } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

interface Props {
    title?: string;
    description?: string;
    children: React.ReactNode;
    isLocked: boolean;
    light?: boolean;
}

export default function LockedFeatureOverlay({
    title = "Funcionalidade Premium",
    description = "Disponível no plano PRO.",
    children,
    isLocked,
    light = false
}: Props) {
    if (!isLocked) return <>{children}</>;

    return (
        <div className={`relative group overflow-hidden rounded-xl ${light ? '' : 'border border-gray-200'}`}>
            {/* Blured Content */}
            <div className={`filter blur-sm select-none pointer-events-none transition-all duration-300 ${light ? 'opacity-30' : 'opacity-40'}`}>
                {children}
            </div>

            {/* Overlay */}
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center transition-opacity ${light ? 'bg-orange-600/20' : 'bg-white/60 dark:bg-gray-900/60'}`}>
                <div className={`${light
                    ? 'bg-white/20 backdrop-blur-md border border-white/20 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white'
                    } p-6 rounded-2xl shadow-xl text-center max-w-sm transform scale-100 transition-transform`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${light
                        ? 'bg-white text-[#ff3d03]'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                        <Lock className="w-6 h-6" />
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${light ? 'text-white' : ''}`}>{title}</h3>
                    <p className={`text-sm mb-6 ${light ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{description}</p>

                    <Link href={route('subscription.index')}>
                        <PrimaryButton className={`w-full justify-center ${light ? 'bg-white !text-[#ff3d03] hover:bg-gray-50 shadow-lg' : 'bg-gray-900 hover:bg-gray-800'}`}>
                            Fazer Upgrade
                        </PrimaryButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}
