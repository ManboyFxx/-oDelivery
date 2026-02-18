import { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product } from './types';
import clsx from 'clsx';
import { toast } from 'sonner';

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: any) => void;
    initialValues?: any; // For editing
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart, initialValues }: ProductModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [selectedComplements, setSelectedComplements] = useState<{ [groupId: string]: { [optionId: string]: number } }>({});

    // Initialize state
    useEffect(() => {
        if (!product || !isOpen) return;

        if (initialValues) {
            setQuantity(initialValues.quantity);
            setNotes(initialValues.notes);
            // Reconstruct complements map if needed
            const complementsMap: { [groupId: string]: { [optionId: string]: number } } = {};
            initialValues.selectedComplements.forEach((comp: any) => {
                if (!complementsMap[comp.groupId]) {
                    complementsMap[comp.groupId] = {};
                }
                complementsMap[comp.groupId][comp.optionId] = comp.quantity || 1;
            });
            setSelectedComplements(complementsMap);
        } else {
            setQuantity(1);
            setNotes('');
            setSelectedComplements({});
        }
    }, [product, initialValues, isOpen]);

    if (!product || !isOpen) return null;

    const updateComplementQuantity = (groupId: string, optionId: string, delta: number, maxQuantity: number, maxSelections: number) => {
        setSelectedComplements(prev => {
            const groupSelections = prev[groupId] || {};
            const currentQty = groupSelections[optionId] || 0;
            const newQty = Math.max(0, Math.min(currentQty + delta, maxQuantity));

            // Calculate total items in group
            const totalItems = Object.values(groupSelections).reduce((sum: number, qty: number) => sum + qty, 0);
            const newTotal = totalItems - currentQty + newQty;

            // Check if exceeds group max
            if (newTotal > maxSelections) {
                toast.error(`Máximo de ${maxSelections} opções permitidas.`);
                return prev;
            }

            const newGroupSelections = { ...groupSelections };
            if (newQty === 0) {
                delete newGroupSelections[optionId];
            } else {
                newGroupSelections[optionId] = newQty;
            }

            return { ...prev, [groupId]: newGroupSelections };
        });
    };

    const getTotalSelected = (groupId: string): number => {
        const groupSelections = selectedComplements[groupId] || {};
        return Object.values(groupSelections).reduce((sum: number, qty: number) => sum + qty, 0);
    };

    const calculateTotal = () => {
        let total = Number(product.promotional_price && Number(product.promotional_price) > 0 ? product.promotional_price : product.price);

        product.complement_groups?.forEach(group => {
            const groupSelections = selectedComplements[group.id] || {};
            Object.entries(groupSelections).forEach(([optionId, qty]) => {
                const option = group.options.find(o => o.id === optionId);
                if (option) total += option.price * qty;
            });
        });

        return total * quantity;
    };

    const handleAddToCart = () => {
        // Validation
        if (product.complement_groups) {
            for (const group of product.complement_groups) {
                const totalSelected = getTotalSelected(group.id);
                if (group.is_required && totalSelected === 0) {
                    toast.error(`"${group.name}" é obrigatório.`);
                    // Find and scroll to error?
                    return;
                }
                if (totalSelected > 0 && totalSelected < group.min_selections) {
                    toast.error(`Selecione pelo menos ${group.min_selections} em "${group.name}".`);
                    return;
                }
            }
        }

        // Prepare Item Data
        const complementsList: any[] = [];
        product.complement_groups?.forEach(group => {
            const groupSelections = selectedComplements[group.id] || {};
            Object.entries(groupSelections).forEach(([optionId, qty]) => {
                const option = group.options.find(o => o.id === optionId);
                if (option && qty > 0) {
                    // Flatten complements as requested by backend structure usually
                    for (let i = 0; i < qty; i++) {
                        complementsList.push({
                            groupId: group.id,
                            optionId: option.id,
                            name: option.name,
                            price: option.price,
                            quantity: 1
                        });
                    }
                }
            });
        });

        onAddToCart({
            product,
            quantity,
            notes,
            selectedComplements: complementsList,
            subtotal: calculateTotal()
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-white dark:bg-premium-dark w-full md:max-w-2xl max-h-[90vh] md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto animate-in slide-in-from-bottom md:slide-in-from-bottom-10 duration-300 transition-colors duration-300">
                {/* Image Header */}
                <div className="h-48 md:h-64 relative shrink-0">
                    {product.image_url ? (
                        <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                            <ShoppingBag className="h-16 w-16" />
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full backdrop-blur-md transition-all group"
                    >
                        <X className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                    </button>
                    {/* Subtle Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6 relative bg-white dark:bg-premium-dark transition-colors duration-300">
                    <div className="mb-4">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2 transition-colors duration-300">{product.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">{product.description}</p>
                        <div className="mt-4">
                            <span className="text-2xl font-black text-[#ff3d03]">
                                R$ {Number(product.promotional_price || product.price).toFixed(2).replace('.', ',')}
                            </span>
                            {product.promotional_price && (
                                <span className="ml-3 text-sm text-gray-400 line-through">
                                    R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Complements */}
                    {product.complement_groups?.map(group => {
                        const totalSelected = getTotalSelected(group.id);
                        const isSatisfied = (!group.is_required || totalSelected >= group.min_selections) && totalSelected <= group.max_selections;

                        return (
                            <div key={group.id} className="mb-6">
                                <div className="flex items-center justify-between mb-3 sticky top-0 bg-white dark:bg-premium-dark py-2 z-10 border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2 transition-colors duration-300">
                                            {group.name}
                                            {group.is_required && <span className="text-[#ff3d03] text-xs font-black uppercase bg-[#ff3d03]/10 px-2 py-0.5 rounded-full">Obrigatório</span>}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                            {group.min_selections > 0 ? `Mín: ${group.min_selections}` : ''}
                                            {group.max_selections < 100 ? ` • Máx: ${group.max_selections}` : ''}
                                        </p>
                                    </div>
                                    <div className={clsx(
                                        "text-xs font-bold px-2 py-1 rounded-full transition-colors duration-300",
                                        isSatisfied ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                                    )}>
                                        {totalSelected}/{group.max_selections}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {group.options.map(option => {
                                        const qty = selectedComplements[group.id]?.[option.id] || 0;
                                        const maxQty = option.max_quantity || 1;
                                        const canAdd = qty < maxQty && totalSelected < group.max_selections;

                                        return (
                                            <div key={option.id} className={clsx(
                                                "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer duration-300",
                                                qty > 0 ? "border-[#ff3d03] bg-[#ff3d03]/5" : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
                                            )}>
                                                <div className="flex-1" onClick={() => canAdd && updateComplementQuantity(group.id, option.id, 1, maxQty, group.max_selections)}>
                                                    <div className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{option.name}</div>
                                                    {option.price > 0 && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                            + R$ {option.price.toFixed(2).replace('.', ',')}
                                                        </div>
                                                    )}
                                                </div>

                                                {qty > 0 || canAdd ? (
                                                    <div className="flex items-center gap-3 bg-white dark:bg-premium-card rounded-lg p-1 shadow-sm border border-gray-100 dark:border-white/5 transition-colors duration-300">
                                                        {qty > 0 && (
                                                            <button
                                                                onClick={() => updateComplementQuantity(group.id, option.id, -1, maxQty, group.max_selections)}
                                                                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-400 transition-colors"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {qty > 0 && <span className="font-bold text-sm min-w-[1rem] text-center text-gray-900 dark:text-white transition-colors duration-300">{qty}</span>}
                                                        <button
                                                            onClick={() => updateComplementQuantity(group.id, option.id, 1, maxQty, group.max_selections)}
                                                            disabled={!canAdd}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-[#ff3d03] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 transition-colors duration-300">
                                                        <Plus className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Notes */}
                    <div className="mb-6">
                        <label className="block font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Observações</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ex: Sem cebola, capricha no molho..."
                            className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-[#ff3d03] resize-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 transition-colors duration-300"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 md:p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-premium-dark md:rounded-b-3xl shrink-0 relative z-20 pb-safe transition-colors duration-300">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/5 rounded-xl px-2 transition-colors duration-300">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="h-10 w-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                            <span className="font-black text-xl w-8 text-center text-gray-900 dark:text-white transition-colors duration-300">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="h-10 w-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-[#ff3d03] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#ff3d03]/30 hover:bg-[#e63700] hover:shadow-[#ff3d03]/50 transition-all active:scale-[0.98] flex items-center justify-between px-6"
                        >
                            <span>{initialValues ? 'Atualizar Pedido' : 'Adicionar'}</span>
                            <span>R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
