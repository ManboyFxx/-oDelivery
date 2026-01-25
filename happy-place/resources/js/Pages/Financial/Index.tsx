import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
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
    Filter
} from 'lucide-react';
import Modal from '@/Components/Modal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

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
}

export default function FinancialIndex({ metrics, chart_data, transactions }: Props) {
    const [showCashRegisterModal, setShowCashRegisterModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [cashRegisterOpen, setCashRegisterOpen] = useState(false);
    const [cashRegisterAmount, setCashRegisterAmount] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Mock Sparkline Data generator
    const generateSparkline = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 60) + 20);

    const kpiCards = [
        {
            title: 'Faturamento Total',
            value: metrics.total_revenue,
            change: `+${metrics.growth}%`,
            trend: 'up',
            icon: DollarSign,
            primary: true,
            sparkline: generateSparkline()
        },
        {
            title: 'Ticket Médio',
            value: metrics.average_ticket,
            change: '+2.4%',
            trend: 'up',
            icon: CreditCard,
            primary: false,
            sparkline: generateSparkline()
        },
        {
            title: 'Despesas',
            value: 3200,
            change: '-5.1%',
            trend: 'down', // Good thing for expenses
            icon: TrendingDown,
            primary: false,
            sparkline: generateSparkline()
        },
        {
            title: 'Lucro Líquido',
            value: metrics.total_revenue - 3200,
            change: '+15.2%',
            trend: 'up',
            icon: Wallet,
            primary: false,
            sparkline: generateSparkline()
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Financeiro" />

            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Financeiro</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Caixa {cashRegisterOpen ? 'Aberto' : 'Fechado'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowExpenseModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1b1e] text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-[#25262b] transition-colors border border-gray-100 dark:border-white/5">
                            <ArrowDownRight className="h-4 w-4 text-[#ff3d03]" />
                            <span>Despesa</span>
                        </button>

                        <button
                            onClick={() => setShowCashRegisterModal(true)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors border border-gray-100 dark:border-white/5 ${cashRegisterOpen
                                    ? 'bg-white dark:bg-[#1a1b1e] text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                                    : 'bg-[#ff3d03] text-white hover:bg-[#e63700] hover:scale-105 shadow-[#ff3d03]/20 shadow-lg'
                                }`}>
                            {cashRegisterOpen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            <span>{cashRegisterOpen ? 'Fechar Caixa' : 'Abrir Caixa'}</span>
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1b1e] text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-[#25262b] transition-colors border border-gray-100 dark:border-white/5">
                            <Download className="h-4 w-4 text-gray-400" />
                            <span>Exportar</span>
                        </button>
                    </div>
                </div>

                {/* Cash Register Alert (if closed) */}
                {!cashRegisterOpen && (
                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-[24px] p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-[#ff3d03]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Caixa Fechado</h4>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Abra o caixa para começar a registrar e visualizar as vendas de hoje em tempo real.
                            </p>
                        </div>
                    </div>
                )}


                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiCards.map((stat, index) => (
                        <div
                            key={index}
                            className={`group relative overflow-hidden rounded-[24px] p-6 transition-all duration-300 hover:scale-[1.05] bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none mb-2`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl transition-colors ${stat.primary
                                    ? 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/30'
                                    : 'bg-orange-50 dark:bg-orange-500/10 text-[#ff3d03] group-hover:bg-[#ff3d03] group-hover:text-white'
                                    }`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up'
                                    ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                    : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                    }`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {stat.change}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    {stat.title}
                                </p>
                                <h3 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                    {formatCurrency(stat.value)}
                                </h3>
                            </div>

                            {/* Sparkline Graph */}
                            <div className="h-10 mt-4 flex items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                {stat.sparkline.map((h, i) => (
                                    <div
                                        key={i}
                                        className={`w-full rounded-t-sm transition-all duration-500 ${stat.primary ? 'bg-white/30' : 'bg-[#ff3d03]/20'
                                            }`}
                                        style={{ height: `${h}%` }}
                                    ></div>
                                ))}
                            </div>

                            {/* Decorative gradient for hover */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff3d03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>


                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Chart Section */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-[#ff3d03]" />
                                    Fluxo de Receita
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Comparativo dos últimos 30 dias</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#ff3d03] text-white rounded-lg text-xs font-bold shadow-md shadow-[#ff3d03]/20">
                                    <Calendar className="h-3 w-3" />
                                    <span>7 Dias</span>
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                    <span>Mensal</span>
                                </button>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chart_data}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff3d03" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ff3d03" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                                        tickFormatter={(value: number) => `R$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#ff3d03' }}
                                        cursor={{ stroke: '#ff3d03', strokeDasharray: '3 3' }}
                                        formatter={(value: number | undefined) => [`R$ ${value || 0}`, 'Receita']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#ff3d03"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        activeDot={{ r: 6, fill: '#ff3d03', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column - Methods & Breakdown */}
                    <div className="space-y-8">
                        {/* Payment Methods */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-[#ff3d03]" />
                                Métodos de Pagamento
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="font-bold text-gray-700 dark:text-gray-300">PIX</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(8481)} (55%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full rounded-full w-[55%]"></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span className="font-bold text-gray-700 dark:text-gray-300">Crédito</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(4626)} (30%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full rounded-full w-[30%]"></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            <span className="font-bold text-gray-700 dark:text-gray-300">Dinheiro</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(2313)} (15%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="bg-yellow-500 h-full rounded-full w-[15%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Goals */}
                        <div className="bg-[#ff3d03] rounded-[32px] p-8 text-white shadow-xl shadow-[#ff3d03]/20 relative overflow-hidden">
                            {/* Abstract Circles Background */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl"></div>

                            <h3 className="font-bold text-xl mb-6 relative z-10 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-white" />
                                Meta Mensal
                            </h3>

                            <div className="relative z-10">
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-5xl font-black">78%</span>
                                    <span className="text-sm mb-2 font-medium opacity-80">concluída</span>
                                </div>
                                <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden mb-4">
                                    <div className="bg-white h-full rounded-full w-[78%] animate-pulse"></div>
                                </div>
                                <p className="text-sm font-medium opacity-90">
                                    Faltam apenas <strong>{formatCurrency(4300)}</strong> para atingir sua meta de {formatCurrency(metrics.total_revenue + 4300)}.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions List */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-[#ff3d03]" />
                                Transações Recentes
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Últimas movimentações financeiras</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            <Filter className="h-4 w-4" />
                            Filtrar
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4 rounded-l-xl">ID</th>
                                    <th className="px-6 py-4">Cliente / Descrição</th>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Método</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right rounded-r-xl">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="group hover:bg-orange-50/30 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-[#ff3d03]">
                                            {transaction.id}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            {transaction.customer}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {transaction.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-sm font-medium">
                                            {transaction.payment_method}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize
                                                ${transaction.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                                                    transaction.status === 'refunded' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'}`}>
                                                {transaction.status === 'completed' ? 'Concluído' :
                                                    transaction.status === 'refunded' ? 'Estornado' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-black ${transaction.status === 'refunded' ? 'text-red-500 line-through opacity-70' : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {formatCurrency(transaction.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Cash Register Modal - Updated Design */}
            <Modal show={showCashRegisterModal} onClose={() => setShowCashRegisterModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                            {cashRegisterOpen ? 'Fechar Caixa' : 'Abrir Caixa'}
                        </h2>
                        <button onClick={() => setShowCashRegisterModal(false)} className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-[#ff3d03] transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 text-[#ff3d03]">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Controle de Segurança</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Todas as aberturas e fechamentos são auditados pelo sistema.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {cashRegisterOpen ? 'Valor Final em Caixa' : 'Suprimento Inicial'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-bold">R$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={cashRegisterAmount}
                                    onChange={(e) => setCashRegisterAmount(e.target.value)}
                                    className="w-full pl-10 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent dark:bg-gray-800 dark:text-white"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        {cashRegisterOpen && (
                            <div className="flex justify-between items-center py-4 border-t border-b border-gray-100 dark:border-white/5">
                                <span className="text-sm font-medium text-gray-500">Valor Esperado (Sistema)</span>
                                <span className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(2450.50)}</span>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowCashRegisterModal(false)}
                                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={cashRegisterOpen ? handleCloseCashRegister : handleOpenCashRegister}
                                className={`flex-1 font-bold py-3.5 rounded-xl text-white shadow-lg transition-all transform active:scale-95 ${cashRegisterOpen
                                    ? 'bg-gray-900 hover:bg-black shadow-gray-900/20'
                                    : 'bg-[#ff3d03] hover:bg-[#e63700] shadow-[#ff3d03]/20'
                                    }`}
                            >
                                {cashRegisterOpen ? 'Confirmar Fechamento' : 'Abrir Caixa'}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Expense Modal - Updated Design */}
            <Modal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                            Lançar Despesa / Sangria
                        </h2>
                        <button onClick={() => setShowExpenseModal(false)} className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-[#ff3d03] transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Descrição
                            </label>
                            <input
                                type="text"
                                value={expenseDescription}
                                onChange={(e) => setExpenseDescription(e.target.value)}
                                className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent dark:bg-gray-800 dark:text-white"
                                placeholder="Ex: Pagamento de Fornecedor"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Valor da Retirada
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-bold">R$</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={expenseAmount}
                                    onChange={(e) => setExpenseAmount(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent dark:bg-gray-800 dark:text-white"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setShowExpenseModal(false)}
                                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddExpense}
                                className="flex-1 bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-[#ff3d03]/20"
                            >
                                Confirmar Lançamento
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout >
    );

    // Helper functions for mock logic (kept same as before but inside component)
    function handleOpenCashRegister() {
        setCashRegisterOpen(true);
        setShowCashRegisterModal(false);
        setCashRegisterAmount('');
    }

    function handleCloseCashRegister() {
        setCashRegisterOpen(false);
        setShowCashRegisterModal(false);
        setCashRegisterAmount('');
    }

    function handleAddExpense() {
        setShowExpenseModal(false);
        setExpenseAmount('');
        setExpenseDescription('');
    }
}
