import { Head, Link, router } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import { MapPin, Phone, Package, Clock, DollarSign, ArrowLeft, Navigation, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface OrderShowProps {
    order: {
        id: string;
        order_number: string;
        status: string;
        customer: {
            name: string;
            phone: string;
        };
        delivery_address: string;
        items: any[];
        total: number;
        delivery_fee: number;
        created_at: string;
    };
}

export default function OrderShow({ order }: OrderShowProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = (route_name: string) => {
        setLoading(route_name);
        router.post(route(route_name, order.id), {}, {
            onFinish: () => setLoading(null)
        });
    };

    return (
        <MotoboyLayout title={`Pedido #${order.order_number}`} subtitle="Detalhes da entrega">
            <Head title={`Pedido #${order.order_number} - Motoboy`} />

            <div className="space-y-6 pb-24">
                {/* Cabeçalho de Ação Rápida */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 flex items-center justify-between">
                    <Link href={route('motoboy.dashboard')} className="flex items-center gap-2 text-gray-500 font-bold">
                        <ArrowLeft className="w-5 h-5" /> Voltar
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Cliente e Endereço */}
                <section className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-[#ff3d03]" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-black text-gray-900">{order.customer.name}</h2>
                            <p className="text-gray-500 font-medium">{order.delivery_address}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700"
                        >
                            <Navigation className="w-5 h-5" /> Abrir GPS
                        </a>
                        <a
                            href={`tel:${order.customer.phone}`}
                            className="flex items-center justify-center gap-2 bg-gray-900 text-white p-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black"
                        >
                            <Phone className="w-5 h-5" /> Ligar
                        </a>
                    </div>
                </section>

                {/* Itens do Pedido */}
                <section className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4" /> Itens do Pedido
                    </h3>
                    <div className="divide-y divide-gray-100">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="py-4 flex justify-between">
                                <div>
                                    <p className="font-bold text-gray-900">{item.quantity}x {item.name}</p>
                                </div>
                                <p className="font-black text-gray-900">R$ {Number(item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                        <p className="text-sm font-bold text-gray-500">Total a receber</p>
                        <p className="text-2xl font-black text-gray-900">R$ {Number(order.total).toFixed(2)}</p>
                    </div>
                </section>

                {/* Botões de Ação de Fluxo */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-200 lg:relative lg:bg-transparent lg:border-0 lg:p-0">
                    {order.status === 'motoboy_accepted' && (
                        <button
                            onClick={() => handleAction('motoboy.orders.start-delivery')}
                            disabled={!!loading}
                            className="w-full bg-[#ff3d03] text-white p-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-orange-500/30 hover:bg-[#e63700] transition-all"
                        >
                            {loading === 'motoboy.orders.start-delivery' ? 'Iniciando...' : 'Coletar e Iniciar Entrega'}
                        </button>
                    )}

                    {order.status === 'out_for_delivery' && (
                        <button
                            onClick={() => handleAction('motoboy.orders.deliver')}
                            disabled={!!loading}
                            className="w-full bg-green-600 text-white p-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-green-500/30 hover:bg-green-700 transition-all"
                        >
                            {loading === 'motoboy.orders.deliver' ? 'Confirmando...' : 'Confirmar Entrega'}
                        </button>
                    )}

                    {order.status === 'delivered' && (
                        <div className="bg-green-50 text-green-700 p-5 rounded-2xl font-black text-center flex items-center justify-center gap-3">
                            <CheckCircle className="w-6 h-6" /> ENTREGA CONCLUÍDA
                        </div>
                    )}
                </div>
            </div>
        </MotoboyLayout>
    );
}
