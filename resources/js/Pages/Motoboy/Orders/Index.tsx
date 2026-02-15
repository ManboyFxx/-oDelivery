import { Head, Link } from '@inertiajs/react';
import MotoboyLayout from '@/Layouts/MotoboyLayout';
import { Package, Clock, MapPin, ChevronRight, CheckCircle } from 'lucide-react';

interface OrdersIndexProps {
    pendingOrders: any[];
    recentDeliveries: any[];
}

export default function OrdersIndex({ pendingOrders, recentDeliveries }: OrdersIndexProps) {
    return (
        <MotoboyLayout title="Meus Pedidos" subtitle="Histórico e entregas atuais">
            <Head title="Meus Pedidos - ÓoDelivery" />

            <div className="space-y-8">
                {/* Ativos */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Em Andamento</h2>
                    <div className="space-y-4">
                        {pendingOrders.length > 0 ? pendingOrders.map((order) => (
                            <Link
                                key={order.id}
                                href={route('motoboy.orders.show', order.id)}
                                className="block bg-white rounded-2xl border-2 border-orange-100 p-5 shadow-sm hover:border-[#ff3d03] transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Package className="w-5 h-5 text-[#ff3d03]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-gray-900">#{order.order_number}</span>
                                                <span className="text-[10px] font-black uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-700 mt-1">{order.customer_name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" /> {order.delivery_address}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300" />
                                </div>
                            </Link>
                        )) : (
                            <p className="text-sm text-gray-400 font-medium italic">Nenhum pedido ativo no momento.</p>
                        )}
                    </div>
                </section>

                {/* Histórico Recente */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Últimas Entregas</h2>
                    <div className="bg-white rounded-2xl border-2 border-gray-100 divide-y divide-gray-100 overflow-hidden">
                        {recentDeliveries.length > 0 ? recentDeliveries.map((order) => (
                            <Link
                                key={order.id}
                                href={route('motoboy.orders.show', order.id)}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">#{order.order_number} - {order.customer_name}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{order.delivered_at}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">R$ {order.delivery_fee.toFixed(2)}</p>
                                    <p className="text-[10px] text-green-600 font-bold uppercase">Pago</p>
                                </div>
                            </Link>
                        )) : (
                            <div className="p-8 text-center text-gray-400">Nenhuma entrega realizada ainda.</div>
                        )}
                    </div>
                </section>
            </div>
        </MotoboyLayout>
    );
}
