import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react'; // Add router
import { useState } from 'react';
import RecipeTab from './Tabs/RecipeTab';
import { Package, List, Beaker, Save, ChevronLeft } from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    category_id: string;
    image_url?: string;
    loyalty_redeemable: boolean;
    loyalty_points_cost: number;
}

interface Group {
    id: string;
    name: string;
    min_selections: number;
    max_selections: number;
}

export default function Edit({ product, categories, complement_groups = [], ingredients = [] }: { product: any, categories: Category[], complement_groups: Group[], ingredients: any[] }) {
    const [activeTab, setActiveTab] = useState<'general' | 'complements' | 'recipe'>('general');
    const [imageError, setImageError] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH', // Spoof PATCH for file upload support in Laravel
        name: product.name,
        price: product.price,
        description: product.description || '',
        category_id: product.category_id || '',
        complement_groups: product.complement_groups ? product.complement_groups.map((g: any) => g.id) : [] as string[],
        ingredients: product.ingredients ? product.ingredients.map((i: any) => ({
            id: i.id,
            name: i.name,
            quantity: i.pivot ? i.pivot.quantity : 1
        })) : [] as any[],
        image: null as File | null,
        loyalty_redeemable: product.loyalty_redeemable || false,
        loyalty_points_cost: product.loyalty_points_cost || 0,
        loyalty_points_multiplier: product.loyalty_points_multiplier || 1.0,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(product.image_url || null);

    const submit = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        post(route('products.update', product.id), {
            forceFormData: true,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
            setImageError(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar ${product.name}`} />

            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link
                            href={route('products.index')}
                            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#ff3d03] transition-colors mb-2 uppercase tracking-widest"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Voltar ao Catálogo
                        </Link>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                            Editar Produto
                        </h2>
                    </div>

                    <button
                        onClick={submit}
                        disabled={processing}
                        className="flex items-center gap-2 bg-[#ff3d03] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#ff3d03]/20 hover:bg-[#e63602] transition-all disabled:opacity-50"
                    >
                        {processing ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Salvar Alterações
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-white dark:bg-white/2 p-2 rounded-3xl border border-gray-100 dark:border-white/5 mb-8 shadow-sm">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-[#ff3d03] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        <Package className="w-5 h-5" />
                        Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('complements')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'complements' ? 'bg-[#ff3d03] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        <List className="w-5 h-5" />
                        Complementos
                    </button>
                    {/* Aba Ficha Técnica removida a pedido do usuário */}
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-[#1a1b1e] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome do Produto</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full px-5 py-4 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-[#0f1012] dark:text-white focus:ring-2 focus:ring-[#ff3d03] transition-all font-bold"
                                        />
                                        {errors.name && <p className="mt-2 text-sm text-red-600 font-bold">{errors.name}</p>}
                                    </div>

                                    {/* Price & Category */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Preço (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                className="w-full px-5 py-4 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-[#0f1012] dark:text-[#ff3d03] focus:ring-2 focus:ring-[#ff3d03] transition-all font-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                                            <select
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                className="w-full px-5 py-4 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-[#0f1012] dark:text-white focus:ring-2 focus:ring-[#ff3d03] transition-all font-bold"
                                            >
                                                <option value="">Selecione...</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Descrição</label>
                                        <textarea
                                            rows={4}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="w-full px-5 py-4 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-[#0f1012] dark:text-white focus:ring-2 focus:ring-[#ff3d03] transition-all"
                                            placeholder="Descreva os ingredientes, tamanho..."
                                        />
                                    </div>
                                </div>

                                {/* Loyalty */}
                                <div className="bg-gradient-to-br from-[#ff3d03]/5 to-orange-500/5 dark:from-[#ff3d03]/10 dark:to-orange-500/5 p-8 rounded-[32px] border border-[#ff3d03]/10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm">
                                            <span className="text-2xl">🎁</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Cartão Fidelidade</h3>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Configurações de resgate</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 rounded-2xl">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">Permite resgate com pontos?</span>
                                        <button
                                            type="button"
                                            onClick={() => setData('loyalty_redeemable', !data.loyalty_redeemable)}
                                            className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-4 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.loyalty_redeemable ? 'bg-[#ff3d03]' : 'bg-gray-200 dark:bg-gray-800'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.loyalty_redeemable ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    {data.loyalty_redeemable && (
                                        <div className="animate-in zoom-in-95 duration-200">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Pontos para Resgate</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={data.loyalty_points_cost}
                                                    onChange={(e) => setData('loyalty_points_cost', parseInt(e.target.value) || 0)}
                                                    className="w-full px-5 py-4 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-white dark:text-gray-900 focus:ring-2 focus:ring-[#ff3d03] transition-all font-black text-lg"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 uppercase tracking-widest">Pontos</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-[#ff3d03]/10 mt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Produto Turbo (Multiplicador)</label>
                                                <p className="text-[10px] text-gray-500 font-bold mb-2 ml-1">Acelere os ganhos de pontos deste item</p>
                                            </div>
                                            <div className="relative w-24">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="1"
                                                    value={data.loyalty_points_multiplier}
                                                    onChange={(e) => setData('loyalty_points_multiplier', parseFloat(e.target.value) || 1.0)}
                                                    className="w-full px-3 py-2 rounded-xl border-gray-200 dark:border-white/10 dark:bg-white dark:text-gray-900 focus:ring-2 focus:ring-[#ff3d03] transition-all font-black text-center"
                                                />
                                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">x</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Image Preview */}
                                <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Imagem em Destaque</label>
                                    <div className="relative group">
                                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center transition-all group-hover:border-[#ff3d03]">
                                            {imagePreview && !imageError ? (
                                                <img
                                                    src={imagePreview}
                                                    className="w-full h-full object-cover"
                                                    alt="Preview"
                                                    onError={() => setImageError(true)}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <Package className="w-12 h-12 text-gray-300" />
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clique para adicionar</span>
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl backdrop-blur-sm">
                                            <span className="text-white font-black text-xs uppercase tracking-widest bg-[#ff3d03] px-4 py-2 rounded-xl">Alterar Foto</span>
                                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                    </div>
                                    {errors.image && <p className="mt-2 text-sm text-red-600 font-bold text-center">{errors.image}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'complements' && (
                        <div className="bg-white dark:bg-[#1a1b1e] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic mb-6">Vincular Grupos de Complementos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {complement_groups.map((group) => (
                                    <label key={group.id} className={`relative flex flex-col p-6 rounded-[24px] border-2 transition-all cursor-pointer ${data.complement_groups.includes(group.id) ? 'bg-[#ff3d03]/5 border-[#ff3d03]' : 'bg-gray-50 dark:bg-white/2 border-gray-100 dark:border-white/5 hover:border-gray-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-xl ${data.complement_groups.includes(group.id) ? 'bg-[#ff3d03] text-white' : 'bg-white dark:bg-white/5 text-gray-400'}`}>
                                                <List className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="rounded-lg border-gray-300 text-[#ff3d03] focus:ring-[#ff3d03] w-5 h-5"
                                                checked={data.complement_groups.includes(group.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    if (checked) {
                                                        setData('complement_groups', [...data.complement_groups, group.id]);
                                                    } else {
                                                        setData('complement_groups', data.complement_groups.filter((id: string) => id !== group.id));
                                                    }
                                                }}
                                            />
                                        </div>
                                        <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">{group.name}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            {group.min_selections} a {group.max_selections} opções
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Componente RecipeTab removido */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
