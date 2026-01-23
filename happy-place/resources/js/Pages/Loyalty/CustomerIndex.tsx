import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Gift, ArrowUpRight, ArrowDownLeft, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import PrimaryButton from '@/Components/PrimaryButton';

interface Settings {
    loyalty_enabled: boolean;
    points_per_currency: number;
    currency_per_point: number;
}

interface Customer {
    id: string;
    name: string;
    loyalty_points: number;
}

interface HistoryItem {
    id: string;
    points: number;
    type: 'earn' | 'redeem';
    description: string;
    created_at: string;
}

interface PageProps {
    settings: Settings;
    customer: Customer;
    history: {
        data: HistoryItem[];
        links: any[]; // Pagination links
    };
}

export default function CustomerIndex({ settings, customer, history }: PageProps) {
    const potentialValue = (customer.loyalty_points * settings.currency_per_point).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Meus Pontos</h2>}
        >
            <Head title="Meus Pontos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Hero / Balance Card */}
                    <div className="bg-gradient-to-r from-[#ff3d03] to-[#ff6b00] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Gift size={200} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-lg font-medium opacity-90 mb-1">Seu Saldo Atual</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-bold tracking-tight">{customer.loyalty_points}</span>
                                <span className="text-xl opacity-90">pontos</span>
                            </div>

                            {settings.loyalty_enabled && (
                                <div className="mt-4 pt-4 border-t border-white/20 inline-flex flex-col">
                                    <span className="text-sm opacity-90">Valor estimado para resgate:</span>
                                    <span className="text-2xl font-bold">{potentialValue}</span>
                                </div>
                            )}

                            {!settings.loyalty_enabled && (
                                <div className="mt-4 bg-white/20 backdrop-blur-sm p-3 rounded-lg inline-block">
                                    <p className="text-sm font-medium">O programa de fidelidade está temporariamente pausado.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* How it works (Optional, keeps UI rich) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                    <ArrowDownLeft className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Como Ganhar</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Ganhe <span className="font-bold text-[#ff3d03]">{settings.points_per_currency} ponto(s)</span> a cada <span className="font-bold">R$ 1,00</span> em compras confirmadas no aplicativo.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                                    <ArrowUpRight className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Como Usar</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Seus pontos valem desconto! Cada ponto equivale a <span className="font-bold text-[#ff3d03]">{settings.currency_per_point.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> para abater na sua conta.
                            </p>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-white dark:bg-[#1a1b1e] shadow-sm sm:rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Trophy className="text-yellow-500 h-5 w-5" />
                                Histórico de Movimentações
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-[#2c2d30] text-gray-500 dark:text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Data</th>
                                        <th className="px-6 py-3">Descrição</th>
                                        <th className="px-6 py-3 text-right">Pontos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {history.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#2c2d30]/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString('pt-BR')} <span className="text-xs ml-1">{new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {item.description}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={clsx(
                                                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                                                    item.type === 'earn'
                                                        ? "text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                                                        : "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                                                )}>
                                                    {item.type === 'earn' ? '+' : '-'}{item.points}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.data.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Você ainda não tem movimentações registradas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Simple Pagination if needed later, usually inertia Link elements */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
