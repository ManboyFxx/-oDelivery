import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import OrderCard, { Order, OrderAction } from './Partials/OrderCard';
import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useAudio } from '@/Hooks/useAudio';
import { useToast } from '@/Hooks/useToast';
import { CancelOrderModal, ChangeModeModal, ChangePaymentModal, EditOrderModal } from './Partials/ActionModals';
import { Circle, Clock, CheckCircle, Truck, Package } from 'lucide-react';

export default function OrdersIndex({ orders, motoboys = [], products = [] }: { orders: Order[], motoboys: any[], products: any[] }) {
    const columns = [
        {
            id: 'new',
            title: 'Novos',
            statuses: ['new'],
            icon: Circle,
            iconColor: 'text-blue-500',
            headerBg: 'bg-white',
            borderColor: 'border-blue-100',
            containerBg: 'bg-gray-50/50',
            badgeColor: 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10'
        },
        {
            id: 'preparing',
            title: 'Preparando',
            statuses: ['preparing'],
            icon: Clock,
            iconColor: 'text-orange-500',
            headerBg: 'bg-white',
            borderColor: 'border-orange-100',
            containerBg: 'bg-orange-50/30',
            badgeColor: 'bg-orange-50 text-orange-700 ring-1 ring-orange-700/10'
        },
        {
            id: 'ready',
            title: 'Pronto / Aguardando',
            statuses: ['ready', 'waiting_motoboy'],
            icon: CheckCircle,
            iconColor: 'text-green-500',
            headerBg: 'bg-white',
            borderColor: 'border-green-100',
            containerBg: 'bg-green-50/30',
            badgeColor: 'bg-green-50 text-green-700 ring-1 ring-green-700/10'
        },
        {
            id: 'out_for_delivery',
            title: 'Em Entrega',
            statuses: ['motoboy_accepted', 'out_for_delivery'],
            icon: Truck,
            iconColor: 'text-indigo-500',
            headerBg: 'bg-white',
            borderColor: 'border-indigo-100',
            containerBg: 'bg-indigo-50/30',
            badgeColor: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-700/10'
        },
    ];

    const getOrdersForColumn = (columnId: string, customStatuses?: string[]) => {
        const targetStatuses = customStatuses || [columnId];
        return orders.filter(o => targetStatuses.includes(o.status));
    };

    // Audio & Polling
    const { play, initializeAudio } = useAudio();
    const { success, info } = useToast();
    const [audioEnabled, setAudioEnabled] = useState(false);
    // Track status of each order: { [id]: status }
    const prevStatusesRef = useRef<Record<string, string>>({});

    // Initialize ref on mount
    useEffect(() => {
        prevStatusesRef.current = orders.reduce((acc, o) => ({ ...acc, [o.id]: o.status }), {});
    }, []); // Run once on mount to set initial state without triggering sounds

    // Enable audio on first interaction
    useEffect(() => {
        const enableAudio = () => {
            setAudioEnabled(true);
            initializeAudio();
        };
        window.addEventListener('click', enableAudio, { once: true });
        return () => window.removeEventListener('click', enableAudio);
    }, [initializeAudio]);

    // Poll for updates every 15s
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['orders'],
                preserveScroll: true,
            } as any);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    // Watch for changes
    useEffect(() => {
        const prevStatuses = prevStatusesRef.current;
        const currentStatuses = orders.reduce((acc, o) => ({ ...acc, [o.id]: o.status }), {} as Record<string, string>);

        // Debug Polling
        console.log('[OrdersPolling] Update received', {
            count: orders.length,
            audioEnabled
        });

        // Check for NEW orders
        const hasNewOrders = orders.some(o => !prevStatuses[o.id] && o.status === 'new');

        // Check for orders changing to READY
        const hasReadyOrders = orders.some(o => {
            const prev = prevStatuses[o.id];
            return prev && prev !== 'ready' && o.status === 'ready';
        });

        if (hasNewOrders) {
            console.log('[OrdersPolling] New order detected!');
            // Sound handled globally in AuthenticatedLayout
            // if (audioEnabled) play('new-order');
            // Toast handled globally? No, polling in AuthLayout handles it. 
            // So we suppress it here to avoid double toast/sound.
        }

        if (hasReadyOrders) {
            console.log('[OrdersPolling] Ready order detected!');
            // if (audioEnabled) play('ready');
            // info('Pedido Pronto!', 'Um pedido está pronto para entrega/retirada.');
        }

        // Update ref
        prevStatusesRef.current = currentStatuses;
    }, [orders, audioEnabled, play, success, info]);

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [modalType, setModalType] = useState<OrderAction | null>(null);

    const handleAction = (action: OrderAction, order: Order) => {
        setSelectedOrder(order);
        if (action === 'print') {
            window.open(`/orders/${order.id}/print`, '_blank', 'width=400,height=600');
        } else if (action === 'whatsapp') {
            if (order.customer_phone) {
                const message = `Olá ${order.customer_name}, sobre seu pedido ${order.order_number}...`;
                window.open(`https://wa.me/55${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
            } else {
                alert('Cliente sem telefone cadastrado.');
            }
        } else {
            setModalType(action);
        }
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedOrder(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gerenciador de Pedidos" />

            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                            <Package className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            Kanban de Pedidos
                        </h2>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium ml-1">
                        Gerencie o fluxo da sua cozinha e entregas em tempo real
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 px-4 py-2.5 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                        <span className="relative flex h-2.5 w-2.5 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        {orders.length} pedidos ativos
                    </div>
                </div>
            </div>


            {/* Modern Kanban Board - Responsive Grid/Scroll Layout */}
            <div className="flex lg:grid lg:grid-cols-4 gap-4 flex-1 h-[calc(100vh-14rem)] overflow-x-auto lg:overflow-x-visible px-1 pb-2">
                {columns.map((column) => {
                    const columnOrders = getOrdersForColumn(column.id, column.statuses);
                    const Icon = column.icon;

                    return (
                        <div key={column.id} className={`flex h-full flex-col rounded-[24px] bg-gray-50 dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none min-w-[280px] lg:min-w-0`}>
                            {/* Column Header */}
                            <div className="p-3 bg-gray-50 dark:bg-[#1a1b1e] z-10 rounded-t-[24px]">
                                <div className={`flex items-center justify-between rounded-xl p-3 bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 shadow-sm`}>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`p-2 rounded-lg bg-gray-50 dark:bg-white/5 flex-shrink-0 ${column.iconColor}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="font-extrabold text-gray-900 dark:text-white text-sm tracking-tight truncate">{column.title}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex-shrink-0 ${column.badgeColor}`}>
                                        {columnOrders.length}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
                                {columnOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        motoboys={motoboys}
                                        onAction={handleAction}
                                    />
                                ))}

                                {columnOrders.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full max-h-48 rounded-[20px] border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 gap-2 mt-2 bg-gray-50/50 dark:bg-white/5 opacity-60">
                                        <div className="p-3 bg-white dark:bg-black/20 rounded-full">
                                            <Icon className="h-6 w-6 opacity-40" />
                                        </div>
                                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest text-center leading-tight">Sem<br />pedidos</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            <CancelOrderModal
                show={modalType === 'cancel'}
                onClose={closeModal}
                order={selectedOrder}
            />
            <ChangePaymentModal
                show={modalType === 'payment'}
                onClose={closeModal}
                order={selectedOrder}
            />
            <EditOrderModal
                show={modalType === 'edit'}
                onClose={closeModal}
                order={selectedOrder}
                products={products}
            />
            <ChangeModeModal
                show={modalType === 'mode'}
                onClose={closeModal}
                order={selectedOrder}
            />
        </AuthenticatedLayout>
    );
}
