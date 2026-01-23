import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    ChefHat,
    LayoutDashboard,
    LayoutGrid,
    Menu,
    Monitor,
    Package,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Ticket,
    Users,
    UserCog,
    Bike,
    Image as ImageIcon,
    ShieldCheck,
    BarChart3,
    LogOut,
    UtensilsCrossed,
    Gift,
    X
} from 'lucide-react';
import { clsx } from 'clsx';
import type { ElementType } from 'react';
import { useState, useEffect } from 'react';

interface LinkItem {
    name: string;
    href: string;
    icon: ElementType;
    current: boolean;
    route?: string;
}

interface Group {
    title: string;
    items: LinkItem[];
}

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const { url } = usePage();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isCurrent = (path: string) => url.startsWith(path);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
        onClose?.();
    }, [url]);

    const handleLinkClick = () => {
        setIsMobileOpen(false);
        onClose?.();
    };

    const groups: Group[] = [
        {
            title: '',
            items: [
                { name: 'Dashboard', href: route('dashboard'), route: 'dashboard', icon: LayoutDashboard, current: isCurrent('/dashboard') },
            ]
        },
        {
            title: 'OPERAÇÕES',
            items: [
                { name: 'PDV', href: route('pdv.index'), route: 'pdv.index', icon: Monitor, current: isCurrent('/pdv') },
                { name: 'Cozinha', href: route('kitchen.index'), route: 'kitchen.index', icon: ChefHat, current: isCurrent('/kitchen') },
                { name: 'Pedidos', href: route('orders.index'), route: 'orders.index', icon: ShoppingBag, current: isCurrent('/orders') },
                { name: 'Entregas', href: '#', icon: Bike, current: isCurrent('/deliveries') },
            ]
        },
        {
            title: 'CARDÁPIO',
            items: [
                { name: 'Cardápio Digital', href: route('menu.index'), route: 'menu.index', icon: BookOpen, current: isCurrent('/cardapio') },
                { name: 'Produtos', href: route('products.index'), route: 'products.index', icon: UtensilsCrossed, current: isCurrent('/products') },
                { name: 'Estoque', href: '#', icon: Package, current: isCurrent('/stock') },
                { name: 'Badges', href: '#', icon: Award, current: isCurrent('/badges') },
                { name: 'Mídia', href: '#', icon: ImageIcon, current: isCurrent('/media') },
            ]
        },
        {
            title: 'MARKETING',
            items: [
                { name: 'Clientes', href: route('customers.index'), route: 'customers.index', icon: Users, current: isCurrent('/customers') },
                { name: 'Fidelidade', href: route('loyalty.index'), route: 'loyalty.index', icon: Gift, current: isCurrent('/fidelidade') },
                { name: 'Cupons', href: route('coupons.index'), route: 'coupons.index', icon: Ticket, current: isCurrent('/coupons') },
            ]
        },
        {
            title: 'GESTÃO',
            items: [
                { name: 'Financeiro', href: '#', icon: BarChart3, current: isCurrent('/relatorio') },
                { name: 'Funcionários', href: '#', icon: UserCog, current: isCurrent('/funcionarios') },
                { name: 'Segurança', href: '#', icon: ShieldCheck, current: isCurrent('/security') },
                { name: 'Configurações', href: route('settings.index'), route: 'settings.index', icon: Settings, current: isCurrent('/settings') },
            ]
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {(isOpen || isMobileOpen) && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => {
                        setIsMobileOpen(false);
                        onClose?.();
                    }}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0f1012] text-gray-900 dark:text-gray-100 transition-transform duration-300 ease-in-out",
                (isOpen || isMobileOpen) ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="flex flex-col h-full">
                    {/* Brand + Close Button (Mobile) */}
                    <div className="px-6 py-6 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1">
                                <img src="/images/logo.png" alt="Logo" className="h-full w-full object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm leading-tight">ÓoDelivery</span>
                                <span className="text-[10px] text-gray-500 uppercase">Sistema de Gestão</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIsMobileOpen(false);
                                onClose?.();
                            }}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-700">
                        <nav className="flex flex-col gap-6 ">
                            {groups.map((group, groupIndex) => (
                                <div key={groupIndex}>
                                    {group.title && (
                                        <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500">
                                            {group.title}
                                        </h3>
                                    )}
                                    <div className="space-y-0.5">
                                        {group.items.map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                onClick={handleLinkClick}
                                                className={clsx(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative',
                                                    link.current
                                                        ? 'bg-[#ff3d03]/10 text-[#ff3d03] dark:bg-[#ff3d03] dark:text-white font-bold'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
                                                )}
                                            >
                                                <link.icon className={clsx("h-5 w-5", link.current ? "text-[#ff3d03] dark:text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200")} />
                                                {link.name}
                                                {link.current && (
                                                    <div className="absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-l-full bg-[#ff3d03] dark:bg-white hidden"></div>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0f1012]">
                    <div className="mb-2 px-2 text-[10px] text-gray-500 text-center">
                        © 2026 ÓoDelivery. Todos os direitos reservados. v4.0.0
                    </div>
                    <Link
                        href={route('logout')}
                        onClick={handleLinkClick}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Sair
                    </Link>
                </div>
            </div>
        </>
    );
}
