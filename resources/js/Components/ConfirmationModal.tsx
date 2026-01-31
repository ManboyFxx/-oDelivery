import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { AlertTriangle } from 'lucide-react';

interface Props {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    processing?: boolean;
}

export default function ConfirmationModal({
    show,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    processing = false
}: Props) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full dark:bg-red-900/20 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>

                <h2 className="text-lg font-medium text-center text-gray-900 dark:text-gray-100 mb-2">
                    {title}
                </h2>

                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                    {message}
                </p>

                <div className="flex justify-center gap-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        {cancelLabel}
                    </SecondaryButton>
                    <DangerButton onClick={onConfirm} disabled={processing}>
                        {confirmLabel}
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}
