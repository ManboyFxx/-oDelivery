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
    CreditCard
} from 'lucide-react';

export default function DashboardDemo({ auth }: any) {
    const stats = [
        {
            title: 'Faturamento do Dia',
            value: 'R$ 4.250,00',
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            primary: true
        },
        {
            title: 'Pedidos Realizados',
            value: '148',
            change: '+8.2%',
            trend: 'up',
            icon: ShoppingBag,
            primary: false
        },
        {
            title: 'Ticket Médio',
            value: 'R$ 28,70',
            change: '-2.1%',
            trend: 'down',
            icon: CreditCard,
            primary: false
        },
        {
            title: 'Novos Clientes',
            value: '24',
            change: '+4.5%',
            trend: 'up',
            icon: Users,
            primary: false
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
            <Head title="Dashboard Demo" />

            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Visão Geral</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loja Aberta • Recebendo Pedidos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1b1e] text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-[#25262b] transition-colors">
                            <Calendar className="h-4 w-4 text-[#ff3d03]" />
                            <span>Hoje</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#ff3d03] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63700] hover:scale-105 transition-all">
                            Pausar Loja
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
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
                                    {stat.value}
                                </h3>
                            </div>

                            {/* Small Sparkline Graph */}
                            <div className="h-10 mt-4 flex items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                                    <div
                                        key={i}
                                        className={`w-full rounded-t-sm transition-all duration-500 ${stat.primary ? 'bg-white/30' : 'bg-[#ff3d03]/20'
                                            }`}
                                        style={{ height: `${h + (Math.random() * 20)}%` }}
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
                    {/* Left Column (Chart & Orders) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Revenue Chart Section */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-[#ff3d03]" />
                                        Fluxo de Vendas
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Comparativo com ontem</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 rounded-lg text-xs font-bold text-[#ff3d03]">
                                        <span className="w-2 h-2 rounded-full bg-[#ff3d03]"></span>
                                        Hoje
                                    </span>
                                    <span className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500">
                                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                        Ontem
                                    </span>
                                </div>
                            </div>

                            {/* Chart Visual */}
                            <div className="h-72 flex items-end justify-between gap-3 px-2">
                                {[45, 65, 40, 75, 90, 60, 85, 95, 70, 55, 80, 100].map((h, i) => (
                                    <div key={i} className="w-full flex gap-1 h-full items-end group relative">
                                        {/* Background Bar (Total Capacity visual) */}
                                        <div className="w-full bg-[#ff3d03] rounded-t-lg opacity-10 h-full absolute bottom-0 group-hover:opacity-20 transition-all"></div>

                                        {/* Active Bar */}
                                        <div
                                            className="w-full bg-[#ff3d03] rounded-t-lg relative z-10 transition-all duration-500 group-hover:scale-y-105 origin-bottom"
                                            style={{ height: `${h}%`, opacity: 0.8 + (i * 0.02) }} // Gradient effect by opacity
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 shadow-xl whitespace-nowrap z-20">
                                                R$ {h * 15},90
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 border-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6 text-xs text-gray-400 font-bold px-2 uppercase tracking-wide">
                                <span>08h</span>
                                <span>10h</span>
                                <span>12h</span>
                                <span>14h</span>
                                <span>16h</span>
                                <span>18h</span>
                                <span>20h</span>
                                <span>22h</span>
                            </div>
                        </div>

                        {/* Recent Orders List */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-[#ff3d03]" />
                                    Últimos Pedidos
                                </h3>
                                <button className="text-sm font-bold text-[#ff3d03] hover:text-[#d63302] hover:underline transition-all">Ver Todos os Pedidos</button>
                            </div>

                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-[#ff3d03]/30 hover:bg-white dark:hover:bg-white/10 hover:shadow-lg hover:shadow-[#ff3d03]/5 transition-all duration-300 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 flex items-center justify-center font-black text-xs text-[#ff3d03] shadow-sm group-hover:scale-110 transition-transform">
                                                {order.id.replace('#', '')}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-[#ff3d03] transition-colors">{order.customer}</h4>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{order.items}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{order.total}</p>
                                            <div className="flex items-center justify-end gap-2 mt-1">
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                <span className="text-xs text-gray-400 font-medium">{order.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Operational) */}
                    <div className="space-y-8">
                        {/* Live Status - Clean White Design */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-8 flex items-center gap-2 relative z-10">
                                <Clock className="h-5 w-5 text-[#ff3d03]" />
                                Tempo Real
                                <span className="flex h-2 w-2 rounded-full bg-[#ff3d03] animate-pulse ml-auto"></span>
                            </h3>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-transparent">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Aguardando</p>
                                        <p className="text-3xl font-black text-[#ff3d03]">4</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-[#ff3d03] shadow-sm">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent group hover:bg-white hover:shadow-lg hover:shadow-orange-500/10 transition-all">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Preparando</p>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-[#ff3d03] transition-colors">8</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 group-hover:text-[#ff3d03] transition-colors">
                                        <ChefHat className="h-6 w-6" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent group hover:bg-white hover:shadow-lg hover:shadow-orange-500/10 transition-all">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Em Rota</p>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-[#ff3d03] transition-colors">12</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 group-hover:text-[#ff3d03] transition-colors">
                                        <Bike className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Zones MiniMap (Mock) */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-[#ff3d03]" />
                                Entregas por Região
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Centro', count: 18, color: 'bg-[#ff3d03]' },
                                    { name: 'Vila Nova', count: 12, color: 'bg-orange-400' },
                                    { name: 'Jardim Sul', count: 8, color: 'bg-orange-300' },
                                ].map((zone, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-2 h-10 rounded-full ${zone.color}`}></div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{zone.name}</h4>
                                            <div className="w-full bg-gray-100 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div className={`h-full ${zone.color}`} style={{ width: `${(zone.count / 20) * 100}%` }}></div>
                                            </div>
                                        </div>
                                        <span className="font-black text-gray-900 dark:text-white">{zone.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-[#ff3d03] rounded-[32px] p-8 text-white shadow-xl shadow-[#ff3d03]/20 relative overflow-hidden">
                            {/* Abstract Circles Background */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl"></div>

                            <h3 className="font-bold text-xl mb-6 relative z-10">Mais Vendidos</h3>
                            <div className="space-y-4 relative z-10">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <div className="h-10 w-10 rounded-xl bg-white text-[#ff3d03] flex items-center justify-center font-black text-lg">
                                            {i}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white text-sm">X-Bacon Especial</h4>
                                            <p className="text-xs text-white/70">32 unidades hoje</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 rounded-xl bg-white text-[#ff3d03] font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                                Relatório Completo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
