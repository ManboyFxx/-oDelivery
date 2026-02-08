import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Timer, UtensilsCrossed, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';

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

interface Props {
    order: Order;
    elapsedTime?: string;
    isOverlay?: boolean;
}

export default function DraggableKitchenCard({ order, elapsedTime, isOverlay }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: order.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const handleStatusUpdate = (e: React.MouseEvent, status: string) => {
        e.stopPropagation(); // Prevent drag start
        router.post(route('kitchen.update-status', order.id), { status }, {
            preserveScroll: true,
            preserveState: true
        });
    };

    // Determine card colors based on status
    const getStatusColors = () => {
        switch (order.status) {
            case 'preparing':
                return {
                    border: 'border-[#ff3d03]/30',
                    hoverBorder: 'hover:border-[#ff3d03]/60',
                    bg: 'bg-[#ff3d03]/10',
                    text: 'text-[#ff3d03]',
                    icon: 'bg-[#ff3d03]/20',
                };
            case 'ready':
                return {
                    border: 'border-green-500/30',
                    hoverBorder: 'hover:border-green-500/60',
                    bg: 'bg-green-500/10',
                    text: 'text-green-500',
                    icon: 'bg-green-500/20',
                };
            default: // new
                return {
                    border: 'border-blue-500/30',
                    hoverBorder: 'hover:border-blue-500/60',
                    bg: 'bg-blue-500/10',
                    text: 'text-blue-500',
                    icon: 'bg-blue-500/20',
                };
        }
    };

    const colors = getStatusColors();

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group relative bg-white dark:bg-[#1a1b1e] rounded-[24px] border ${colors.border} ${colors.hoverBorder} transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md touch-none cursor-grab active:cursor-grabbing ${isOverlay ? 'shadow-2xl rotate-2 ring-2 ring-blue-500/50' : ''}`}
        >
            {/* Top Bar / Timer */}
            <div className="absolute top-0 right-0 p-4">
                <div className={`${colors.bg} backdrop-blur-sm border ${colors.border} rounded-full px-3 py-1 flex items-center gap-2 ${order.status === 'preparing' ? 'animate-pulse' : ''}`}>
                    <Timer className={`h-4 w-4 ${colors.text}`} />
                    <span className={`font-mono font-bold ${colors.text}`}>
                        {elapsedTime || '0:00'}
                    </span>
                </div>
            </div>

            <div className="p-6">
                {/* Order Info */}
                <div className="flex items-start gap-4 mb-6">
                    <div className={`${colors.bg} p-4 rounded-2xl border ${colors.border}`}>
                        <span className={`text-xs ${colors.text} uppercase font-bold block mb-1`}>Pedido</span>
                        <span className="text-3xl font-black text-gray-800 dark:text-white">#{order.order_number}</span>
                    </div>
                    <div className="pt-1">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{order.customer_name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Recebido às {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* Items List */}
                <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 mb-6 border border-gray-100 dark:border-white/5 space-y-3">
                    {order.items.map(item => (
                        <div key={item.id} className="flex items-start gap-3">
                            <div className={`${colors.icon} ${colors.text} w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0`}>
                                {item.quantity}x
                            </div>
                            <div>
                                <p className="text-gray-800 dark:text-gray-200 font-medium leading-tight pt-1">
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

                {/* Actions */}
                <div className="flex gap-3">
                    {order.status === 'new' && (
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleStatusUpdate(e, 'preparing')}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <UtensilsCrossed className="h-5 w-5" />
                            PREPARAR
                        </button>
                    )}

                    {order.status === 'preparing' && (
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleStatusUpdate(e, 'ready')}
                            className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            PRONTO
                        </button>
                    )}

                    {order.status === 'ready' && (
                        <div className="w-full bg-green-500/20 text-green-600 dark:text-green-400 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-green-500/30">
                            <CheckCircle2 className="h-5 w-5" />
                            CONCLUÍDO
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
