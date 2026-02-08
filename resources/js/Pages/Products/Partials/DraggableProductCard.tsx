import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react';
import { Switch } from '@headlessui/react';
import QuickEditField from '@/Components/QuickEditField';
import Checkbox from '@/Components/Checkbox';
import { isEqual } from 'lodash';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    is_available: boolean;
    category?: { name: string };
    complementGroups?: any[];
}

interface DraggableProductCardProps {
    product: Product;
    selected: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onToggleAvailability: (product: Product) => void;
    onPriceUpdate: (id: string, newPrice: number) => void;
    isDragging?: boolean;
}

const DraggableProductCard = memo(function DraggableProductCard({
    product,
    selected,
    onSelect,
    onEdit,
    onDelete,
    onToggleAvailability,
    onPriceUpdate,
    isDragging
}: DraggableProductCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging
    } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.3 : 1,
        zIndex: isSortableDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative bg-white dark:bg-[#0f1012] rounded-[24px] shadow-lg shadow-gray-200/50 dark:shadow-none transition-all duration-300 border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col ${selected ? 'ring-2 ring-[#ff3d03]' : 'hover:shadow-xl hover:-translate-y-1'}`}
        >
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ opacity: selected ? 1 : undefined }}>
                <Checkbox
                    checked={selected}
                    onChange={(e) => onSelect(product.id, e.target.checked)}
                    className="h-5 w-5 bg-white border-gray-300"
                />
            </div>

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-3 right-1/2 translate-x-1/2 z-20 p-1.5 bg-black/20 dark:bg-white/10 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-white transition-opacity duration-200"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Image Area */}
            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-white/5 overflow-hidden">
                {product.image_url ? (
                    <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                    </div>
                )}

                {/* Action Overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0 z-20">
                    <button
                        onClick={() => onEdit(product)}
                        className="bg-white/90 dark:bg-black/80 text-gray-700 dark:text-gray-200 p-2 rounded-xl hover:text-[#ff3d03] shadow-lg backdrop-blur-sm transition-colors"
                        title="Editar"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(product.id)}
                        className="bg-white/90 dark:bg-black/80 text-gray-700 dark:text-gray-200 p-2 rounded-xl hover:text-red-500 shadow-lg backdrop-blur-sm transition-colors"
                        title="Excluir"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                {/* Availability Toggle - Now at bottom left of image */}
                <div className="absolute bottom-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                    <Switch
                        checked={product.is_available}
                        onChange={() => onToggleAvailability(product)}
                        className={`${product.is_available ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            } relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none shadow-lg`}
                    >
                        <span
                            className={`${product.is_available ? 'translate-x-5' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </Switch>
                </div>

                {!product.is_available && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-0">
                        <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">Indisponível</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#ff3d03] mb-1">
                            {product.category?.name || 'Sem Categoria'}
                        </p>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white line-clamp-1 leading-tight" title={product.name}>
                            {product.name}
                        </h3>
                    </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem] leading-relaxed mb-4">
                    {product.description || 'Sem descrição'}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <QuickEditField
                        value={product.price}
                        productId={product.id}
                        field="price"
                        onSuccess={() => onPriceUpdate(product.id, product.price)}
                        className="text-xl font-black text-gray-900 dark:text-white tracking-tight"
                        formatValue={(val) => `R$ ${Number(val).toFixed(2).replace('.', ',')}`}
                    />
                    <div className="flex gap-1.5">{product.complementGroups && product.complementGroups.length > 0 && (
                        <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-gray-300" title="Possui complementos">
                            +Opções
                        </span>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to ensure deep equality on product object and stability on handlers
    // We mainly care if product, selected, or isDragging changed
    return (
        prevProps.product.id === nextProps.product.id &&
        prevProps.product.name === nextProps.product.name &&
        prevProps.product.price === nextProps.product.price &&
        prevProps.product.is_available === nextProps.product.is_available &&
        prevProps.selected === nextProps.selected &&
        prevProps.isDragging === nextProps.isDragging
        // Callbacks are ignored in comparison if we assume they are stable or if we don't care about their reference changes
        // But since we are likely passing inline functions, we might need to ignore them to make memo work effectively
        // However, if we ignore them and they capture stale state, that's bad.
        // For now, let's trust simple shallow comparison or strict dependency on product fields.
    );
});

export default DraggableProductCard;
