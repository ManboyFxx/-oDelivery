import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { BookOpen, Eye, EyeOff, Star, ChevronUp, ChevronDown, Check, X, Search, Sparkles, ExternalLink, Plus, Package } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    is_available: boolean;
    is_featured: boolean;
}

interface Category {
    id: string;
    name: string;
    products_count: number;
    is_active: boolean;
    products: Product[];
    sort_order: number;
}

interface Props {
    categories: Category[];
    tenantSlug: string;
    stats: {
        totalCategories: number;
        totalProducts: number;
        activeCategories: number;
        featuredProducts: number;
    };
}

export default function MenuIndex({ categories: initialCategories, tenantSlug, stats }: Props) {
    const [categories, setCategories] = useState(initialCategories);
    const [activeCategory, setActiveCategory] = useState<string | null>(initialCategories.length > 0 ? initialCategories[0].id : null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleReorder = (index: number, direction: 'up' | 'down') => {
        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newCategories.length) return;

        // Swap
        [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];

        // Update sort_order locally
        newCategories.forEach((cat, idx) => cat.sort_order = idx);

        setCategories(newCategories);

        // Send to backend
        router.post(route('menu.reorder'), {
            items: newCategories.map((c, i) => ({ id: c.id, sort_order: i }))
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Optional toast
            }
        });
    };

    const toggleCategoryVisibility = (category: Category) => {
        // Optimistic update
        const updatedCategories = categories.map(c =>
            c.id === category.id ? { ...c, is_active: !c.is_active } : c
        );
        setCategories(updatedCategories);

        router.post(route('menu.toggle', category.id), {}, { preserveScroll: true });
    };

    const toggleProductAvailability = (product: Product) => {
        router.post(route('products.toggle', product.id), {}, { preserveScroll: true });

        // Optimistic update nested state
        const updatedCategories = categories.map(c => ({
            ...c,
            products: c.products.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p)
        }));
        setCategories(updatedCategories);
    };

    const toggleProductFeatured = (product: Product) => {
        router.post(route('products.toggle-featured', product.id), {}, { preserveScroll: true });

        // Optimistic
        const updatedCategories = categories.map(c => ({
            ...c,
            products: c.products.map(p => p.id === product.id ? { ...p, is_featured: !p.is_featured } : p)
        }));
        setCategories(updatedCategories);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestão do Cardápio" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-md bg-[#ff3d03]/10 text-[#ff3d03] text-[10px] font-bold uppercase tracking-wider">
                                    Cardápio
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Gestão do Cardápio</h2>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                                Organize categorias, ative produtos e destaque suas melhores ofertas
                            </p>
                        </div>

                        <a
                            href={`/${tenantSlug}/menu`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ff3d03] hover:bg-[#e03603] text-white font-bold rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#ff3d03]/30 h-fit whitespace-nowrap"
                        >
                            <ExternalLink className="h-5 w-5" />
                            Ver Menu Público
                        </a>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-[20px] p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Categorias</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalCategories}</p>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">{stats.activeCategories} ativas</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[20px] p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Produtos</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalProducts}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">{stats.featuredProducts} destaques</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/5 rounded-[20px] p-4 border border-orange-200 dark:border-orange-800/30 shadow-sm">
                            <p className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase mb-1">Área Promocional</p>
                            <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{stats.featuredProducts}</p>
                            <p className="text-xs text-orange-600/70 dark:text-orange-500/70 font-medium mt-1">produtos em destaque</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[20px] p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Visibilidade</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{((stats.activeCategories / Math.max(stats.totalCategories, 1)) * 100).toFixed(0)}%</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">categorias visíveis</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Categories Sidebar */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    Categorias
                                </h3>
                                <span className="px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-bold">
                                    {categories.length}
                                </span>
                            </div>

                            {categories.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm mb-3">Nenhuma categoria criada</p>
                                    <a href={route('categories.create')} className="text-orange-600 dark:text-orange-400 font-bold text-sm hover:underline flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Criar Categoria
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {categories.map((category, index) => (
                                        <div
                                            key={category.id}
                                            onClick={() => setActiveCategory(category.id)}
                                            className={clsx(
                                                "group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border relative",
                                                activeCategory === category.id
                                                    ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 shadow-md shadow-orange-100/30"
                                                    : "bg-gray-50 dark:bg-gray-800/50 border-transparent hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-sm"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex flex-col gap-0.5 shrink-0">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleReorder(index, 'up'); }}
                                                        disabled={index === 0}
                                                        className="p-0.5 text-gray-400 hover:text-orange-500 disabled:opacity-30 transition-colors"
                                                    >
                                                        <ChevronUp className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleReorder(index, 'down'); }}
                                                        disabled={index === categories.length - 1}
                                                        className="p-0.5 text-gray-400 hover:text-orange-500 disabled:opacity-30 transition-colors"
                                                    >
                                                        <ChevronDown className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className={clsx(
                                                        "font-bold text-sm truncate block",
                                                        activeCategory === category.id ? "text-orange-700 dark:text-orange-400" : "text-gray-700 dark:text-gray-300"
                                                    )}>
                                                        {category.name}
                                                    </span>
                                                    <span className={clsx(
                                                        "text-xs font-medium",
                                                        activeCategory === category.id ? "text-orange-600 dark:text-orange-500/70" : "text-gray-500 dark:text-gray-400"
                                                    )}>
                                                        {category.products_count} {category.products_count === 1 ? 'produto' : 'produtos'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleCategoryVisibility(category); }}
                                                    className={clsx(
                                                        "p-1.5 rounded-lg transition-colors",
                                                        category.is_active
                                                            ? "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                            : "text-gray-300 bg-gray-100 dark:bg-gray-700 dark:text-gray-600"
                                                    )}
                                                    title={category.is_active ? "Ocultar categoria" : "Mostrar categoria"}
                                                >
                                                    {category.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            {!category.is_active && (
                                                <div className="absolute inset-0 rounded-xl pointer-events-none border border-gray-300/50 dark:border-gray-600/30 bg-black/3 dark:bg-black/10"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Products List (Active Category) */}
                    <div className="lg:col-span-8">
                        {categories.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-[24px] p-12 border border-gray-100 dark:border-gray-700 text-center">
                                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
                                    <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Seu cardápio está vazio</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Comece adicionando categorias para organizar seus produtos</p>
                                <a href={route('categories.create')} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Criar Primeira Categoria
                                </a>
                            </div>
                        ) : (
                            <>
                                {categories.map((category) => (
                                    activeCategory === category.id && (
                                        <div key={category.id} className="bg-white dark:bg-gray-800 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{category.name}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {category.products.length} {category.products.length === 1 ? 'produto' : 'produtos'} {!category.is_active && '(Categoria oculta)'}
                                                    </p>
                                                </div>
                                                <div className="relative w-full sm:w-auto">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar produto..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border-none bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-orange-500 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {category.products.length === 0 ? (
                                                <div className="p-12 text-center">
                                                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                                                        <Package className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">Esta categoria não possui produtos</p>
                                                    <a href={route('products.create')} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold text-sm rounded-lg transition-colors border border-orange-200 dark:border-orange-800/50">
                                                        <Plus className="w-4 h-4" />
                                                        Adicionar Produto
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {category.products
                                                        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                        .map((product) => (
                                                            <div key={product.id} className={clsx(
                                                                "p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors",
                                                                !product.is_available && "opacity-60 grayscale-[0.5]"
                                                            )}>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden relative">
                                                                        {product.image_url ? (
                                                                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                                                        ) : (
                                                                            <div className="text-xs font-bold text-gray-400">{product.name.substring(0, 2).toUpperCase()}</div>
                                                                        )}
                                                                        {product.is_featured && (
                                                                            <div className="absolute top-0 right-0 bg-yellow-400 p-0.5 rounded-bl-lg shadow-sm">
                                                                                <Star className="w-2.5 h-2.5 text-white fill-current" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{product.name}</h4>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{product.description || 'Sem descrição'}</p>
                                                                        <span className="text-xs font-black text-orange-600 dark:text-orange-500 mt-1 block">
                                                                            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => toggleProductFeatured(product)}
                                                                        className={clsx(
                                                                            "p-2 rounded-lg transition-all",
                                                                            product.is_featured
                                                                                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500"
                                                                                : "text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                        )}
                                                                        title="Destacar produto (Área Promocional)"
                                                                    >
                                                                        <Star className={clsx("w-5 h-5", product.is_featured && "fill-current")} />
                                                                    </button>

                                                                    <button
                                                                        onClick={() => toggleProductAvailability(product)}
                                                                        className={clsx(
                                                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                                                            product.is_available
                                                                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                                                                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                                                        )}
                                                                    >
                                                                        {product.is_available ? (
                                                                            <>
                                                                                <Check className="w-3 h-3" /> Ativo
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <X className="w-3 h-3" /> Pausado
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    {category.products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && searchQuery && (
                                                        <div className="p-8 text-center text-gray-400 text-sm">
                                                            Nenhum produto encontrado com "{searchQuery}"
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
