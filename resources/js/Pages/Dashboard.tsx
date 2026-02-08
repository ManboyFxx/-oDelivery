import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react'; // Add usePage
import ActivationChecklist from '@/Components/ActivationChecklist'; // Import Checklist
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
    MoreHorizontal,
    Star,
    AlertCircle,
    CheckCircle2,
    XCircle,
    CreditCard
} from 'lucide-react';

interface MetricProps {
    metrics: {
        todayRevenue: number;
        todayOrders: number;
        averageTicket: number;
        newCustomers: number;
        chartData: number[]; // 24 hours
        recentOrders: any[];
        orderStats: Record<string, number>;
        topProducts: any[];
    }
}

export default function Dashboard({ auth, metrics }: any) {
    const { props } = usePage();
    const tenant = (props as any).tenant;
    const limits = tenant?.limits;

    // Checklist Data
    const hasProducts = (limits?.products?.used || 0) > 0;
    const hasOrders = (limits?.orders?.used || 0) > 0;
    const whatsappConnected = tenant?.whatsapp_status === 'connected';

    const {
        todayRevenue = 0,
        todayOrders = 0,
        averageTicket = 0,
        newCustomers = 0,
        chartData = [],
        recentOrders = [],
        orderStats = {},
        topProducts = []
    } = metrics || {};

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const stats = [
        {
            title: 'Faturamento do Dia',
            value: formatCurrency(todayRevenue),
            change: '-', // TODO: Implementar comparativo com dia anterior
            trend: 'neutral',
            icon: DollarSign,
            primary: true,
            chartData: chartData.length ? chartData.map(v => (v / (Math.max(...chartData) || 1)) * 100) : []
        },
        {
            title: 'Pedidos Realizados',
            value: todayOrders,
            change: '-',
            trend: 'neutral',
            icon: ShoppingBag,
            primary: false,
            chartData: []
        },
        {
            title: 'Ticket Médio',
            value: formatCurrency(averageTicket),
            change: '-',
            trend: 'neutral',
            icon: CreditCard,
            primary: false,
            chartData: []
        },
        {
            title: 'Novos Clientes',
            value: newCustomers,
            change: '-',
            trend: 'neutral',
            icon: Users,
            primary: false,
            chartData: []
        },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
            case 'preparing': return <ChefHat className="h-4 w-4 text-blue-500" />;
            case 'delivering': return <Bike className="h-4 w-4 text-purple-500" />;
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'canceled': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

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
                            {/* <ChevronDown className="h-4 w-4 text-gray-400" /> */}
                        </button>
                    </div>
                </div>

                {/* Activation Checklist (Replaces Empty State) */}
                <ActivationChecklist
                    hasProducts={hasProducts}
                    hasOrders={hasOrders}
                    whatsappConnected={whatsappConnected}
                />

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
                                {/* Trend logic is placeholder for now */}
                                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-50 text-gray-400`}>
                                    {/* Placeholder for trend */}
                                    -
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
                                    <p className="text-xs text-gray-500 mt-1">Vendas por horário (Hoje)</p>
                                </div>
                            </div>

                            <div className="h-64 flex items-end justify-between gap-1 px-2">
                                {chartData.length > 0 ? chartData.map((val, i) => (
                                    <div key={i} className="w-full flex flex-col justify-end h-full group relative">
                                        {/* Tooltip */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none">
                                            {formatCurrency(val)} - {i}:00
                                        </div>
                                        <div className="relative w-full h-full flex items-end bg-gray-50 dark:bg-white/5 rounded-t-sm">
                                            <div
                                                className="w-full bg-[#ff3d03] rounded-t-sm relative z-10 transition-all duration-500"
                                                style={{ height: `${(val / (Math.max(...chartData) || 1)) * 100}%`, minHeight: val > 0 ? '4px' : '0' }}
                                            ></div>
                                        </div>
                                        <span className="text-[9px] text-gray-300 text-center mt-1">{i}h</span>
                                    </div>
                                )) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                                        Sem vendas hoje ainda.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Orders List */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-[#ff3d03]" />
                                    Últimos Pedidos
                                </h3>
                                <button className="text-xs font-bold text-[#ff3d03] hover:underline">Ver Todos</button>
                            </div>

                            <div className="space-y-3">
                                {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-[#ff3d03]/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-[10px] text-[#ff3d03]">
                                                {order.id}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{order.customer}</h4>
                                                <p className="text-xs font-medium text-gray-500">{order.items}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-sm">{order.total}</p>
                                            <div className="flex items-center justify-end gap-1.5 mt-1">
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                <span className="text-[10px] text-gray-400 font-bold">{order.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-gray-400 py-4 text-sm">Nenhum pedido recente.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Operational) */}
                    <div className="space-y-6">
                        {/* Live Status */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-[#ff3d03]" />
                                Status em Tempo Real
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10">
                                    <div>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Pendentes</p>
                                        <p className="text-2xl font-black text-[#ff3d03]">{orderStats['pending'] || 0}</p>
                                    </div>
                                    <Clock className="h-5 w-5 text-[#ff3d03]" />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                                    <div>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Em Preparo</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{orderStats['preparing'] || 0}</p>
                                    </div>
                                    <ChefHat className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                                    <div>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Em Entrega</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{orderStats['delivering'] || 0}</p>
                                    </div>
                                    <Bike className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-[#ff3d03] rounded-3xl p-6 text-white shadow-xl shadow-[#ff3d03]/20 relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>

                            <h3 className="font-bold text-lg flex items-center gap-2 mb-6 relative z-10">
                                <Star className="h-5 w-5" />
                                Mais Vendidos
                            </h3>

                            <div className="space-y-3 relative z-10">
                                {topProducts.length > 0 ? topProducts.map((prod: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                                        <div className="h-8 w-8 rounded-lg bg-white text-[#ff3d03] flex items-center justify-center font-black text-xs">
                                            {i + 1}º
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-sm truncate">{prod.name}</h4>
                                            <p className="text-[10px] text-white/80">{prod.total_sales} vendas</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-white/60 text-sm">Nenhum dado de vendas ainda.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
