import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Clock, ChefHat } from 'lucide-react';
import { clsx } from 'clsx';

interface Order {
    id: string;
    order_number: string;
    status: string;
    customer_name: string;
    created_at: string;
    mode: string;
    items: {
        id: string;
        product_name: string;
        quantity: number;
        product?: {
            description?: string;
        }
    }[];
}

export default function KitchenIndex({ orders }: { orders: Order[] }) {
    const [elapsedTimes, setElapsedTimes] = useState<Record<string, string>>({});

    useEffect(() => {
        const interval = setInterval(() => {
            const times: Record<string, string> = {};
            orders.forEach(order => {
                const start = new Date(order.created_at).getTime();
                const now = new Date().getTime();
                const diff = now - start;
                const minutes = Math.floor(diff / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                times[order.id] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            });
            setElapsedTimes(times);
        }, 1000);

        return () => clearInterval(interval);
    }, [orders]);

    const handleStatusUpdate = (orderId: string, status: string) => {
        router.post(route('kitchen.update-status', orderId), { status });
    };

    const newOrders = orders.filter(o => o.status === 'new');
    const preparingOrders = orders.filter(o => o.status === 'preparing');

    return (
        <AuthenticatedLayout>
            <Head title="Cozinha" />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <ChefHat className="h-8 w-8 text-orange-500" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Display da Cozinha</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Novos Pedidos */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                            Novos ({newOrders.length})
                        </h3>
                        <div className="space-y-4">
                            {newOrders.map(order => (
                                <div key={order.id} className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">#{order.order_number}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer_name}</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                                            <Clock className="h-4 w-4 text-yellow-700 dark:text-yellow-500" />
                                            <span className="font-bold text-yellow-700 dark:text-yellow-500">
                                                {elapsedTimes[order.id] || '0:00'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex items-start gap-2">
                                                <span className="font-bold text-orange-600 text-lg">{item.quantity}x</span>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                                                    {item.product?.description && (
                                                        <p className="text-xs text-gray-500">{item.product.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                                    >
                                        Iniciar Preparo
                                    </button>
                                </div>
                            ))}
                            {newOrders.length === 0 && (
                                <div className="text-center py-12 text-gray-400">Nenhum pedido novo</div>
                            )}
                        </div>
                    </div>

                    {/* Em Preparo */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-orange-600 dark:text-orange-400">
                            Em Preparo ({preparingOrders.length})
                        </h3>
                        <div className="space-y-4">
                            {preparingOrders.map(order => (
                                <div key={order.id} className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">#{order.order_number}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer_name}</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                                            <Clock className="h-4 w-4 text-red-700 dark:text-red-500" />
                                            <span className="font-bold text-red-700 dark:text-red-500">
                                                {elapsedTimes[order.id] || '0:00'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex items-start gap-2">
                                                <span className="font-bold text-orange-600 text-lg">{item.quantity}x</span>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                                                    {item.product?.description && (
                                                        <p className="text-xs text-gray-500">{item.product.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                                    >
                                        Marcar como Pronto
                                    </button>
                                </div>
                            ))}
                            {preparingOrders.length === 0 && (
                                <div className="text-center py-12 text-gray-400">Nenhum pedido em preparo</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
