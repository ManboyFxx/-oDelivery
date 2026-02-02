import { Head } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import DashboardCard from '@/Components/Motoboy/DashboardCard';
import { Zap, TrendingUp, Star, Clock, BarChart3 } from 'lucide-react';

interface MetricsProps {
    summary: {
        deliveries_today: number;
        earnings_today: number;
        average_rating: number;
        status: string;
        is_online: boolean;
        pending_orders_count: number;
    };
    recentDeliveries: any[]; // Simple list for now
}

export default function Metrics({ summary, recentDeliveries }: MetricsProps) {
    return (
        <MotoboyLayout title="Métricas" subtitle="Seu desempenho detalhado">
            <Head title="Métricas - ÓoDelivery Motoboy" />

            <div className="space-y-8">
                {/* MAIN KPI CARDS */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4">
                        Resumo do Dia
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <DashboardCard
                            icon={Zap}
                            label="Entregas Hoje"
                            value={summary.deliveries_today}
                            color="orange"
                            subtitle="Entregas completadas"
                        />
                        <DashboardCard
                            icon={TrendingUp}
                            label="Ganhos Hoje"
                            value={`R$ ${summary.earnings_today.toFixed(2)}`}
                            color="green"
                            trend="up"
                            trendValue="+0%"
                        />
                        <DashboardCard
                            icon={Star}
                            label="Avaliação"
                            value={summary.average_rating.toFixed(1)}
                            color="yellow"
                            subtitle="Média atual"
                        />
                        <DashboardCard
                            icon={Clock}
                            label="Horas Online"
                            value="0h"
                            color="blue"
                            subtitle="Em breve"
                        />
                    </div>
                </section>

                {/* DETAILED STATS */}
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Histórico Recente</h2>
                    <div className="space-y-4">
                        {/* Placeholder for more detailed charts/stats */}
                        <div className="text-center py-8 text-gray-500">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>Gráficos detalhados em breve</p>
                        </div>
                    </div>
                </section>
            </div>
        </MotoboyLayout>
    );
}
