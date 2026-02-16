import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, LayoutGrid, Map as MapIcon, RotateCw, DollarSign, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TableGrid from '@/Components/TableGrid';
import TableMapEditor from '@/Components/TableMapEditor';
import ConfirmationModal from '@/Components/ConfirmationModal';
import TableTransferModal from '@/Components/TableTransferModal';
import InputError from '@/Components/InputError';

interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'free' | 'occupied' | 'reserved';
    occupied_at?: string;
    occupied_since?: string;
    current_order?: {
        total: number;
    };
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    shape: 'square' | 'round';
    rotation: number;
}

export default function TablesIndex({ tables }: { tables: Table[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
    const [transferModal, setTransferModal] = useState<{ show: boolean; table: { id: string; number: number } | null }>({ show: false, table: null });
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [now, setNow] = useState(new Date());

    // Update timer every minute for duration calculation
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Polling System
    useEffect(() => {
        const interval = setInterval(() => {
            if (viewMode === 'grid') {
                router.visit(window.location.pathname, {
                    only: ['tables'],
                    preserveScroll: true,
                    preserveState: true,
                    replace: true
                });
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [viewMode]);

    const { data, setData, post, put, delete: destroy, processing, reset, errors, clearErrors } = useForm({
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

    const handleEdit = (table: Table) => {
        setEditingTable(table);
        setData({
            number: table.number.toString(),
            capacity: table.capacity.toString(),
        });
        setIsModalOpen(true);
    };

    const handleDelete = (table: Table) => {
        setConfirmModal({ show: true, id: table.id });
    };

    const confirmDelete = () => {
        if (confirmModal.id) {
            destroy(route('tables.destroy', confirmModal.id), {
                onFinish: () => setConfirmModal({ show: false, id: null })
            });
        }
    };

    const handleTransfer = (table: Table) => {
        if (table.status === 'occupied') {
            setTransferModal({ show: true, table: { id: table.id, number: table.number } });
        }
    };

    const getOccupiedTime = (occupiedSince?: string) => {
        if (!occupiedSince) return 0;
        const start = new Date(occupiedSince).getTime();
        const current = now.getTime();
        return Math.floor((current - start) / (1000 * 60)); // Minutes
    };

    const getStatusColor = (table: Table) => {
        if (table.status === 'free') return 'bg-green-100 text-green-800 border-green-200';
        if (table.status === 'reserved') return 'bg-blue-100 text-blue-800 border-blue-200';

        const minutes = getOccupiedTime(table.occupied_since || table.occupied_at);
        if (minutes > 120) return 'bg-red-100 text-red-800 border-red-200 animate-pulse-slow'; // > 2 hours
        if (minutes > 60) return 'bg-orange-100 text-orange-800 border-orange-200'; // > 1 hour
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gestão de Mesas</h2>
                    <div className="flex items-center gap-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 flex border border-gray-200 dark:border-gray-700 mr-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                title="Visualização em Grid"
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                title="Visualização de Mapa"
                            >
                                <MapIcon size={20} />
                            </button>
                        </div>
                        <PrimaryButton onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                            <Plus size={16} /> Nova Mesa
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Mesas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Legend */}
                    <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div> Livre
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Ocupada
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div> {'>'} 1h
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div> {'>'} 2h
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {tables.map((table) => {
                                    const minutes = getOccupiedTime(table.occupied_since || table.occupied_at);

                                    return (
                                        <div
                                            key={table.id}
                                            className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-md ${getStatusColor(table)}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold">Mesa {table.number}</h3>
                                                <button
                                                    onClick={() => handleEdit(table)}
                                                    className="text-xs opacity-50 hover:opacity-100"
                                                >
                                                    Editar
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>{table.capacity} Lugares</span>
                                                </div>

                                                {table.status === 'occupied' && (
                                                    <div className="mt-3 pt-3 border-t border-black/5">
                                                        <div className="flex items-center gap-1 text-xs font-mono mb-1">
                                                            <Clock size={12} />
                                                            {formatDuration(minutes)}
                                                        </div>
                                                        <div className="flex items-center gap-1 font-bold text-lg">
                                                            <DollarSign size={16} />
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(table.current_order?.total || 0)}
                                                        </div>
                                                        <div className="mt-3 flex gap-2">
                                                            <button
                                                                onClick={() => handleTransfer(table)}
                                                                className="flex-1 bg-white/50 hover:bg-white/80 py-1 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <RotateCw size={12} /> Transferir
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {table.status === 'free' && (
                                                    <div className="mt-8 text-center opacity-50 text-xs">
                                                        Disponível
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <TableMapEditor tables={tables} />
                        )}
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {editingTable ? 'Editar Mesa' : 'Nova Mesa'}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="number" value="Número da Mesa" />
                        <TextInput
                            id="number"
                            type="number"
                            className="mt-1 block w-full"
                            value={data.number}
                            onChange={(e) => setData('number', e.target.value)}
                            required
                        />
                        <InputError message={errors.number} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="capacity" value="Capacidade" />
                        <TextInput
                            id="capacity"
                            type="number"
                            className="mt-1 block w-full"
                            value={data.capacity}
                            onChange={(e) => setData('capacity', e.target.value)}
                            required
                        />
                        <InputError message={errors.capacity} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        {editingTable && (
                            <button
                                type="button"
                                onClick={() => handleDelete(editingTable)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Excluir
                            </button>
                        )}
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Salvar</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                show={confirmModal.show}
                onClose={() => setConfirmModal({ show: false, id: null })}
                onConfirm={confirmDelete}
                title="Excluir Mesa"
                message="Tem certeza que deseja excluir esta mesa? Esta ação não pode ser desfeita."
            />

            <TableTransferModal
                show={transferModal.show}
                onClose={() => setTransferModal({ show: false, table: null })}
                sourceTable={transferModal.table}
                tables={tables}
            />
        </AuthenticatedLayout>
    );
}
