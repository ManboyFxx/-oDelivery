import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, Copy, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react';
import clsx from 'clsx';

interface Ingredient {
    id: string;
    name: string;
}

interface ComplementOption {
    id?: string;
    name: string;
    price: number;
    is_available: boolean;
    ingredient_id?: string | null;
    sort_order?: number;
}

interface ComplementGroup {
    id: string;
    name: string;
    is_required: boolean;
    min_selections: number;
    max_selections: number;
    options: ComplementOption[];
    options_count: number;
}

export default function Index({ groups, ingredients }: { groups: ComplementGroup[], ingredients: Ingredient[] }) {
    const [search, setSearch] = useState('');
    const [sortAZ, setSortAZ] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ComplementGroup | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        is_required: false,
        min_selections: 0,
        max_selections: 1,
        options: [{ name: '', price: 0, is_available: true, ingredient_id: null }] as ComplementOption[]
    });

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
            options: [{ name: '', price: 0, is_available: true, ingredient_id: null }]
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
                is_available: opt.is_available,
                ingredient_id: opt.ingredient_id || null
            }))
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingGroup) {
            router.put(`/complement-groups/${editingGroup.id}`, formData as any, {
                onSuccess: () => setShowModal(false)
            });
        } else {
            router.post('/complement-groups', formData as any, {
                onSuccess: () => setShowModal(false)
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Deseja realmente excluir este grupo de complementos?')) {
            router.delete(`/complement-groups/${id}`);
        }
    };

    const handleDuplicate = (id: string) => {
        router.post(`/complement-groups/${id}/duplicate`);
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { name: '', price: 0, is_available: true, ingredient_id: null }]
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

    const toggleOptionAvailability = (groupId: string, optionId: string, currentStatus: boolean) => {
        // This would be handled by a separate endpoint in a real implementation
        // For now, we'll just update via the edit modal
    };

    return (
        <AuthenticatedLayout>
            <Head title="Grupos de Complementos" />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Grupos de Complementos</h1>
                        <p className="text-sm text-gray-500 mt-1">Gerencie os complementos e adicionais dos seus produtos</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-[#ff8c00] hover:bg-[#e67e00] text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Novo Grupo
                    </button>
                </div>

                {/* Search and Sort */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar grupo ou opção..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff8c00] focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setSortAZ(!sortAZ)}
                        className={clsx(
                            "px-6 py-3 border rounded-xl font-medium transition-colors",
                            sortAZ
                                ? "bg-[#ff8c00] text-white border-[#ff8c00]"
                                : "bg-white text-gray-700 border-gray-200 hover:border-[#ff8c00]"
                        )}
                    >
                        Ordenar A-Z
                    </button>
                </div>

                {/* Groups List */}
                <div className="space-y-4">
                    {filteredGroups.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <p className="text-gray-400">Nenhum grupo encontrado</p>
                        </div>
                    ) : (
                        filteredGroups.map((group) => (
                            <div key={group.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {/* Group Header */}
                                <div className="p-4 flex items-center gap-4">
                                    <button className="text-gray-400 hover:text-gray-600 cursor-move">
                                        <GripVertical className="h-5 w-5" />
                                    </button>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-gray-900">{group.name}</h3>
                                            {group.is_required && (
                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                                    Obrigatório
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {group.options_count} opções • Min: {group.min_selections} • Max: {group.max_selections}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDuplicate(group.id)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Duplicar"
                                        >
                                            <Copy className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(group)}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(group.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => toggleExpand(group.id)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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
                                    <div className="border-t border-gray-200 bg-gray-50">
                                        {group.options.map((option) => (
                                            <div key={option.id} className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-0 bg-white">
                                                <button className="text-gray-300 hover:text-gray-500 cursor-move">
                                                    <GripVertical className="h-4 w-4" />
                                                </button>

                                                {/* Toggle */}
                                                <button
                                                    onClick={() => toggleOptionAvailability(group.id, option.id!, option.is_available)}
                                                    className={clsx(
                                                        "relative w-12 h-6 rounded-full transition-colors",
                                                        option.is_available ? "bg-[#ff8c00]" : "bg-gray-200"
                                                    )}
                                                >
                                                    <div
                                                        className={clsx(
                                                            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                                                            option.is_available && "translate-x-6"
                                                        )}
                                                    />
                                                </button>

                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-700">{option.name}</p>
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    {option.price === 0 ? (
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                                            Grátis
                                                        </span>
                                                    ) : (
                                                        <span className="font-medium">
                                                            R$ {option.price.toFixed(2)}
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
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="p-6 border-b">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {editingGroup ? 'Editar Grupo' : 'Novo Grupo de Complementos'}
                                    </h3>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Group Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome do Grupo *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Escolha a Borda, Adicionais, Bebidas"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff8c00] focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Settings Grid */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mín. Seleções
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.min_selections}
                                            onChange={(e) => setFormData({ ...formData, min_selections: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff8c00] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Máx. Seleções
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.max_selections}
                                            onChange={(e) => setFormData({ ...formData, max_selections: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff8c00] focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_required}
                                                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                                                className="h-5 w-5 text-[#ff8c00] rounded focus:ring-[#ff8c00]"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Obrigatório</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Options */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Opções *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="text-sm text-[#ff8c00] hover:text-[#e67e00] font-medium"
                                        >
                                            + Adicionar Opção
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.options.map((option, index) => (
                                            <div key={index} className="flex gap-3 items-start p-3 border border-gray-200 rounded-xl">
                                                <div className="flex-1 grid grid-cols-3 gap-3">
                                                    <input
                                                        type="text"
                                                        value={option.name}
                                                        onChange={(e) => updateOption(index, 'name', e.target.value)}
                                                        placeholder="Nome da opção"
                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff8c00] focus:border-transparent"
                                                        required
                                                    />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={option.price}
                                                        onChange={(e) => updateOption(index, 'price', parseFloat(e.target.value))}
                                                        placeholder="Preço"
                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff8c00] focus:border-transparent"
                                                        required
                                                    />
                                                    <select
                                                        value={option.ingredient_id || ''}
                                                        onChange={(e) => updateOption(index, 'ingredient_id', e.target.value || null)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff8c00] focus:border-transparent"
                                                    >
                                                        <option value="">Sem ingrediente</option>
                                                        {ingredients.map(ing => (
                                                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {formData.options.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-[#ff8c00] text-white font-bold py-3 rounded-xl hover:bg-[#e67e00] transition-colors"
                                    >
                                        {editingGroup ? 'Atualizar' : 'Criar Grupo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
