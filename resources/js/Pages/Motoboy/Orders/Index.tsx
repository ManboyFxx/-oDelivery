import { Head } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import { Package } from 'lucide-react';

export default function OrdersIndex() {
    return (
        <MotoboyLayout title="Pedidos" subtitle="Visualize e gerencie seus pedidos para entrega">
            <Head title="Pedidos - ÓoDelivery Motoboy" />

            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Package className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">Página de Pedidos</h2>
                <p className="text-gray-600 font-medium mb-6">
                    Aqui você verá todos os pedidos disponíveis, poderá aceitar, recusar e entregar pedidos.
                </p>
                <p className="text-sm text-gray-500">🚀 Esta página será implementada na próxima fase!</p>
            </div>
        </MotoboyLayout>
    );
}
