import { Bell, Search, Moon, Sun, Menu } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';

export default function TopBar({ user, onMenuClick }: { user: any; onMenuClick?: () => void }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 dark:border-gray-800 dark:bg-gray-950 transition-colors">
            {/* Left Actions: Hamburger (Mobile) + Store Status & Search */}
            <div className="flex items-center gap-3">
                {/* Hamburger Menu (Mobile Only) */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                    aria-label="Abrir menu"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <span className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    LOJA ABERTA
                </span>
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar pedidos, clientes, produtos..."
                        className="h-10 w-48 md:w-64 lg:w-80 rounded-full border-none bg-gray-100 pl-10 text-sm outline-none focus:ring-2 focus:ring-[#ff3d03]/20 dark:bg-gray-900 dark:text-gray-100 placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>

                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex items-center gap-3 text-left">
                            <div className="h-9 w-9 bg-[#ff3d03]/10 text-[#ff3d03] rounded-lg flex items-center justify-center font-bold text-sm">
                                AD
                            </div>
                            <div className="hidden md:block">
                                <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">Admin Delivery</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Proprietário</p>
                            </div>
                        </button>
                    </Dropdown.Trigger>

                    <Dropdown.Content>
                        <Dropdown.Link href={route('profile.edit')}>Perfil</Dropdown.Link>
                        <Dropdown.Link href={route('logout')} method="post" as="button">
                            Sair
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </header>
    );
}
