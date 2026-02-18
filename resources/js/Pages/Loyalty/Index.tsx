import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Gift, Save, Plus, History, Settings, Users, ArrowUpRight, ArrowDownLeft, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton'; // Assuming we have this
import Modal from '@/Components/Modal';
import PageHeader from '@/Components/PageHeader';
import { Switch } from '@headlessui/react';

interface LoyaltyTier {
    name: string;
    min_points: number;
    multiplier: number;
}

interface Settings {
    id: string;
    loyalty_enabled: boolean;
    points_per_currency: number;
    currency_per_point: number;
    loyalty_tiers?: LoyaltyTier[];
    loyalty_expiry_days?: number;
    // Referral
    referral_enabled?: boolean;
    referral_referrer_points?: number;
    referral_referred_points?: number;
    referral_max_per_customer?: number;
    referral_min_order_value?: number;
    referral_code_expiry_days?: number;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    loyalty_points: number;
}

interface Referral {
    id: string;
    referrer: { name: string; phone: string };
    referred: { name: string; phone: string } | null;
    referral_code: string;
    status: 'pending' | 'completed' | 'fraud' | 'expired';
    referrer_points_awarded: number;
    referred_points_awarded: number;
    created_at: string;
    completed_at: string | null;
}

interface HistoryItem {
    id: string;
    points: number;
    type: 'earn' | 'redeem';
    description: string;
    created_at: string;
    customer: Customer;
}

