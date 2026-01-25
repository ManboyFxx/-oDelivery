import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Users,
    Store,
    CreditCard,
    Activity,
    ArrowUpRight,
    Search,
    Filter,
    MoreHorizontal,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';

interface DashboardProps {
    auth: any;
    metrics: {
        total_tenants: number;
        active_tenants: number;
        trial_tenants: number;
        mrr: number;
    };
    recent_tenants: Array<{
        id: string;
        name: string;
        slug: string;
        plan: string;
        status: string;
        created_at: string;
    }>;
}

export default function AdminDashboard({ auth, metrics, recent_tenants }: DashboardProps) {
    const stats = [
        {
            title: 'Total de Lojas',
            value: metrics.total_tenants.toString(),
            change: '+12.5%',
            trend: 'up',
            icon: Store,
            primary: true,
        },
        {
            title: 'Lojas Ativas',
            value: metrics.active_tenants.toString(),
            change: '+5.2%',
            trend: 'up',
            icon: Activity,
            primary: false,
        },
        {
            title: 'Em Trial',
            value: metrics.trial_tenants.toString(),
            change: '+2.1%',
            trend: 'up',
            icon: Users,
            primary: false,
        },
        {
            title: 'MRR Estimado',
            value: `R$ ${metrics.mrr.toFixed(2)}`,
            change: '+0.0%',
            trend: 'neutral',
            icon: CreditCard,
            primary: false,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Super Admin Dashboard" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#ff3d03]/10 text-[#ff3d03] text-[10px] font-bold uppercase tracking-wider">
                                Super Admin
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Visão Geral do Sistema</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monitoramento global da plataforma ÓoDelivery</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1b1e] text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-[#25262b] transition-colors border border-gray-100 dark:border-white/5">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <span>Filtros</span>
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all">
                            <TrendingUp className="h-4 w-4" />
                            Relatórios
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-[24px] p-6 bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl transition-colors ${stat.primary
                                    ? 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/30'
                                    : 'bg-orange-50 dark:bg-orange-500/10 text-[#ff3d03] group-hover:bg-[#ff3d03] group-hover:text-white'
                                    }`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                {stat.change && (
                                    <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                                        <ArrowUpRight className="h-3 w-3" />
                                        {stat.change}
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                    {stat.title}
                                </p>
                                <h3 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                    {stat.value}
                                </h3>
                            </div>

                            {/* Decorative gradient */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff3d03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>

                {/* Recent Tenants Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                    <Store className="h-5 w-5 text-[#ff3d03]" />
                                    Lojas Recentes
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Últimos cadastros na plataforma</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar loja..."
                                    className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border-none text-sm focus:ring-2 focus:ring-[#ff3d03]/20"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-white/5">
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Loja</th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Plano</th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cadastro</th>
                                        <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_tenants.map((tenant) => (
                                        <tr key={tenant.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/5 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 text-sm">
                                                        {tenant.slug.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{tenant.name}</p>
                                                        <p className="text-xs text-gray-500">/{tenant.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-bold">
                                                    {tenant.plan}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit ${tenant.status === 'Ativo'
                                                        ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                        : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${tenant.status === 'Ativo' ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></span>
                                                    {tenant.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-500 font-medium">
                                                {tenant.created_at}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Monitoring */}
                    <div className="space-y-6">
                        <div className="bg-[#111827] dark:bg-[#000000] rounded-[32px] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3d03] opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <h3 className="font-bold text-xl mb-6 relative z-10 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-[#ff3d03]" />
                                Integridade
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                        <span className="font-medium text-sm">API Gateway</span>
                                    </div>
                                    <span className="text-xs font-bold text-green-400">14ms</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                        <span className="font-medium text-sm">Database (Primary)</span>
                                    </div>
                                    <span className="text-xs font-bold text-green-400">Stable</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                        <span className="font-medium text-sm">Job Workers</span>
                                    </div>
                                    <span className="text-xs font-bold text-green-400">Idle</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Uso de CPU</span>
                                    <span className="font-bold">12%</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[12%] rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Ações Rápidas</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-[#ff3d03]/10 border border-transparent hover:border-[#ff3d03]/20 transition-all group text-left">
                                    <Store className="h-6 w-6 text-gray-400 group-hover:text-[#ff3d03] mb-2 transition-colors" />
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-[#ff3d03]">Novo Tenant</span>
                                </button>
                                <button className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-[#ff3d03]/10 border border-transparent hover:border-[#ff3d03]/20 transition-all group text-left">
                                    <Users className="h-6 w-6 text-gray-400 group-hover:text-[#ff3d03] mb-2 transition-colors" />
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-[#ff3d03]">Gerenciar Usuários</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
