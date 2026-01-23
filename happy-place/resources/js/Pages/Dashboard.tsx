import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown, Brain, FileText, Clock, ChevronRight } from 'lucide-react';

export default function Dashboard({ auth }: any) {
    const stats = [
        { name: 'RECEITA TOTAL', value: 'R$ 12.450,80', icon: DollarSign, change: '+12.5%', trend: 'up', iconColor: 'text-green-600', bgIcon: 'bg-green-100' },
        { name: 'PEDIDOS HOJE', value: '142', icon: ShoppingBag, change: '+18.2%', trend: 'up', iconColor: 'text-blue-600', bgIcon: 'bg-blue-100' },
        { name: 'TICKET MÉDIO', value: 'R$ 87,68', icon: TrendingDown, change: '-2.4%', trend: 'down', iconColor: 'text-red-500', bgIcon: 'bg-red-100' },
        { name: 'NOVOS CLIENTES', value: '38', icon: Users, change: '+5.0%', trend: 'up', iconColor: 'text-purple-600', bgIcon: 'bg-purple-100' },
    ];

    const topProducts = [
        { name: 'Pizza Calabresa G', count: 850, percentage: 80 },
        { name: 'X-Burger Especial', count: 620, percentage: 60 },
        { name: 'Batata Rústica', count: 430, percentage: 40 },
        { name: 'Coca-Cola 350ml', count: 980, percentage: 90 },
    ];

    return (
        <AuthenticatedLayout header={undefined} user={auth.user}>
            <Head title="Dashboard" />

            <div className="space-y-8 animate-fadeIn">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
                            Visão Geral
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Bem-vindo de volta! Veja como está seu negócio hoje.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 transition-colors">
                            <Clock className="w-4 h-4" />
                            Hoje: 20 Out
                        </button>
                        <button className="flex items-center gap-2 bg-[#ff3d03] hover:bg-[#e63700] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                            <FileText className="w-4 h-4" />
                            Relatório PDF
                        </button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${item.bgIcon}`}>
                                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                    {item.change}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.name}</h3>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Insights Banner */}
                <div className="bg-[#1a1b1e] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl text-white group cursor-pointer">
                    <div className="absolute top-0 right-0 p-8 opacity-10 md:opacity-20 transition-opacity group-hover:opacity-30">
                        <Brain className="w-40 h-40" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff3d03]/20 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain className="w-5 h-5 text-[#ff3d03]" />
                            <span className="text-xs font-bold text-[#ff3d03] tracking-widest uppercase">ÓoInsights AI</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Previsão de demanda em alta!</h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Sua demanda por <span className="text-white font-bold decoration-[#ff3d03] underline decoration-2 underline-offset-2">Pizza Calabresa</span> deve aumentar 25% nas próximas 2 horas. Sugerimos reforçar a equipe de montagem.
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Visual Sales Chart (Mocked with CSS/SVG) */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-gray-800 dark:text-white">Desempenho de Vendas</h3>
                            <button className="text-sm text-gray-400 hover:text-[#ff3d03] transition-colors">Ver Detalhes</button>
                        </div>

                        <div className="h-64 w-full flex items-end justify-between gap-2 px-2 relative">
                            {/* Simple SVG Chart */}
                            <svg className="absolute inset-0 w-full h-full text-[#ff3d03]/20" preserveAspectRatio="none">
                                <path d="M0,200 C150,200 150,100 300,100 C450,100 450,250 600,200 C750,150 750,50 900,50 L900,256 L0,256 Z" fill="url(#gradient)" />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#ff3d03" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#ff3d03" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                <path d="M0,200 C150,200 150,100 300,100 C450,100 450,250 600,200 C750,150 750,50 900,50" fill="none" stroke="#ff3d03" strokeWidth="3" strokeLinecap="round" />
                            </svg>

                            {/* Axis Labels Mock */}
                            <div className="absolute bottom-[-25px] left-0 right-0 flex justify-between text-xs text-gray-400 px-4">
                                <span>Seg</span>
                                <span>Ter</span>
                                <span>Qua</span>
                                <span>Qui</span>
                                <span>Sex</span>
                                <span>Sáb</span>
                                <span>Dom</span>
                            </div>
                        </div>
                        <div className="h-6"></div> {/* Spacer for labels */}
                    </div>

                    {/* Top Products */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-6">Mais Vendidos</h3>
                        <div className="space-y-6 flex-1">
                            {topProducts.map((product, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{product.name}</span>
                                        <span className="text-gray-400 text-xs">{product.count} unid.</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#ff3d03] rounded-full"
                                            style={{ width: `${product.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-6 w-full py-3 text-[#ff3d03] text-sm font-bold hover:bg-[#ff3d03]/5 rounded-xl transition-colors">
                            Ver Todos os Produtos
                        </button>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

