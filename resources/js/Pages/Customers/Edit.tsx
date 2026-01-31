import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { User, Phone, Mail, MapPin, Receipt, History, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Address {
    id: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    zip_code: string;
    is_default: boolean;
}

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string;
    items: OrderItem[];
}

interface LoyaltyHistory {
    id: string;
    points: number;
    type: 'earn' | 'redeem';
    description: string;
    created_at: string;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    address?: string; // Legacy field
    orders: Order[];
    loyalty_history: LoyaltyHistory[];
    addresses: Address[];
    loyalty_points: number;
}

export default function CustomerEdit({ customer }: { customer: Customer }) {
    const [activeTab, setActiveTab] = useState<'details' | 'addresses' | 'orders' | 'loyalty'>('details');

    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('customers.update', customer.id));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar Cliente - ${customer.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="h-6 w-6 text-[#ff3d03]" />
                            {customer.name}
                        </h2>
                        <p className="text-gray-500 text-sm">Gerenciamento completo do cliente</p>
                    </div>
                    <Link
                        href={route('customers.index')}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1 text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" /> Voltar
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <nav className="flex flex-col">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2",
                                        activeTab === 'details'
                                            ? "bg-[#ff3d03]/10 text-[#ff3d03] border-[#ff3d03] dark:bg-[#ff3d03] dark:text-white dark:border-[#ff3d03]"
                                            : "text-gray-600 border-transparent hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <User className="h-4 w-4" /> Dados Pessoais
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2",
                                        activeTab === 'addresses'
                                            ? "bg-[#ff3d03]/10 text-[#ff3d03] border-[#ff3d03] dark:bg-[#ff3d03] dark:text-white dark:border-[#ff3d03]"
                                            : "text-gray-600 border-transparent hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <MapPin className="h-4 w-4" /> Endereços
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2",
                                        activeTab === 'orders'
                                            ? "bg-[#ff3d03]/10 text-[#ff3d03] border-[#ff3d03] dark:bg-[#ff3d03] dark:text-white dark:border-[#ff3d03]"
                                            : "text-gray-600 border-transparent hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <Receipt className="h-4 w-4" /> Histórico de Pedidos
                                </button>
                                <button
                                    onClick={() => setActiveTab('loyalty')}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2",
                                        activeTab === 'loyalty'
                                            ? "bg-[#ff3d03]/10 text-[#ff3d03] border-[#ff3d03] dark:bg-[#ff3d03] dark:text-white dark:border-[#ff3d03]"
                                            : "text-gray-600 border-transparent hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <History className="h-4 w-4" /> Fidelidade ({customer.loyalty_points} pts)
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                            {activeTab === 'details' && (
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Nome Completo" />
                                            <TextInput
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className="w-full mt-1"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <InputLabel value="Telefone (WhatsApp)" />
                                            <div className="relative mt-1">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <TextInput
                                                    value={data.phone}
                                                    onChange={e => setData('phone', e.target.value)}
                                                    className="w-full pl-9"
                                                    required
                                                />
                                            </div>
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel value="Email (Opcional)" />
                                            <div className="relative mt-1">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <TextInput
                                                    type="email"
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    className="w-full pl-9"
                                                />
                                            </div>
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel value="Endereço Principal (Legado)" />
                                            <TextInput
                                                value={data.address}
                                                onChange={e => setData('address', e.target.value)}
                                                className="w-full mt-1"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Este campo é mantido para compatibilidade. Use a aba "Endereços" para gestão completa.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <PrimaryButton disabled={processing} className="gap-2">
                                            <Save className="h-4 w-4" /> Salvar Alterações
                                        </PrimaryButton>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'addresses' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold dark:text-white">Endereços Cadastrados</h3>
                                        <p className="text-sm text-gray-500">Gestão de múltiplos endereços (Em breve)</p>
                                    </div>

                                    {customer.addresses && customer.addresses.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {customer.addresses.map(addr => (
                                                <div key={addr.id} className="border dark:border-gray-700 rounded-lg p-4 relative">
                                                    {addr.is_default && (
                                                        <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full dark:bg-green-900/20 dark:text-green-400">Padrão</span>
                                                    )}
                                                    <p className="font-bold dark:text-white">{addr.street}, {addr.number}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{addr.neighborhood} - {addr.city}</p>
                                                    <p className="text-xs text-gray-500 mt-1">CEP: {addr.zip_code}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500">Nenhum endereço estruturado cadastrado.</p>
                                            <p className="text-sm text-gray-400">O cliente pode apenas ter o endereço legado.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold dark:text-white mb-4">Histórico de Pedidos</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-2">ID</th>
                                                    <th className="px-4 py-2">Data</th>
                                                    <th className="px-4 py-2">Status</th>
                                                    <th className="px-4 py-2">Total</th>
                                                    <th className="px-4 py-2">Itens</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {customer.orders && customer.orders.length > 0 ? (
                                                    customer.orders.map(order => (
                                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id.substring(0, 8)}</td>
                                                            <td className="px-4 py-3 dark:text-gray-300">{formatDate(order.created_at)}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={clsx(
                                                                    "px-2 py-1 rounded-full text-xs font-bold capitalize",
                                                                    order.status === 'completed' ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                                                                        order.status === 'cancelled' ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" :
                                                                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                                )}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 font-bold dark:text-white">{formatCurrency(order.total)}</td>
                                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                                                {order.items.map(item => `${item.quantity}x ${item.product_name}`).join(', ')}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum pedido realizado.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'loyalty' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold dark:text-white">Extrato de Pontos</h3>
                                        <div className="bg-[#ff3d03]/10 text-[#ff3d03] px-3 py-1 rounded-full font-bold text-sm">
                                            Saldo Atual: {customer.loyalty_points} pts
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-2">Data</th>
                                                    <th className="px-4 py-2">Descrição</th>
                                                    <th className="px-4 py-2 text-right">Pontos</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {customer.loyalty_history && customer.loyalty_history.length > 0 ? (
                                                    customer.loyalty_history.map(hist => (
                                                        <tr key={hist.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                            <td className="px-4 py-3 dark:text-gray-300">{formatDate(hist.created_at)}</td>
                                                            <td className="px-4 py-3 dark:text-gray-300">{hist.description}</td>
                                                            <td className={clsx("px-4 py-3 text-right font-bold", hist.type === 'earn' ? "text-green-600" : "text-red-600")}>
                                                                {hist.type === 'earn' ? '+' : '-'}{hist.points}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">Nenhuma movimentação de pontos.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                        <Link href={route('loyalty.index')} className="text-[#ff3d03] text-sm hover:underline font-medium">
                                            Gerenciar/Ajustar Pontos &rarr;
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
