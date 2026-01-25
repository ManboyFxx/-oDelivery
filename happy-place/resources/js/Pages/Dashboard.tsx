import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Activity,
    ChefHat,
    Bike,
    Calendar,
    ChevronDown,
    MapPin,
    CreditCard,
    MoreHorizontal,
    Star
} from 'lucide-react';

export default function Dashboard({ auth }: any) {
    const stats = [
        {
            title: 'Faturamento do Dia',
            value: 'R$ 4.250,00',
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            primary: true,
            chartData: [40, 65, 50, 80, 55, 90, 70]
        },
        {
            title: 'Pedidos Realizados',
            value: '148',
            change: '+8.2%',
            trend: 'up',
            icon: ShoppingBag,
            primary: false,
            chartData: [30, 45, 35, 50, 40, 60, 50]
        },
        {
            title: 'Ticket Médio',
            value: 'R$ 28,70',
            change: '-2.1%',
            trend: 'down',
            icon: CreditCard,
            primary: false,
            chartData: [60, 55, 50, 45, 40, 35, 30]
        },
        {
            title: 'Novos Clientes',
            value: '24',
            change: '+4.5%',
            trend: 'up',
            icon: Users,
            primary: false,
            chartData: [20, 25, 30, 35, 40, 45, 50]
        },
    ];

    const recentOrders = [
        { id: '#4820', customer: 'João Silva', items: '2x Pizza G', total: 'R$ 84,00', status: 'Preparo', time: '5 min' },
        { id: '#4819', customer: 'Maria Oliveira', items: '1x Hamburguer + Fritas', total: 'R$ 32,50', status: 'Saiu para Entrega', time: '12 min' },
        { id: '#4818', customer: 'Pedro Santos', items: '3x Açaí 500ml', total: 'R$ 45,00', status: 'Entregue', time: '25 min' },
        { id: '#4817', customer: 'Ana Costa', items: '1x Pizza M', total: 'R$ 38,00', status: 'Entregue', time: '32 min' },
        { id: '#4816', customer: 'Carlos Souza', items: '2x Coca-Cola 2L', total: 'R$ 24,00', status: 'Cancelado', time: '45 min' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Visão geral do seu negócio hoje</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1b1e] text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-[#25262b] transition-colors border border-gray-100 dark:border-white/5">
                            <Calendar className="h-4 w-4 text-[#ff3d03]" />
                            <span>Hoje</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 shadow-sm`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-xl transition-colors ${stat.primary
                                    ? 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/30'
                                    : 'bg-orange-50 dark:bg-orange-500/10 text-[#ff3d03] group-hover:bg-[#ff3d03] group-hover:text-white'
                                    }`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${stat.trend === 'up'
                                    ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                    : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                    }`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {stat.change}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                    {stat.title}
                                </p>
                                <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                                    {stat.value}
                                </h3>
                            </div>

                            {/* Small Sparkline Graph */}
                            <div className="h-8 mt-4 flex items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                {stat.chartData?.map((h, i) => (
                                    <div
                                        key={i}
                                        className={`w-full rounded-t-sm transition-all duration-500 ${stat.primary ? 'bg-orange-200' : 'bg-[#ff3d03]/20'
                                            }`}
                                        style={{ height: `${h + (Math.random() * 20)}%` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Chart & Orders) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Revenue Chart Section */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-[#ff3d03]" />
                                        Fluxo de Vendas
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">Comparativo de vendas por horário</p>
                                </div>
                                {/* Legend */}
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                        <span className="w-2 h-2 rounded-full bg-[#ff3d03]"></span>
                                        Hoje
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                        Ontem
                                    </div>
                                </div>
                            </div>

                            {/* Chart Visual - Improved */}
                            <div className="h-64 md:h-80 flex items-end justify-between gap-2 sm:gap-4 px-2">
                                {[35, 55, 40, 75, 90, 60, 85, 95, 70, 55, 80, 100].map((h, i) => (
                                    <div key={i} className="w-full flex flex-col justify-end gap-1 h-full group relative cursor-pointer">
                                        {/* Tooltip */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 shadow-xl whitespace-nowrap z-20 pointer-events-none">
                                            R$ {h * 15},90
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 border-4 border-transparent border-t-gray-900"></div>
                                        </div>

                                        {/* Bar Container */}
                                        <div className="relative w-full h-full flex items-end rounded-t-lg overflow-hidden bg-gray-50 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-white/10 transition-colors">
                                            {/* Active Bar */}
                                            <div
                                                className="w-full bg-[#ff3d03] rounded-t-sm relative z-10 transition-all duration-500 group-hover:bg-[#d63302]"
                                                style={{ height: `${h}%`, opacity: 0.8 }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold px-2 uppercase tracking-wide">
                                <span>08:00</span>
                                <span>10:00</span>
                                <span>12:00</span>
                                <span>14:00</span>
                                <span>16:00</span>
                                <span>18:00</span>
                                <span>20:00</span>
                                <span>22:00</span>
                            </div>
                        </div>

                        {/* Recent Orders List */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-[#ff3d03]" />
                                    Últimos Pedidos
                                </h3>
                                <button className="text-xs font-bold text-[#ff3d03] hover:text-[#d63302] hover:underline transition-all">Ver Todos</button>
                            </div>

                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-[#ff3d03]/20 hover:bg-white dark:hover:bg-white/10 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 flex items-center justify-center font-black text-[10px] text-[#ff3d03] shadow-sm group-hover:scale-105 transition-transform">
                                                {order.id.replace('#', '')}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-[#ff3d03] transition-colors">{order.customer}</h4>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{order.items}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{order.total}</p>
                                            <div className="flex items-center justify-end gap-1.5 mt-1">
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                <span className="text-[10px] text-gray-400 font-bold">{order.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Operational) */}
                    <div className="space-y-6">
                        {/* Live Status - Clean White Design */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
                                <Clock className="h-5 w-5 text-[#ff3d03]" />
                                Status em Tempo Real
                                <span className="flex h-2 w-2 rounded-full bg-[#ff3d03] animate-pulse ml-auto"></span>
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-transparent">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Aguardando Aprovação</p>
                                        <p className="text-2xl font-black text-[#ff3d03]">4</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-[#ff3d03] shadow-sm">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent group hover:bg-white hover:shadow-lg hover:shadow-orange-500/10 transition-all">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Em Preparo</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-[#ff3d03] transition-colors">8</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 group-hover:text-[#ff3d03] transition-colors">
                                        <ChefHat className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent group hover:bg-white hover:shadow-lg hover:shadow-orange-500/10 transition-all">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Em Rota de Entrega</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-[#ff3d03] transition-colors">12</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 group-hover:text-[#ff3d03] transition-colors">
                                        <Bike className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-[#ff3d03] rounded-3xl p-6 text-white shadow-xl shadow-[#ff3d03]/20 relative overflow-hidden">
                            {/* Abstract Circles Background */}
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl"></div>

                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    Top 3 Mais Vendidos
                                </h3>
                                <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-3 relative z-10">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/10 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer">
                                        <div className="h-10 w-10 rounded-lg bg-white text-[#ff3d03] flex items-center justify-center font-black text-sm shadow-sm">
                                            {i}º
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-sm truncate">X-Bacon Especial Duplo</h4>
                                            <p className="text-[10px] text-white/80 font-medium">32 vendas hoje</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-white">R$ 32,90</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-2.5 rounded-xl bg-white text-[#ff3d03] font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm active:scale-95 transform">
                                Ver Relatório de Produtos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
