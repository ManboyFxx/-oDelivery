import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Check, X, Pencil } from 'lucide-react';

interface Props {
    value: string | number;
    productId: string;
    field: 'price' | 'name';
    onSuccess?: () => void;
    className?: string;
    formatValue?: (value: string | number) => string;
}

export default function QuickEditField({
    value,
    productId,
    field,
    onSuccess,
    className = '',
    formatValue
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value.toString());
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editValue === value.toString()) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);

        router.patch(
            route('products.quick-update', productId),
            { [field]: editValue },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditing(false);
                    setIsLoading(false);
                    onSuccess?.();
                },
                onError: () => {
                    setEditValue(value.toString());
                    setIsEditing(false);
                    setIsLoading(false);
                }
            }
        );
    };

    const handleCancel = () => {
        setEditValue(value.toString());
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (!isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className={`group relative inline-flex items-center gap-2 hover:text-[#ff3d03] transition-colors ${className}`}
            >
                <span>{formatValue ? formatValue(value) : value}</span>
                <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <input
                ref={inputRef}
                type={field === 'price' ? 'number' : 'text'}
                step={field === 'price' ? '0.01' : undefined}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                disabled={isLoading}
                className="w-24 px-2 py-1 text-sm border border-[#ff3d03] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff3d03]/20 bg-white dark:bg-gray-800"
            />
            <button
                onClick={handleSave}
                disabled={isLoading}
                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
            >
                <Check className="h-4 w-4" />
            </button>
            <button
                onClick={handleCancel}
                disabled={isLoading}
                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
