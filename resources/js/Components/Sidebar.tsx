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
    Download, // Added for System
    LifeBuoy // Added for Support
} from 'lucide-react';
import { clsx } from 'clsx';
import type { ElementType } from 'react';
import { useState, useEffect, useRef } from 'react';

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
    const scrollRef = useRef<HTMLDivElement>(null);

    // Persist Sidebar Scroll Position
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const savedPosition = sessionStorage.getItem('sidebar-scroll-position');
        if (savedPosition) {
            scrollContainer.scrollTop = parseInt(savedPosition, 10);
        }

        const handleScroll = () => {
            sessionStorage.setItem('sidebar-scroll-position', scrollContainer.scrollTop.toString());
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

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

    // ============================================================================
    // GRUPOS DE ROTAS POR ROLE
    // ============================================================================

    // Itens disponíveis para TODOS (admin + employee)
    const operationalGroups: Group[] = [
        {
            title: 'Operação',
            items: [
                { name: 'PDV / Caixa', href: route('pdv.index'), route: 'pdv.index', icon: Monitor, current: isCurrent('/pdv') },
                { name: 'Pedidos', href: route('orders.index'), route: 'orders.index', icon: ShoppingBag, current: isCurrent('/orders') },
                { name: 'Cozinha (KDS)', href: route('kitchen.index'), route: 'kitchen.index', icon: ChefHat, current: isCurrent('/kitchen') },
                { name: 'Estoque', href: route('stock.index'), route: 'stock.index', icon: Box, current: isCurrent('/estoque') },
            ]
        },
        {
            title: 'Cardápio',
            items: [
                { name: 'Gestão de Cardápio', href: route('menu.index'), route: 'menu.index', icon: BookOpen, current: isCurrent('/cardapio') },
                { name: 'Produtos', href: route('products.index'), route: 'products.index', icon: Package, current: isCurrent('/products') },
            ]
        },
    ];

    // Itens APENAS para ADMIN
    const adminOnlyGroups: Group[] = [
        {
            title: 'Visão Geral',
            items: [
                { name: 'Dashboard', href: route('dashboard'), route: 'dashboard', icon: LayoutDashboard, current: isCurrent('/dashboard') },
                { name: 'Minha Assinatura', href: route('subscription.index'), route: 'subscription.index', icon: CreditCard, current: isCurrent('/subscription') },
            ]
        },
        {
            title: 'Gestão',
            items: [
                { name: 'Clientes', href: route('customers.index'), route: 'customers.index', icon: Users, current: isCurrent('/customers') },
                { name: 'Equipe', href: route('employees.index'), route: 'employees.index', icon: UserCog, current: isCurrent('/employees') },
                { name: 'Fidelidade', href: route('loyalty.index'), route: 'loyalty.index', icon: Trophy, current: isCurrent('/fidelidade') },
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



    const supportGroup: Group = {
        title: 'Ajuda',
        items: [
            { name: 'Suporte', href: route('support.index'), route: 'support.index', icon: LifeBuoy, current: isCurrent('/suporte') },
        ]
    };

    // Monta grupos baseado no role
    const tenantGroups: Group[] = user.role === 'admin'
        ? [...operationalGroups, ...adminOnlyGroups, supportGroup]
        : [...operationalGroups, supportGroup];

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

    const limits = (props as any).tenant?.limits;

    return (
        <>
            {/* Mobile Overlay */}
            {(isOpen || isMobileOpen) && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => {
                        setIsMobileOpen(false);
                        onClose?.();
                    }}
                />
            )}

            {/* Sidebar Container */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col justify-between border-r border-white/5 bg-[#0a0a0a] selection:bg-orange-500/20 transition-transform duration-300 ease-out",
                (isOpen || isMobileOpen) ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Brand Section - Fixed Top */}
                <div className="flex-none pt-8 pb-6 px-6 bg-[#0a0a0a]">
                    <div className="flex items-center gap-4 px-2">
                        <div className="flex flex-col w-full gap-1">
                            <img
                                src="/images/logo.png"
                                alt="ÓoDelivery"
                                className="h-14 w-auto object-contain mx-auto mb-2"
                            />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Painel Gestor</p>
                            </div>
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

                {/* Navigation - Scrollable Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">

                    <nav className="flex flex-col gap-6 pb-6">
                        {groups.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                {group.title && (
                                    <h3 className={clsx(
                                        "mb-2 px-4 text-[10px] font-black uppercase tracking-widest",
                                        group.title === 'Sistema' ? "text-cyan-500/80" : "text-white/30"
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
                                                    'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200',
                                                    link.current
                                                        ? (isSystem
                                                            ? 'bg-cyan-500/10 text-cyan-400'
                                                            : 'bg-[#ff3d03]/10 text-[#ff3d03]')
                                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                )}
                                            >
                                                {/* Active Indicator Line */}
                                                {link.current && (
                                                    <div className={clsx(
                                                        "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full",
                                                        isSystem ? "bg-cyan-400" : "bg-[#ff3d03]"
                                                    )} />
                                                )}

                                                <link.icon className={clsx(
                                                    "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                                                    link.current
                                                        ? (isSystem ? "text-cyan-400" : "text-[#ff3d03]")
                                                        : "text-gray-500 group-hover:text-white"
                                                )} />
                                                <span className="relative z-10 font-bold tracking-wide">{link.name}</span>

                                                {/* Hover Glow Effect */}
                                                {!link.current && (
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Plan Limits Widget */}
                {/* Plan Limits Widget */}
                {limits && limits.products && limits.orders && (
                    <div className="mx-4 mb-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-3 opacity-60">
                            <BarChart3 size={14} className="text-white" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Consumo do Plano</span>
                        </div>

                        {/* Products */}
                        <div className="mb-3">
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                <span>Produtos</span>
                                <span>{limits.products.used} / {limits.products.max ?? '∞'}</span>
                            </div>
                            {limits.products.max ? (
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={clsx(
                                            "h-full rounded-full transition-all duration-500",
                                            (limits.products.used / limits.products.max) > 0.9 ? "bg-red-500" : "bg-[#ff3d03]"
                                        )}
                                        style={{ width: `${Math.min((limits.products.used / limits.products.max) * 100, 100)}%` }}
                                    />
                                </div>
                            ) : (
                                <span className="text-[10px] text-green-400 font-bold">Ilimitado</span>
                            )}
                        </div>

                        {/* Orders */}
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                <span>Pedidos (Mês)</span>
                                <span>{limits.orders.used} / {limits.orders.max ?? '∞'}</span>
                            </div>
                            {limits.orders.max ? (
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={clsx(
                                            "h-full rounded-full transition-all duration-500",
                                            (limits.orders.used / limits.orders.max) > 0.9 ? "bg-red-500" : "bg-blue-500"
                                        )}
                                        style={{ width: `${Math.min((limits.orders.used / limits.orders.max) * 100, 100)}%` }}
                                    />
                                </div>
                            ) : (
                                <span className="text-[10px] text-green-400 font-bold">Ilimitado</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer / User Profile - Fixed Bottom */}
                <div className="flex-none p-4 bg-[#0a0a0a] border-t border-white/5">
                    <Link
                        href={route('logout')}
                        onClick={handleLinkClick}
                        method="post"
                        as="button"
                        className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                    >
                        <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        <span>Sair do Sistema</span>
                    </Link>

                    <div className="mt-4 px-2 flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-medium text-white">v4.0.0 Pro</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                </div>
            </aside>
        </>
    );
}
