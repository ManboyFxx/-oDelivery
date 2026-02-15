import { Head, Link } from '@inertiajs/react';
import {
    TrendingUp, DollarSign, ShoppingBag, PieChart,
    ArrowUpRight, ArrowDownRight, Store, Calendar,
    CreditCard, CheckCircle, Clock, Search
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { formatCurrency } from '@/Utils/format';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: any;
    trend?: { value: number; isUp: boolean };
    description?: string;
}

const MetricCard = ({ title, value, icon: Icon, trend, description }: MetricCardProps) => (
    <div className="bg-white dark:bg-premium-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#ff3d03]/10 rounded-xl">
                <Icon className="w-6 h-6 text-[#ff3d03]" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-sm font-bold ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {trend.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {trend.value}%
                </div>
            )}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value}</h3>
            {description && <p className="text-gray-400 text-xs mt-2">{description}</p>}
        </div>
    </div>
);

export default function FinancialIndex({ auth, metrics, chartData, topTenants, recentTransactions }: any) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-black text-2xl text-gray-800 dark:text-white leading-tight">Finanças Globais</h2>}
        >
            <Head title="Finanças Globais" />

            <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Receita Total"
                        value={formatCurrency(metrics.total_revenue)}
                        icon={DollarSign}
                        description="Vendas acumuladas (entregues)"
                    />
                    <MetricCard
                        title="Volume de Pedidos"
                        value={metrics.total_orders}
                        icon={ShoppingBag}
                        description="Total de pedidos realizados"
                    />
                    <MetricCard
                        title="Ticket Médio"
                        value={formatCurrency(metrics.avg_order_value)}
                        icon={TrendingUp}
                        description="Valor médio por pedido concluído"
                    />
                    <MetricCard
                        title="Taxa de Sucesso"
                        value={`${metrics.success_rate}%`}
                        icon={PieChart}
                        description="Pedidos entregues vs. total"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Tenants Ranking */}
                    <div className="lg:col-span-1 bg-white dark:bg-premium-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-lg text-gray-900 dark:text-white">Top 5 Lojas</h3>
                            <Store className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {topTenants.map((tenant: any, index: number) => (
                                <div key={tenant.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#ff3d03] text-white flex items-center justify-center font-black text-xs">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white leading-none">{tenant.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase mt-1">{tenant.plan}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-sm text-[#ff3d03]">{formatCurrency(tenant.revenue)}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{tenant.orders_count} pedidos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="lg:col-span-2 bg-white dark:bg-premium-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-lg text-gray-900 dark:text-white">Últimas Transações</h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-gray-100 dark:bg-white/10 text-gray-400 text-[10px] font-black px-2 py-1 rounded">GLOBAL</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-gray-100 dark:border-white/5">
                                        <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-widest">Loja</th>
                                        <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
                                        <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {recentTransactions.map((tx: any) => (
                                        <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-gray-900 dark:text-white">{tx.tenant_name}</span>
                                                    <span className="text-xs text-gray-400">{tx.customer}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className="font-black text-sm text-gray-900 dark:text-white">{formatCurrency(tx.amount)}</span>
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${tx.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                        tx.status === 'canceled' ? 'bg-red-100 text-red-600' :
                                                            'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className="text-xs text-gray-400">{tx.created_at}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
