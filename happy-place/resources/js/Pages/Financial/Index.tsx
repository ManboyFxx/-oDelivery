import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Add router import
import { BarChart3, Calendar, DollarSign, TrendingUp, CreditCard, Banknote, QrCode } from 'lucide-react';
import { useMemo } from 'react';
import { clsx } from 'clsx';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

interface Summary {
    revenue: number;
    orders: number;
    average_ticket: number;
}

interface DailyData {
    date: string;
    revenue: number;
    count: number;
}

interface PaymentMethod {
    payment_method: string;
    count: number;
    total: number;
}

export default function FinancialIndex({ filters, summary, daily_data, payment_methods }: { filters: { start_date: string, end_date: string }, summary: Summary, daily_data: DailyData[], payment_methods: PaymentMethod[] }) {

    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
    });

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('financial.index'));
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Financeiro" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="text-[#ff3d03]" />
                            Relatório Financeiro
                        </h2>
                        <p className="text-sm text-gray-500">Acompanhe o desempenho do seu negócio</p>
                    </div>

                    <form onSubmit={submitFilters} className="flex items-end gap-2 bg-white dark:bg-[#1a1b1e] p-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div>
                            <InputLabel value="Data Início" className="text-xs mb-1" />
                            <TextInput
                                type="date"
                                value={data.start_date}
                                onChange={e => setData('start_date', e.target.value)}
                                className="py-1 text-sm w-36"
                            />
                        </div>
                        <div>
                            <InputLabel value="Data Fim" className="text-xs mb-1" />
                            <TextInput
                                type="date"
                                value={data.end_date}
                                onChange={e => setData('end_date', e.target.value)}
                                className="py-1 text-sm w-36"
                            />
                        </div>
                        <PrimaryButton disabled={processing} className="h-[34px] px-3">
                            Filtrar
                        </PrimaryButton>
                    </form>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <DollarSign className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Faturamento Total</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.revenue)}</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <TrendingUp className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Pedidos</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{summary.orders}</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket Médio</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.average_ticket)}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Daily Chart (Simulated with Bars) */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#1a1b1e] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <h3 className="font-bold text-lg mb-6 dark:text-white">Faturamento Diário</h3>
                        <div className="h-64 flex items-end gap-2">
                            {daily_data.length === 0 ? (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    Sem dados para o período.
                                </div>
                            ) : (
                                daily_data.map((day) => {
                                    // Scale height based on max revenue in the set
                                    const maxRevenue = Math.max(...daily_data.map(d => d.revenue));
                                    const heightPercentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

                                    return (
                                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity">
                                                {new Date(day.date).toLocaleDateString('pt-BR')}: {formatCurrency(day.revenue)}
                                            </div>

                                            <div
                                                className="w-full bg-[#ff3d03]/80 hover:bg-[#ff3d03] rounded-t-sm transition-all dark:bg-[#ff3d03]/60 dark:hover:bg-[#ff3d03]"
                                                style={{ height: `${Math.max(4, heightPercentage)}%` }}
                                            ></div>
                                            <span className="text-[10px] text-gray-500 rotate-0 truncate w-full text-center">
                                                {new Date(day.date).getDate()}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white dark:bg-[#1a1b1e] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <h3 className="font-bold text-lg mb-6 dark:text-white">Métodos de Pagamento</h3>
                        <div className="space-y-4">
                            {payment_methods.map((method) => (
                                <div key={method.payment_method} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#2c2d30] rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {method.payment_method === 'credit_card' && <CreditCard className="h-5 w-5 text-blue-500" />}
                                        {method.payment_method === 'money' || method.payment_method === 'cash' && <Banknote className="h-5 w-5 text-green-500" />}
                                        {method.payment_method === 'pix' && <QrCode className="h-5 w-5 text-teal-500" />}
                                        <div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-white capitalize">
                                                {method.payment_method === 'credit_card' ? 'Cartão' :
                                                    method.payment_method === 'pix' ? 'Pix' : 'Dinheiro'}
                                            </p>
                                            <p className="text-xs text-gray-500">{method.count} pedidos</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                                        {formatCurrency(method.total)}
                                    </span>
                                </div>
                            ))}
                            {payment_methods.length === 0 && (
                                <p className="text-center text-gray-500 text-sm py-4">Sem dados de pagamento.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
