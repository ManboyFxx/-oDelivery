import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Gift, Save, Plus, History, Settings, Users, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';

interface Settings {
    id: string;
    loyalty_enabled: boolean;
    points_per_currency: number;
    currency_per_point: number;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    loyalty_points: number;
}

interface HistoryItem {
    id: string;
    points: number;
    type: 'earn' | 'redeem';
    description: string;
    created_at: string;
    customer: Customer;
}

export default function LoyaltyIndex({ settings, history, customers }: { settings: Settings, history: HistoryItem[], customers: Customer[] }) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

    // Settings Form
    const { data: settingsData, setData: setSettingsData, post: postSettings, processing: processingSettings } = useForm({
        loyalty_enabled: settings?.loyalty_enabled ?? false,
        points_per_currency: settings?.points_per_currency ?? 1,
        currency_per_point: settings?.currency_per_point ?? 0.10,
    });

    const submitSettings = (e: React.FormEvent) => {
        e.preventDefault();
        postSettings(route('loyalty.settings'));
    };

    // Adjust Points Form
    const { data: adjustData, setData: setAdjustData, post: postAdjust, processing: processingAdjust, reset: resetAdjust, errors: adjustErrors } = useForm({
        customer_id: '',
        points: '',
        type: 'add', // add or remove
        description: 'Ajuste manual',
    });

    const submitAdjust = (e: React.FormEvent) => {
        e.preventDefault();
        postAdjust(route('loyalty.adjust'), {
            onSuccess: () => {
                setIsAdjustModalOpen(false);
                resetAdjust();
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fidelidade" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Gift className="text-[#ff3d03]" />
                            Fidelidade
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Gerencie pontos e recompensas</p>
                    </div>
                    {activeTab === 'dashboard' && (
                        <button
                            onClick={() => setIsAdjustModalOpen(true)}
                            className="bg-[#ff3d03] hover:bg-[#e63700] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Ajuste Manual
                        </button>
                    )}
                </div>

                {/* Horizontal Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-800">
                    <nav className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={clsx(
                                "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                                activeTab === 'dashboard'
                                    ? "border-[#ff3d03] text-[#ff3d03]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            )}
                        >
                            <History className="h-4 w-4" />
                            Visão Geral
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={clsx(
                                "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                                activeTab === 'settings'
                                    ? "border-[#ff3d03] text-[#ff3d03]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            )}
                        >
                            <Settings className="h-4 w-4" />
                            Configurações
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div>
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Recent History Table */}
                            <div className="bg-white dark:bg-[#1a1b1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-[#2c2d30] text-gray-500 dark:text-gray-400 uppercase text-xs">
                                            <tr>
                                                <th className="px-6 py-3">Cliente</th>
                                                <th className="px-6 py-3">Tipo</th>
                                                <th className="px-6 py-3">Pontos</th>
                                                <th className="px-6 py-3">Descrição</th>
                                                <th className="px-6 py-3">Data</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                            {history.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#2c2d30]/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                        {item.customer.name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.type === 'earn' ? (
                                                            <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs font-bold">
                                                                <ArrowDownLeft className="h-3 w-3" /> Ganho
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full text-xs font-bold">
                                                                <ArrowUpRight className="h-3 w-3" /> Resgate
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={clsx("px-6 py-4 font-bold", item.type === 'earn' ? "text-green-600" : "text-red-600")}>
                                                        {item.type === 'earn' ? '+' : '-'}{item.points}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                        {item.description}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                        {new Date(item.created_at).toLocaleDateString('pt-BR')} {new Date(item.created_at).toLocaleTimeString('pt-BR')}
                                                    </td>
                                                </tr>
                                            ))}
                                            {history.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                        Nenhuma movimentação registrada.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-2xl space-y-6">
                            <div className="bg-white dark:bg-[#1a1b1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                                <form onSubmit={submitSettings} className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#2c2d30] rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="loyalty_enabled"
                                                type="checkbox"
                                                checked={settingsData.loyalty_enabled}
                                                onChange={(e) => setSettingsData('loyalty_enabled', e.target.checked)}
                                                className="w-5 h-5 text-[#ff3d03] border-gray-300 rounded focus:ring-[#ff3d03] dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="loyalty_enabled" className="font-medium text-gray-900 dark:text-white cursor-pointer select-none">
                                                Ativar Programa de Fidelidade
                                            </label>
                                            <p className="text-xs text-gray-500">Se desativado, os clientes não ganharão novos pontos.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Pontos por Real Gasto" />
                                            <div className="relative mt-1">
                                                <TextInput
                                                    type="number"
                                                    value={settingsData.points_per_currency}
                                                    onChange={(e) => setSettingsData('points_per_currency', parseFloat(e.target.value))}
                                                    className="w-full pr-12"
                                                    step="0.1"
                                                    min="0"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 text-sm">
                                                    pts/R$
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Ex: 1 ponto a cada R$ 1,00 gasto.</p>
                                        </div>

                                        <div>
                                            <InputLabel value="Valor de Resgate (Cashback)" />
                                            <div className="relative mt-1">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 text-sm">
                                                    R$
                                                </div>
                                                <TextInput
                                                    type="number"
                                                    value={settingsData.currency_per_point}
                                                    onChange={(e) => setSettingsData('currency_per_point', parseFloat(e.target.value))}
                                                    className="w-full pl-8 pr-16"
                                                    step="0.01"
                                                    min="0"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 text-sm">
                                                    /ponto
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Ex: Cada ponto vale R$ 0,10 de desconto.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <PrimaryButton disabled={processingSettings} className="gap-2">
                                            <Save className="h-4 w-4" />
                                            Salvar Alterações
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Adjust Points Modal */}
            <Modal show={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ajuste Manual de Pontos</h2>
                    <form onSubmit={submitAdjust} className="space-y-4">
                        <div>
                            <InputLabel value="Cliente" />
                            <select
                                value={adjustData.customer_id}
                                onChange={(e) => setAdjustData('customer_id', e.target.value)}
                                className="w-full mt-1 border-gray-300 dark:border-gray-700 dark:bg-[#2c2d30] dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                required
                            >
                                <option value="">Selecione um cliente...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.loyalty_points} pts currently)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Tipo de Operação" />
                            <div className="grid grid-cols-2 gap-4 mt-1">
                                <button
                                    type="button"
                                    onClick={() => setAdjustData('type', 'add')}
                                    className={clsx(
                                        "flex items-center justify-center gap-2 py-2 px-4 rounded-lg border font-medium transition-colors",
                                        adjustData.type === 'add'
                                            ? "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                                    )}
                                >
                                    <Plus className="h-4 w-4" /> Adicionar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAdjustData('type', 'remove')}
                                    className={clsx(
                                        "flex items-center justify-center gap-2 py-2 px-4 rounded-lg border font-medium transition-colors",
                                        adjustData.type === 'remove'
                                            ? "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                                    )}
                                >
                                    <ArrowUpRight className="h-4 w-4" /> Remover
                                </button>
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Quantidade de Pontos" />
                            <TextInput
                                type="number"
                                value={adjustData.points}
                                onChange={(e) => setAdjustData('points', e.target.value)}
                                className="w-full mt-1"
                                min="1"
                                required
                            />
                            {adjustErrors.points && <p className="text-red-500 text-xs mt-1">{adjustErrors.points}</p>}
                        </div>

                        <div>
                            <InputLabel value="Motivo / Descrição" />
                            <TextInput
                                type="text"
                                value={adjustData.description}
                                onChange={(e) => setAdjustData('description', e.target.value)}
                                className="w-full mt-1"
                                placeholder="Ex: Bônus de aniversário"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsAdjustModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Cancelar
                            </button>
                            <PrimaryButton disabled={processingAdjust}>Confirmar Ajuste</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
