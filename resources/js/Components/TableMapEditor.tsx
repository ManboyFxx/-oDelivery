import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, useDraggable, useSensor, useSensors, PointerSensor, DragStartEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Grid, Save, GripHorizontal } from 'lucide-react';
import { clsx } from 'clsx';

interface Table {
    id: string;
    number: number;
    capacity: number;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    shape: 'square' | 'round';
    rotation: number;
    status?: 'free' | 'occupied' | 'reserved';
}

interface MapTableProps {
    table: Table;
    isSelected: boolean;
}

function MapTable({ table, isSelected }: MapTableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: table.id,
        data: { table },
    });

    // Use transform for temporary drag movement, excessive absolute positioning for final state
    // When dragging, dnd-kit applies transform. usage of translate3d is recommended.
    // But we need to offset it by the original position.

    // Actually, distinct from sortable lists, for free drag we usually:
    // 1. Position element absolute at x,y
    // 2. Apply transform during drag

    const getStatusColor = () => {
        if (isSelected) return "ring-2 ring-blue-500 border-blue-500";
        if (table.status === 'occupied') return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
        if (table.status === 'reserved') return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";
    };

    const style: React.CSSProperties = {
        left: `${table.position_x}px`,
        top: `${table.position_y}px`,
        width: `${table.width}px`,
        height: `${table.height}px`,
        position: 'absolute',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={clsx(
                "border-2 shadow-sm flex flex-col items-center justify-center cursor-move transition-colors select-none",
                getStatusColor(),
                isDragging && "shadow-xl opacity-80 z-50",
                table.shape === 'round' ? "rounded-full" : "rounded-lg"
            )}
        >
            <GripHorizontal className="w-4 h-4 text-gray-300 absolute top-2 opacity-0 hover:opacity-100 transition-opacity" />
            <span className={clsx("font-bold dark:text-white", table.width < 60 ? "text-sm" : "text-xl")}>{table.number}</span>
            {table.width >= 60 && <span className="text-[10px] text-gray-500">{table.capacity}L</span>}

            {table.status === 'occupied' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white dark:border-gray-900" />
            )}
        </div>
    );
}

export default function TableMapEditor({ tables: initialTables }: { tables: Table[] }) {
    const [tables, setTables] = useState<Table[]>(initialTables);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize positions if they are 0 (scatter them or stack them)
    // For now assume they might be 0,0.

    useEffect(() => {
        setTables(initialTables);
    }, [initialTables]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        const id = active.id as string;

        setTables(prev => prev.map(t => {
            if (t.id === id) {
                // Snap to grid (20px)
                const rawX = Math.max(0, t.position_x + delta.x);
                const rawY = Math.max(0, t.position_y + delta.y);

                const snap = (val: number) => Math.round(val / 20) * 20;

                return {
                    ...t,
                    position_x: snap(rawX),
                    position_y: snap(rawY),
                };
            }
            return t;
        }));

        setHasChanges(true);
    };

    const handleSave = () => {
        const positions = tables.map(t => ({
            id: t.id,
            x: t.position_x,
            y: t.position_y,
            width: t.width,
            height: t.height,
            shape: t.shape,
            rotation: t.rotation
        }));

        router.post(route('tables.update-positions'), { positions }, {
            preserveScroll: true,
            onSuccess: () => setHasChanges(false),
        });
    };

    const updateTableProp = (id: string, field: keyof Table, value: any) => {
        setTables(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
        setHasChanges(true);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500">
                    <p>Arraste as mesas para posicioná-las. Clique em uma mesa para editar formato.</p>
                </div>
                <div className="flex gap-2">
                    {hasChanges && (
                        <span className="text-amber-500 text-sm flex items-center px-2">
                            Alterações não salvas
                        </span>
                    )}
                    <PrimaryButton
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={clsx("gap-2", !hasChanges && "opacity-50 cursor-not-allowed")}
                    >
                        <Save className="w-4 h-4" />
                        Salvar Layout
                    </PrimaryButton>
                </div>
            </div>

            <div className="relative w-full h-[600px] bg-gray-100 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden shadow-inner font-sans">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}>
                </div>

                <DndContext
                    sensors={sensors}
                    modifiers={[restrictToParentElement]}
                    onDragEnd={handleDragEnd}
                >
                    {tables.map(table => (
                        <div key={table.id}>
                            <MapTable
                                table={table}
                                isSelected={false}
                            />
                            {/* Controls Overlay (Simple implementation for now) */}
                            <div
                                style={{
                                    left: table.position_x,
                                    top: table.position_y - 25,
                                    position: 'absolute',
                                    zIndex: 50 // Above table
                                }}
                                className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity bg-white/80 rounded p-1 shadow-sm"
                            >
                                <button onClick={() => updateTableProp(table.id, 'shape', table.shape === 'round' ? 'square' : 'round')} className="p-0.5 hover:bg-gray-200 rounded text-[10px]">
                                    {table.shape === 'round' ? '⬛' : '🔵'}
                                </button>
                                <button onClick={() => updateTableProp(table.id, 'width', table.width + 10)} className="p-0.5 hover:bg-gray-200 rounded text-[10px]">+</button>
                                <button onClick={() => updateTableProp(table.id, 'width', Math.max(40, table.width - 10))} className="p-0.5 hover:bg-gray-200 rounded text-[10px]">-</button>
                            </div>
                        </div>
                    ))}
                </DndContext>
            </div>
        </div>
    );
}
