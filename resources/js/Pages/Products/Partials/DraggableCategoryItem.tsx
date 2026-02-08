import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, GripVertical, Search } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    description: string;
    image_url?: string;
}

interface DraggableCategoryItemProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    isDragging?: boolean;
}

export default function DraggableCategoryItem({ category, onEdit, onDelete, isDragging }: DraggableCategoryItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.3 : 1,
        zIndex: isSortableDragging ? 50 : 'auto',
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`p-4 group bg-white dark:bg-[#1a1b1e] hover:bg-orange-50/50 dark:hover:bg-white/5 transition-all flex justify-between items-center ${isDragging ? 'shadow-lg ring-1 ring-[#ff3d03]/20 z-50' : 'border-b border-gray-100 dark:border-white/5 last:border-0'}`}
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 -ml-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-white/10 flex items-center justify-center text-[#ff3d03] font-bold text-lg group-hover:scale-110 transition-transform">
                    {category.name.substring(0, 1).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{category.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.description || 'Sem descrição'}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(category)}
                    className="p-2 text-gray-400 hover:text-[#ff3d03] hover:bg-orange-50 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title="Editar"
                >
                    <Pencil className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onDelete(category.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title="Excluir"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        </li>
    );
}
