import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Users, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'free' | 'occupied' | 'reserved';
    occupied_at?: string;
    current_order_id?: string;
    current_order?: {
        total: number;
    };
}

interface TableCardProps {
    table: Table;
    onClick: (table: Table) => void;
    onEdit?: (table: Table) => void;
    onDelete?: (table: Table) => void;
}

import { Pencil, Trash2 } from 'lucide-react';

export default function TableCard({ table, onClick, onEdit, onDelete }: TableCardProps) {
    const isOccupied = table.status === 'occupied';
    const isFree = table.status === 'free';

    // Timer Logic
    const [elapsed, setElapsed] = useState<string>('');
    const [isOvertime, setIsOvertime] = useState(false);

    useEffect(() => {
        if (!isOccupied || !table.occupied_at) {
            setElapsed('');
            return;
        }

        const updateTimer = () => {
            const start = new Date(table.occupied_at!).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((now - start) / 1000);

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);

            setElapsed(`${hours > 0 ? hours + 'h ' : ''}${minutes}m`);
            setIsOvertime(diff > 7200); // > 2 hours alert
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [table.status, table.occupied_at]);

    // Drag & Drop
    const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
        id: `table-${table.id}`,
        data: { type: 'table', table },
        disabled: isFree, // Can only drag occupied tables (to transfer)
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `table-drop-${table.id}`,
        data: { type: 'table', table },
        disabled: isOccupied, // Can only drop on free tables (to move/merge?) -> For now move
    });

    // Styles
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: 0.8,
    } : undefined;

    let borderColor = 'border-gray-200 dark:border-gray-700';
    let bgColor = 'bg-white dark:bg-gray-800';
    let textColor = 'text-gray-900 dark:text-white';

    if (isOccupied) {
        borderColor = isOvertime ? 'border-red-600' : 'border-red-500';
        bgColor = isOvertime ? 'bg-red-50 dark:bg-red-900/20' : 'bg-red-50 dark:bg-red-900/10';
        textColor = 'text-red-700 dark:text-red-300';
    } else if (isOver) {
        borderColor = 'border-blue-500 ring-2 ring-blue-200';
        bgColor = 'bg-blue-50 dark:bg-blue-900/20';
    } else if (isFree) {
        borderColor = 'border-green-500';
        bgColor = 'bg-green-50 dark:bg-green-900/10';
        textColor = 'text-green-700 dark:text-green-300';
    }

    return (
        <div
            ref={(node) => {
                setDragRef(node);
                setDropRef(node);
            }}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => onClick(table)}
            className={`
                relative p-4 rounded-xl border-2 flex flex-col items-center justify-between 
                min-h-[140px] transition-all cursor-pointer shadow-sm hover:shadow-md
                ${borderColor} ${bgColor} ${isDragging ? 'shadow-xl scale-105 rotate-2' : ''}
            `}
        >
            <div className={`absolute top-2 right-2 flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isOccupied ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                }`}>
                {isOccupied ? 'Ocupada' : 'Livre'}
            </div>

            {/* Actions */}
            <div className="absolute top-2 left-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(table); }}
                        className="p-1 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-sm text-gray-400 hover:text-blue-500"
                    >
                        <Pencil className="h-3 w-3" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(table); }}
                        className="p-1 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-sm text-gray-400 hover:text-red-500"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                )}
            </div>

            <div className="flex flex-col items-center mt-2">
                <span className={`text-3xl font-black ${textColor}`}>
                    {table.number}
                </span>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mt-1">
                    <Users className="h-3 w-3" />
                    <span>{table.capacity} lug.</span>
                </div>
            </div>

            {isOccupied && (
                <div className="w-full mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-700 flex justify-between items-center text-xs">
                    <div className={`flex items-center gap-1 font-medium ${isOvertime ? 'text-red-600 animate-pulse' : 'text-gray-600 dark:text-gray-400'}`}>
                        <Clock className="h-3 w-3" />
                        {elapsed || '< 1m'}
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white">
                        {table.current_order?.total
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(table.current_order.total)
                            : 'R$ 0,00'}
                    </div>
                </div>
            )}

            {/* Actions (Edit/Delete) - visible on hover or if needed */}
            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Can be passed as children or props if we want to keep Card pure, but let's assume we pass callbacks */}
            </div>
        </div>
    );
}
