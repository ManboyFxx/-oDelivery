import { Trash2, Plus, Package, Beaker, Save, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Ingredient {
    id: string;
    name: string;
}

interface RecipeItem {
    id: string;
    name: string;
    quantity: number;
}

interface Props {
    availableIngredients: Ingredient[];
    currentRecipe: RecipeItem[];
    onChange: (recipe: RecipeItem[]) => void;
}

export default function RecipeTab({ availableIngredients, currentRecipe, onChange }: Props) {
    const [selectedIngredientId, setSelectedIngredientId] = useState('');
    const [qty, setQty] = useState(1);

    const handleAdd = () => {
        if (!selectedIngredientId) return;

        const ingredient = availableIngredients.find(i => i.id === selectedIngredientId);
        if (!ingredient) return;

        // Check if already in recipe
        if (currentRecipe.find(r => r.id === ingredient.id)) {
            alert('Este ingrediente já faz parte da ficha técnica.');
            return;
        }

        const newRecipe = [...currentRecipe, { id: ingredient.id, name: ingredient.name, quantity: qty }];
        onChange(newRecipe);
        setSelectedIngredientId('');
        setQty(1);
    };

    const handleRemove = (id: string) => {
        onChange(currentRecipe.filter(r => r.id !== id));
    };

    const handleQtyChange = (id: string, newQty: number) => {
        onChange(currentRecipe.map(r => r.id === id ? { ...r, quantity: newQty } : r));
    };

    return (
        <div className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-[#ff3d03] flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    A <strong>Ficha Técnica</strong> define a composição padrão do produto. Ao vender esse item, o estoque dos ingredientes listados será baixado automaticamente.
                </p>
            </div>

            {/* Selector */}
            <div className="flex flex-col md:flex-row gap-4 p-6 bg-white dark:bg-white/2 border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm">
                <div className="flex-1">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Selecionar Ingrediente</label>
                    <select
                        value={selectedIngredientId}
                        onChange={e => setSelectedIngredientId(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border-gray-200 dark:border-white/10 dark:bg-[#1a1b1e] dark:text-white focus:ring-2 focus:ring-[#ff3d03] transition-all"
                    >
                        <option value="">Selecione um ingrediente...</option>
                        {availableIngredients
                            .filter(ing => !currentRecipe.find(r => r.id === ing.id))
                            .map(ing => (
                                <option key={ing.id} value={ing.id}>{ing.name}</option>
                            ))}
                    </select>
                </div>
                <div className="w-full md:w-32">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Quantidade</label>
                    <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={qty}
                        onChange={e => setQty(parseFloat(e.target.value) || 0)}
                        className="w-full h-12 px-4 rounded-xl border-gray-200 dark:border-white/10 dark:bg-[#1a1b1e] dark:text-white focus:ring-2 focus:ring-[#ff3d03] transition-all"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!selectedIngredientId}
                        className="h-12 px-6 rounded-xl bg-[#ff3d03] text-white font-bold text-sm hover:bg-[#e63602] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Adicionar
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/10 rounded-[32px] overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/2">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ingrediente</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantidade Utilizada</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {currentRecipe.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <Beaker className="w-10 h-10 text-gray-300 mb-2" />
                                        <p className="text-gray-500 font-bold uppercase text-xs">Nenhum ingrediente na ficha técnica</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            currentRecipe.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-400">
                                                <Package className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 w-32">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.001"
                                                value={item.quantity}
                                                onChange={e => handleQtyChange(item.id, parseFloat(e.target.value) || 0)}
                                                className="w-full h-8 px-2 rounded-lg border-gray-200 dark:border-white/10 dark:bg-[#0f1012] text-sm font-bold text-[#ff3d03]"
                                            />
                                            <span className="text-xs text-gray-400 font-bold">UN</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
