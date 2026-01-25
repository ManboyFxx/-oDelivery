import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2, Users, Pencil, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmationModal from '@/Components/ConfirmationModal';

interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'free' | 'occupied' | 'reserved';
    current_order_id?: string;
}

export default function TablesIndex({ tables }: { tables: Table[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        id: string | null;
    }>({ show: false, id: null });

    const { data, setData, post, put, processing, reset, delete: destroy, errors, clearErrors } = useForm({
        number: '',
        capacity: '4',
    });

    useEffect(() => {
        if (!isModalOpen) {
            reset();
            clearErrors();
            setEditingTable(null);
        }
    }, [isModalOpen]);

    const openCreateModal = () => {
        setEditingTable(null);
        setData({ number: '', capacity: '4' });
        setIsModalOpen(true);
    };

    const openEditModal = (table: Table) => {
        setEditingTable(table);
        setData({
            number: table.number.toString(),
            capacity: table.capacity.toString(),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTable) {
            put(route('tables.update', editingTable.id), {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            post(route('tables.store'), {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const confirmDelete = (id: string) => {
        setConfirmModal({ show: true, id });
    };

    const handleDelete = () => {
        if (confirmModal.id) {
            destroy(route('tables.destroy', confirmModal.id), {
                onFinish: () => setConfirmModal({ show: false, id: null })
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mesas" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Gestão de Mesas</h1>
                    <p className="text-sm text-gray-500">Organize o layout do seu estabelecimento</p>
                </div>
                <PrimaryButton
                    onClick={openCreateModal}
                    className="bg-[#ff3d03] hover:bg-[#e63700] gap-2"
                >
                    <Plus className="h-4 w-4" /> Nova Mesa
                </PrimaryButton>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        className={`group relative p-6 rounded-xl border-2 flex flex-col items-center justify-center min-h-[160px] transition-all bg-white dark:bg-gray-800 ${table.status === 'free'
                            ? 'border-green-500/50 hover:border-green-500'
                            : 'border-red-500/50 hover:border-red-500'
                            }`}
                    >
                        {/* Status Toggle Button */}
                        <button
                            onClick={() => {
                                // For status toggle we can keep native confirm or implement another modal if critical, 
                                // but native is fast for this frequent action. Or maybe no confirm needed for free<->occupied?
                                // Let's keep native for speed but make the logic sound.
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

                        {/* Action Buttons (Edit/Delete) - Visible on Hover */}
                        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm p-1">
                            <button
                                onClick={() => openEditModal(table)}
                                className="p-1.5 text-gray-400 hover:text-[#ff3d03] rounded-md transition-colors"
                                title="Editar"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => confirmDelete(table.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {tables.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        Nenhuma mesa cadastrada. Adicione uma nova mesa para começar.
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {editingTable ? 'Editar Mesa' : 'Cadastrar Nova Mesa'}
                    </h2>
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
                            {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
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
                            {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <SecondaryButton
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton disabled={processing} className="bg-[#ff3d03] hover:bg-[#e63700]">
                                {editingTable ? 'Salvar Alterações' : 'Cadastrar'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={confirmModal.show}
                onClose={() => setConfirmModal({ show: false, id: null })}
                onConfirm={handleDelete}
                title="Excluir Mesa"
                message="Tem certeza que deseja excluir esta mesa? Esta ação não pode ser desfeita."
                confirmLabel="Sim, Excluir"
            />
        </AuthenticatedLayout>
    );
}
