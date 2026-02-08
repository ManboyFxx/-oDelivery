import { X, Clock, User, MapPin, Phone, CreditCard, Package, Bike, Printer, MessageCircle, DollarSign } from 'lucide-react';
import { Order, OrderAction } from './OrderCard';
import { clsx } from 'clsx';

interface OrderDrawerProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onAction?: (action: OrderAction, order: Order) => void;
}

export default function OrderDrawer({ order, isOpen, onClose, onAction }: OrderDrawerProps) {
    if (!order) return null;

    const statusLabels: Record<string, string> = {
        new: 'Novo',
        preparing: 'Preparando',
        ready: 'Pronto',
        waiting_motoboy: 'Aguardando Motoboy',
        motoboy_accepted: 'Motoboy Aceitou',
        out_for_delivery: 'Em Entrega',
        delivered: 'Entregue',
        completed: 'Concluído',
        cancelled: 'Cancelado',
    };

    const modeLabels = {
        delivery: 'Delivery',
        pickup: 'Retirada',
        table: 'Mesa',
    };

    const paymentStatusLabels = {
        paid: 'Pago',
        pending: 'Pendente',
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={clsx(
                    'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={clsx(
                    'fixed right-0 top-0 h-full w-full md:w-[500px] bg-white dark:bg-[#1a1b1e] shadow-2xl z-50 transition-transform duration-300 overflow-y-auto',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-[#1a1b1e] border-b border-gray-200 dark:border-white/10 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                            Pedido #{order.order_number}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {statusLabels[order.status] || order.status}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 space-y-3">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Cliente
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p className="text-gray-700 dark:text-gray-300 font-medium">{order.customer_name}</p>
                            {order.customer_phone && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Phone className="w-4 h-4" />
                                    {order.customer_phone}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address (if delivery) */}
                    {order.mode === 'delivery' && order.address && (
                        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 space-y-3">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Endereço de Entrega
                            </h3>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                <p>{order.address.street}, {order.address.number}</p>
                                <p className="text-gray-600 dark:text-gray-400">{order.address.neighborhood}</p>
                                {order.address.complement && (
                                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                                        {order.address.complement}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Motoboy */}
                    {order.motoboy && (
                        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 space-y-3">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Bike className="w-5 h-5" />
                                Entregador
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                {order.motoboy.name}
                            </p>
                        </div>
                    )}

                    {/* Items */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Itens do Pedido
                        </h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 space-y-2"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {item.quantity}x {item.product_name}
                                            </p>
                                            {item.product?.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {item.product.description}
                                                </p>
                                            )}
                                        </div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                                            R$ {item.subtotal.toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Complements */}
                                    {item.complements && item.complements.length > 0 && (
                                        <div className="pl-3 border-l-2 border-gray-200 dark:border-white/10 space-y-1">
                                            {item.complements.map((comp, idx) => (
                                                <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                                    + {comp.quantity}x {comp.name}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {item.notes && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-yellow-50 dark:bg-yellow-500/10 p-2 rounded">
                                            Obs: {item.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 space-y-3">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Resumo do Pagamento
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>R$ {order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.delivery_fee > 0 && (
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Taxa de Entrega</span>
                                    <span>R$ {order.delivery_fee.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-200 dark:border-white/10">
                                <span>Total</span>
                                <span>R$ {order.total.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <CreditCard className="w-4 h-4 text-gray-500" />
                                <span className={clsx(
                                    'text-xs font-bold px-2 py-1 rounded-full',
                                    order.payment_status === 'paid'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                                )}>
                                    {paymentStatusLabels[order.payment_status]}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Tipo de Pedido</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {modeLabels[order.mode]}
                            </span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Criado em</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {new Date(order.created_at).toLocaleString('pt-BR')}
                            </span>
                        </div>
                        {order.preparation_started_at && (
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Preparo iniciado</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {new Date(order.preparation_started_at).toLocaleTimeString('pt-BR')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Footer */}
                {onAction && (
                    <div className="sticky bottom-0 bg-white dark:bg-[#1a1b1e] border-t border-gray-200 dark:border-white/10 p-6 space-y-3">
                        <button
                            onClick={() => onAction('print', order)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        >
                            <Printer className="w-5 h-5" />
                            Imprimir Comanda
                        </button>
                        <button
                            onClick={() => onAction('whatsapp', order)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Enviar WhatsApp
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
