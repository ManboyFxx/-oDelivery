import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Users, Store, ShoppingBag, TrendingUp, AlertTriangle,
    CheckCircle, XCircle, Activity, Server, Printer, MessageCircle
} from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
    metrics: {
        total_tenants: number;
        active_tenants: number;
        trial_tenants: number;
        new_tenants: number;
        total_orders: number;
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
    system_health: {
        evolution: { status: string; latency: string };
        motoboy: { status: string; latency: string };
        print: { status: string; latency: string };
    };
}

export default function AdminDashboard({ metrics, recent_tenants, system_health }: DashboardProps) {
    const pieData = {
        labels: ['Ativos', 'Trial', 'Inativos'],
        datasets: [
            {
                data: [
                    metrics.active_tenants - metrics.trial_tenants,
                    metrics.trial_tenants,
                    metrics.total_tenants - metrics.active_tenants
                ],
                backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
                borderWidth: 0,
            },
        ],
    };

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'connected':
            case 'active':
                return 'text-green-500';
            case 'disconnected':
            case 'calibration_needed':
                return 'text-yellow-500';
            case 'error':
                return 'text-red-500';
            default:
                return 'text-gray-400';
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Super Admin Dashboard" />

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Visão Geral
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Monitoramento global da plataforma
                    </p>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Active Tenants */}
                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Store className="w-16 h-16 text-[#ff3d03]" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4 text-[#ff3d03]">
                                <Store className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                Lojas Ativas
                            </p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                                {metrics.active_tenants}
                            </h3>
                            <p className="text-xs font-bold text-green-500 mt-2 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +{metrics.new_tenants} este mês
                            </p>
                        </div>
                    </div>

                    {/* MRR */}
                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Users className="w-16 h-16 text-blue-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4 text-blue-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                MRR (Estimado)
                            </p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                                {formatCurrency(metrics.mrr)}
                            </h3>
                            <p className="text-xs font-bold text-blue-500 mt-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Receita Recorrente
                            </p>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <ShoppingBag className="w-16 h-16 text-purple-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4 text-purple-500">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                Pedidos Globais
                            </p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                                {metrics.total_orders}
                            </h3>
                            <p className="text-xs font-bold text-purple-500 mt-2 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Todas as lojas
                            </p>
                        </div>
                    </div>

                    {/* Trials */}
                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Activity className="w-16 h-16 text-green-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4 text-green-500">
                                <Activity className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                Em Trial
                            </p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                                {metrics.trial_tenants}
                            </h3>
                            <p className="text-xs font-bold text-green-500 mt-2 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Potenciais clientes
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Tenants List */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#1a1b1e] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Store className="w-5 h-5 text-[#ff3d03]" />
                                Lojas Recentes
                            </h3>
                            <Link
                                href={route('admin.tenants.index')}
                                className="text-sm font-bold text-[#ff3d03] hover:underline"
                            >
                                Ver todas
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recent_tenants.map(tenant => (
                                <div key={tenant.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff3d03] to-[#e63700] flex items-center justify-center text-white font-bold text-sm">
                                            {tenant.slug.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{tenant.name}</p>
                                            <p className="text-xs text-gray-500">/{tenant.slug}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${tenant.status === 'Ativo'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {tenant.status}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">{tenant.created_at}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Saúde do Sistema
                        </h3>

                        <div className="space-y-6">
                            {/* Evolution API */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">WhatsApp API</p>
                                        <p className="text-xs text-gray-500">Evolution</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${getHealthColor(system_health.evolution.status)}`}>
                                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                        {system_health.evolution.status}
                                    </div>
                                    <p className="text-xs text-gray-400">{system_health.evolution.latency}</p>
                                </div>
                            </div>

                            {/* Motoboy */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Painel Motoboy</p>
                                        <p className="text-xs text-gray-500">Rastreamento</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${getHealthColor(system_health.motoboy.status)}`}>
                                        <div className="w-2 h-2 rounded-full bg-current" />
                                        {system_health.motoboy.status}
                                    </div>
                                    <p className="text-xs text-gray-400">{system_health.motoboy.latency}</p>
                                </div>
                            </div>

                            {/* Print System */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                                        <Printer className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Sistema de Impressão</p>
                                        <p className="text-xs text-gray-500">Fila de Jobs</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${getHealthColor(system_health.print.status)}`}>
                                        <div className="w-2 h-2 rounded-full bg-current" />
                                        {system_health.print.status}
                                    </div>
                                    <p className="text-xs text-gray-400">{system_health.print.latency}</p>
                                </div>
                            </div>
                        </div>

                        {/* Chart Preview (Optional) */}
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Distribuição de Lojas</h4>
                            <div className="h-48 flex justify-center">
                                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
