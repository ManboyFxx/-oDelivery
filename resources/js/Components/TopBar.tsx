import { Bell, Search, Moon, Sun, Menu, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import StoreStatusControls from '@/Components/StoreStatusControls';

export default function TopBar({ user, onMenuClick, hasUnread = false, onRead }: { user: any; onMenuClick?: () => void; hasUnread?: boolean; onRead?: () => void }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDarkMode(true);
        }
    };

    return (
        <header className="flex h-20 items-center justify-between bg-white px-4 md:px-8 dark:bg-[#0f1012] transition-colors border-b border-gray-100 dark:border-white/5">
            {/* Left Actions: Hamburger (Mobile) + Store Status & Search */}
            <div className="flex items-center gap-6">
                {/* Hamburger Menu (Mobile Only) */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                    aria-label="Abrir menu"
                >
                    <Menu className="h-6 w-6" />
                </button>

                {/* Greeting removed */}

                <div className="relative hidden sm:block group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff3d03] transition-colors" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="h-11 w-64 rounded-2xl border-none bg-gray-100 pl-11 text-sm font-medium outline-none focus:ring-2 focus:ring-[#ff3d03]/20 dark:bg-[#1a1b1e] dark:text-gray-100 placeholder-gray-500 transition-all"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-4">
                <StoreStatusControls />

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    <button
                        onClick={onRead}
                        className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors group"
                    >
                        <Bell className={`h-5 w-5 ${hasUnread ? 'text-[#ff3d03] animate-bounce' : ''}`} />
                        {hasUnread && (
                            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[#ff3d03] ring-2 ring-white dark:ring-[#0f1012] animate-pulse shadow-[0_0_8px_rgba(255,61,3,0.6)]"></span>
                        )}
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex items-center gap-3 text-left pl-2 pr-1 py-1 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                            <div className="h-9 w-9 bg-gradient-to-br from-[#ff3d03] to-[#d63302] text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-[#ff3d03]/20 group-hover:scale-105 transition-transform">
                                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight group-hover:text-[#ff3d03] transition-colors">{user?.name || 'Administrador'}</p>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                                    {user?.role === 'super_admin' ? 'Super Admin' : 'Proprietário'}
                                    <ChevronDown className="h-3 w-3" />
                                </div>
                            </div>
                        </button>
                    </Dropdown.Trigger>

                    <Dropdown.Content>
                        <Dropdown.Link href={route('logout')} method="post" as="button">
                            Sair
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </header>
    );
}
