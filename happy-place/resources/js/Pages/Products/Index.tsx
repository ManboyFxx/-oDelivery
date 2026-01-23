import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useState, useEffect, FormEventHandler } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Dropdown from '@/Components/Dropdown';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Switch } from '@headlessui/react';
import axios from 'axios';

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
    is_available: boolean;
    category_id?: string;
    category?: Category;
    complement_groups?: ComplementGroup[]; // JSON serialization often uses snake_case
    complementGroups?: ComplementGroup[]; // Eloquent relation name
}

interface Props {
    products: {
        data: Product[];
        links: any[];
    };
    categories: Category[];
    complement_groups: ComplementGroup[];
}

export default function ProductIndex({ products, categories, complement_groups }: Props) {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        name: string;
        price: string; // Handle as string input
        description: string;
        category_id: string;
        is_available: boolean;
        image: File | null;
        complement_groups: string[];
        _method?: string;
    }>({
        name: '',
        price: '',
        description: '',
        category_id: '',
        is_available: true,
        image: null,
        complement_groups: [],
    });

    // Reset when modal opens/closes or edit changes
    useEffect(() => {
        if (!showModal) {
            reset();
            setImagePreview(null);
            clearErrors();
        }
    }, [showModal]);

    const openCreateModal = () => {
        setEditingProduct(null);
        setData({
            name: '',
            price: '',
            description: '',
            category_id: '',
            is_available: true,
            image: null,
            complement_groups: [],
        });
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setImagePreview(product.image_url || null);

        // Extract complement group IDs
        // Handle both camelCase (Eloquent relation) and snake_case (JSON serialization)
        const groups = product.complementGroups || (product as any).complement_groups || [];
        const existingGroupIds = groups.map((g: ComplementGroup) => g.id);

        setData({
            name: product.name,
            price: product.price.toString(),
            description: product.description || '',
            category_id: product.category_id || '',
            is_available: product.is_available,
            image: null,
            complement_groups: existingGroupIds,
            _method: 'put' // Important for file upload in edit
        });
        setShowModal(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingProduct) {
            post(route('products.update', editingProduct.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('products.store'), {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            router.delete(route('products.destroy', id));
        }
    };

    const handleToggleAvailability = async (product: Product) => {
        try {
            await axios.post(route('products.toggle', product.id));
            router.reload({ only: ['products'] });
        } catch (error) {
            console.error('Failed to toggle product availability', error);
        }
    };

    const toggleComplementGroup = (groupId: string) => {
        const current = data.complement_groups;
        if (current.includes(groupId)) {
            setData('complement_groups', current.filter(id => id !== groupId));
        } else {
            setData('complement_groups', [...current, groupId]);
        }
    };

    // Filter products locally (optional, but pagination handles main filter)
    const filteredProducts = products.data.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="Produtos" />

            <div className="flex h-full flex-col space-y-6">
                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <span className="border-[#ff3d03] text-[#ff3d03] whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Produtos
                        </span>
                        <Link href={route('categories.index')} className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Categorias
                        </Link>
                        <Link href={route('complements.index')} className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Complementos
                        </Link>
                    </nav>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Produtos
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Gerencie o cardápio da sua loja.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-lg bg-[#ff3d03] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e63700] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff3d03]"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Produto
                    </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar produtos..."
                            className="w-full rounded-md border border-gray-200 bg-gray-50 pl-9 dark:border-gray-700 dark:bg-gray-900 focus:border-[#ff3d03] focus:ring-[#ff3d03] dark:focus:border-[#ff3d03]"
                        />
                    </div>
                </div>

                {/* Product GRID View */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                                {/* Image Area */}
                                <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                    {product.image_url ? (
                                        <img
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            src={product.image_url}
                                            alt={product.name}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <ImageIcon className="h-10 w-10 text-gray-300" />
                                        </div>
                                    )}
                                    {/* Action Overlay (Edit/Delete) - Top Right */}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 p-1.5 rounded-full hover:text-[#ff3d03] shadow-sm backdrop-blur-sm"
                                            title="Editar"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 p-1.5 rounded-full hover:text-red-600 shadow-sm backdrop-blur-sm"
                                            title="Excluir"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Availability Toggle - Top Left (Always Visible or Hover?) Let's make it always visible for quick access */}
                                    <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                                        <Switch
                                            checked={product.is_available}
                                            onChange={() => handleToggleAvailability(product)}
                                            className={`${product.is_available ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'
                                                } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ff3d03] shadow-sm`}
                                        >
                                            <span
                                                className={`${product.is_available ? 'translate-x-5' : 'translate-x-1'
                                                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                            />
                                        </Switch>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 flex flex-col flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-medium text-[#ff3d03]">
                                                {product.category?.name || 'Sem Categoria'}
                                            </p>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1" title={product.name}>
                                                {product.name}
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                                        {product.description || 'Sem descrição'}
                                    </p>

                                    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                        </span>
                                        {!product.is_available && (
                                            <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                Indisponível
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Nenhum produto</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comece criando um novo produto.</p>
                        <div className="mt-6">
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center rounded-md bg-[#ff3d03] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e63700] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff3d03]"
                            >
                                <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                Novo Produto
                            </button>
                        </div>
                    </div>
                )}

                {/* Pagination (if exists) */}
            </div>

            {/* Create/Edit Modal - Same as before */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
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
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#ff3d03] transition-colors cursor-pointer relative bg-gray-50 dark:bg-gray-800">
                                <input
                                    type="file"
                                    id="image"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                />
                                {imagePreview ? (
                                    <div className="relative w-full aspect-square">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
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
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-[#ff3d03] focus:ring-[#ff3d03] rounded-md shadow-sm"
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
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-[#ff3d03] focus:ring-[#ff3d03] rounded-md shadow-sm h-24 resize-none"
                                    placeholder="Detalhes do produto..."
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Availability */}
                            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                <Checkbox
                                    id="is_available"
                                    checked={data.is_available}
                                    onChange={(e) => setData('is_available', e.target.checked)}
                                />
                                <label htmlFor="is_available" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                    Produto Disponível
                                </label>
                            </div>

                            {/* Complement Groups */}
                            <div>
                                <InputLabel value="Grupos de Complementos" className="mb-2" />
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-2 space-y-1 custom-scrollbar">
                                    {complement_groups.length > 0 ? (
                                        complement_groups.map((group) => (
                                            <div
                                                key={group.id}
                                                onClick={() => toggleComplementGroup(group.id)}
                                                className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${data.complement_groups.includes(group.id)
                                                    ? 'bg-orange-50 border border-[#ff3d03] dark:bg-orange-900/20'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <Checkbox
                                                    checked={data.complement_groups.includes(group.id)}
                                                    onChange={() => { }}
                                                    className="pointer-events-none mr-3 text-[#ff3d03]"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
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

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowModal(false)} disabled={processing}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#ff3d03] hover:bg-[#e63700] border-transparent">
                            {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
