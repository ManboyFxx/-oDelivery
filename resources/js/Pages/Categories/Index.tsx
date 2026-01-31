import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react'; // Added useForm
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from 'lucide-react';

import { useState } from 'react';
import Modal from '@/Components/Modal'; // Assuming we have a Modal component
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

interface Category {
    id: string;
    name: string;
    description: string;
    image_url?: string;
}

export default function CategoryIndex({ categories }: { categories: Category[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, reset, delete: destroy } = useForm({
        id: '',
        name: '',
        description: '',
        image_url: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            // For simplicity in this demo, create logic handled as POST store only for now or use separate update route
            // If we had a PUT route setup for generic update we would use it.
            // But my controller for update expects a Category model binding.
            // Inertia put helper:
            // form.put(route('categories.update', editingId))
            // Let's implement full editing logic? 
            // To keep it fast, I will just implement CREATE for now to solve the user's immediate request "Cade a aba de criar".
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Categorias" />
            <div className="flex h-full flex-col space-y-6">
                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <Link href={route('products.index')} className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Produtos
                        </Link>
                        <Link href={route('categories.index')} className="border-[#ff3d03] text-[#ff3d03] whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" aria-current="page">
                            Categorias
                        </Link>
                        <Link href={route('complements.index')} className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Complementos
                        </Link>
                    </nav>
                </div>

                <div className="flex justify-between">
                    <h2 className="text-xl font-bold dark:text-white">Gerenciar Categorias</h2>
                    <button onClick={() => setIsModalOpen(true)} className="bg-[#ff3d03] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Nova Categoria
                    </button>
                </div>

                {/* List */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {categories.map((cat) => (
                            <li key={cat.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                                    <p className="text-sm text-gray-500">{cat.description}</p>
                                </div>
                                <button onClick={() => {
                                    if (confirm('Excluir?')) destroy(route('categories.destroy', cat.id));
                                }} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                        {categories.length === 0 && <li className="p-6 text-center text-gray-500">Nenhuma categoria.</li>}
                    </ul>
                </div>

                <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Nova Categoria</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <InputLabel value="Nome" />
                                <TextInput className="w-full mt-1" value={data.name} onChange={e => setData('name', e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel value="Descrição" />
                                <TextInput className="w-full mt-1" value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">Cancelar</button>
                                <PrimaryButton disabled={processing}>Salvar</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
