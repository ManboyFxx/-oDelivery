import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import TableCard from '@/Components/TableCard';
import TableDrawer from '@/Components/TableDrawer';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'free' | 'occupied' | 'reserved';
    occupied_at?: string;
    current_order_id?: string;
    current_order?: any;
}

interface TableGridProps {
    tables: Table[];
    onEdit?: (table: Table) => void;
    onDelete?: (table: Table) => void;
}

export default function TableGrid({ tables, onEdit, onDelete }: TableGridProps) {
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const sourceTable = active.data.current?.table as Table;
        const targetTable = over.data.current?.table as Table;

        if (sourceTable.id !== targetTable.id) {
            if (confirm(`Transferir mesa ${sourceTable.number} para mesa ${targetTable.number}?`)) {
                router.post(route('tables.transfer', { from: sourceTable.id, to: targetTable.id }), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Optional: Show success toast
                    }
                });
            }
        }
    };

    const handleCloseAccount = (tableId: string) => {
        if (confirm('Deseja realmente fechar a conta desta mesa?')) {
            router.post(route('tables.close-account', tableId), {}, {
                onSuccess: () => setSelectedTable(null)
            });
        }
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tables.map((table) => (
                    <TableCard
                        key={table.id}
                        table={table}
                        onClick={(t) => setSelectedTable(t)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            <TableDrawer
                table={selectedTable}
                open={!!selectedTable}
                onClose={() => setSelectedTable(null)}
                onCloseAccount={handleCloseAccount}
            />
        </DndContext>
    );
}
