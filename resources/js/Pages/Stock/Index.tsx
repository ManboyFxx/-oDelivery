import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Package, Search, AlertTriangle, TrendingUp, DollarSign, History, Save, Minus, Plus, Settings, Image as ImageIcon, Box } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/Components/PageHeader';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Switch } from '@headlessui/react';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    category?: { name: string };
    stock_quantity: number | null;
    track_stock: boolean;
}

interface Props {
    products: {
        data: Product[];
        links: any[];
    };
    metrics: {
        total_items: number;
        low_stock: number;
        total_value: number;
    };
}

export default function StockIndex({ products, metrics }: Props) {
    const [search, setSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [quantityInput, setQuantityInput] = useState('');
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

    const filteredProducts = products.data.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    const stockValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.total_value);

    const openAdjustModal = (product: Product) => {
        setEditingProduct(product);
        setQuantityInput(product.stock_quantity?.toString() || '0');
        setIsAdjustModalOpen(true);
    };

    const handleSaveAdjustment = () => {
        if (!editingProduct) return;

        router.put(route('stock.update', editingProduct.id), {
            stock_quantity: parseInt(quantityInput) || 0,
            track_stock: true
        }, {
            onSuccess: () => setIsAdjustModalOpen(false)
        });
    };

    const handleQuickAdd = (product: Product, amount: number) => {
        const currentCheck = product.stock_quantity || 0;
        const newQuantity = Math.max(0, currentCheck + amount);

        router.put(route('stock.update', product.id), {
            stock_quantity: newQuantity,
            track_stock: true
        }, {
            preserveScroll: true
        });
    };

    const handleToggleStock = (product: Product) => {
        router.put(route('stock.update', product.id), {
            // Keep current quantity if enabling, or null/0 if disabling? 
            // Usually we just toggle the boolean. The backend needs to support partial updates or we send everything.
            // My controller validates stock_quantity as required if I send it.
            // Let's send current quantity + toggle.
            stock_quantity: product.stock_quantity || 0,
            track_stock: !product.track_stock
        }, {
            preserveScroll: true
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Controle de Estoque" />

            <div className="flex h-full flex-col space-y-8">
                {/* Header */}
                <PageHeader
                    title="Controle de Estoque"
                    subtitle="Gerencie entradas, saídas e inventário."
                    action={
                        <Link
                            href={route('stock.movements')}
                            className="flex items-center gap-2 rounded-2xl bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/10 px-4 py-3 text-sm font-bold text-gray-700 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                        >
                            <History className="h-5 w-5" />
                            Histórico
                        </Link>
                    }
                />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <Package className="w-24 h-24 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total de Itens</p>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{metrics.total_items}</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <AlertTriangle className="w-24 h-24 text-[#ff3d03]" />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Estoque Baixo</p>
                            <h3 className="text-4xl font-black text-[#ff3d03] tracking-tight">{metrics.low_stock}</h3>
                            <p className="text-xs text-gray-400 mt-2">Menos de 5 unidades</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <DollarSign className="w-24 h-24 text-green-500" />
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Valor em Estoque</p>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{stockValue}</h3>
                            <p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Patrimônio Ativo
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar produto no estoque..."
                            className="w-full h-11 rounded-2xl border border-gray-200 bg-white pl-11 shadow-sm focus:border-[#ff3d03] focus:ring-[#ff3d03]/20 dark:border-white/5 dark:bg-[#0f1012] transition-all"
                        />
                    </div>
                </div>

                {/* Stock Grid Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="group flex flex-col bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden hover:-translate-y-1 transition-all duration-300">
                            {/* Image Section */}
                            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-white/5 overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md
                                        ${!product.track_stock
                                            ? 'bg-gray-100/90 text-gray-500 dark:bg-black/50 dark:text-gray-400'
                                            : (product.stock_quantity || 0) <= 5
                                                ? 'bg-red-500 text-white'
                                                : 'bg-green-500 text-white'
                                        }`}
                                    >
                                        {!product.track_stock ? 'Off' : (product.stock_quantity || 0) <= 5 ? 'Baixo' : 'OK'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-[#ff3d03] uppercase tracking-wider mb-1">
                                        {product.category?.name || 'Geral'}
                                    </p>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1" title={product.name}>
                                        {product.name}
                                    </h3>
                                </div>

                                {/* Link to Stock Actions */}
                                <div className="mt-auto space-y-4">
                                    {/* Toggle Switch */}
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Controlar?</span>
                                        <Switch
                                            checked={product.track_stock}
                                            onChange={() => handleToggleStock(product)}
                                            className={`${product.track_stock ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'
                                                } relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none`}
                                        >
                                            <span
                                                className={`${product.track_stock ? 'translate-x-5' : 'translate-x-1'
                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                        </Switch>
                                    </div>

                                    {/* Quantities Control */}
                                    {product.track_stock ? (
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => handleQuickAdd(product, -1)}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-colors"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>

                                            <div className="flex flex-col items-center cursor-pointer" onClick={() => openAdjustModal(product)}>
                                                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                                                    {product.stock_quantity || 0}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-gray-400">Unidades</span>
                                            </div>

                                            <button
                                                onClick={() => handleQuickAdd(product, 1)}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-400 hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-500/20 dark:hover:text-green-400 transition-colors"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-12 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                                <Box className="w-4 h-4" />
                                                Estoque Infinito
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Adjustment Modal */}
            <Modal show={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 text-center">
                        Ajuste Manual
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Produto</p>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{editingProduct?.name}</h3>
                        </div>

                        <div>
                            <div className="relative">
                                <TextInput
                                    type="number"
                                    value={quantityInput}
                                    onChange={(e) => setQuantityInput(e.target.value)}
                                    className="block w-full text-center text-4xl font-black h-20 border-[#ff3d03] text-[#ff3d03] focus:ring-[#ff3d03]"
                                    autoFocus
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">UN</span>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-2 font-medium">Digite a nova quantidade total</p>
                        </div>

                        <div className="flex gap-3">
                            <SecondaryButton onClick={() => setIsAdjustModalOpen(false)} className="flex-1 justify-center py-3 rounded-xl font-bold">
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton onClick={handleSaveAdjustment} className="flex-1 justify-center py-3 rounded-xl bg-[#ff3d03] hover:bg-[#e63700] border-transparent font-bold shadow-lg shadow-[#ff3d03]/20">
                                Salvar
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
