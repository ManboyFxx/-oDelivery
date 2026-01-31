import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Clock, ChefHat, CheckCircle2, AlertCircle, Timer, UtensilsCrossed } from 'lucide-react';
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

            <div className="min-h-screen pb-12">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-200 dark:text-white flex items-center gap-3">
                            <span className="p-3 bg-[#ff3d03]/10 rounded-2xl border border-[#ff3d03]/20">
                                <ChefHat className="h-8 w-8 text-[#ff3d03]" />
                            </span>
                            Kitchen Display
                        </h2>
                        <p className="text-gray-400 mt-2 ml-16">
                            Gerencie os pedidos em tempo real com agilidade
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-light-card dark:bg-premium-card px-6 py-3 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-blue-400" />
                            </span>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Novos</p>
                                <p className="text-2xl font-bold text-gray-200 dark:text-white leading-none">{newOrders.length}</p>
                            </div>
                        </div>
                        <div className="bg-light-card dark:bg-premium-card px-6 py-3 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-[#ff3d03]/10 flex items-center justify-center">
                                <UtensilsCrossed className="h-5 w-5 text-[#ff3d03]" />
                            </span>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Preparando</p>
                                <p className="text-2xl font-bold text-gray-200 dark:text-white leading-none">{preparingOrders.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                    {/* Column: New Orders */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                            <h3 className="text-lg font-semibold text-blue-400 uppercase tracking-widest">
                                Novos Pedidos
                            </h3>
                        </div>

                        {newOrders.map(order => (
                            <div
                                key={order.id}
                                className="group relative bg-light-card dark:bg-premium-card rounded-[24px] border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 overflow-hidden shadow-lg shadow-black/20"
                            >
                                {/* Top Bar / Timer */}
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-full px-3 py-1 flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-blue-400" />
                                        <span className="font-mono font-bold text-blue-400">
                                            {elapsedTimes[order.id] || '0:00'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Order Info */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                                            <span className="text-xs text-blue-400 uppercase font-bold block mb-1">Pedido</span>
                                            <span className="text-3xl font-black text-gray-200 dark:text-white">#{order.order_number}</span>
                                        </div>
                                        <div className="pt-1">
                                            <h4 className="text-xl font-bold text-gray-200 dark:text-white mb-1">{order.customer_name}</h4>
                                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                Recebido às {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="bg-light-card dark:bg-premium-card rounded-xl p-4 mb-6 border border-gray-100 dark:border-white/5 space-y-3">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex items-start gap-3">
                                                <div className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <p className="text-gray-200 font-medium leading-tight pt-1">
                                                        {item.product_name}
                                                    </p>
                                                    {item.product?.description && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {item.product.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action */}
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-gray-200 dark:text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                                    >
                                        <ChefHat className="h-5 w-5" />
                                        INICIAR PREPARO
                                    </button>
                                </div>
                            </div>
                        ))}

                        {newOrders.length === 0 && (
                            <div className="border-2 border-dashed border-white/10 rounded-[24px] p-12 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-gray-500" />
                                </div>
                                <p className="text-gray-500 font-medium">Nenhum novo pedido</p>
                                <p className="text-gray-600 text-sm mt-1">Aguardando novos pedidos chegarem...</p>
                            </div>
                        )}
                    </div>

                    {/* Column: Preparing Orders */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <div className="w-3 h-3 rounded-full bg-[#ff3d03] animate-pulse" />
                            <h3 className="text-lg font-semibold text-[#ff3d03] uppercase tracking-widest">
                                Em Preparo
                            </h3>
                        </div>

                        {preparingOrders.map(order => (
                            <div
                                key={order.id}
                                className="group relative bg-light-card dark:bg-premium-card rounded-[24px] border border-[#ff3d03]/30 hover:border-[#ff3d03]/60 transition-all duration-300 overflow-hidden shadow-lg shadow-black/20"
                            >
                                {/* Top Bar / Timer */}
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="bg-[#ff3d03]/10 backdrop-blur-sm border border-[#ff3d03]/30 rounded-full px-3 py-1 flex items-center gap-2 animate-pulse">
                                        <Timer className="h-4 w-4 text-[#ff3d03]" />
                                        <span className="font-mono font-bold text-[#ff3d03]">
                                            {elapsedTimes[order.id] || '0:00'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Order Info */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="bg-[#ff3d03]/10 p-4 rounded-2xl border border-[#ff3d03]/20">
                                            <span className="text-xs text-[#ff3d03] uppercase font-bold block mb-1">Pedido</span>
                                            <span className="text-3xl font-black text-gray-200 dark:text-white">#{order.order_number}</span>
                                        </div>
                                        <div className="pt-1">
                                            <h4 className="text-xl font-bold text-gray-200 dark:text-white mb-1">{order.customer_name}</h4>
                                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                                <UtensilsCrossed className="h-3 w-3" />
                                                Em preparo
                                            </p>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="bg-light-card dark:bg-premium-card rounded-xl p-4 mb-6 border border-gray-100 dark:border-white/5 space-y-3">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex items-start gap-3">
                                                <div className="bg-[#ff3d03]/20 text-[#ff3d03] w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <p className="text-gray-200 font-medium leading-tight pt-1">
                                                        {item.product_name}
                                                    </p>
                                                    {item.product?.description && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {item.product.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action */}
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-gray-200 dark:text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        MARCAR COMO PRONTO
                                    </button>
                                </div>
                            </div>
                        ))}

                        {preparingOrders.length === 0 && (
                            <div className="border-2 border-dashed border-white/10 rounded-[24px] p-12 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UtensilsCrossed className="h-8 w-8 text-gray-500" />
                                </div>
                                <p className="text-gray-500 font-medium">Sem pedidos em preparo</p>
                                <p className="text-gray-600 text-sm mt-1">A cozinha está tranquila por enquanto.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
