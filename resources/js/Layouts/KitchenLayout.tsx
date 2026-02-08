import { PropsWithChildren, useState, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { Maximize, Minimize, Power, Clock } from 'lucide-react';

interface KitchenLayoutProps {
    isFullscreen: boolean;
    toggleFullscreen: () => void;
}

export default function KitchenLayout({ children, isFullscreen, toggleFullscreen }: PropsWithChildren<KitchenLayoutProps>) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Minimalist Header */}
            <header className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 shadow-lg shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/" className="shrink-0">
                        <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                    </Link>
                    <div className="h-6 w-px bg-gray-600 mx-2"></div>
                    <h1 className="text-xl font-bold tracking-tight text-white/90">
                        KDS - Kitchen Display System
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    {/* Clock */}
                    <div className="flex items-center gap-2 text-gray-300 font-mono text-lg bg-gray-900/50 px-4 py-1.5 rounded-lg border border-gray-700">
                        <Clock className="h-4 w-4 text-[#ff3d03]" />
                        <span>
                            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
                            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                        >
                            {isFullscreen ? (
                                <Minimize className="h-5 w-5" />
                            ) : (
                                <Maximize className="h-5 w-5" />
                            )}
                        </button>

                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#ff3d03] hover:bg-[#e63700] rounded-lg transition-colors"
                        >
                            <Power className="h-4 w-4" />
                            <span className="hidden sm:inline">Sair</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 p-4 overflow-auto scrollbar-hide">
                    {children}
                </div>
            </main>
        </div>
    );
}