export default function LoyaltyIndex({ settings, history, customers, referrals, referralStats }: { 
    settings: Settings, 
    history: HistoryItem[], 
    customers: Customer[],
    referrals?: { data: Referral[], links: any[] },
    referralStats?: { total: number, completed: number, pending: number, total_points_awarded: number }
}) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'referrals' | 'settings'>('dashboard');
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

    // Settings Form
    const { data: settingsData, setData: setSettingsData, post: postSettings, processing: processingSettings } = useForm({
        loyalty_enabled: settings?.loyalty_enabled ?? false,
        points_per_currency: settings?.points_per_currency ?? 1,
        currency_per_point: settings?.currency_per_point ?? 0.10,
        loyalty_expiry_days: settings?.loyalty_expiry_days ?? null,
        
        // Referral Settings
        referral_enabled: settings?.referral_enabled ?? false,
        referral_referrer_points: settings?.referral_referrer_points ?? 50,
        referral_referred_points: settings?.referral_referred_points ?? 20,
        referral_max_per_customer: settings?.referral_max_per_customer ?? 10,
        referral_min_order_value: settings?.referral_min_order_value ?? null,
        referral_code_expiry_days: settings?.referral_code_expiry_days ?? null,

        loyalty_tiers: settings?.loyalty_tiers ?? [
            { name: 'Bronze', min_points: 0, multiplier: 1.0 },
            { name: 'Prata', min_points: 100, multiplier: 1.05 },
            { name: 'Ouro', min_points: 500, multiplier: 1.10 },
            { name: 'Diamante', min_points: 1000, multiplier: 1.15 },
        ],
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

            <div className="flex h-full flex-col space-y-8">
                {/* Header */}
                <PageHeader
                    title="Programa de Fidelidade"
                    subtitle="Gerencie pontos, recompensas e configurações."
                    action={
                        activeTab === 'dashboard' ? (
                            <button
                                onClick={() => setIsAdjustModalOpen(true)}
                                className="flex items-center gap-2 rounded-2xl bg-[#ff3d03] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63700] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                            >
                                <Plus className="h-5 w-5" />
                                Ajuste Manual
                            </button>
                        ) : undefined
                    }
                />

                {/* Pill Tabs */}
                <div className="flex justify-center md:justify-start">
                    <nav className="flex items-center gap-1 bg-white dark:bg-[#1a1b1e] p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={clsx(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2",
                                activeTab === 'dashboard'
                                    ? "bg-[#ff3d03] text-white shadow-md shadow-[#ff3d03]/20"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                            )}
                        >
                            <History className="h-4 w-4" />
                            Visão Geral
                        </button>
                        <button
                            onClick={() => setActiveTab('referrals')}
                            className={clsx(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2",
                                activeTab === 'referrals'
                                    ? "bg-[#ff3d03] text-white shadow-md shadow-[#ff3d03]/20"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                            )}
                        >
                            <Users className="h-4 w-4" />
                            Indicações
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={clsx(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2",
                                activeTab === 'settings'
                                    ? "bg-[#ff3d03] text-white shadow-md shadow-[#ff3d03]/20"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
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
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Recent History Table */}
                            <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Últimas Movimentações</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-[#0f1012] text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">
                                            <tr>
                                                <th className="px-6 py-4 rounded-tl-[32px]">Cliente</th>
                                                <th className="px-6 py-4">Tipo</th>
                                                <th className="px-6 py-4">Pontos</th>
                                                <th className="px-6 py-4">Descrição</th>
                                                <th className="px-6 py-4 rounded-tr-[32px]">Data</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {history.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                        {item.customer.name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.type === 'earn' ? (
                                                            <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-lg text-xs font-bold border border-green-100 dark:border-green-500/20">
                                                                <ArrowDownLeft className="h-3 w-3" /> Acúmulo
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-lg text-xs font-bold border border-red-100 dark:border-red-500/20">
                                                                <ArrowUpRight className="h-3 w-3" /> Resgate
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={clsx("px-6 py-4 font-black text-lg", item.type === 'earn' ? "text-green-600" : "text-red-500")}>
                                                        {item.type === 'earn' ? '+' : '-'}{item.points}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                        {item.description}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400 dark:text-gray-500 text-xs font-medium">
                                                        {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                </tr>
                                            ))}
                                            {history.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center w-full">
                                                        <div className="h-16 w-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                                            <History className="h-8 w-8 text-gray-300" />
                                                        </div>
                                                        <p className="font-bold text-gray-900 dark:text-white">Nenhuma movimentação registrada.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'referrals' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Referral Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5">
                                    <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total de Indicações</h4>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{referralStats?.total ?? 0}</p>
                                </div>
                                <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5">
                                    <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Pendentes</h4>
                                    <p className="text-3xl font-black text-orange-500">{referralStats?.pending ?? 0}</p>
                                </div>
                                <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5">
                                    <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Convertidas</h4>
                                    <p className="text-3xl font-black text-green-500">{referralStats?.completed ?? 0}</p>
                                </div>
                                <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5">
                                    <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Pontos Distribuídos</h4>
                                    <p className="text-3xl font-black text-[#ff3d03]">{referralStats?.total_points_awarded ?? 0}</p>
                                </div>
                            </div>

                            {/* Referrals Table */}
                            <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Últimas Indicações</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-[#0f1012] text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">
                                            <tr>
                                                <th className="px-6 py-4 rounded-tl-[32px]">Padrinho (Indicou)</th>
                                                <th className="px-6 py-4">Indicado (Novo Cliente)</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Pontos (Padrinho)</th>
                                                <th className="px-6 py-4 rounded-tr-[32px]">Data</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {referrals?.data.map((referral) => (
                                                <tr key={referral.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                        {referral.referrer.name}
                                                        <span className="block text-xs text-gray-500 font-normal">{referral.referrer.phone}</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                        {referral.referred ? (
                                                            <>
                                                                {referral.referred.name}
                                                                <span className="block text-xs text-gray-500 font-normal">{referral.referred.phone}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Aguardando cadastro</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {referral.status === 'completed' && (
                                                            <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-lg text-xs font-bold border border-green-100 dark:border-green-500/20">
                                                                Concluída
                                                            </span>
                                                        )}
                                                        {referral.status === 'pending' && (
                                                            <span className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-lg text-xs font-bold border border-orange-100 dark:border-orange-500/20">
                                                                Pendente
                                                            </span>
                                                        )}
                                                        {(referral.status === 'fraud' || referral.status === 'expired') && (
                                                            <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-lg text-xs font-bold border border-red-100 dark:border-red-500/20">
                                                                {referral.status === 'fraud' ? 'Suspeita' : 'Expirada'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-black text-gray-900 dark:text-white">
                                                        {referral.referrer_points_awarded > 0 ? `+${referral.referrer_points_awarded}` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400 dark:text-gray-500 text-xs font-medium">
                                                        {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!referrals?.data || referrals.data.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">
                                                        <div className="h-16 w-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 mx-auto">
                                                            <Users className="h-8 w-8 text-gray-300" />
                                                        </div>
                                                        <p className="font-bold text-gray-900 dark:text-white">Nenhuma indicação encontrada.</p>
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
                        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <form onSubmit={submitSettings} className="space-y-6">
                                {/* Main Toggle */}
                                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 p-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-[#ff3d03]">
                                                <Gift className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Programa de Fidelidade</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Ative para permitir que seus clientes acumulem pontos.</p>
                                            </div>
                                        </div>

                                        <Switch
                                            checked={settingsData.loyalty_enabled}
                                            onChange={(checked) => setSettingsData('loyalty_enabled', checked)}
                                            className={`${settingsData.loyalty_enabled ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'
                                                } relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none`}
                                        >
                                            <span
                                                className={`${settingsData.loyalty_enabled ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                                            />
                                        </Switch>
                                    </div>
                                </div>

                                    {/* Rules Card */}
                                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 p-8">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Regras de Pontuação</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <InputLabel value="Pontos por Real Gasto" className="mb-2" />
                                            <div className="relative group">
                                                <TextInput
                                                    type="number"
                                                    value={settingsData.points_per_currency}
                                                    onChange={(e) => setSettingsData('points_per_currency', parseFloat(e.target.value))}
                                                    className="w-full pr-16 h-14 text-lg font-bold"
                                                    step="0.1"
                                                    min="0"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-bold bg-transparent">
                                                    pts / R$
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2 pl-1">Ex: O cliente ganha <strong className="text-gray-900 dark:text-white">1 ponto</strong> a cada R$ 1,00 gasto.</p>
                                        </div>

                                        <div>
                                            <InputLabel value="Valor do CashBack (Resgate)" className="mb-2" />
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 font-bold">
                                                    R$
                                                </div>
                                                <TextInput
                                                    type="number"
                                                    value={settingsData.currency_per_point}
                                                    onChange={(e) => setSettingsData('currency_per_point', parseFloat(e.target.value))}
                                                    className="w-full pl-10 pr-16 h-14 text-lg font-bold"
                                                    step="0.01"
                                                    min="0"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-bold">
                                                    / ponto
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2 pl-1">Ex: Cada ponto vale <strong className="text-gray-900 dark:text-white">R$ 0,10</strong> de desconto.</p>
                                        </div>
                                    </div>

                                    {/* Expiry & Referral */}
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-8 mb-6 pt-6 border-t border-gray-100 dark:border-white/5">
                                        Configuração de Indicações (Indique e Ganhe)
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="h-4 w-4 text-blue-500" />
                                                <InputLabel value="Pontos para quem INDICA (Padrinho)" />
                                            </div>
                                            <div className="relative group">
                                                <TextInput
                                                    type="number"
                                                    value={settingsData.referral_referrer_points}
                                                    onChange={(e) => setSettingsData('referral_referrer_points', parseInt(e.target.value) || 0)}
                                                    className="w-full pr-16 h-14 text-lg font-bold"
                                                    placeholder="50"
                                                    min="0"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-bold bg-transparent">
                                                    pts
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2 pl-1">Ganho pelo cliente que enviou o convite.</p>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Gift className="h-4 w-4 text-green-500" />
                                                <InputLabel value="Pontos para o INDICADO (Novo Cliente)" />
                                            </div>
                                            <div className="relative group">
                                                <TextInput
                                                    type="number"
                                                    value={settingsData.referral_referred_points}
                                                    onChange={(e) => setSettingsData('referral_referred_points', parseInt(e.target.value) || 0)}
                                                    className="w-full pr-16 h-14 text-lg font-bold"
                                                    placeholder="20"
                                                    min="0"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-bold bg-transparent">
                                                    pts
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2 pl-1">Ganho pelo novo cliente ao se cadastrar e comprar.</p>
                                        </div>

                                        <div>
                                            <InputLabel value="Máximo de Indicações por Cliente" className="mb-2" />
                                            <TextInput
                                                type="number"
                                                value={settingsData.referral_max_per_customer}
                                                onChange={(e) => setSettingsData('referral_max_per_customer', parseInt(e.target.value) || 10)}
                                                className="w-full h-14 text-lg font-bold"
                                                placeholder="10"
                                                min="1"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel value="Valor Mínimo do 1º Pedido" className="mb-2" />
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 font-bold">R$</div>
                                                <TextInput
                                                    type="number"
                                                    value={settingsData.referral_min_order_value ?? ''}
                                                    onChange={(e) => setSettingsData('referral_min_order_value', e.target.value ? parseFloat(e.target.value) : null)}
                                                    className="w-full pl-10 h-14 text-lg font-bold"
                                                    placeholder="Opcional"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2 pl-1">Mínimo gasto pelo indicado para validar a recompensa.</p>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <History className="h-4 w-4 text-orange-500" />
                                                <InputLabel value="Validade dos Pontos (Geral)" />
                                            </div>
                                            <div className="relative group">
                                                <TextInput
                                                    type="number"
                                                    value={settingsData.loyalty_expiry_days ?? ''}
                                                    onChange={(e) => setSettingsData('loyalty_expiry_days', e.target.value ? parseInt(e.target.value) : null)}
                                                    className="w-full pr-16 h-14 text-lg font-bold"
                                                    placeholder="Ex: 90"
                                                    min="1"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-bold bg-transparent">
                                                    dias
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2 pl-1">Deixe em branco para pontos nunca expirarem.</p>
                                        </div>
                                    </div>

                                    {/* Loyalty Tiers Configuration */}
                                    <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h4 className="text-base font-bold text-gray-900 dark:text-white">Níveis de Fidelidade (Ranking)</h4>
                                                <p className="text-sm text-gray-500">Defina os nomes e pontuações para cada nível.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentTiers = settingsData.loyalty_tiers || [];
                                                    setSettingsData('loyalty_tiers', [
                                                        ...currentTiers,
                                                        { name: 'Novo Nível', min_points: 0, multiplier: 1.0 }
                                                    ]);
                                                }}
                                                className="text-sm font-bold text-[#ff3d03] hover:text-[#e63700] flex items-center gap-1"
                                            >
                                                <Plus className="h-4 w-4" /> Adicionar Nível
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {settingsData.loyalty_tiers?.map((tier: any, index: number) => (
                                                <div key={index} className="flex gap-4 items-end bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 group">
                                                    <div className="flex-1">
                                                        <InputLabel value="Nome do Nível" className="mb-1 text-xs" />
                                                        <TextInput
                                                            value={tier.name}
                                                            onChange={(e) => {
                                                                const newTiers = [...settingsData.loyalty_tiers];
                                                                newTiers[index].name = e.target.value;
                                                                setSettingsData('loyalty_tiers', newTiers);
                                                            }}
                                                            className="w-full h-10 text-sm font-bold"
                                                            placeholder="Ex: Diamante"
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <InputLabel value="Min. Pontos" className="mb-1 text-xs" />
                                                        <TextInput
                                                            type="number"
                                                            value={tier.min_points}
                                                            onChange={(e) => {
                                                                const newTiers = [...settingsData.loyalty_tiers];
                                                                newTiers[index].min_points = parseInt(e.target.value) || 0;
                                                                setSettingsData('loyalty_tiers', newTiers);
                                                            }}
                                                            className="w-full h-10 text-sm font-bold"
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <InputLabel value="Multiplicador" className="mb-1 text-xs" />
                                                        <TextInput
                                                            type="number"
                                                            step="0.05"
                                                            value={tier.multiplier}
                                                            onChange={(e) => {
                                                                const newTiers = [...settingsData.loyalty_tiers];
                                                                newTiers[index].multiplier = parseFloat(e.target.value) || 1.0;
                                                                setSettingsData('loyalty_tiers', newTiers);
                                                            }}
                                                            className="w-full h-10 text-sm font-bold"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newTiers = settingsData.loyalty_tiers.filter((_, i) => i !== index);
                                                            setSettingsData('loyalty_tiers', newTiers);
                                                        }}
                                                        className="h-10 w-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!settingsData.loyalty_tiers || settingsData.loyalty_tiers.length === 0) && (
                                                <p className="text-center text-gray-500 py-4 italic">Nenhum nível configurado. Adicione um para começar.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <PrimaryButton disabled={processingSettings} className="h-12 px-8 rounded-xl bg-[#ff3d03] hover:bg-[#e63700] shadow-lg shadow-[#ff3d03]/20 border-transparent text-base font-bold">
                                        <Save className="h-5 w-5 mr-2" />
                                        Salvar Configurações
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Adjust Points Modal */}
            <Modal show={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Ajuste Manual de Pontos</h2>
                        <button onClick={() => setIsAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            {/* close icon */}
                        </button>
                    </div>

                    <form onSubmit={submitAdjust} className="space-y-6">
                        <div>
                            <InputLabel value="Cliente" />
                            <select
                                value={adjustData.customer_id}
                                onChange={(e) => setAdjustData('customer_id', e.target.value)}
                                className="w-full mt-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f1012] text-gray-900 dark:text-white focus:border-[#ff3d03] focus:ring-[#ff3d03] rounded-xl h-12 shadow-sm"
                                required
                            >
                                <option value="">Selecione um cliente...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.loyalty_points} pts atuais)
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
                                        "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold transition-all relative overflow-hidden",
                                        adjustData.type === 'add'
                                            ? "bg-green-500 text-white border-green-500 shadow-md transform scale-[1.02]"
                                            : "border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-white/5 dark:text-gray-400"
                                    )}
                                >
                                    <Plus className="h-5 w-5" /> Adicionar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAdjustData('type', 'remove')}
                                    className={clsx(
                                        "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold transition-all relative overflow-hidden",
                                        adjustData.type === 'remove'
                                            ? "bg-red-500 text-white border-red-500 shadow-md transform scale-[1.02]"
                                            : "border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-white/5 dark:text-gray-400"
                                    )}
                                >
                                    <ArrowUpRight className="h-5 w-5" /> Remover
                                </button>
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Quantidade de Pontos" />
                            <TextInput
                                type="number"
                                value={adjustData.points}
                                onChange={(e) => setAdjustData('points', e.target.value)}
                                className="w-full mt-1 h-12 font-bold text-lg"
                                min="1"
                                placeholder="0"
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
                                className="w-full mt-1 h-12"
                                placeholder="Ex: Bônus de aniversário"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-white/5">
                            <SecondaryButton onClick={() => setIsAdjustModalOpen(false)} className="h-12 px-6 rounded-xl">
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton disabled={processingAdjust} className="h-12 px-6 rounded-xl bg-[#ff3d03] hover:bg-[#e63700] border-transparent shadow-lg shadow-[#ff3d03]/20">
                                Confirmar Ajuste
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
