import { Head } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import { User } from 'lucide-react';

export default function Profile() {
    return (
        <MotoboyLayout title="Meu Perfil" subtitle="Gerencie suas informações pessoais">
            <Head title="Perfil - ÓoDelivery Motoboy" />

            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                        <User className="w-8 h-8 text-[#ff3d03]" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">Página de Perfil</h2>
                <p className="text-gray-600 font-medium mb-6">
                    Aqui você poderá editar seus dados pessoais, informações de veículo, documentação e dados bancários.
                </p>
                <p className="text-sm text-gray-500">🚀 Esta página será implementada na próxima fase!</p>
            </div>
        </MotoboyLayout>
    );
}
