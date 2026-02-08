import { Link, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, X, Upload, Check, Zap, Lock } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useToast } from '@/Hooks/useToast';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Switch } from '@headlessui/react';
import QuickEditField from '@/Components/QuickEditField';
import UpgradeModal from '@/Components/UpgradeModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import DraggableProductCard from '../Partials/DraggableProductCard';
import BulkActionsBar from '../Partials/BulkActionsBar';

// ... (interfaces remain same)
interface Category {
    id: string;
    name: string;
}

interface ComplementGroup {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    stock_quantity?: number;
    is_available: boolean;
    track_stock: boolean;
    category_id?: string;
    category?: Category;
    complement_groups?: ComplementGroup[];
    complementGroups?: ComplementGroup[];
    sort_order?: number;
}

interface Props {
    products: {
        data: Product[];
        links: any[];
    };
    categories: Category[];
    complement_groups: ComplementGroup[];
    usage: {
        products: number;
        limit: number | null;
        canAdd: boolean;
    };
}

export default function ProductsTab({ products: initialProducts, categories, complement_groups, usage }: Props) {
    const [products, setProducts] = useState(initialProducts.data);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { success, error: showError, info } = useToast();

    // DND & Bulk Actions State
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        price: '',
        category_id: '',
        is_available: true,
        image: null as File | null,
        complement_groups: [] as string[],
        track_stock: false,
        stock_quantity: '' as string | number,
        loyalty_redeemable: false,
        loyalty_points_cost: 0
    });

    // Filter products locally for instant search (if pagination allows, otherwise server search is better but this matches previous behavior)
    // Note: The products prop is paginated, so this filter only affects the current page.
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over?.id) {
            setProducts((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Send new order to backend
                router.post(route('products.reorder'), {
                    products: newOrder.map((item, index) => ({
                        id: item.id,
                        sort_order: index
                    }))
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        // Silent success or maybe a small toast
                    }
                });

                return newOrder;
            });
        }
    }

    const handleSelectProduct = useCallback((productId: string, checked: boolean) => {
        if (checked) {
            setSelectedProducts(prev => [...prev, productId]);
        } else {
            setSelectedProducts(prev => prev.filter(id => id !== productId));
        }
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedProducts([]);
    }, []);

    const handleBulkActivate = () => {
        // ... (bulk actions implementation remains same, can be memoized if passed to child)
        if (bulkLoading) return;
        setBulkLoading(true);
        router.post(route('products.bulk-update'), {
            ids: selectedProducts,
            action: 'activate'
        }, {
            onSuccess: () => {
                success('Sucesso', `${selectedProducts.length} produtos ativados.`);
                setSelectedProducts([]);
                setProducts(products.map(p =>
                    selectedProducts.includes(p.id) ? { ...p, is_available: true } : p
                ));
            },
            onFinish: () => setBulkLoading(false)
        });
    };

    const handleBulkDeactivate = () => {
        if (bulkLoading) return;
        setBulkLoading(true);
        router.post(route('products.bulk-update'), {
            ids: selectedProducts,
            action: 'deactivate'
        }, {
            onSuccess: () => {
                success('Sucesso', `${selectedProducts.length} produtos pausados.`);
                setSelectedProducts([]);
                setProducts(products.map(p =>
                    selectedProducts.includes(p.id) ? { ...p, is_available: false } : p
                ));
            },
            onFinish: () => setBulkLoading(false)
        });
    };

    const handleBulkDelete = () => {
        if (bulkLoading || !confirm(`Tem certeza que deseja excluir ${selectedProducts.length} produtos?`)) return;
        setBulkLoading(true);
        router.delete(route('products.bulk-delete'), {
            data: { ids: selectedProducts },
            onSuccess: () => {
                success('Sucesso', `${selectedProducts.length} produtos excluídos.`);
                setProducts(products.filter(p => !selectedProducts.includes(p.id)));
                setSelectedProducts([]);
            },
            onFinish: () => setBulkLoading(false)
        });
    };

    // Duplicate not supported in bulk yet by backend method but we can iterate or add support later.
    // For now, let's just support single duplicate in valid actions or implement basic bulk logic if backend supports it.
    // Wait, I implemented bulkUpdate, bulkChangeCategory. duplicate is single.
    // Let's implement bulk duplicate in frontend by iterating? No, better add backend support if needed.
    // For now I will OMIT duplicate from bulk actions bar or implement it as "Activate/Deactivate/Delete/Move"

    // Actually loop for duplicate?
    const handleBulkDuplicate = () => {
        // Implementation pending backend support for bulk duplicate or loop
        alert('Duplicação em massa em breve!');
    };

    const handleBulkChangeCategory = () => {
        const categoryId = prompt('Digite o ID da nova categoria (temporário, ideal seria um modal):');
        if (!categoryId || bulkLoading) return;

        setBulkLoading(true);
        router.post(route('products.bulk-change-category'), {
            ids: selectedProducts,
            category_id: categoryId
        }, {
            onSuccess: () => {
                success('Sucesso', 'Categorias atualizadas.');
                setSelectedProducts([]);
                // Reload to get fresh data is easier for category names
                router.reload();
            },
            onFinish: () => setBulkLoading(false)
        });
    };

    const openCreateModal = useCallback(() => {
        // Check if can add product
        if (!usage.canAdd) {
            setShowUpgradeModal(true);
            return;
        }

        setEditingProduct(null);
        setImagePreview(null);
        reset();
        setData({
            name: '',
            description: '',
            price: '',
            category_id: '',
            is_available: true,
            image: null,
            complement_groups: [],
            track_stock: false,
            stock_quantity: '',
            loyalty_redeemable: false,
            loyalty_points_cost: 0
        });
        setShowModal(true);
    }, [usage.canAdd]); // usage.canAdd dependency

    const openEditModal = useCallback((product: Product) => {
        setEditingProduct(product);
        setImagePreview(product.image_url || null);
        setData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            category_id: product.category_id || '',
            is_available: product.is_available,
            image: null,
            complement_groups: product.complement_groups?.map(g => g.id) || [],
            track_stock: product.track_stock,
            stock_quantity: product.stock_quantity || '',
            loyalty_redeemable: (product as any).loyalty_redeemable || false,
            loyalty_points_cost: (product as any).loyalty_points_cost || 0
        });
        setShowModal(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            router.post(route('products.update', editingProduct.id), {
                _method: 'put',
                ...data,
            }, {
                onSuccess: () => {
                    success('Produto Atualizado', 'Produto atualizado com sucesso.');
                    setShowModal(false);
                },
                onError: () => showError('Erro', 'Erro ao atualizar produto.')
            });
        } else {
            post(route('products.store'), {
                onSuccess: () => {
                    success('Produto Criado', 'Produto cadastrado com sucesso.');
                    setShowModal(false);
                },
                onError: () => showError('Erro', 'Erro ao criar produto.')
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDelete = useCallback((id: string) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            router.delete(route('products.destroy', id), {
                onSuccess: () => success('Produto Excluído', 'Produto removido com sucesso.')
            });
        }
    }, []);

    const handleToggleAvailability = useCallback((product: Product) => {
        router.post(route('products.toggle', product.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                success('Produto Atualizado', `O produto "${product.name}" foi ${!product.is_available ? 'ativado' : 'pausado'}.`);
            }
        });
    }, []);

    const handlePriceUpdate = useCallback((id: string, newPrice: number) => {
        router.patch(route('products.quick-update', id), { price: newPrice }, {
            preserveScroll: true
        });
    }, []);

    const toggleComplementGroup = (id: string) => {
        const groups = data.complement_groups.includes(id)
            ? data.complement_groups.filter(g => g !== id)
            : [...data.complement_groups, id];
        setData('complement_groups', groups);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white hidden md:block">
                        Gerenciar Itens
                    </h3>
                    {/* Limit Badge */}
                    {usage.limit !== null ? (
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${usage.products >= usage.limit
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : usage.products >= usage.limit * 0.8
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400'
                            }`}>
                            {usage.products}/{usage.limit} produtos
                        </span>
                    ) : (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#ff3d03] to-[#e63700] text-white">
                            <Zap className="h-3 w-3 inline mr-1" />
                            Ilimitado
                        </span>
                    )}
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar itens..."
                            className="w-full h-11 rounded-2xl border border-gray-200 bg-white pl-11 shadow-sm focus:border-[#ff3d03] focus:ring-[#ff3d03]/20 dark:border-white/5 dark:bg-[#0f1012] transition-all"
                        />
                    </div>

                    <button
                        onClick={openCreateModal}
                        disabled={!usage.canAdd}
                        className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all whitespace-nowrap ${usage.canAdd
                            ? 'bg-[#ff3d03] shadow-[#ff3d03]/20 hover:bg-[#e63700] hover:scale-105 active:scale-95'
                            : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-60'
                            }`}
                        title={!usage.canAdd ? `Limite de ${usage.limit} produtos atingido` : ''}
                    >
                        {usage.canAdd ? <Plus className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                        Novo Produto
                    </button>
                </div>
            </div>

            {/* Product GRID View with DND */}
            {filteredProducts.length > 0 ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={({ active }) => setActiveId(active.id as string)}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={filteredProducts.map(p => p.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredProducts.map((product) => (
                                <DraggableProductCard
                                    key={product.id}
                                    product={product}
                                    selected={selectedProducts.includes(product.id)}
                                    onSelect={handleSelectProduct}
                                    onEdit={openEditModal}
                                    onDelete={handleDelete}
                                    onToggleAvailability={handleToggleAvailability}
                                    onPriceUpdate={handlePriceUpdate}
                                    isDragging={activeId === product.id}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0f1012] rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800">
                    <div className="h-16 w-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nenhum produto encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tente buscar por outro termo ou crie um novo item.</p>
                    <div className="mt-6">
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#ff3d03] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63700] hover:scale-105 transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Cadastrar Produto
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedProducts.length}
                loading={bulkLoading}
                actions={{
                    onActivate: handleBulkActivate,
                    onDeactivate: handleBulkDeactivate,
                    onChangeCategory: handleBulkChangeCategory,
                    onDuplicate: handleBulkDuplicate,
                    onDelete: handleBulkDelete,
                    onClearSelection: handleClearSelection
                }}
            />

            {/* Create/Edit Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                        </h2>
                        <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Image Upload */}
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-4 hover:border-[#ff3d03] transition-colors cursor-pointer relative bg-gray-50 dark:bg-gray-800 h-48">
                                <input
                                    type="file"
                                    id="image"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                />
                                {imagePreview ? (
                                    <div className="relative w-full h-full">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                                            <p className="text-white text-sm font-medium">Trocar Imagem</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4">
                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">Clique para adicionar imagem</p>
                                    </div>
                                )}
                            </div>
                            <InputError message={errors.image} className="mt-2" />

                            {/* Name */}
                            <div>
                                <InputLabel htmlFor="name" value="Nome do Produto *" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Ex: X-Tudo"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Price */}
                            <div>
                                <InputLabel htmlFor="price" value="Preço (R$) *" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="0.00"
                                    required
                                />
                                <InputError message={errors.price} className="mt-2" />
                            </div>

                            {/* Category */}
                            <div>
                                <InputLabel htmlFor="category_id" value="Categoria" />
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-[#ff3d03] focus:ring-[#ff3d03] rounded-xl shadow-sm h-11"
                                >
                                    <option value="">Selecione uma categoria...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.category_id} className="mt-2" />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Description */}
                            <div>
                                <InputLabel htmlFor="description" value="Descrição" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-[#ff3d03] focus:ring-[#ff3d03] rounded-xl shadow-sm h-24 resize-none p-3"
                                    placeholder="Detalhes do produto..."
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Availability & Stock Tracking */}
                            <div className="flex gap-4">
                                <div className="flex-1 flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <Checkbox
                                        id="is_available"
                                        checked={data.is_available}
                                        onChange={(e) => setData('is_available', e.target.checked)}
                                    />
                                    <label htmlFor="is_available" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                        Disponível
                                    </label>
                                </div>
                                <div className="flex-1 flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <Checkbox
                                        id="track_stock"
                                        checked={data.track_stock}
                                        onChange={(e) => setData('track_stock', e.target.checked)}
                                    />
                                    <label htmlFor="track_stock" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                        Estoque
                                    </label>
                                </div>
                            </div>

                            {/* Stock Quantity - Only if tracking enabled */}
                            {data.track_stock && (
                                <div className="animate-in fade-in slide-in-from-top-1">
                                    <InputLabel htmlFor="stock_quantity" value="Quantidade em Estoque" />
                                    <TextInput
                                        id="stock_quantity"
                                        type="number"
                                        value={data.stock_quantity ?? ''}
                                        onChange={(e) => setData('stock_quantity', e.target.value)}
                                        className="mt-1 block w-full bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500 font-bold text-orange-600"
                                        placeholder="0"
                                    />
                                    <InputError message={errors.stock_quantity} className="mt-2" />
                                </div>
                            )}

                            {/* Complement Groups */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <InputLabel value="Grupos de Complementos" className="mb-2" />
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-2 space-y-1 custom-scrollbar">
                                    {complement_groups.length > 0 ? (
                                        complement_groups.map((group) => (
                                            <div
                                                key={group.id}
                                                onClick={() => toggleComplementGroup(group.id)}
                                                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${data.complement_groups.includes(group.id)
                                                    ? 'bg-orange-100 border border-[#ff3d03]/30 dark:bg-orange-900/40'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <Checkbox
                                                    checked={data.complement_groups.includes(group.id)}
                                                    onChange={() => { }}
                                                    className="pointer-events-none mr-3 text-[#ff3d03]"
                                                />
                                                <span className={`text-sm ${data.complement_groups.includes(group.id) ? 'font-bold text-[#ff3d03]' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {group.name}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500 text-center py-4">Nenhum grupo cadastrado.</p>
                                    )}
                                </div>
                                <InputError message={errors.complement_groups} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Loyalty Redemption Section */}
                    <div className="mt-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/10 rounded-2xl p-4 border-2 border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">🎁</span>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Programa de Fidelidade</h3>
                        </div>

                        {/* Toggle Redeemable */}
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl mb-3">
                            <div>
                                <label htmlFor="loyalty_redeemable" className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Permite resgate por pontos
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Cliente pode trocar pontos por este produto
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setData('loyalty_redeemable', !data.loyalty_redeemable)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 ${data.loyalty_redeemable ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.loyalty_redeemable ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Points Cost Input */}
                        {data.loyalty_redeemable && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 animate-in fade-in slide-in-from-top-1">
                                <label htmlFor="loyalty_points_cost" className="block text-xs font-medium text-gray-900 dark:text-white mb-1.5">
                                    Pontos necessários para resgate
                                </label>
                                <div className="relative">
                                    <input
                                        id="loyalty_points_cost"
                                        type="number"
                                        min="1"
                                        value={data.loyalty_points_cost}
                                        onChange={(e) => setData('loyalty_points_cost', parseInt(e.target.value) || 0)}
                                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 pl-3 pr-12 text-sm shadow-sm focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                        placeholder="Ex: 150"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">pts</span>
                                    </div>
                                </div>
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    💡 Dica: Produtos de R$ 30 geralmente custam 100-150 pontos
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                        <SecondaryButton onClick={() => setShowModal(false)} disabled={processing} className="rounded-xl py-3">
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#ff3d03] hover:bg-[#e63700] border-transparent rounded-xl py-3 px-6 shadow-lg shadow-[#ff3d03]/20">
                            {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                resource="produtos"
                currentLimit={usage.limit || 0}
            />
        </div>
    );
}
