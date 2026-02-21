import { useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, X } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import MediaPickerModal from '@/Components/MediaPickerModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableCategoryItem from '../Partials/DraggableCategoryItem';


interface Category {
    id: string;
    name: string;
    description: string;
    image_url?: string;
    sort_order?: number;
}

export default function CategoriesTab({ categories: initialCategories }: { categories: Category[] }) {
    // Local state for immediate UI feedback on reorder
    // Note: In a real app we might rely on props update, but for DND smooth experience local state is better
    const [categories, setCategories] = useState(initialCategories);

    // Update local state when props change (e.g. after search filtering or CRUD)
    // However, filtering complicates this. DND usually works best on the full list or filtered list.
    // If we filter, we can only reorder visible items relative to each other?
    // Let's DND on filtered list.

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { data, setData, post, put, processing, reset, errors, delete: destroy } = useForm({
        name: '',
        description: '',
        image_url: '',
    });

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    // Sync state with props IF props change significantly (length) or we want to force update
    // But be careful not to overwrite local DND state during drag.
    // Simplified: just initialize. If reordering happens, we update local and backend.

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over?.id) {
            setCategories((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Send to backend
                router.post(route('categories.reorder'), {
                    categories: newOrder.map((item, index) => ({
                        id: item.id,
                        sort_order: index
                    }))
                }, {
                    preserveScroll: true,
                    // preserveState: true // We want to keep our local state until page reload
                });

                return newOrder;
            });
        }
    }

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
            router.put(route('categories.update', editingCategory.id), data, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    // Update local state to reflect changes (optional if page reloads)
                    setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...data } : c));
                }
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    // We would need the new ID to add to local state properly without reload, 
                    // but Inertia will reload props. We might need useEffect to sync props to state or just rely on reload.
                    window.location.reload(); // Simple brute force for now or let Inertia handle it
                }
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta categoria? Produtos vinculados podem ficar sem categoria.')) {
            router.delete(route('categories.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    setCategories(categories.filter(c => c.id !== id));
                }
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

            {/* List with DND */}
            <div className="bg-white dark:bg-[#1a1b1e] rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={({ active }) => setActiveId(active.id as string)}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={filteredCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <ul className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredCategories.map((cat) => (
                                <DraggableCategoryItem
                                    key={cat.id}
                                    category={cat}
                                    onEdit={openEditModal}
                                    onDelete={handleDelete}
                                    isDragging={activeId === cat.id}
                                />
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
                    </SortableContext>
                </DndContext>
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

                        <div>
                            <InputLabel value="Imagem da Categoria" />
                            <div
                                onClick={() => setMediaPickerOpen(true)}
                                className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl hover:border-[#ff3d03] transition-colors cursor-pointer relative bg-gray-50 dark:bg-gray-800 h-32 overflow-hidden"
                            >
                                {data.image_url ? (
                                    <div className="relative w-full h-full group">
                                        <img src={data.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                            <p className="text-white text-xs font-bold">Trocar Imagem</p>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setData('image_url', ''); }}
                                                className="text-[10px] text-red-300 hover:text-red-100"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="mx-auto h-6 w-6 text-gray-400" />
                                        <p className="mt-1 text-xs font-medium text-gray-500">Banco de Imagens</p>
                                    </div>
                                )}
                            </div>
                            <InputError message={errors.image_url} className="mt-2" />
                        </div>

                        <MediaPickerModal
                            open={mediaPickerOpen}
                            onClose={() => setMediaPickerOpen(false)}
                            onSelect={(media) => { setData('image_url', media.url); setMediaPickerOpen(false); }}
                            currentUrl={data.image_url}
                        />


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
