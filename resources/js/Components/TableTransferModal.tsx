import { useRef, useEffect } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';

interface Props {
    show: boolean;
    onClose: () => void;
    sourceTable: { id: string; number: number } | null;
    tables: { id: string; number: number; status: string }[];
}

export default function TableTransferModal({ show, onClose, sourceTable, tables }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        target_table_id: '',
    });

    useEffect(() => {
        if (!show) {
            reset();
        }
    }, [show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (sourceTable) {
            post(route('tables.transfer', sourceTable.id), {
                onSuccess: () => onClose(),
            });
        }
    };

    const freeTables = tables
        .filter(t => t.status === 'free' && t.id !== sourceTable?.id)
        .sort((a, b) => a.number - b.number);

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Transferir Mesa {sourceTable?.number}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Para Mesa:
                        </label>
                        <select
                            value={data.target_table_id}
                            onChange={e => setData('target_table_id', e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        >
                            <option value="">Selecione uma mesa livre...</option>
                            {freeTables.map(table => (
                                <option key={table.id} value={table.id}>
                                    Mesa {table.number}
                                </option>
                            ))}
                        </select>
                        {errors.target_table_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.target_table_id}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing || !data.target_table_id}>
                            Transferir
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
