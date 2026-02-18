import { Head } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import { Clock } from 'lucide-react';

export default function History() {
    return (
        <MotoboyLayout title="Histórico" subtitle="Seu histórico de entregas completo">
            <Head title="Histórico - ÓoDelivery Motoboy" />

            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                        <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">Histórico de Entregas</h2>
                <p className="text-gray-600 font-medium mb-6">
                    Veja todas as suas entregas passadas, com filtros por data, cliente e status.
                </p>
                <p className="text-sm text-gray-500">🚀 Esta página será implementada na próxima fase!</p>
            </div>
        </MotoboyLayout>
    );
}
