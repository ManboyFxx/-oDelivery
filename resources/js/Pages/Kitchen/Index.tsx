import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import KitchenLayout from '@/Layouts/KitchenLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Clock, ChefHat, CheckCircle2, Timer, UtensilsCrossed, Volume2, Maximize, Minimize, VolumeX } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableKitchenCard from './DraggableKitchenCard';
import { useNotificationSound } from '@/Hooks/useNotificationSound';
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
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [previousOrderCount, setPreviousOrderCount] = useState(orders.filter(o => o.status === 'new').length);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { play: playNotification } = useNotificationSound(soundEnabled);

    // Fullscreen Toggle Logic
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            });
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Detect new orders and play sound
    useEffect(() => {
        const newOrderCount = orders.filter(o => o.status === 'new').length;

        if (newOrderCount > previousOrderCount && soundEnabled) {
            playNotification();
        }

        setPreviousOrderCount(newOrderCount);
    }, [orders, soundEnabled]);

    // Timer Logic
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
        router.post(route('kitchen.update-status', orderId), { status }, {
            preserveScroll: true,
            preserveState: true // Keep fullscreen state
        });
    };

    const newOrders = orders.filter(o => o.status === 'new');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    // Drag & Drop Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
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

        const order = orders.find(o => o.id === orderId);
        if (!order || order.status === newStatus) return;

        handleStatusUpdate(orderId, newStatus);
    };

    // Status Column Component
    const StatusColumn = ({ id, title, orders, icon: Icon, color, bgClass, borderClass }: any) => (
        <div
            className={clsx(
                "flex flex-col rounded-2xl overflow-hidden border transition-all duration-300",
                bgClass,
                borderClass,
                isFullscreen ? "h-full" : "h-[calc(100vh-200px)] min-h-[600px]"
            )}
        >
            {/* Header */}
            <div className={clsx("p-4 border-b flex justify-between items-center", borderClass, color)}>
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                    <Icon className="h-5 w-5" />
                    {title}
                </div>
                <div className={clsx("px-2 py-1 rounded-lg text-xs font-bold bg-white/20")}>
                    {orders.length}
                </div>
            </div>

            {/* Droppable Area */}
            <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
                <SortableContext id={id} items={orders.map((o: Order) => o.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 min-h-[100px]">
                        {orders.map((order: Order) => (
                            <DraggableKitchenCard
                                key={order.id}
                                order={order}
                                elapsedTime={elapsedTimes[order.id]}
                            />
                        ))}
                    </div>
                </SortableContext>

                {orders.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                        <Icon className="h-12 w-12 mb-2" />
                        <p className="font-medium text-sm">Vazio</p>
                    </div>
                )}
            </div>
        </div>
    );

    const content = (
        <div className={clsx("flex flex-col h-full", isFullscreen ? "p-4" : "")}>
            <Head title="Cozinha (KDS)" />

            {/* Header Controls (Only when not in fullscreen or embedded in standard layout) */}
            {!isFullscreen && (
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-black dark:text-white flex items-center gap-3">
                            <ChefHat className="h-8 w-8 text-[#ff3d03]" />
                            Kitchen Display System
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie a produção em tempo real</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={clsx(
                                "p-3 rounded-xl border transition-colors",
                                soundEnabled
                                    ? "bg-white dark:bg-[#1a1b1e] border-gray-200 dark:border-white/10 text-[#ff3d03] shadow-sm"
                                    : "bg-gray-100 dark:bg-white/5 border-transparent text-gray-400"
                            )}
                            title={soundEnabled ? "Som Ativado" : "Som Mudo"}
                        >
                            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
                        >
                            <Maximize className="h-4 w-4" />
                            Modo Tela Cheia
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">

                    {/* 1. New Orders */}
                    <div id="new" className="h-full">
                        <StatusColumn
                            id="new"
                            title="Novos Pedidos"
                            orders={newOrders}
                            icon={Clock}
                            color="text-blue-500"
                            bgClass="bg-blue-50/50 dark:bg-blue-900/10"
                            borderClass="border-blue-100 dark:border-blue-500/20"
                        />
                    </div>

                    {/* 2. Preparing */}
                    <div id="preparing" className="h-full">
                        <StatusColumn
                            id="preparing"
                            title="Em Preparo"
                            orders={preparingOrders}
                            icon={UtensilsCrossed}
                            color="text-[#ff3d03]"
                            bgClass="bg-orange-50/50 dark:bg-orange-900/10"
                            borderClass="border-orange-100 dark:border-[#ff3d03]/20"
                        />
                    </div>

                    {/* 3. Ready */}
                    <div id="ready" className="h-full">
                        <StatusColumn
                            id="ready"
                            title="Prontos"
                            orders={readyOrders}
                            icon={CheckCircle2}
                            color="text-green-500"
                            bgClass="bg-green-50/50 dark:bg-green-900/10"
                            borderClass="border-green-100 dark:border-green-500/20"
                        />
                    </div>

                </div>

                <DragOverlay>
                    {activeOrder ? (
                        <div className="w-[350px] rotate-3 cursor-grabbing opacity-90">
                            <DraggableKitchenCard
                                order={activeOrder}
                                elapsedTime={elapsedTimes[activeOrder.id]}
                                isOverlay
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );

    if (isFullscreen) {
        return (
            <KitchenLayout isFullscreen={true} toggleFullscreen={toggleFullscreen}>
                {content}
            </KitchenLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            {content}
        </AuthenticatedLayout>
    );
}
