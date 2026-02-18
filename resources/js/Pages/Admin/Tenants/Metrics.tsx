import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ShoppingBag,
    DollarSign,
    Package,
    Calendar,
    Activity,
    CreditCard
} from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    email: string;
}

interface Metrics {
    total_products: number;
    total_orders: number;
    orders_today: number;
    total_revenue: number;
    plan_name: string;
    subscription_status: string;
    joined_date: string;
}

interface Props {
    tenant: Tenant;
    metrics: Metrics;
}

export default function TenantMetrics({ tenant, metrics }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`Métricas - ${tenant.name}`} />

            <div className="space-y-8">
                {/* Header with Back Button */}
                <div>
                    <Link
                        href={route('admin.tenants.index')}
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#ff3d03] mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para Lojas
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-md bg-[#ff3d03]/10 text-[#ff3d03] text-[10px] font-bold uppercase tracking-wider">
                                    Métricas da Loja
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{tenant.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">/{tenant.slug} • {tenant.email}</p>
                        </div>

                        <div className="flex gap-3">
                            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-0.5">Plano</p>
                                <p className="font-black text-blue-700 dark:text-blue-400">{metrics.plan_name}</p>
                            </div>
                            <div className="px-4 py-2 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-100 dark:border-green-500/20">
                                <p className="text-[10px] font-bold text-green-500 uppercase tracking-wide mb-0.5">Status</p>
                                <p className="font-black text-green-700 dark:text-green-400">{metrics.subscription_status || 'Ativo'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-500">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pedidos Totais</h3>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {metrics.total_orders}
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 bg-gradient-to-br from-orange-500/10 to-transparent w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    </div>

                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-500">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Receita Total</h3>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.total_revenue)}
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 bg-gradient-to-br from-green-500/10 to-transparent w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    </div>

                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500">
                                    <Package className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Produtos</h3>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {metrics.total_products}
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 bg-gradient-to-br from-blue-500/10 to-transparent w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    </div>

                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-500">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pedidos Hoje</h3>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {metrics.orders_today}
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 bg-gradient-to-br from-purple-500/10 to-transparent w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white mb-6">Informações da Conta</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Data de Cadastro</p>
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {metrics.joined_date}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email de Contato</p>
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium break-all">
                                {tenant.email}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Plano Atual</p>
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                                {metrics.plan_name}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
