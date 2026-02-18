import { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Building2, Key, Shield, FileText, LogOut, LayoutDashboard, Ticket } from 'lucide-react';

export default function AdminLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: url === '/dashboard' },
        { name: 'Estabelecimentos', href: '/admin/tenants', icon: Building2, current: url.startsWith('/admin/tenants') },
        { name: 'Chaves de API', href: '/admin/api-keys', icon: Key, current: url.startsWith('/admin/api-keys') },
        { name: 'Logs de Segurança', href: '/admin/logs/security', icon: Shield, current: url.startsWith('/admin/logs/security') },
        { name: 'Logs de Auditoria', href: '/admin/logs/audit', icon: FileText, current: url.startsWith('/admin/logs/audit') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex flex-col items-center justify-center px-6 py-10 border-b border-gray-200 dark:border-gray-700 gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-white/5 p-2 shadow-sm border border-gray-100 dark:border-white/5">
                            <img src="/images/logo-icon.png" alt="Logo" className="h-full w-full object-contain dark:brightness-0 dark:invert" />
                        </div>
                        <div className="text-center">
                            <h1 className="font-black text-xs tracking-[0.3em] text-[#ff3d03] uppercase mb-1">ÓoDelivery</h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Admin CMS</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.current
                                        ? 'bg-[#ff3d03] text-white'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Sair
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pl-64">
                <main className="py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
