import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'free' | 'occupied' | 'reserved';
    current_order_id?: string;
}

export default function TablesIndex({ tables }: { tables: Table[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, reset, delete: destroy } = useForm({
        number: '',
        capacity: '4',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tables.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta mesa?')) {
            destroy(route('tables.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mesas" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Gestão de Mesas</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#ff3d03] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#e63700]"
                >
                    <Plus className="h-4 w-4" /> Nova Mesa
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        className={`relative p-6 rounded-xl border-2 flex flex-col items-center justify-center min-h-[160px] transition-all bg-white dark:bg-gray-800 ${table.status === 'free'
                            ? 'border-green-500/50 hover:border-green-500'
                            : 'border-red-500/50 hover:border-red-500'
                            }`}
                    >
                        <button
                            onClick={() => {
                                if (confirm('Alterar status da mesa?')) {
                                    post(route('tables.toggle', table.id));
                                }
                            }}
                            className={`absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${table.status === 'free' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {table.status === 'free' ? 'LIVRE' : 'OCUPADA'}
                        </button>

                        <span className="text-4xl font-black text-gray-800 dark:text-white mb-2">
                            {table.number}
                        </span>

                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                            <Users className="h-4 w-4" />
                            <span>{table.capacity} lugares</span>
                        </div>

                        <button
                            onClick={() => handleDelete(table.id)}
                            className="absolute bottom-2 right-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {tables.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        Nenhuma mesa cadastrada. Adicione uma nova mesa para começar.
                    </div>
                )}
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cadastrar Nova Mesa</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel value="Número da Mesa" />
                            <TextInput
                                type="number"
                                className="w-full mt-1"
                                value={data.number}
                                onChange={e => setData('number', e.target.value)}
                                placeholder="Ex: 10"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Capacidade (Pessoas)" />
                            <TextInput
                                type="number"
                                className="w-full mt-1"
                                value={data.capacity}
                                onChange={e => setData('capacity', e.target.value)}
                                min="1"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Cancelar
                            </button>
                            <PrimaryButton disabled={processing}>Salvar</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
