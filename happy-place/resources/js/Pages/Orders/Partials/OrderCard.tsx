import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Clock, Printer, Edit, CreditCard, Repeat, MessageCircle, Check, X, User, MapPin, Bike, ChevronDown, ChevronUp } from 'lucide-react';
import { router } from '@inertiajs/react';

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
        product?: {
            description?: string;
        }
    }[];
    motoboy?: {
        id: string;
        name: string;
    };
    customer_phone?: string;
}

export type OrderAction = 'print' | 'edit' | 'payment' | 'mode' | 'cancel' | 'whatsapp';

interface Props {
    order: Order;
    motoboys: any[];
    onAction: (action: OrderAction, order: Order) => void;
}

export default function OrderCard({ order, motoboys, onAction }: Props) {
    const [elapsedTime, setElapsedTime] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedMotoboy, setSelectedMotoboy] = useState(order.motoboy?.id || '');

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
        router.post(route('orders.assign-motoboy', order.id), {
            motoboy_id: motoboyId
        });
    };

    const handleStatusUpdate = (status: string) => {
        router.post(route('orders.status', order.id), { status });
    };

    // Action wrappers
    const handlePrint = () => onAction('print', order);
    const handleEdit = () => onAction('edit', order);
    const handlePayment = () => onAction('payment', order);
    const handleWhatsApp = () => onAction('whatsapp', order);
    const handleCancel = () => onAction('cancel', order);

    // Color Helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'preparing': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'ready': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'out_for_delivery': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="bg-white dark:bg-[#1a1b1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mb-3 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                            {order.customer_name} <span className="text-gray-400 font-normal text-sm">({order.items.length})</span>
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <span className="uppercase text-[#ff3d03]">ID: {order.order_number}</span>
                            <span>•</span>
                            <span className={clsx("uppercase font-bold", order.mode === 'delivery' ? "text-blue-500" : "text-yellow-500")}>
                                {order.mode === 'delivery' ? 'ENTREGA' : order.mode === 'pickup' ? 'RETIRADA' : 'MESA'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block font-bold text-lg text-[#ff3d03]">
                            R$ {Number(order.total).toFixed(2).replace('.', ',')}
                        </span>
                        <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                            {order.payment_status === 'paid' ? (
                                <span className="flex items-center text-green-600 gap-0.5"><Check className="h-3 w-3" /> Pago</span>
                            ) : (
                                <span className="text-red-500">Pendente</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timer line */}
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold dark:bg-yellow-900/20 dark:text-yellow-500">
                        <Clock className="h-3 w-3" />
                        <span>{elapsedTime}</span>
                    </div>
                    {order.status === 'out_for_delivery' && (
                        <div className="text-xs font-bold text-indigo-600 animate-pulse">
                            EM ENTREGA
                        </div>
                    )}
                </div>

                {/* Address (If Delivery) */}
                {order.mode === 'delivery' && order.address && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                            {order.address.street}, {order.address.number} - {order.address.neighborhood}
                            {order.address.complement ? ` (${order.address.complement})` : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* Motoboy Selection */}
            {order.mode === 'delivery' && (
                <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-900/10 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Bike className="h-4 w-4 text-blue-500" />
                        <select
                            className="bg-transparent border-none text-xs font-medium text-gray-700 focus:ring-0 cursor-pointer w-full p-0 dark:text-gray-300"
                            value={selectedMotoboy}
                            onChange={(e) => {
                                setSelectedMotoboy(e.target.value);
                                handleAssignMotoboy(e.target.value);
                            }}
                        >
                            <option value="">Selecione Entregador...</option>
                            {motoboys.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex gap-3 text-gray-500 dark:text-gray-400">
                    <button onClick={handlePrint} title="Imprimir" className="hover:text-gray-800 dark:hover:text-white transition-colors">
                        <Printer className="h-4 w-4" />
                    </button>
                    <button title="Copiar / Duplicar" className="hover:text-gray-800 dark:hover:text-white transition-colors">
                        <Repeat className="h-4 w-4" />
                    </button>
                    <button onClick={handleEdit} title="Editar" className="hover:text-gray-800 dark:hover:text-white transition-colors">
                        <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={handlePayment} title="Alterar Pagamento" className="hover:text-gray-800 dark:hover:text-white transition-colors">
                        <CreditCard className="h-4 w-4" />
                    </button>
                    <button onClick={handleWhatsApp} title="WhatsApp" className="hover:text-green-500 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Big Action Button (Status) */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
                {order.status === 'new' && (
                    <button onClick={() => handleStatusUpdate('preparing')} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        Aceitar / Preparar
                    </button>
                )}
                {order.status === 'preparing' && (
                    <button onClick={() => handleStatusUpdate('ready')} className="flex-1 py-3 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors">
                        Pronto
                    </button>
                )}
                {order.status === 'ready' && order.mode === 'delivery' && (
                    <button onClick={() => handleStatusUpdate('waiting_motoboy')} className="flex-1 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors">
                        Chamar Entregador
                    </button>
                )}
                {order.status === 'ready' && order.mode !== 'delivery' && (
                    <button onClick={() => handleStatusUpdate('delivered')} className="flex-1 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors">
                        Entregar / Finalizar
                    </button>
                )}
                {/* More status buttons as needed */}

                <button
                    onClick={handleCancel}
                    className="w-12 flex items-center justify-center border-l border-white/20 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
                    title="Cancelar"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Collapsible Details */}
            <div>
                <button
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span>Exibir detalhes</span>
                    {isDetailsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {isDetailsOpen && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 text-sm space-y-3">
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase">ITENS DO PEDIDO</h4>
                            {order.items.map((item: Order['items'][0]) => (
                                <div key={item.id} className="flex justify-between items-start">
                                    <div>
                                        <span className="font-bold text-orange-500 mr-1">{item.quantity}x</span>
                                        <span className="text-gray-800 dark:text-gray-200">{item.product_name}</span>
                                        {item.product?.description && (
                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.product.description}</p>
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                        R$ {Number(item.subtotal).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                            </div>
                            {Number(order.delivery_fee) > 0 && (
                                <div className="flex justify-between text-gray-500">
                                    <span>Taxa de entrega</span>
                                    <span>R$ {Number(order.delivery_fee).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white pt-1">
                                <span>Total</span>
                                <span className="text-orange-500">R$ {Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>

                        <button className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                            Ver detalhes completos
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
