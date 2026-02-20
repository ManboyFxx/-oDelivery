import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, Copy, Edit2, Trash2, GripVertical, X, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';

interface Ingredient {
    id: string;
    name: string;
}

interface ComplementOption {
    id?: string;
    name: string;
    price: number;
    max_quantity?: number | null;
    is_available: boolean;
    ingredient_id?: string | null;
    sort_order?: number;
    ingredient?: Ingredient;
}

interface ComplementGroup {
    id: string;
    name: string;
    is_required: boolean;
    min_selections: number;
    max_selections: number;
    options: ComplementOption[];
    options_count?: number;
}

export default function ComplementsTab({ groups, ingredients }: { groups: ComplementGroup[], ingredients: Ingredient[] }) {
    const [search, setSearch] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ComplementGroup | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        is_required: false,
        min_selections: 0,
        max_selections: 1,
        options: [{ name: '', price: 0, max_quantity: 1, is_available: true, ingredient_id: null }] as ComplementOption[]
    });

    const { errors } = usePage().props;

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleExpand = (groupId: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const openCreateModal = () => {
        setEditingGroup(null);
        setFormData({
            name: '',
            is_required: false,
            min_selections: 0,
            max_selections: 1,
            options: [{ name: '', price: 0, max_quantity: null, is_available: true, ingredient_id: null }]
        });
        setShowModal(true);
    };

    const openEditModal = (group: ComplementGroup) => {
        setEditingGroup(group);
        setFormData({
            name: group.name,
            is_required: group.is_required,
            min_selections: group.min_selections,
            max_selections: group.max_selections,
            options: group.options.map(opt => ({
                id: opt.id,
                name: opt.name,
                price: opt.price,
                max_quantity: opt.max_quantity || null,
                is_available: opt.is_available,
                ingredient_id: opt.ingredient_id || null
            }))
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingGroup) {
            router.put(route('complements.update', editingGroup.id), formData as any, {
                onSuccess: () => setShowModal(false)
            });
        } else {
            router.post(route('complements.store'), formData as any, {
                onSuccess: () => setShowModal(false)
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Deseja realmente excluir este grupo de complementos?')) {
            router.delete(route('complements.destroy', id));
        }
    };

    const handleDuplicate = (id: string) => {
        router.post(route('complements.duplicate', id));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { name: '', price: 0, max_quantity: null, is_available: true, ingredient_id: null }]
        }));
    };

    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const updateOption = (index: number, field: keyof ComplementOption, value: any) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.map((opt, i) =>
                i === index ? { ...opt, [field]: value } : opt
            )
        }));
    };

    const toggleOptionAvailability = async (groupId: string, optionId: string, currentStatus: boolean) => {
        try {
            await axios.post(route('complements.toggle-option', { groupId, optionId }));
            router.reload({ only: ['complement_groups'] });
        } catch (error) {
            console.error('Error toggling option:', error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white hidden md:block">
                    Gerenciar Complementos
                </h3>

                <div className="flex gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar grupos..."
                            className="w-full h-11 rounded-2xl border border-gray-200 bg-white pl-11 shadow-sm focus:border-[#ff3d03] focus:ring-[#ff3d03]/20 dark:border-white/5 dark:bg-[#0f1012] transition-all"
                        />
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-2xl bg-[#ff3d03] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63700] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <Plus className="h-5 w-5" />
                        Novo Grupo
                    </button>
                </div>
            </div>

            {/* Groups List */}
            <div className="space-y-4">
                {filteredGroups.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#1a1b1e] rounded-[24px] border border-gray-200 dark:border-white/5">
                        <p className="text-gray-400">Nenhum grupo encontrado</p>
                    </div>
                ) : (
                    filteredGroups.map((group) => (
                        <div key={group.id} className="bg-white dark:bg-[#1a1b1e] rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
                            {/* Group Header */}
                            <div className="p-5 flex items-center gap-4">
                                <button className="text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 cursor-move">
                                    <GripVertical className="h-5 w-5" />
                                </button>

                                <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(group.id)}>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{group.name}</h3>
                                        {group.is_required && (
                                            <span className="text-[10px] uppercase font-bold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-2 py-1 rounded-lg">
                                                Obrigatório
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {group.options.length} opções • Min: {group.min_selections} • Max: {group.max_selections}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDuplicate(group.id)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        title="Duplicar"
                                    >
                                        <Copy className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(group)}
                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(group.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => toggleExpand(group.id)}
                                        className={`p-2 text-gray-400 hover:text-[#ff3d03] hover:bg-orange-50 dark:hover:bg-white/10 rounded-lg transition-all ${expandedGroups.includes(group.id) ? 'bg-orange-50 text-[#ff3d03] dark:bg-white/10' : ''}`}
                                    >
                                        {expandedGroups.includes(group.id) ? (
                                            <ChevronUp className="h-5 w-5" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Options List (Expanded) */}
                            {expandedGroups.includes(group.id) && (
                                <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                                    {group.options.map((option) => (
                                        <div key={option.id} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-white dark:hover:bg-white/5 transition-colors">
                                            <button className="text-gray-300 hover:text-gray-500 cursor-move">
                                                <GripVertical className="h-4 w-4" />
                                            </button>

                                            {/* Toggle */}
                                            <button
                                                onClick={() => toggleOptionAvailability(group.id, option.id!, option.is_available)}
                                                className={clsx(
                                                    "relative w-10 h-6 rounded-full transition-colors focus:outline-none",
                                                    option.is_available ? "bg-[#ff3d03]" : "bg-gray-300 dark:bg-gray-600"
                                                )}
                                            >
                                                <div
                                                    className={clsx(
                                                        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                                                        option.is_available && "translate-x-4"
                                                    )}
                                                />
                                            </button>

                                            <div className="flex-1">
                                                <p className="font-bold text-gray-700 dark:text-gray-300">{option.name}</p>
                                            </div>

                                            <div className="text-sm">
                                                {option.price === 0 ? (
                                                    <span className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                        Grátis
                                                    </span>
                                                ) : (
                                                    <span className="font-black text-gray-900 dark:text-white bg-white dark:bg-white/10 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5">
                                                        R$ {Number(option.price).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                {editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                            {/* Error Display */}
                            {Object.keys(errors).length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-red-800 dark:text-red-300 text-sm mb-1">
                                            Não foi possível salvar o grupo
                                        </h4>
                                        <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                                            {Object.values(errors).map((error: any, idx) => (
                                                <li key={idx}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Group Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Nome do Grupo *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Escolha a Borda, Adicionais, Bebidas"
                                    className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent font-medium bg-gray-50 dark:bg-gray-800 dark:text-white"
                                    required
                                />
                            </div>

                            {/* Settings Grid */}
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Mín.
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.min_selections}
                                        onChange={(e) => setFormData({ ...formData, min_selections: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent font-bold text-center bg-gray-50 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Máx.
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_selections}
                                        onChange={(e) => setFormData({ ...formData, max_selections: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent font-bold text-center bg-gray-50 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-end h-[52px]">
                                    <label className={`flex items-center justify-center gap-3 cursor-pointer w-full h-full rounded-xl border transition-all ${formData.is_required
                                        ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                                        : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_required}
                                            onChange={(e) => {
                                                const isRequired = e.target.checked;
                                                setFormData({
                                                    ...formData,
                                                    is_required: isRequired,
                                                    min_selections: isRequired && formData.min_selections === 0 ? 1 : formData.min_selections
                                                });
                                            }}
                                            className="hidden"
                                        />
                                        <span className="text-sm font-bold uppercase tracking-wide">Obrigatório</span>
                                        {formData.is_required && <Check className="h-4 w-4" />}
                                    </label>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="bg-gray-50 dark:bg-black/20 rounded-[24px] p-6 border border-gray-100 dark:border-white/5">
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-lg font-black text-gray-900 dark:text-white">
                                        Opções do Grupo
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="flex items-center gap-2 text-sm text-white bg-[#ff3d03] hover:bg-[#e63700] font-bold px-4 py-2 rounded-xl shadow-lg shadow-[#ff3d03]/20 transition-all"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Adicionar
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.options.map((option, index) => (
                                        <div key={index} className="flex gap-3 items-start p-4 bg-white dark:bg-[#1a1b1e] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:border-[#ff3d03] dark:hover:border-[#ff3d03] group">
                                            <div className="flex-1 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                    <div className="md:col-span-6">
                                                        <span className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nome</span>
                                                        <input
                                                            type="text"
                                                            value={option.name}
                                                            onChange={(e) => updateOption(index, 'name', e.target.value)}
                                                            placeholder="Ex: Bacon Extra"
                                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent text-sm dark:bg-gray-800 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <span className="text-xs font-bold text-gray-400 uppercase mb-1 block">Preço</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={option.price}
                                                            onChange={(e) => updateOption(index, 'price', parseFloat(e.target.value))}
                                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent text-sm font-bold text-[#ff3d03] dark:bg-gray-800"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <span className="text-xs font-bold text-gray-400 uppercase mb-1 block">Qtd. Máx</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={option.max_quantity || ''}
                                                            onChange={(e) => updateOption(index, 'max_quantity', e.target.value ? parseInt(e.target.value) : null)}
                                                            placeholder="∞"
                                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent text-sm font-bold text-center dark:bg-gray-800 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {formData.options.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(index)}
                                                    className="mt-6 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#ff3d03] text-white font-bold py-4 rounded-xl hover:bg-[#e63700] transition-colors shadow-xl shadow-[#ff3d03]/20"
                                >
                                    {editingGroup ? 'Salvar Alterações' : 'Criar Grupo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
