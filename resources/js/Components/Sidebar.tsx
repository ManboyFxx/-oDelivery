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
    MessageSquare, // Added for WhatsApp
    Download // Added for System
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
                { name: 'Fidelidade', href: route('loyalty.index'), route: 'loyalty.index', icon: Trophy, current: isCurrent('/fidelidade') },
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
        },
        {
            title: 'Sistema',
            items: [
                { name: 'Apps & Downloads', href: route('system.downloads'), route: 'system.downloads', icon: Download, current: isCurrent('/sistema/downloads') },
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
                "fixed lg:static inset-y-0 left-0 z-50 flex h-screen w-72 flex-col justify-between border-r border-[#0B1228]/10 dark:border-[#0B1228]/30 bg-[#0B1228] shadow-xl shadow-black/20 transition-transform duration-300 ease-in-out",
                (isOpen || isMobileOpen) ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="flex flex-col h-full">
                    {/* Brand Section */}
                    <div className="relative pt-8 pb-6 px-6 bg-[#0B1228] border-b border-white/5">
                        <div className="flex items-center gap-4 px-4">
                            <div className="flex flex-col items-center w-full gap-2">
                                <img
                                    src="/images/logo.png"
                                    alt="ÓoDelivery"
                                    className="h-16 w-auto"
                                />
                                <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Sistema de gestão</p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsMobileOpen(false);
                                onClose?.();
                            }}
                            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
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
                                        <h3 className={clsx(
                                            "mb-3 px-3 text-[11px] font-black uppercase tracking-widest",
                                            group.title === 'Sistema' ? "text-cyan-400" : "text-white/40"
                                        )}>
                                            {group.title}
                                        </h3>
                                    )}
                                    <div className="space-y-1">
                                        {group.items.map((link) => {
                                            const isSystem = link.name === 'Apps & Downloads';
                                            return (
                                                <Link
                                                    key={link.name}
                                                    href={link.href}
                                                    onClick={handleLinkClick}
                                                    className={clsx(
                                                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all group relative overflow-hidden',
                                                        link.current
                                                            ? (isSystem
                                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                                : 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/30')
                                                            : (isSystem
                                                                ? 'text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-400'
                                                                : 'text-white/70 hover:bg-white/5 hover:text-white')
                                                    )}
                                                >
                                                    <link.icon className={clsx(
                                                        "h-5 w-5 transition-transform group-hover:scale-110",
                                                        link.current
                                                            ? (isSystem ? "text-cyan-400" : "text-white")
                                                            : (isSystem ? "text-cyan-400/50 group-hover:text-cyan-400" : "text-white/50 group-hover:text-white")
                                                    )} />
                                                    <span className="relative z-10">{link.name}</span>

                                                    {!link.current && (
                                                        <div className={clsx(
                                                            "absolute inset-y-0 left-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                                            isSystem ? "bg-cyan-400" : "bg-[#ff3d03]"
                                                        )} />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-white/5 bg-[#0B1228]">
                    <Link
                        href={route('logout')}
                        onClick={handleLinkClick}
                        method="post"
                        as="button"
                        className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white hover:bg-red-500 hover:text-white transition-all border border-white/10 hover:border-red-500 bg-[#0B1228] shadow-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Sair do Sistema
                    </Link>
                    <div className="mt-3 text-[10px] text-white/30 text-center font-medium">
                        © 2026 ÓoDelivery v4.0.0 Pro
                    </div>
                </div>
            </div>
        </>
    );
}
