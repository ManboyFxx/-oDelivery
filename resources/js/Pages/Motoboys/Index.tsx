import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Bike, Plus, Edit, Trash2 } from 'lucide-react';

interface Motoboy {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export default function MotoboyIndex({ motoboys }: { motoboys: Motoboy[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMotoboy, setEditingMotoboy] = useState<Motoboy | null>(null);

    const { data, setData, post, put, processing, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const openModal = (motoboy?: Motoboy) => {
        if (motoboy) {
            setEditingMotoboy(motoboy);
            setData({
                name: motoboy.name,
                email: motoboy.email,
                phone: motoboy.phone,
                password: '',
            });
        } else {
            setEditingMotoboy(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMotoboy(null);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMotoboy) {
            put(route('motoboys.update', editingMotoboy.id), {
                onSuccess: closeModal
            });
        } else {
            post(route('motoboys.store'), {
                onSuccess: closeModal
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Remover este entregador?')) {
            router.delete(route('motoboys.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Entregadores" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Entregadores</h2>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-[#ff3d03] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#e53703]"
                    >
                        <Plus className="h-4 w-4" /> Novo Entregador
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {motoboys.map((motoboy) => (
                        <div key={motoboy.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                        <Bike className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{motoboy.name}</h3>
                                        <p className="text-sm text-gray-500">{motoboy.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(motoboy)}
                                        className="text-gray-400 hover:text-blue-600"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(motoboy.id)}
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">{motoboy.email}</p>
                        </div>
                    ))}
                </div>

                {motoboys.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Nenhum entregador cadastrado ainda.
                    </div>
                )}
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4">
                        {editingMotoboy ? 'Editar Entregador' : 'Novo Entregador'}
                    </h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel value="Nome" />
                            <TextInput
                                className="w-full mt-1"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                        </div>
                        {!editingMotoboy && (
                            <div>
                                <InputLabel value="Email" />
                                <TextInput
                                    type="email"
                                    className="w-full mt-1"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div>
                            <InputLabel value="Telefone" />
                            <TextInput
                                className="w-full mt-1"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                required
                            />
                        </div>
                        {!editingMotoboy && (
                            <div>
                                <InputLabel value="Senha" />
                                <TextInput
                                    type="password"
                                    className="w-full mt-1"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" onClick={closeModal} className="text-gray-500 hover:text-gray-700">
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
