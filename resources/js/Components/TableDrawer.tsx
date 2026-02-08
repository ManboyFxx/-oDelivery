import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { X, User, DollarSign, Clock, Receipt } from 'lucide-react';

interface Table {
    id: string;
    number: number;
    status: 'free' | 'occupied' | 'reserved';
    current_order?: {
        id: string;
        customer_name?: string;
        total: number;
        items: Array<{
            id: string;
            product: { name: string };
            quantity: number;
            total: number;
        }>;
    };
}

interface TableDrawerProps {
    table: Table | null;
    open: boolean;
    onClose: () => void;
    onCloseAccount: (tableId: string) => void;
}

export default function TableDrawer({ table, open, onClose, onCloseAccount }: TableDrawerProps) {
    if (!table) return null;

    const isOccupied = table.status === 'occupied';

    return (
        <Modal show={open} onClose={onClose} maxWidth="md">
            <div className="flex flex-col h-full max-h-[90vh]">
                {/* Header */}
                <div className={`p-6 border-b flex justify-between items-center ${isOccupied ? 'bg-red-50 dark:bg-red-900/10' : 'bg-green-50 dark:bg-green-900/10'
                    }`}>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                            Mesa {table.number}
                        </h2>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${isOccupied ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                            }`}>
                            {isOccupied ? 'Ocupada' : 'Livre'}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
                        <X className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isOccupied && table.current_order ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <User className="h-4 w-4" />
                                <span className="font-medium">
                                    {table.current_order.customer_name || 'Cliente Geral'}
                                </span>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-2">Qtd</th>
                                            <th className="px-4 py-2">Item</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {table.current_order.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 font-medium">{item.quantity}x</td>
                                                <td className="px-4 py-2">{item.product.name}</td>
                                                <td className="px-4 py-2 text-right">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                                        <tr>
                                            <td colSpan={2} className="px-4 py-3 text-right">Total:</td>
                                            <td className="px-4 py-3 text-right text-green-600">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(table.current_order.total)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <SecondaryButton className="w-full justify-center gap-2" onClick={() => { }}>
                                    <Receipt className="h-4 w-4" /> Imprimir Parcial
                                </SecondaryButton>
                                <PrimaryButton
                                    className="w-full justify-center gap-2 bg-green-600 hover:bg-green-700"
                                    onClick={() => onCloseAccount(table.id)}
                                >
                                    <DollarSign className="h-4 w-4" /> Fechar Conta
                                </PrimaryButton>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <Receipt className="h-12 w-12 mb-2 opacity-20" />
                            <p>Mesa livre. Nenhum pedido aberto.</p>
                            <PrimaryButton className="mt-4 bg-[#ff3d03]" onClick={onClose}>
                                Abrir Novo Pedido
                            </PrimaryButton>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
