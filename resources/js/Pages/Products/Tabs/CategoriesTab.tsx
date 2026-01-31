import { useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, X } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';

interface Category {
    id: string;
    name: string;
    description: string;
    image_url?: string;
}

export default function CategoriesTab({ categories }: { categories: Category[] }) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, setData, post, put, processing, reset, errors, delete: destroy } = useForm({
        name: '',
        description: '',
        image_url: '',
    });

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
            image_url: category.image_url || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            // Using router.put instead of form.put to allow existing resource controller
            // Actually, we can use the form helper if we re-initialize it correctly or just use router manually
            router.put(route('categories.update', editingCategory.id), data, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta categoria? Produtos vinculados podem ficar sem categoria.')) {
            router.delete(route('categories.destroy', id), {
                preserveScroll: true
            });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white hidden md:block">
                    Gerenciar Categorias
                </h3>

                <div className="flex gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar categorias..."
                            className="w-full h-11 rounded-2xl border border-gray-200 bg-white pl-11 shadow-sm focus:border-[#ff3d03] focus:ring-[#ff3d03]/20 dark:border-white/5 dark:bg-[#0f1012] transition-all"
                        />
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-2xl bg-[#ff3d03] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63700] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <Plus className="h-5 w-5" />
                        Nova Categoria
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-[#1a1b1e] rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredCategories.map((cat) => (
                        <li key={cat.id} className="p-4 group hover:bg-orange-50/50 dark:hover:bg-white/5 transition-colors flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-white/10 flex items-center justify-center text-[#ff3d03] font-bold text-lg group-hover:scale-110 transition-transform">
                                    {cat.name.substring(0, 1)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{cat.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{cat.description || 'Sem descrição'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditModal(cat)}
                                    className="p-2 text-gray-400 hover:text-[#ff3d03] hover:bg-orange-50 dark:hover:bg-white/10 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/10 rounded-lg transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                    {filteredCategories.length === 0 && (
                        <li className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                            <div className="h-16 w-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nenhuma categoria encontrada</h3>
                        </li>
                    )}
                </ul>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">
                            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                        </h2>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel value="Nome *" />
                            <TextInput
                                className="w-full mt-1"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                                placeholder="Ex: Bebidas"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel value="Descrição" />
                            <TextInput
                                className="w-full mt-1"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Breve descrição da categoria"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100 dark:border-white/5">
                            <SecondaryButton onClick={() => setIsModalOpen(false)} className="py-3 rounded-xl">Cancelar</SecondaryButton>
                            <PrimaryButton disabled={processing} className="bg-[#ff3d03] hover:bg-[#e63700] py-3 rounded-xl shadow-lg shadow-[#ff3d03]/20 border-transparent">
                                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
