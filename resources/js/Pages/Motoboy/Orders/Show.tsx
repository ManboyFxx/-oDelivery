import { Head } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import { MapPin } from 'lucide-react';

export default function OrderShow() {
    return (
        <MotoboyLayout title="Detalhe do Pedido" subtitle="Informações completas do seu pedido">
            <Head title="Detalhe do Pedido - ÓoDelivery Motoboy" />

            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">Detalhe do Pedido</h2>
                <p className="text-gray-600 font-medium mb-6">
                    Aqui você verá todos os detalhes do pedido, mapa com rota e opções de ação.
                </p>
                <p className="text-sm text-gray-500">🚀 Esta página será implementada na próxima fase!</p>
            </div>
        </MotoboyLayout>
    );
}
