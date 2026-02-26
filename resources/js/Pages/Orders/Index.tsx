import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import OrderCard, { Order, OrderAction } from './Partials/OrderCard';
import DraggableOrderCard from './Partials/DraggableOrderCard';
import OrderDrawer from './Partials/OrderDrawer';
import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useAudio } from '@/Hooks/useAudio';
import { useToast } from '@/Hooks/useToast';
import { CancelOrderModal, ChangeModeModal, ChangePaymentModal, EditOrderModal } from './Partials/ActionModals';
import { Circle, Clock, CheckCircle, Truck, Package, Filter, X, MapPin, Bike, CreditCard } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { useMemo, useCallback } from 'react';

// ... imports

export default function OrdersIndex({ orders, motoboys = [], products = [], estimatedTime = 40 }: { orders: Order[], motoboys: any[], products: any[], estimatedTime?: number }) {
    const [baseTime, setBaseTime] = useState(estimatedTime);
    const [isUpdatingTime, setIsUpdatingTime] = useState(false);

    useEffect(() => {
        setBaseTime(estimatedTime);
    }, [estimatedTime]);

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBaseTime(parseInt(e.target.value) || 0);
    };

    const saveTime = () => {
        setIsUpdatingTime(true);
        router.post(route('orders.update-time'), { estimated_delivery_time: baseTime }, {
            preserveScroll: true,
            onFinish: () => setIsUpdatingTime(false)
        });
    };

    const columns = useMemo(() => [
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
            statuses: ['out_for_delivery'],
            icon: Truck,
            iconColor: 'text-cyan-500',
            headerBg: 'bg-white',
            borderColor: 'border-cyan-100',
            containerBg: 'bg-cyan-50/30',
            badgeColor: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-700/10'
        },
    ], []);

    // Filters State
    const [filters, setFilters] = useState({
        neighborhood: '',
        motoboy: '',
        paymentStatus: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    // Drawer State
    const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const openDrawer = useCallback((order: Order) => {
        setDrawerOrder(order);
        setIsDrawerOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
        setTimeout(() => setDrawerOrder(null), 300);
    }, []);

    // Get unique neighborhoods and motoboys for filters
    const neighborhoods = useMemo(() => Array.from(new Set(orders.filter(o => o.address?.neighborhood).map(o => o.address!.neighborhood))), [orders]);

    // Memoize available motoboys
    const availableMotoboys = useMemo(() => {
        return Array.from(new Set(orders.filter(o => o.motoboy).map(o => o.motoboy!.id))).map(id => {
            const order = orders.find(o => o.motoboy?.id === id);
            return order?.motoboy;
        }).filter(Boolean);
    }, [orders]);

    // Apply filters
    const filteredOrders = useMemo(() => orders.filter(order => {
        if (filters.neighborhood && order.address?.neighborhood !== filters.neighborhood) return false;
        if (filters.motoboy && order.motoboy?.id !== filters.motoboy) return false;
        if (filters.paymentStatus && order.payment_status !== filters.paymentStatus) return false;
        return true;
    }), [orders, filters]);

    const getOrdersForColumn = useCallback((columnId: string, customStatuses?: string[]) => {
        const targetStatuses = customStatuses || [columnId];
        return filteredOrders.filter(o => targetStatuses.includes(o.status));
    }, [filteredOrders]);

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

    // Poll for updates every 15s using public endpoint to save DB connections
    useEffect(() => {
        const tenantId = (window as any).page?.props?.auth?.user?.tenant_id || (window as any).page?.props?.tenant?.id;
        let lastTimestamp = 0;

        const checkPublicPoll = async () => {
            if (!tenantId) return;

            try {
                const response = await fetch(`/api/poll/${tenantId}`);
                if (!response.ok) return;

                const { timestamp } = await response.json();

                if (lastTimestamp === 0) {
                    lastTimestamp = timestamp;
                    return;
                }

                if (timestamp > lastTimestamp) {
                    console.log('[OrdersPolling] Change detected via Poll File. Reloading...');
                    lastTimestamp = timestamp;

                    router.reload({
                        only: ['orders'],
                        preserveScroll: true,
                    } as any);
                }
            } catch (error) {
                // Silent fail
            }
        };

        const interval = setInterval(checkPublicPoll, 15000);

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

    const handleAction = useCallback((action: OrderAction, order: Order) => {
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
    }, []);

    const closeModal = () => {
        setModalType(null);
        setSelectedOrder(null);
    };

    // Drag & Drop
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts
            },
        })
    );

    const handleDragStart = (event: any) => {
        const { active } = event;
        const order = orders.find(o => o.id === active.id);
        setActiveOrder(order || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveOrder(null);

        if (!over) return;

        const orderId = active.id as string;
        const newStatus = over.id as string;

        // Find the order
        const order = orders.find(o => o.id === orderId);
        if (!order || order.status === newStatus) return;

        // Map column IDs to actual statuses
        const statusMap: Record<string, string> = {
            'new': 'new',
            'preparing': 'preparing',
            'ready': 'ready',
            'out_for_delivery': 'out_for_delivery',
        };

        const targetStatus = statusMap[newStatus];
        if (!targetStatus) return;

        // Update status via API
        router.post(route('orders.status', order.id), { status: targetStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                const statusLabels: Record<string, string> = {
                    'new': 'Novo',
                    'preparing': 'Em Preparo',
                    'ready': 'Pronto',
                    'out_for_delivery': 'Em Entrega',
                };
                success('Status Atualizado', `Pedido #${order.order_number} → ${statusLabels[targetStatus]}`);
            }
        });
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
                <div className="flex flex-wrap items-center gap-3">
                    {/* Time Config */}
                    <div className="flex items-center gap-2 bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 pl-3 pr-1 py-1 rounded-2xl shadow-sm">
                        <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Previsão:
                        </label>
                        <div className="flex items-center gap-1">
                            <input 
                                type="number" 
                                min="5" max="180" step="5"
                                value={baseTime}
                                onChange={handleTimeChange}
                                className="w-16 h-8 text-sm font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-center px-1"
                            />
                            <span className="text-xs font-bold text-gray-400 mr-1">min</span>
                            {baseTime !== estimatedTime && (
                                <button
                                    onClick={saveTime}
                                    disabled={isUpdatingTime}
                                    className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                                    title="Salvar Tempo Base"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-colors shadow-sm ${showFilters || Object.values(filters).some(v => v)
                            ? 'bg-[#ff3d03] text-white'
                            : 'bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-[#ff3d03]'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                        {Object.values(filters).filter(v => v).length > 0 && (
                            <span className="bg-white text-[#ff3d03] px-1.5 py-0.5 rounded-full text-xs font-black">
                                {Object.values(filters).filter(v => v).length}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-2 bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 px-4 py-2.5 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                        <span className="relative flex h-2.5 w-2.5 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        {filteredOrders.length} pedidos {Object.values(filters).some(v => v) ? 'filtrados' : 'ativos'}
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/10 rounded-2xl p-4 mb-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Neighborhood Filter */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Bairro
                            </label>
                            <select
                                value={filters.neighborhood}
                                onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-[#ff3d03] focus:ring-0"
                            >
                                <option value="">Todos os bairros</option>
                                {neighborhoods.map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>

                        {/* Motoboy Filter */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <Bike className="w-4 h-4 inline mr-1" />
                                Entregador
                            </label>
                            <select
                                value={filters.motoboy}
                                onChange={(e) => setFilters({ ...filters, motoboy: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-[#ff3d03] focus:ring-0"
                            >
                                <option value="">Todos os entregadores</option>
                                {availableMotoboys.map(m => m && (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Status Filter */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <CreditCard className="w-4 h-4 inline mr-1" />
                                Pagamento
                            </label>
                            <select
                                value={filters.paymentStatus}
                                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-[#ff3d03] focus:ring-0"
                            >
                                <option value="">Todos os status</option>
                                <option value="paid">Pago</option>
                                <option value="pending">Pendente</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {Object.values(filters).some(v => v) && (
                        <button
                            onClick={() => setFilters({ neighborhood: '', motoboy: '', paymentStatus: '' })}
                            className="mt-3 flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#ff3d03] transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Limpar filtros
                        </button>
                    )}
                </div>
            )}



            {/* Modern Kanban Board - Responsive Grid/Scroll Layout */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex lg:grid lg:grid-cols-4 gap-4 flex-1 h-[calc(100vh-14rem)] overflow-x-auto lg:overflow-x-visible px-1 pb-2">
                    {columns.map((column) => {
                        const columnOrders = getOrdersForColumn(column.id, column.statuses);
                        const Icon = column.icon;

                        return (
                            <SortableContext
                                key={column.id}
                                id={column.id}
                                items={columnOrders.map(o => o.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className={`flex h-full flex-col rounded-[24px] bg-gray-50 dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none min-w-[280px] lg:min-w-0`}>
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
                                            <DraggableOrderCard
                                                key={order.id}
                                                order={order}
                                                motoboys={motoboys}
                                                onAction={handleAction}
                                                onQuickView={openDrawer}
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
                            </SortableContext>
                        );
                    })}
                </div>

                {/* Drag Overlay - Shows ghost of dragged item */}
                <DragOverlay>
                    {activeOrder ? (
                        <div className="rotate-3 scale-105 opacity-90">
                            <OrderCard
                                order={activeOrder}
                                motoboys={motoboys}
                                onAction={() => { }}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

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

            {/* Order Drawer */}
            <OrderDrawer
                order={drawerOrder}
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                onAction={handleAction}
            />
        </AuthenticatedLayout>
    );
}
