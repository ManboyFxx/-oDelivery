import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Clock, Printer, Edit, CreditCard, MessageCircle, Check, X, MapPin, Bike, User, AlertCircle, AlertTriangle, Timer } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useToast } from '@/Hooks/useToast';

export interface Order {
    id: string;
    order_number: string;
    status: string;
    customer_name: string;
    created_at: string;
    total: number;
    subtotal: number;
    delivery_fee: number;
    mode: 'delivery' | 'pickup' | 'table';
    payment_status: 'paid' | 'pending';
    address?: {
        street: string;
        number: string;
        neighborhood: string;
        complement?: string;
    } | null;
    items: {
        id: string;
        product_name: string;
        quantity: number;
        subtotal: number;
        notes?: string;
        product?: {
            description?: string;
        };
        complements?: {
            name: string;
            quantity: number;
        }[];
    }[];
    motoboy?: {
        id: string;
        name: string;
    };
    customer_phone?: string;
    // Timing fields
    preparation_started_at?: string;
    estimated_ready_at?: string;
    preparation_time_minutes?: number;
    is_late?: boolean;
    elapsed_minutes?: number;
    preparation_elapsed_minutes?: number;
    time_status?: 'pending' | 'on_time' | 'warning' | 'late';
    // Payment
    payments?: Array<{
        method: string;
    }>;
    table?: {
        id: string;
        number: number;
    } | null;
}

export type OrderAction = 'print' | 'edit' | 'payment' | 'mode' | 'cancel' | 'whatsapp';

interface Props {
    order: Order;
    motoboys: any[];
    onAction: (action: OrderAction, order: Order) => void;
    onQuickView?: (order: Order) => void;
}

