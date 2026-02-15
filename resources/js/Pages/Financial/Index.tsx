import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    Calendar,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    PieChart,
    Activity,
    Lock,
    Unlock,
    AlertCircle,
    TrendingDown,
    X,
    ChevronDown,
    MapPin,
    Clock,
    Filter,
    ShoppingBag,
    BarChart3
} from 'lucide-react';
import Modal from '@/Components/Modal';
import DateRangeFilter from '@/Components/DateRangeFilter';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LockedFeatureOverlay from '@/Components/LockedFeatureOverlay';
import TopProductsChart from './Components/TopProductsChart';
import PaymentMethodsChart from './Components/PaymentMethodsChart';

interface Transaction {
    id: string;
    customer: string;
    amount: number;
    status: 'completed' | 'pending' | 'refunded';
    payment_method: string;
    date: string;
}

interface Props {
    metrics: {
        total_revenue: number;
        orders_count: number;
        average_ticket: number;
        growth: number;
    };
    chart_data: { date: string; value: number }[];
    transactions: Transaction[];
    top_products?: { name: string; quantity: number; total: number }[];
    payment_methods_stats?: { name: string; method: string; total: number; count: number }[];
    current_plan: string;
    is_trial: boolean;
    filters: {
        start_date: string;
        end_date: string;
    }
}

export default function FinancialIndex({ metrics, chart_data, transactions, top_products = [], payment_methods_stats = [], current_plan, is_trial, filters }: Props) {
    const [showCashRegisterModal, setShowCashRegisterModal] = useState(false);

    // Missing state restored (mock implementation for UI)
    const [cashRegisterOpen, setCashRegisterOpen] = useState(false);

    // Derived state
    const isPro = current_plan === 'pro' || current_plan === 'custom' || is_trial;
    const isFree = !isPro;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const kpiCards = [
        {
            title: 'Faturamento Total',
            value: metrics.total_revenue,
            change: `+${metrics.growth}%`,
            trend: metrics.growth >= 0 ? 'up' : 'down',
            icon: DollarSign,
            primary: true,
            formatter: formatCurrency
        },
        {
            title: 'Ticket Médio',
            value: metrics.average_ticket,
            change: '+2.4%',
            trend: 'up',
            icon: CreditCard,
            primary: false,
            formatter: formatCurrency
        },
        {
            title: 'Pedidos Realizados',
            value: metrics.orders_count,
            change: '+15.2%',
            trend: 'up',
            icon: ShoppingBag,
            primary: false,
            formatter: (val: number) => val
        },
        {
            title: 'Lucro Líquido (Est.)',
            value: metrics.total_revenue * 0.85, // Mock profit margin
            change: '+12.1%',
            trend: 'up',
            icon: Wallet,
            primary: false,
            formatter: formatCurrency
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Relatórios Financeiros
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Acompanhe o desempenho do seu negócio</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        {isFree ? (
                            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-xl text-xs font-bold border border-yellow-200" title="Upgrade para selecionar datas">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Últimos 7 dias</span>
                                <Link href={route('subscription.plans')} className="text-[#ff3d03] hover:underline ml-1">
                                    Upgrade
                                </Link>
                            </div>
                        ) : (
                            <DateRangeFilter />
                        )}

                        <button
                            onClick={() => setShowCashRegisterModal(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all border border-gray-100 dark:border-white/5 ${cashRegisterOpen
                                ? 'bg-white dark:bg-[#1a1b1e] text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                                : 'bg-[#ff3d03] text-white hover:bg-[#e63700] hover:scale-105 shadow-[#ff3d03]/20 shadow-lg'
                                }`}>
                            {cashRegisterOpen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            <span className="hidden sm:inline">{cashRegisterOpen ? 'Fechar Caixa' : 'Abrir Caixa'}</span>
                        </button>

                        <button className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-[#25262b] transition-all shadow-sm">
                            <Download className="w-4 h-4 text-[#ff3d03]" />
                            <span className="hidden sm:inline">Exportar</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Financeiro" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {kpiCards.map((kpi, index) => (
                            <div key={index} className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl transition-colors ${kpi.primary
                                        ? 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/30'
                                        : 'bg-orange-50 dark:bg-orange-500/10 text-[#ff3d03] group-hover:bg-[#ff3d03] group-hover:text-white'
                                        }`}>
                                        <kpi.icon className="h-5 w-5" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${kpi.trend === 'up'
                                        ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                        : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                        }`}>
                                        {kpi.change}
                                        {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{kpi.title}</p>
                                    <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                                        {kpi.formatter(kpi.value)}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row 1: Revenue Evolution */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-[#ff3d03]" />
                                    Fluxo de Faturamento
                                </h3>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chart_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ff3d03" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#ff3d03" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                                            tickFormatter={(value) => `R$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                backgroundColor: '#111827',
                                                color: '#fff'
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#9CA3AF', fontWeight: 'bold', marginBottom: '4px' }}
                                            formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#ff3d03"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Payment Methods (LOCKED FOR FREE) */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-[#ff3d03]" />
                                Métodos de Pagamento
                            </h3>
                            <LockedFeatureOverlay
                                isLocked={isFree}
                                title="Análise de Pagamentos"
                                description="Entenda como seus clientes preferem pagar."
                            >
                                <PaymentMethodsChart data={payment_methods_stats} />
                            </LockedFeatureOverlay>
                        </div>
                    </div>

                    {/* Charts Row 2: Top Products & Transactions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top Products (LOCKED FOR FREE) */}
                        <div className="bg-[#ff3d03] rounded-3xl p-6 text-white shadow-xl shadow-[#ff3d03]/20 relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
                            <h3 className="font-bold text-lg flex items-center gap-2 mb-6 relative z-10">
                                <BarChart3 className="w-5 h-5" />
                                Mais Vendidos
                            </h3>
                            <LockedFeatureOverlay
                                isLocked={isFree}
                                title="Produtos Top Sellers"
                                description="Descubra o que mais sai na sua cozinha."
                                light={true}
                            >
                                <TopProductsChart data={top_products} light={true} />
                            </LockedFeatureOverlay>
                        </div>

                        {/* Recent Transactions */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#1a1b1e] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center text-sm">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-[#ff3d03]" />
                                    Transações Recentes
                                </h3>
                                <button className="font-bold text-[#ff3d03] hover:underline">Ver Todas</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-white/2 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100 dark:border-white/5">
                                        <tr>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4">Data</th>
                                            <th className="px-6 py-4">Método</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-400">#{tx.id}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{tx.customer}</td>
                                                <td className="px-6 py-4 text-gray-500 font-medium">{tx.date}</td>
                                                <td className="px-6 py-4 text-gray-500 font-medium">
                                                    {tx.payment_method}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight
                                                        ${tx.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400' : ''}
                                                        ${tx.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400' : ''}
                                                        ${tx.status === 'refunded' ? 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400' : ''}
                                                    `}>
                                                        {tx.status === 'completed' ? 'Concluído' : tx.status === 'pending' ? 'Pendente' : 'Estornado'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">
                                                    {formatCurrency(tx.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal show={showCashRegisterModal} onClose={() => setShowCashRegisterModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">{cashRegisterOpen ? 'Fechar Caixa' : 'Abrir Caixa'}</h2>
                    <p className="text-gray-500 mb-6">Esta funcionalidade está em desenvolvimento.</p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowCashRegisterModal(false)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                setCashRegisterOpen(!cashRegisterOpen);
                                setShowCashRegisterModal(false);
                            }}
                            className="bg-[#ff3d03] text-white px-4 py-2 rounded-lg hover:bg-[#e63700]"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
