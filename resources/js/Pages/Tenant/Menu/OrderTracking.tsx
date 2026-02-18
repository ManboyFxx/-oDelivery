import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircle, Clock, ChefHat, Truck, Package, X } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

interface OrderTrackingProps {
    orderId: string;
    slug: string;
}

interface OrderData {
    order: {
        id: string;
        order_number: string;
        status: string;
        total: number;
        delivery_fee: number;
        customer_name: string;
        delivery_address: string;
        created_at: string;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
    };
    status: string;
    estimated_time: number;
    timeline: Array<{
        label: string;
        icon: string;
        completed: boolean;
        current?: boolean;
        timestamp?: string;
    }>;
}

export default function OrderTracking({ orderId, slug }: OrderTrackingProps) {
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrderStatus = async () => {
        try {
            const response = await axios.get(`/api/orders/${orderId}/track`);
            setOrderData(response.data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar pedido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderStatus();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchOrderStatus, 30000);

        return () => clearInterval(interval);
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-premium-dark flex items-center justify-center transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff3d03] mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Carregando pedido...</p>
                </div>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-premium-dark flex items-center justify-center p-4 transition-colors duration-300">
                <div className="bg-white dark:bg-premium-card rounded-2xl p-8 max-w-md w-full text-center shadow-lg transition-colors duration-300">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                        <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Pedido não encontrado</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">{error}</p>
                    <a
                        href={`/${slug}`}
                        className="inline-block px-6 py-3 bg-[#ff3d03] text-white rounded-xl font-bold hover:bg-[#e63700] transition-colors duration-300"
                    >
                        Voltar ao Menu
                    </a>
                </div>
            </div>
        );
    }

    const { order, timeline, estimated_time } = orderData;

    return (
        <>
            <Head title={`Pedido #${order.order_number}`} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-300">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="bg-white dark:bg-premium-card rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                                    Pedido #{order.order_number}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{order.created_at}</p>
                            </div>
                            {estimated_time > 0 && (
                                <div className="bg-[#ff3d03] text-white px-4 py-2 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        <div>
                                            <p className="text-xs opacity-90">Tempo estimado</p>
                                            <p className="text-lg font-black">{estimated_time} min</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 transition-colors duration-300"></div>

                            <div className="space-y-4">
                                {timeline.map((step, index) => (
                                    <div key={index} className="relative flex items-start gap-4">
                                        <div className={clsx(
                                            "relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300",
                                            step.completed
                                                ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                                        )}>
                                            {step.completed ? '✓' : step.icon}
                                        </div>

                                        <div className="flex-1 pt-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className={clsx(
                                                    "font-bold transition-colors duration-300",
                                                    step.completed ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
                                                )}>
                                                    {step.label}
                                                </h3>
                                                {step.timestamp && (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{step.timestamp}</span>
                                                )}
                                            </div>
                                            {step.current && (
                                                <p className="text-sm text-[#ff3d03] font-medium mt-1">
                                                    Em andamento...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-white dark:bg-premium-card rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Detalhes do Pedido</h2>

                        <div className="space-y-3 mb-6">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5 last:border-0 transition-colors duration-300">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{item.quantity}x {item.name}</p>
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                        R$ {item.price.toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Subtotal</span>
                                <span className="font-medium dark:text-gray-200 transition-colors duration-300">R$ {(order.total - order.delivery_fee).toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Taxa de Entrega</span>
                                <span className="font-medium dark:text-gray-200 transition-colors duration-300">R$ {order.delivery_fee.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                                <span className="dark:text-white transition-colors duration-300">Total</span>
                                <span className="text-[#ff3d03]">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white dark:bg-premium-card rounded-2xl shadow-lg p-6 transition-colors duration-300">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Endereço de Entrega</h2>
                        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{order.delivery_address}</p>
                    </div>

                    {/* Back Button */}
                    <div className="mt-6 text-center">
                        <a
                            href={`/${slug}`}
                            className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                        >
                            Voltar ao Menu
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
