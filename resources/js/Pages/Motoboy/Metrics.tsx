import { Head } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import { BarChart3 } from 'lucide-react';

export default function Metrics() {
    return (
        <MotoboyLayout title="Métricas" subtitle="Acompanhe seu desempenho e estatísticas">
            <Head title="Métricas - ÓoDelivery Motoboy" />

            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">Métricas e Desempenho</h2>
                <p className="text-gray-600 font-medium mb-6">
                    Veja gráficos, estatísticas, avaliações e análise completa de seu desempenho.
                </p>
                <p className="text-sm text-gray-500">🚀 Esta página será implementada na próxima fase!</p>
            </div>
        </MotoboyLayout>
    );
}
