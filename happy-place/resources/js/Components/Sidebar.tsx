import { Link, usePage } from '@inertiajs/react';
import { useAudio } from '@/Hooks/useAudio';
import { Volume2 } from 'lucide-react';
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
    X,
    CreditCard,
    Store, // Added
    Trophy, // Added
    Layers, // Added
    Printer, // Added
    Key, // Added
    Box, // Added
    MessageSquare // Added for WhatsApp
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
    const { url, props } = usePage();
    const user = (props.auth as any).user;
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Get tenant features from props
    // const tenant = (props as any).tenant;
    // const features = tenant?.features || [];

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

    const tenantGroups: Group[] = [
        {
            title: 'Visão Geral',
            items: [
                { name: 'Dashboard', href: route('dashboard'), route: 'dashboard', icon: LayoutDashboard, current: isCurrent('/dashboard') },
                { name: 'Minha Assinatura', href: route('subscription.index'), route: 'subscription.index', icon: CreditCard, current: isCurrent('/subscription') },
            ]
        },
        {
            title: 'Vendas',
            items: [
                { name: 'PDV / Caixa', href: route('pdv.index'), route: 'pdv.index', icon: Monitor, current: isCurrent('/pdv') },
                { name: 'Pedidos', href: route('orders.index'), route: 'orders.index', icon: ShoppingBag, current: isCurrent('/orders') },
                { name: 'Cozinha (KDS)', href: route('kitchen.index'), route: 'kitchen.index', icon: ChefHat, current: isCurrent('/kitchen') },
            ]
        },
        {
            title: 'Cardápio',
            items: [
                { name: 'Gestão de Cardápio', href: route('menu.index'), route: 'menu.index', icon: BookOpen, current: isCurrent('/cardapio') },
                { name: 'Produtos', href: route('products.index'), route: 'products.index', icon: Package, current: isCurrent('/products') },
            ]
        },
        {
            title: 'Gestão',
            items: [
                { name: 'Clientes', href: route('customers.index'), route: 'customers.index', icon: Users, current: isCurrent('/customers') },
                { name: 'Equipe', href: route('employees.index'), route: 'employees.index', icon: UserCog, current: isCurrent('/employees') },
                { name: 'Fidelidade', href: route('loyalty.index'), route: 'loyalty.index', icon: Trophy, current: isCurrent('/loyalty') },
                { name: 'Estoque', href: route('stock.index'), route: 'stock.index', icon: Box, current: isCurrent('/estoque') },
                { name: 'Financeiro', href: route('financial.index'), route: 'financial.index', icon: BarChart3, current: isCurrent('/financeiro') },
            ]
        },
        {
            title: 'Marketing',
            items: [
                { name: 'Cupons', href: route('coupons.index'), route: 'coupons.index', icon: Ticket, current: isCurrent('/coupons') },
                { name: 'WhatsApp', href: route('whatsapp.index'), route: 'whatsapp.index', icon: MessageSquare, current: isCurrent('/whatsapp') },
            ]
        },
        {
            title: 'Configurações',
            items: [
                { name: 'Loja', href: route('settings.index'), route: 'settings.index', icon: Store, current: isCurrent('/settings') },
            ]
        }
    ];

    const superAdminGroups: Group[] = [
        {
            title: 'Administração',
            items: [
                { name: 'Dashboard', href: route('admin.dashboard'), route: 'admin.dashboard', icon: LayoutDashboard, current: isCurrent('/admin/dashboard') },
                { name: 'Tenants', href: route('admin.tenants.index'), route: 'admin.tenants.index', icon: Store, current: isCurrent('/admin/tenants') },
            ]
        },
        {
            title: 'Sistema',
            items: [
                { name: 'API Keys', href: route('admin.api-keys.index'), route: 'admin.api-keys.index', icon: Key, current: isCurrent('/admin/api-keys') },
                { name: 'WhatsApp Master', href: route('admin.whatsapp.index'), route: 'admin.whatsapp.index', icon: MessageSquare, current: isCurrent('/admin/whatsapp') && !isCurrent('/admin/whatsapp/templates') },
                { name: 'Templates Padrão', href: route('admin.whatsapp.templates.index'), route: 'admin.whatsapp.templates.index', icon: BookOpen, current: isCurrent('/admin/whatsapp/templates') },
                { name: 'Logs de Segurança', href: route('admin.logs.security'), route: 'admin.logs.security', icon: ShieldCheck, current: isCurrent('/admin/logs') },
            ]
        }
    ];

    const groups = user.role === 'super_admin' ? superAdminGroups : tenantGroups;

    return (
        <>
            {/* Mobile Overlay */}
            {(isOpen || isMobileOpen) && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => {
                        setIsMobileOpen(false);
                        onClose?.();
                    }}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 flex h-screen w-72 flex-col justify-between border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a1b1e] shadow-xl shadow-gray-200/50 dark:shadow-black/20 transition-transform duration-300 ease-in-out",
                (isOpen || isMobileOpen) ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="flex flex-col h-full">
                    {/* Brand Section */}
                    <div className="relative pt-8 pb-6 px-6 bg-gradient-to-br from-[#ffffff] to-[#fff5f2] dark:from-[#1a1b1e] dark:to-[#2C2D33]">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-[#ff3d03] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff3d03]/20">
                                <span className="font-black text-white text-lg tracking-tighter">Óo</span>
                            </div>
                            <div>
                                <h1 className="font-black text-xl tracking-tight text-gray-900 dark:text-white">ÓoDelivery</h1>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Painel</p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsMobileOpen(false);
                                onClose?.();
                            }}
                            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        <nav className="flex flex-col gap-6">
                            {groups.map((group, groupIndex) => (
                                <div key={groupIndex}>
                                    {group.title && (
                                        <h3 className="mb-3 px-3 text-[11px] font-black uppercase tracking-widest text-gray-400">
                                            {group.title}
                                        </h3>
                                    )}
                                    <div className="space-y-1">
                                        {group.items.map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                onClick={handleLinkClick}
                                                className={clsx(
                                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all group relative overflow-hidden',
                                                    link.current
                                                        ? 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/30'
                                                        : 'text-gray-500 hover:bg-orange-50 hover:text-[#ff3d03]'
                                                )}
                                            >
                                                <link.icon className={clsx(
                                                    "h-5 w-5 transition-transform group-hover:scale-110",
                                                    link.current ? "text-white" : "text-gray-400 group-hover:text-[#ff3d03]"
                                                )} />
                                                <span className="relative z-10">{link.name}</span>

                                                {!link.current && (
                                                    <div className="absolute inset-y-0 left-0 w-1 bg-[#ff3d03] opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <Link
                        href={route('logout')}
                        onClick={handleLinkClick}
                        method="post"
                        as="button"
                        className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200 hover:border-red-100 bg-white shadow-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Sair do Sistema
                    </Link>
                    <div className="mt-3 text-[10px] text-gray-400 text-center font-medium">
                        © 2026 ÓoDelivery v4.0.0 Pro
                    </div>
                </div>
            </div>
        </>
    );
}
