import { usePage } from '@inertiajs/react';
import { LayoutDashboard, Package, Clock, BarChart3, User, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import NavLink from './NavLink';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const { url } = usePage();

    const menuItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: route('motoboy.dashboard'),
            active: url === route('motoboy.dashboard'),
        },
        {
            label: 'Pedidos',
            icon: Package,
            href: route('motoboy.orders'),
            active: url.startsWith(route('motoboy.orders')),
        },
        {
            label: 'Histórico',
            icon: Clock,
            href: route('motoboy.history'),
            active: url === route('motoboy.history'),
        },
        {
            label: 'Métricas',
            icon: BarChart3,
            href: route('motoboy.metrics'),
            active: url === route('motoboy.metrics'),
        },
        {
            label: 'Notificações',
            icon: Bell,
            href: route('motoboy.notifications'),
            active: url === route('motoboy.notifications'),
        },
        {
            label: 'Perfil',
            icon: User,
            href: route('motoboy.profile'),
            active: url === route('motoboy.profile'),
        },
    ];

    return (
        <aside
            className={`
                bg-white border-r border-gray-200 transition-all duration-300 flex flex-col
                ${collapsed ? 'w-20' : 'w-64'}
            `}
        >
            {/* Logo Section */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#ff3d03] rounded-lg flex items-center justify-center text-white font-black text-sm">
                            Ó
                        </div>
                        <span className="font-black text-gray-900 text-lg">Motoboy</span>
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={collapsed ? 'Expandir' : 'Retrair'}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        active={item.active}
                        collapsed={collapsed}
                    />
                ))}
            </nav>

            {/* Footer Info */}
            {!collapsed && (
                <div className="border-t border-gray-200 p-4">
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>
                            <span className="font-bold">Versão:</span> 1.0
                        </p>
                        <p className="text-gray-400">© 2026 ÓoDelivery</p>
                    </div>
                </div>
            )}
        </aside>
    );
}
