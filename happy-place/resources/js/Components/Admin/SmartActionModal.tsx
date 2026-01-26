import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface SmartActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => void;
    title: string;
    description: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    fields?: {
        name: string;
        label: string;
        type: 'text' | 'select' | 'textarea';
        options?: { label: string; value: string }[];
        required?: boolean;
        placeholder?: string;
    }[];
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export default function SmartActionModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type,
    fields = [],
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading = false,
}: SmartActionModalProps) {
    const [formData, setFormData] = useState<any>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(formData);
    };

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle className="h-6 w-6 text-red-600" />;
            case 'warning': return <ShieldAlert className="h-6 w-6 text-orange-600" />;
            case 'success': return <CheckCircle className="h-6 w-6 text-green-600" />;
            default: return <AlertTriangle className="h-6 w-6 text-blue-600" />;
        }
    };

    const getColorClass = () => {
        switch (type) {
            case 'danger': return 'bg-red-50 text-red-900';
            case 'warning': return 'bg-orange-50 text-orange-900';
            case 'success': return 'bg-green-50 text-green-900';
            default: return 'bg-blue-50 text-blue-900';
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'warning': return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500';
            case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-[#1a1b1e] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-white dark:bg-[#1a1b1e] px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${getColorClass()}`}>
                                            {getIcon()}
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                                                {title}
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {description}
                                                </p>
                                            </div>

                                            {fields.length > 0 && (
                                                <div className="mt-4 space-y-4">
                                                    {fields.map((field) => (
                                                        <div key={field.name}>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                {field.label}
                                                            </label>
                                                            {field.type === 'select' ? (
                                                                <select
                                                                    className="w-full rounded-md border-gray-300 dark:border-white/10 dark:bg-white/5 py-2 pl-3 pr-10 text-base focus:border-[#ff3d03] focus:outline-none focus:ring-[#ff3d03] sm:text-sm text-gray-900 dark:text-white"
                                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                                    value={formData[field.name] || ''}
                                                                >
                                                                    <option value="">Selecione...</option>
                                                                    {field.options?.map(opt => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            ) : field.type === 'textarea' ? (
                                                                <textarea
                                                                    className="w-full rounded-md border-gray-300 dark:border-white/10 dark:bg-white/5 py-2 px-3 text-base focus:border-[#ff3d03] focus:outline-none focus:ring-[#ff3d03] sm:text-sm text-gray-900 dark:text-white"
                                                                    rows={3}
                                                                    placeholder={field.placeholder}
                                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                                    value={formData[field.name] || ''}
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    className="w-full rounded-md border-gray-300 dark:border-white/10 dark:bg-white/5 py-2 px-3 text-base focus:border-[#ff3d03] focus:outline-none focus:ring-[#ff3d03] sm:text-sm text-gray-900 dark:text-white"
                                                                    placeholder={field.placeholder}
                                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                                    value={formData[field.name] || ''}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/5 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="button"
                                        className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${getButtonClass()} disabled:opacity-50`}
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Processando...' : confirmText}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-transparent px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-white/5 sm:mt-0 sm:w-auto"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        {cancelText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
