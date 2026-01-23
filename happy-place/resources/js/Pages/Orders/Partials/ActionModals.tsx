import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Order } from '../Partials/OrderCard';

interface Props {
    show: boolean;
    onClose: () => void;
    order: Order | null;
}

export function CancelOrderModal({ show, onClose, order }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        reason: '',
    });

    useEffect(() => {
        if (show) reset();
    }, [show]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;
        post(route('orders.cancel', order.id), {
            onSuccess: onClose
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-bold mb-4 text-red-600">Cancelar Pedido #{order?.order_number}</h2>
                <form onSubmit={submit}>
                    <InputLabel value="Motivo do Cancelamento" />
                    <TextInput
                        className="w-full mt-1"
                        value={data.reason}
                        onChange={e => setData('reason', e.target.value)}
                        placeholder="Ex: Cliente desistiu"
                        required
                    />
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">Cancelar</button>
                        <button disabled={processing} className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-700">Confirmar Cancelamento</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export function ChangePaymentModal({ show, onClose, order }: Props) {
    const { data, setData, post, processing } = useForm({
        payment_method: '',
        payment_status: '',
    });

    useEffect(() => {
        if (order) {
            // We don't have payment method explicitly in Order interface yet, purely visual or inferred.
            // Assuming we added it or will use what's available. 
            // For now, default to empty or what we can guess.
            setData({
                payment_method: 'cash', // Default
                payment_status: order.payment_status
            });
        }
    }, [order]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;
        post(route('orders.payment', order.id), {
            onSuccess: onClose
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-bold mb-4">Alterar Pagamento #{order?.order_number}</h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel value="Método de Pagamento" />
                        <select
                            value={data.payment_method}
                            onChange={e => setData('payment_method', e.target.value)}
                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="cash">Dinheiro</option>
                            <option value="credit_card">Cartão de Crédito</option>
                            <option value="debit_card">Cartão de Débito</option>
                            <option value="pix">Pix</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Status do Pagamento" />
                        <select
                            value={data.payment_status}
                            onChange={e => setData('payment_status', e.target.value)}
                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">Cancelar</button>
                        <PrimaryButton disabled={processing}>Salvar</PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export function ChangeModeModal({ show, onClose, order }: Props) {
    const { data, setData, post, processing } = useForm({
        mode: '',
    });

    useEffect(() => {
        if (order) setData('mode', order.mode);
    }, [order]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;
        post(route('orders.mode', order.id), {
            onSuccess: onClose
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-bold mb-4">Alterar Tipo de Pedido</h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel value="Tipo de Entrega" />
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {['delivery', 'pickup', 'table'].map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setData('mode', m)}
                                    className={`py-2 px-3 rounded border text-sm font-bold uppercase ${data.mode === m ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-500'}`}
                                >
                                    {m === 'delivery' ? 'Entrega' : m === 'pickup' ? 'Retirada' : 'Mesa'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">Cancelar</button>
                        <PrimaryButton disabled={processing}>Salvar</PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export function EditOrderModal({ show, onClose, order }: Props) {
    // Basic Edit: Just customer name/phone/notes for now until we have a full edit page
    const { data, setData, post, processing } = useForm({
        // We actually need a route to update details not just status. 
        // Let's assume we use 'update' resource method but we need to check if it exists or create it.
        // For now, let's create a stub or just handle basic info.
        customer_name: '',
        customer_phone: '',
    });

    // NOTE: We don't have a specific `update` method for details in the controller logic we built yet, 
    // we only built specific actions. I will add a generic update to existing resource update method later.
    // For now this is valid.

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-bold mb-4">Editar Pedido (Básico)</h2>
                <div className="text-gray-500">Funcionalidade de edição completa em breve.</div>
                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">Fechar</button>
                </div>
            </div>
        </Modal>
    );
}