export default function OrderCard({ order, motoboys, onAction, onQuickView }: Props) {
    const [elapsedTime, setElapsedTime] = useState('');
    const [selectedMotoboy, setSelectedMotoboy] = useState(order.motoboy?.id || '');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(order.payments?.[0]?.method || 'cash');
    const { success, info } = useToast();

    // Timer Logic
    useEffect(() => {
        const calculateTime = () => {
            const start = new Date(order.created_at).getTime();
            const now = new Date().getTime();
            const diff = now - start;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setElapsedTime(
                `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        const timer = setInterval(calculateTime, 1000);
        calculateTime();

        return () => clearInterval(timer);
    }, [order.created_at]);

    const handleAssignMotoboy = (motoboyId: string) => {
        if (!motoboyId) return;
        const motoboy = motoboys.find(m => m.id === motoboyId);
        router.post(route('orders.assign-motoboy', order.id), {
            motoboy_id: motoboyId
        }, {
            onSuccess: () => {
                success('Motoboy Atribuído', `${motoboy?.name || 'Motoboy'} foi atribuído ao pedido #${order.order_number}`);
            }
        });
    };

    const handlePaymentMethodChange = (method: string) => {
        setSelectedPaymentMethod(method);
        const methodLabel = paymentMethods.find(pm => pm.value === method)?.label || method;
        router.post(route('orders.payment', order.id), {
            payment_method: method
        }, {
            onSuccess: () => {
                info('Pagamento Atualizado', `Método alterado para ${methodLabel}`);
            }
        });
    };

    const handleStatusUpdate = (status: string) => {
        const statusLabels: Record<string, string> = {
            'preparing': 'Em Preparo',
            'ready': 'Pronto',
            'waiting_motoboy': 'Aguardando Motoboy',
            'motoboy_accepted': 'Saiu para Entrega',
            'out_for_delivery': 'Saiu para Entrega',
            'delivered': 'Entregue'
        };
        router.post(route('orders.status', order.id), { status }, {
            onSuccess: () => {
                success('Status Atualizado', `Pedido #${order.order_number} agora está: ${statusLabels[status] || status}`);
            }
        });
    };

    const handleStartPreparation = () => {
        router.post(route('orders.start-preparation', order.id), {}, {
            onSuccess: () => {
                success('Preparo Iniciado!', `Pedido #${order.order_number} está sendo preparado.`);
            }
        });
    };

    // Action wrappers
    const handlePrint = () => onAction('print', order);
    const handleEdit = () => onAction('edit', order);
    const handlePayment = () => onAction('payment', order);
    const handleWhatsApp = () => onAction('whatsapp', order);
    const handleCancel = () => onAction('cancel', order);

    const getModeBadge = (mode: string) => {
        switch (mode) {
            case 'delivery':
                return { label: 'Entrega', color: 'bg-orange-100 text-orange-700 ring-1 ring-orange-500/20', icon: Bike };
            case 'pickup':
                return { label: 'Retirada', color: 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20', icon: Clock };
            case 'table':
                return { label: 'Mesa', color: 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-500/20', icon: User };
            default:
                return { label: mode, color: 'bg-gray-100 text-gray-700 ring-1 ring-gray-500/20', icon: Check };
        }
    };

    const getTimeStatusColor = () => {
        if (!order.time_status) return 'text-gray-500';
        switch (order.time_status) {
            case 'late':
                return 'text-red-500 animate-pulse';
            case 'warning':
                return 'text-yellow-500';
            case 'on_time':
                return 'text-green-500';
            default:
                return 'text-gray-500';
        }
    };

    const getTimeStatusIcon = () => {
        if (!order.time_status) return Clock;
        switch (order.time_status) {
            case 'late':
                return AlertCircle;
            case 'warning':
                return AlertTriangle;
            default:
                return Timer;
        }
    };

    const paymentMethods = [
        { value: 'cash', label: 'Dinheiro' },
        { value: 'credit_card', label: 'Crédito' },
        { value: 'debit_card', label: 'Débito' },
        { value: 'pix', label: 'PIX' },
    ];

    const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total);

    return (
        <div className="group relative flex flex-col w-full bg-white dark:bg-[#1a1b1e] rounded-[20px] p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-white/5">
            {/* Payment Status Indicator Line */}
            <div className={clsx(
                "absolute top-6 left-0 w-1 h-8 rounded-r-full",
                order.payment_status === 'paid' ? "bg-green-500" : "bg-orange-500"
            )} />

            {/* Header */}
            <div className="mb-3 flex items-start justify-between pl-2">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                            #{order.order_number}
                        </h3>
                        {order.mode === 'table' && order.table && (
                            <div className="flex items-center justify-center bg-cyan-600 text-white w-10 h-10 rounded-xl shadow-lg shadow-cyan-500/20 -mt-1 ml-1 group-hover:scale-110 transition-transform">
                                <span className="text-xl font-black">{order.table.number}</span>
                            </div>
                        )}
                        {/* Quick View Button */}
                        {onQuickView && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickView(order);
                                }}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors group/eye"
                                title="Visualização Rápida"
                            >
                                <svg className="w-4 h-4 text-gray-400 group-hover/eye:text-[#ff3d03]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        )}
                        {getModeBadge(order.mode) && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getModeBadge(order.mode)?.color}`}>
                                {(() => {
                                    const Icon = getModeBadge(order.mode)?.icon;
                                    return Icon && <Icon className="h-3 w-3" />;
                                })()}
                                {getModeBadge(order.mode)?.label}
                            </span>
                        )}
                        {order.is_late && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 ring-1 ring-red-500/20 animate-pulse">
                                <AlertCircle className="h-3 w-3" />
                                ATRASADO
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className={clsx(
                            "flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold",
                            order.time_status === 'late' ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600" :
                                order.time_status === 'warning' ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600" :
                                    "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400"
                        )}>
                            {(() => {
                                const Icon = getTimeStatusIcon();
                                return <Icon className={clsx("w-3 h-3", getTimeStatusColor())} />;
                            })()}
                            <span className="tabular-nums tracking-wide">{elapsedTime}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Info */}
            <div className="mb-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-white dark:bg-[#1a1b1e] text-orange-500 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-sm">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-2">
                                {order.customer_name}
                            </h3>
                            <button
                                onClick={handleWhatsApp}
                                className="text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                                title="Abrir WhatsApp"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </button>
                        </div>
                        {order.address && (
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0 opacity-70" />
                                <span className="truncate">
                                    {order.address.street}, {order.address.number}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="flex-1 space-y-2 mb-3 px-1">
                {order.items.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="flex gap-2 group/item">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-orange-50 dark:bg-orange-500/10 text-[10px] font-black text-orange-600 dark:text-orange-500">
                            {item.quantity}×
                        </span>
                        <div className="flex-1 min-w-0">
                            <span className="block font-bold text-gray-900 dark:text-white text-xs leading-tight group-hover/item:text-orange-500 transition-colors">
                                {item.product_name}
                            </span>
                            {item.complements && item.complements.length > 0 && (
                                <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1.5 pl-1.5 border-l-2 border-orange-200 dark:border-orange-500/20">
                                    {item.complements.map((c, i) => (
                                        <span key={i} className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-tighter">
                                            + {c.quantity > 1 ? `${c.quantity}x ` : ''}{c.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {item.notes && (
                                <p className="text-[10px] font-medium text-red-500 mt-0.5 bg-red-50 dark:bg-red-900/10 px-1.5 py-0.5 rounded inline-block">
                                    Obs: {item.notes}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                {order.items.length > 6 && (
                    <button
                        onClick={handleEdit}
                        className="w-full py-1 text-[11px] font-bold text-gray-400 hover:text-orange-500 transition-colors border-t border-gray-100 dark:border-white/5 border-dashed"
                    >
                        + {order.items.length - 6} itens
                    </button>
                )}
            </div>

            {/* Payment & Motoboy Controls */}
            <div className="space-y-2 mb-3">
                {/* Payment Method Dropdown */}
                <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                        value={selectedPaymentMethod}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        className="flex-1 py-1.5 px-2 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-xs font-medium focus:ring-orange-500 focus:border-orange-500"
                    >
                        {paymentMethods.map((pm) => (
                            <option key={pm.value} value={pm.value}>{pm.label}</option>
                        ))}
                    </select>
                </div>

                {/* Motoboy Assignment - Show for delivery orders */}
                {order.mode === 'delivery' && (
                    <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <select
                            value={selectedMotoboy}
                            onChange={(e) => {
                                setSelectedMotoboy(e.target.value);
                                handleAssignMotoboy(e.target.value);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-xs font-medium focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">Atribuir motoboy...</option>
                            {motoboys.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-2">
                <div
                    className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handlePayment}
                >
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                    <span className="text-base font-black text-gray-900 dark:text-white tracking-tight">{formattedTotal}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleEdit}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/20 dark:hover:text-orange-500 transition-all active:scale-95"
                        title="Editar"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handlePrint}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-orange-600 dark:hover:bg-gray-200 transition-all shadow-sm active:scale-95"
                        title="Imprimir"
                    >
                        <Printer className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95"
                        title="Cancelar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Status Actions */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                {order.status === 'new' && (
                    <button
                        onClick={handleStartPreparation}
                        className="w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-md shadow-green-500/20 transition-all active:scale-95"
                    >
                        ✓ Aceitar e Iniciar Preparo
                    </button>
                )}

                {order.status === 'preparing' && (
                    <button
                        onClick={() => handleStatusUpdate(order.mode === 'delivery' ? 'waiting_motoboy' : 'ready')}
                        className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95"
                    >
                        ✓ Marcar como Pronto
                    </button>
                )}

                {order.status === 'waiting_motoboy' && order.motoboy && (
                    <button
                        onClick={() => handleStatusUpdate('motoboy_accepted')}
                        className="w-full py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                    >
                        🚴 Motoboy Saiu para Entrega
                    </button>
                )}

                {(order.status === 'motoboy_accepted' || order.status === 'out_for_delivery') && (
                    <button
                        onClick={() => handleStatusUpdate('delivered')}
                        className="w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-md shadow-green-500/20 transition-all active:scale-95"
                    >
                        ✓ Pedido Entregue
                    </button>
                )}

                {order.status === 'ready' && (
                    <button
                        onClick={() => handleStatusUpdate('delivered')}
                        className="w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-md shadow-green-500/20 transition-all active:scale-95"
                    >
                        ✓ Cliente Retirou
                    </button>
                )}
            </div>
        </div>
    );
}
