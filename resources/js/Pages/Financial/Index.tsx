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
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Relatórios Financeiros
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Acompanhe o desempenho do seu negócio</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        {isFree ? (
                            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm border border-yellow-200" title="Upgrade para selecionar datas">
                                <Lock className="w-4 h-4" />
                                <span>Últimos 7 dias</span>
                                <Link href={route('subscription.plans')} className="font-bold underline ml-1">
                                    Upgrade
                                </Link>
                            </div>
                        ) : (
                            <DateRangeFilter />
                        )}

                        <button
                            onClick={() => setShowCashRegisterModal(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors border border-gray-100 dark:border-white/5 ${cashRegisterOpen
                                ? 'bg-white dark:bg-[#1a1b1e] text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                                : 'bg-[#ff3d03] text-white hover:bg-[#e63700] hover:scale-105 shadow-[#ff3d03]/20 shadow-lg'
                                }`}>
                            {cashRegisterOpen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            <span className="hidden sm:inline">{cashRegisterOpen ? 'Fechar Caixa' : 'Abrir Caixa'}</span>
                        </button>

                        <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <Download className="w-4 h-4" />
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
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${kpi.primary
                                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>
                                        <kpi.icon className="w-6 h-6" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {kpi.change}
                                        {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    </div>
                                </div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{kpi.title}</h3>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {kpi.formatter(kpi.value)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row 1: Revenue Evolution */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gray-400" />
                                    Evolução de Faturamento
                                </h3>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chart_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ff3d03" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#ff3d03" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            tickFormatter={(value) => `R$ ${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#ff3d03"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Payment Methods (LOCKED FOR FREE) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-gray-400" />
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
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-gray-400" />
                                Produtos Mais Vendidos
                            </h3>
                            <LockedFeatureOverlay
                                isLocked={isFree}
                                title="Produtos Top Sellers"
                                description="Descubra o que mais sai na sua cozinha."
                            >
                                <TopProductsChart data={top_products} />
                            </LockedFeatureOverlay>
                        </div>

                        {/* Recent Transactions */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-gray-400" />
                                    Transações Recentes
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4">Data</th>
                                            <th className="px-6 py-4">Método</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-gray-500">#{tx.id}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tx.customer}</td>
                                                <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                                                <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                                                    {tx.payment_method}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                        ${tx.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                                        ${tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                                        ${tx.status === 'refunded' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                                                    `}>
                                                        {tx.status === 'completed' ? 'Concluído' : tx.status === 'pending' ? 'Pendente' : 'Estornado'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(tx.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                        {transactions.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                    Nenhuma transação encontrada neste período.
                                                </td>
                                            </tr>
                                        )}
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
