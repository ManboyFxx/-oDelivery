import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import OrderCard, { Order, OrderAction } from './Partials/OrderCard';
import { useState } from 'react';
import { CancelOrderModal, ChangeModeModal, ChangePaymentModal, EditOrderModal } from './Partials/ActionModals';

export default function OrdersIndex({ orders, motoboys = [] }: { orders: Order[], motoboys: any[] }) {
    const columns = [
        {
            id: 'new',
            title: 'Novos',
            headerColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
            containerColor: 'bg-blue-50/30 border-blue-100 dark:bg-blue-900/5 dark:border-blue-800/30'
        },
        {
            id: 'preparing',
            title: 'Preparando',
            headerColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
            containerColor: 'bg-orange-50/30 border-orange-100 dark:bg-orange-900/5 dark:border-orange-800/30'
        },
        {
            id: 'ready',
            title: 'Pronto / Aguardando',
            statuses: ['ready', 'waiting_motoboy'],
            headerColor: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
            containerColor: 'bg-green-50/30 border-green-100 dark:bg-green-900/5 dark:border-green-800/30'
        },
        {
            id: 'out_for_delivery',
            title: 'Em Entrega',
            statuses: ['motoboy_accepted', 'out_for_delivery'],
            headerColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
            containerColor: 'bg-indigo-50/30 border-indigo-100 dark:bg-indigo-900/5 dark:border-indigo-800/30'
        },
    ];

    const getOrdersForColumn = (columnId: string, customStatuses?: string[]) => {
        const targetStatuses = customStatuses || [columnId];
        return orders.filter(o => targetStatuses.includes(o.status));
    };

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

            <div className="flex h-full flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Kanban de Pedidos
                    </h2>
                    <span className="text-sm text-gray-500">
                        {orders.length} pedidos ativos
                    </span>
                </div>

                {/* Kanban Board */}
                <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
                    {columns.map((column) => (
                        <div key={column.id} className={`flex h-full w-96 flex-shrink-0 flex-col rounded-xl border p-3 transition-colors ${column.containerColor}`}>
                            <div className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 font-semibold ${column.headerColor}`}>
                                <span>{column.title}</span>
                                <span className="rounded-full bg-white px-2 py-0.5 text-xs shadow-sm dark:bg-gray-800">
                                    {getOrdersForColumn(column.id, column.statuses).length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                                {getOrdersForColumn(column.id, column.statuses).map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        motoboys={motoboys}
                                        onAction={handleAction}
                                    />
                                ))}

                                {getOrdersForColumn(column.id, column.statuses).length === 0 && (
                                    <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400 dark:border-gray-700">
                                        Vazio
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
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
            />
            <ChangeModeModal
                show={modalType === 'mode'}
                onClose={closeModal}
                order={selectedOrder}
            />
        </AuthenticatedLayout>
    );
}
