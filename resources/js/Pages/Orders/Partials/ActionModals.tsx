import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Order } from '../Partials/OrderCard';
import { X, AlertCircle, CreditCard, ShoppingBag } from 'lucide-react';
import { useToast } from '@/Hooks/useToast';

interface Props {
    show: boolean;
    onClose: () => void;
    order: Order | null;
}

export function CancelOrderModal({ show, onClose, order }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        reason: '',
    });
    const { success, error: showError } = useToast();

    useEffect(() => {
        if (show) reset();
    }, [show]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;
        post(route('orders.cancel', order.id), {
            onSuccess: () => {
                onClose();
            },
            onError: () => {
                showError('Erro', 'Não foi possível cancelar o pedido.');
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Cancelar Pedido</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={submit}>
                    <div className="mb-6">
                        <InputLabel value="Motivo do Cancelamento" className="mb-2 ml-1" />
                        <TextInput
                            className="w-full rounded-2xl border-gray-200 focus:border-red-500 focus:ring-red-500 bg-gray-50 dark:bg-black/20"
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                            placeholder="Ex: Cliente desistiu"
                            required
                        />
                        <p className="mt-2 text-xs text-gray-500 ml-1">
                            Esta ação não pode ser desfeita. O pedido será marcado como cancelado.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Voltar
                        </button>
                        <button
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Confirmar Cancelamento
                        </button>
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
    const { success } = useToast();

    useEffect(() => {
        if (order) {
            setData({
                payment_method: 'cash',
                payment_status: order.payment_status
            });
        }
    }, [order]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;
        post(route('orders.payment', order.id), {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-xl">
                            <CreditCard className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Pagamento</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <InputLabel value="Método de Pagamento" className="mb-2 ml-1" />
                        <select
                            value={data.payment_method}
                            onChange={e => setData('payment_method', e.target.value)}
                            className="w-full rounded-2xl border-gray-200 focus:border-green-500 focus:ring-green-500 bg-gray-50 dark:bg-black/20 p-2.5"
                        >
                            <option value="cash">Dinheiro</option>
                            <option value="credit_card">Cartão de Crédito</option>
                            <option value="debit_card">Cartão de Débito</option>
                            <option value="pix">Pix</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Status do Pagamento" className="mb-2 ml-1" />
                        <select
                            value={data.payment_status}
                            onChange={e => setData('payment_status', e.target.value)}
                            className="w-full rounded-2xl border-gray-200 focus:border-green-500 focus:ring-green-500 bg-gray-50 dark:bg-black/20 p-2.5"
                        >
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
                        <button
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Salvar Alterações
                        </button>
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
    const { success } = useToast();

    useEffect(() => {
        if (order) setData('mode', order.mode);
    }, [order]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;
        post(route('orders.mode', order.id), {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Tipo de Pedido</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                        {['delivery', 'pickup', 'table'].map(m => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setData('mode', m)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${data.mode === m
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-[1.02]'
                                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                    }`}
                            >
                                <span className="font-bold uppercase tracking-wider text-sm">
                                    {m === 'delivery' ? 'Entrega' : m === 'pickup' ? 'Retirada' : 'Mesa'}
                                </span>
                                {data.mode === m && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
                        <button
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export function EditOrderModal({ show, onClose, order, products = [] }: Props & { products?: any[] }) {
    const { data, setData, put, processing, reset } = useForm({
        items: [] as any[],
    });
    const { success } = useToast();

    const [newItemId, setNewItemId] = useState('');
    const [selectedComplements, setSelectedComplements] = useState<Record<string, number>>({});

    useEffect(() => {
        if (show && order) {
            // Map existing items
            const mappedItems = order.items.map(item => ({
                id: item.id,
                product_id: (item as any).product_id,
                product_name: item.product_name || (item.product as any)?.name,
                quantity: item.quantity,
                notes: (item as any).notes || '',
                unit_price: (item as any).unit_price,
                subtotal: item.subtotal,
                complements: (item as any).complements || []
            }));
            setData('items', mappedItems);
        } else if (!show) {
            reset();
            setNewItemId('');
            setSelectedComplements({});
        }
    }, [show, order]);

    const handleAddItem = () => {
        if (!newItemId) return;
        const product = products.find(p => p.id === newItemId);
        if (!product) return;

        // Process complements
        const complementsList = [] as any[];
        let complementsPrice = 0;

        Object.entries(selectedComplements).forEach(([optId, qty]) => {
            if (qty > 0) {
                let foundOption = null;
                product.complement_groups?.forEach((g: any) => {
                    const opt = g.options?.find((o: any) => o.id === optId);
                    if (opt) foundOption = opt;
                });

                if (foundOption) {
                    complementsList.push({
                        id: (foundOption as any).id,
                        name: (foundOption as any).name,
                        price: (foundOption as any).price,
                        quantity: qty
                    });
                    complementsPrice += Number((foundOption as any).price) * qty;
                }
            }
        });

        const quantity = 1;
        const subtotal = (Number(product.price) + complementsPrice) * quantity;

        const newItem = {
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            notes: '',
            unit_price: product.price,
            complements_price: complementsPrice,
            subtotal: subtotal,
            is_new: true,
            complements: complementsList
        };

        setData('items', [...data.items, newItem]);
        setNewItemId('');
        setSelectedComplements({});
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'quantity') {
            const unitPrice = Number(newItems[index].unit_price);
            const compPrice = Number(newItems[index].complements_price || 0);
            newItems[index].subtotal = (unitPrice + compPrice) * value;
        }

        setData('items', newItems);
    };

    const toggleComplement = (optionId: string, checked: boolean) => {
        setSelectedComplements(prev => {
            const next = { ...prev };
            if (checked) {
                next[optionId] = 1; // Default qty 1
            } else {
                delete next[optionId];
            }
            return next;
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;
        put(route('orders.update-items', order.id), {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const selectedProduct = products.find(p => p.id === newItemId);
    const totalDisplay = data.items.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-col md:flex-row md:items-center gap-1 md:gap-3">
                        <div className="hidden md:block p-2 bg-orange-100 rounded-xl">
                            <ShoppingBag className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Editar Pedido #{order?.order_number}</h2>
                            <p className="text-sm font-medium text-gray-500">
                                Total Estimado: <span className="text-orange-600 font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDisplay)}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Add Item Section */}
                    <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-[24px] border border-gray-100 dark:border-white/5 space-y-4">
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <InputLabel value="Adicionar Produto" className="mb-2 ml-1" />
                                <select
                                    className="w-full rounded-2xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-[#1a1b1e] p-2.5 text-sm"
                                    value={newItemId}
                                    onChange={e => { setNewItemId(e.target.value); setSelectedComplements({}); }}
                                >
                                    <option value="">Selecione um produto...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - R$ {Number(p.price).toFixed(2)}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                disabled={!newItemId}
                                className="px-5 py-2.5 h-[42px] flex items-center bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all active:scale-95"
                            >
                                Adicionar
                            </button>
                        </div>

                        {/* Complements Selection UI */}
                        {selectedProduct && selectedProduct.complement_groups?.length > 0 && (
                            <div className="mt-2 pl-2 border-t border-gray-200 dark:border-white/10 pt-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Adicionais / Opções</span>
                                <div className="space-y-3 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                                    {selectedProduct.complement_groups.map((group: any) => (
                                        <div key={group.id} className="bg-white dark:bg-[#1a1b1e] p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">{group.name}</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {group.options?.map((option: any) => (
                                                    <label key={option.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-1 rounded-lg transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded-md border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                                                            checked={!!selectedComplements[option.id]}
                                                            onChange={e => toggleComplement(option.id, e.target.checked)}
                                                        />
                                                        <span>{option.name} (+R$ {Number(option.price).toFixed(2)})</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 pl-1">
                        {data.items.length === 0 ? (
                            <div className="text-center text-gray-400 py-8 bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
                                Nenhum item no pedido.
                            </div>
                        ) : (
                            data.items.map((item, index) => (
                                <div key={index} className="group flex gap-4 items-start p-4 bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    {/* Qty */}
                                    <div className="w-16">
                                        <InputLabel value="Qtd" className="text-[10px] ml-1 mb-1" />
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full border-gray-200 rounded-xl shadow-sm text-sm p-2 text-center font-bold focus:border-orange-500 focus:ring-orange-500"
                                            value={item.quantity}
                                            onChange={e => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-gray-900 dark:text-white text-sm">{item.product_name}</div>
                                        {/* Show Complements */}
                                        {item.complements && item.complements.length > 0 && (
                                            <div className="text-[11px] text-gray-500 mt-1 leading-snug bg-gray-50 inline-block px-2 py-1 rounded-lg">
                                                {item.complements.map((c: any) => `+ ${c.quantity > 1 ? c.quantity + 'x ' : ''}${c.name}`).join(', ')}
                                            </div>
                                        )}

                                        <div className="text-xs font-bold text-orange-600 mt-1">
                                            R$ {Number(item.subtotal).toFixed(2)}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Observação do item..."
                                            className="w-full mt-2 border-none bg-gray-50 dark:bg-black/20 rounded-xl text-xs p-2 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-gray-400"
                                            value={item.notes}
                                            onChange={e => handleUpdateItem(index, 'notes', e.target.value)}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Remover item"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
                        <button
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-600/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
