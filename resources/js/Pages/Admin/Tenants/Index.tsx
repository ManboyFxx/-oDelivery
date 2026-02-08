import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Search, Plus, MoreHorizontal, Filter, Download,
    Shield, Store, Calendar, CreditCard, AlertTriangle,
    Clock, Zap, Users, Package, ShoppingCart, CheckCircle, XCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Pagination from '@/Components/Pagination';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    email: string;
    plan: string;
    subscription_status: string;
    trial_ends_at: string | null;
    trial_days_remaining: number;
    is_trial_active: boolean;
    is_suspended: boolean;
    is_active: boolean;
    created_at: string;
    usage: {
        products: number;
        users: number;
        orders: number;
        motoboys: number; // Added back as it was in original
    };
    limits: {
        products: number | null;
        users: number | null;
        motoboys: number | null;
    };
}

interface IndexProps {
    tenants: {
        data: Tenant[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
        plan?: string;
        sort_by?: string;
        sort_desc?: string;
    };
    plans: Array<{ plan: string; display_name: string }>;
}

export default function AdminTenantsIndex({ tenants, filters, plans }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [plan, setPlan] = useState(filters.plan || 'all');
    const [extendingTrial, setExtendingTrial] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(route('admin.tenants.index'), {
                    search,
                    status: status !== 'all' ? status : undefined,
                    plan: plan !== 'all' ? plan : undefined
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'status') setStatus(value);
        if (key === 'plan') setPlan(value);

        router.get(route('admin.tenants.index'), {
            search,
            status: key === 'status' && value !== 'all' ? value : (status !== 'all' ? status : undefined),
            plan: key === 'plan' && value !== 'all' ? value : (plan !== 'all' ? plan : undefined)
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleExtendTrial = (tenantId: string, days: number) => {
        if (confirm(`Estender trial por ${days} dias?`)) {
            router.post(route('admin.tenants.extend-trial', tenantId), { days }, {
                onSuccess: () => setExtendingTrial(null),
            });
        }
    };

    const handleResetTrial = (tenantId: string) => {
        if (confirm('Resetar trial para 14 dias? Isso dará acesso PRO completo.')) {
            router.post(route('admin.tenants.reset-trial', tenantId));
        }
    };

    const handleForceUpgrade = (tenantId: string, plan: string) => {
        // Simple prompt for now, usually needs a modal
        if (confirm(`Forçar upgrade para plano ${plan.toUpperCase()}?`)) {
            router.post(route('admin.tenants.force-upgrade', tenantId), { plan });
        }
    };

    const getPlanBadge = (plan: string) => {
        const colors = {
            free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            pro: 'bg-gradient-to-r from-[#ff3d03] to-[#e63700] text-white',
            custom: 'bg-gradient-to-r from-purple-500 to-purple-700 text-white',
        };
        return colors[plan as keyof typeof colors] || colors.free;
    };

    const getTrialBadge = (tenant: Tenant) => {
        if (!tenant.is_trial_active) return null;

        const daysLeft = tenant.trial_days_remaining;
        const isExpiringSoon = daysLeft <= 3;

        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${isExpiringSoon
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                <Clock className="h-3 w-3" />
                Trial: {daysLeft}d restantes
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gerenciar Lojas" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Gerenciar Lojas
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {tenants.meta?.total || 0} lojas cadastradas
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {/* Export Button Placeholder */}
                        {/* <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Download className="h-4 w-4" />
                            Exportar
                         </button> */}

                        <Link
                            href={route('admin.tenants.create')}
                            className="flex items-center gap-2 px-6 py-3 bg-[#ff3d03] hover:bg-[#ff3d03]/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-[#ff3d03]/20 transition-all transform hover:scale-105"
                        >
                            <Plus className="h-4 w-4" />
                            Nova Loja
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-[#1a1b1e] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, domínio ou email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-[#ff3d03] focus:ring-[#ff3d03] text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <select
                            value={status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-[#ff3d03] focus:ring-[#ff3d03] text-sm font-medium min-w-[140px]"
                        >
                            <option value="all">Todos Status</option>
                            <option value="active">Ativos</option>
                            <option value="suspended">Suspensos</option>
                            <option value="trial">Em Trial</option>
                            <option value="inactive">Inativos</option>
                        </select>

                        <select
                            value={plan}
                            onChange={(e) => handleFilterChange('plan', e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-[#ff3d03] focus:ring-[#ff3d03] text-sm font-medium min-w-[140px]"
                        >
                            <option value="all">Todos Planos</option>
                            {plans && plans.map(p => (
                                <option key={p.plan} value={p.plan}>{p.display_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tenants List */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Loja</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Plano</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Uso</th>
                                    <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {tenants.data.map((tenant) => (
                                    <tr key={tenant.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#ff3d03] to-[#e63700] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#ff3d03]/20">
                                                    {tenant.slug.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={route('admin.tenants.edit', tenant.id)}
                                                        className="font-bold text-gray-900 dark:text-white hover:text-[#ff3d03] transition-colors"
                                                    >
                                                        {tenant.name}
                                                    </Link>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                        <span>{tenant.email}</span>
                                                        <span>•</span>
                                                        <a
                                                            href={`http://${tenant.slug}.oodelivery.com.br`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="hover:underline hover:text-[#ff3d03]"
                                                        >
                                                            {tenant.slug}.oodelivery.com.br
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold w-fit ${getPlanBadge(tenant.plan)}`}>
                                                    {tenant.plan.toUpperCase()}
                                                </span>
                                                {tenant.is_trial_active && getTrialBadge(tenant)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit ${tenant.is_suspended
                                                ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                                : tenant.is_active
                                                    ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${tenant.is_suspended ? 'bg-red-500' : tenant.is_active ? 'bg-green-500' : 'bg-gray-500'
                                                    }`}></span>
                                                {tenant.is_suspended ? 'Suspenso' : tenant.is_active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-xs space-y-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        <Package className="h-3 w-3" /> Prod.
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {tenant.usage.products}
                                                        <span className="text-gray-400 font-normal"> / {tenant.limits.products || '∞'}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        <ShoppingCart className="h-3 w-3" /> Ped.
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-white">{tenant.usage.orders}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Trial Actions */}
                                                {tenant.is_trial_active && (
                                                    <button
                                                        onClick={() => handleExtendTrial(tenant.id, 7)}
                                                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] font-bold transition-colors"
                                                        title="Estender +7 dias"
                                                    >
                                                        +7d
                                                    </button>
                                                )}

                                                <Link
                                                    href={route('admin.tenants.edit', tenant.id)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-[#ff3d03] transition-colors"
                                                    title="Editar"
                                                >
                                                    <Shield className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {tenants.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-500">
                                            <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <p className="font-medium">Nenhuma loja encontrada</p>
                                            <p className="text-xs mt-1">Tente ajustar os filtros de busca</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 dark:border-white/5">
                        <Pagination links={tenants.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
