import { Search, Plus, Beaker, Edit, Power, Package, Filter, AlertTriangle, Save } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

interface Ingredient {
    id: string;
    name: string;
    is_available: boolean;
    stock: number;
    min_stock: number;
    display_order: number;
    complement_options_count: number;
}

interface Props {
    ingredients: Ingredient[];
}

export default function IngredientsTab({ ingredients }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        is_available: true,
        stock: 0,
        min_stock: 0,
    });

    const filteredIngredients = ingredients.filter(ing =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenCreate = () => {
        reset();
        setEditingIngredient(null);
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (ingredient: Ingredient) => {
        setData({
            name: ingredient.name,
            is_available: ingredient.is_available,
            stock: ingredient.stock || 0,
            min_stock: ingredient.min_stock || 0,
        });
        setEditingIngredient(ingredient);
        setIsCreateModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingIngredient) {
            put(route('ingredients.update', editingIngredient.id), {
                onSuccess: () => setIsCreateModalOpen(false),
            });
        } else {
            post(route('ingredients.store'), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                },
            });
        }
    };

    const toggleAvailability = (ingredient: Ingredient) => {
        post(route('ingredients.toggle', ingredient.id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#ff3d03] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar ingredientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-[#1a1b1e] dark:text-white focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent transition-all shadow-sm"
                    />
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 rounded-2xl bg-[#ff3d03] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63602] transition-all whitespace-nowrap"
                >
                    <Plus className="h-5 w-5" />
                    Novo Ingrediente
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl ${ingredient.is_available ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-gray-100 dark:bg-white/5'}`}>
                                        <Beaker className={`w-6 h-6 ${ingredient.is_available ? 'text-[#ff3d03]' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">
                                            {ingredient.name}
                                        </h3>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${ingredient.is_available ? 'text-green-500' : 'text-red-500'}`}>
                                            {ingredient.is_available ? 'Disponível' : 'Indisponível'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleOpenEdit(ingredient)}
                                        className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-[#ff3d03]"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => toggleAvailability(ingredient)}
                                        className={`p-2 rounded-xl transition-colors ${ingredient.is_available ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                                        title={ingredient.is_available ? 'Desativar' : 'Ativar'}
                                    >
                                        <Power className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-3 bg-gray-50 dark:bg-white/2 rounded-2xl">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter block mb-1">Estoque Atual</span>
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-400" />
                                        <span className={`text-sm font-black ${ingredient.stock <= ingredient.min_stock ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                            {ingredient.stock || 0} unid
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-white/2 rounded-2xl">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter block mb-1">Vinculado a</span>
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-black text-gray-900 dark:text-white">
                                            {(ingredient as any).complement_options_count || 0} opções
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {ingredient.stock <= ingredient.min_stock && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 rounded-2xl text-red-600 dark:text-red-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Estoque baixo ou crítico</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredIngredients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Beaker className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase italic tracking-tighter">Nenhum ingrediente encontrado</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Tente ajustar sua busca ou adicione um novo ingrediente para começar.</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight italic">
                        {editingIngredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome do Ingrediente</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-[#1a1b1e] dark:text-white focus:ring-2 focus:ring-[#ff3d03] transition-all"
                                placeholder="Ex: Bacon, Mussarela..."
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-2">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Estoque Inicial</label>
                                <input
                                    type="number"
                                    value={data.stock}
                                    onChange={e => setData('stock', parseInt(e.target.value) || 0)}
                                    className="w-full px-5 py-4 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-[#1a1b1e] dark:text-white focus:ring-2 focus:ring-[#ff3d03] transition-all"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mínimo para Alerta</label>
                                <input
                                    type="number"
                                    value={data.min_stock}
                                    onChange={e => setData('min_stock', parseInt(e.target.value) || 0)}
                                    className="w-full px-5 py-4 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-[#1a1b1e] dark:text-white focus:ring-2 focus:ring-[#ff3d03] transition-all"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/2 rounded-2xl">
                            <input
                                type="checkbox"
                                id="is_available_modal"
                                checked={data.is_available}
                                onChange={e => setData('is_available', e.target.checked)}
                                className="w-5 h-5 rounded-lg border-gray-300 text-[#ff3d03] focus:ring-[#ff3d03]"
                            />
                            <label htmlFor="is_available_modal" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                Disponível para uso agora
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex-1 py-4 px-6 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-4 px-6 rounded-2xl text-sm font-black text-white bg-[#ff3d03] shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63602] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                            {processing ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {editingIngredient ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
