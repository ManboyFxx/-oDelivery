import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function ResultCalculator() {
    const [ordersPerDay, setOrdersPerDay] = useState(20);
    const [averageTicket, setAverageTicket] = useState(65);
    const [marketplaceFee, setMarketplaceFee] = useState(27); // Standard iFood fee

    const results = useMemo(() => {
        const monthlyRevenue = ordersPerDay * averageTicket * 30;
        const marketplaceCost = monthlyRevenue * (marketplaceFee / 100);
        const ooDeliveryCost = 147; // Fixed plan price
        const monthlySavings = marketplaceCost - ooDeliveryCost;
        const annualSavings = monthlySavings * 12;

        return {
            monthlyRevenue,
            marketplaceCost,
            monthlySavings,
            annualSavings
        };
    }, [ordersPerDay, averageTicket, marketplaceFee]);

    const formatBRL = (val: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="bg-white dark:bg-[#1a1b1e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 relative overflow-hidden group">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#FF3D03]/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#FF3D03]/10 transition-colors" />
            
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-[#FF3D03] p-3 rounded-2xl shadow-lg shadow-[#FF3D03]/20">
                    <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Simulador de Economia</h3>
                    <p className="text-sm text-gray-500 font-medium">Veja quanto você deixa de pagar em taxas</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
                {/* Inputs */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pedidos por dia</label>
                            <span className="bg-orange-50 dark:bg-orange-500/10 text-[#FF3D03] px-3 py-1 rounded-lg font-black text-sm">{ordersPerDay}</span>
                        </div>
                        <input 
                            type="range" min="1" max="100" 
                            value={ordersPerDay} 
                            onChange={(e) => setOrdersPerDay(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#FF3D03]"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Ticket Médio (BRL)</label>
                            <span className="bg-orange-50 dark:bg-orange-500/10 text-[#FF3D03] px-3 py-1 rounded-lg font-black text-sm">{formatBRL(averageTicket)}</span>
                        </div>
                        <input 
                            type="range" min="20" max="250" step="5"
                            value={averageTicket} 
                            onChange={(e) => setAverageTicket(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#FF3D03]"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Taxa Marketplace (%)</label>
                            <span className="bg-red-50 dark:bg-red-500/10 text-red-500 px-3 py-1 rounded-lg font-black text-sm">{marketplaceFee}%</span>
                        </div>
                        <input 
                            type="range" min="5" max="35" 
                            value={marketplaceFee} 
                            onChange={(e) => setMarketplaceFee(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                    </div>
                </div>

                {/* Results Card */}
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-24 h-24" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Economia Mensal</p>
                            <h4 className="text-4xl font-black tracking-tighter text-[#FF3D03]">
                                {formatBRL(results.monthlySavings)}
                            </h4>
                        </div>

                        <div className="pt-6 border-t border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-white/60 text-xs font-bold">Gasto com Marketplace</span>
                                <span className="text-red-400 font-bold text-sm">{formatBRL(results.marketplaceCost)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/60 text-xs font-bold">Investimento OoDelivery</span>
                                <span className="text-green-400 font-bold text-sm">{formatBRL(147)}</span>
                            </div>
                        </div>

                        <div className="pt-6 bg-white/5 rounded-2xl p-4 flex items-center justify-between group/result">
                            <div>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Lucro Anual Extra</p>
                                <p className="text-xl font-black text-white">{formatBRL(results.annualSavings)}</p>
                            </div>
                            <div className="bg-green-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-2 text-green-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[11px] font-black uppercase tracking-wider">Liberdade do Marketplace garantida</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
