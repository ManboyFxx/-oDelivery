import { Trash2, Copy, FolderInput, CheckCircle, XCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface BulkActionsBarProps {
    selectedCount: number;
    actions: {
        onActivate: () => void;
        onDeactivate: () => void;
        onChangeCategory: () => void;
        onDuplicate: () => void;
        onDelete: () => void;
        onClearSelection: () => void;
    };
    loading?: boolean;
}

export default function BulkActionsBar({ selectedCount, actions, loading }: BulkActionsBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-40 animate-slide-up">
            <div className="bg-white dark:bg-[#1a1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-3 py-1 text-sm font-bold">
                        {selectedCount}
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:inline">
                        selecionados
                    </span>
                    <div className="h-6 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    {/* Activate */}
                    <button
                        onClick={actions.onActivate}
                        disabled={loading}
                        className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors whitespace-nowrap"
                        title="Ativar Vendas"
                    >
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline text-sm font-bold">Ativar</span>
                    </button>

                    {/* Deactivate */}
                    <button
                        onClick={actions.onDeactivate}
                        disabled={loading}
                        className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-colors whitespace-nowrap"
                        title="Pausar Vendas"
                    >
                        <XCircle className="h-4 w-4" />
                        <span className="hidden sm:inline text-sm font-bold">Pausar</span>
                    </button>

                    {/* Change Category */}
                    <button
                        onClick={actions.onChangeCategory}
                        disabled={loading}
                        className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors whitespace-nowrap"
                        title="Mudar Categoria"
                    >
                        <FolderInput className="h-4 w-4" />
                        <span className="hidden sm:inline text-sm font-bold">Mover</span>
                    </button>

                    {/* Duplicate */}
                    <button
                        onClick={actions.onDuplicate}
                        disabled={loading}
                        className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors whitespace-nowrap"
                        title="Duplicar"
                    >
                        <Copy className="h-4 w-4" />
                        <span className="hidden sm:inline text-sm font-bold">Duplicar</span>
                    </button>

                    <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />

                    {/* Delete */}
                    <button
                        onClick={actions.onDelete}
                        disabled={loading}
                        className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors whitespace-nowrap"
                        title="Excluir"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline text-sm font-bold">Excluir</span>
                    </button>
                </div>

                <div className="pl-4 border-l border-gray-200 dark:border-white/10">
                    <button
                        onClick={actions.onClearSelection}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                        title="Cancelar seleção"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}
