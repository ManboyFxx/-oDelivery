import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Users, Plus, Pencil, Phone, Search, Mail, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/Components/PageHeader';
import PrimaryButton from '@/Components/PrimaryButton';

interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    orders_count: number;
}

export default function CustomerIndex({ customers }: { customers: { data: Customer[] } }) {
    const [search, setSearch] = useState('');

    const filteredCustomers = customers.data.filter(customer =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search) ||
        (customer.email && customer.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AuthenticatedLayout>
            <Head title="Clientes" />

            <div className="flex h-full flex-col space-y-8">
                {/* Page Header */}
                <PageHeader
                    title="Clientes"
                    subtitle="Gerencie sua base de clientes."
                    action={
                        <Link
                            href={route('customers.create')}
                            className="flex items-center gap-2 rounded-2xl bg-[#ff3d03] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63700] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                        >
                            <Plus className="h-5 w-5" />
                            Novo Cliente
                        </Link>
                    }
                />

                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nome, telefone ou email..."
                            className="w-full h-11 rounded-2xl border border-gray-200 bg-white pl-11 shadow-sm focus:border-[#ff3d03] focus:ring-[#ff3d03]/20 dark:border-white/5 dark:bg-[#0f1012] transition-all"
                        />
                    </div>
                </div>

                {/* Customers Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="group relative bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">

                            {/* Avatar Area */}
                            <div className="h-24 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/5 flex items-center justify-center relative">
                                <div className="h-16 w-16 rounded-2xl bg-white dark:bg-[#0f1012] shadow-sm flex items-center justify-center text-2xl font-black text-[#ff3d03]">
                                    {customer.name.substring(0, 1).toUpperCase()}
                                </div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={route('customers.edit', customer.id)}
                                        className="p-2 bg-white/90 dark:bg-black/60 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#ff3d03] transition-colors block shadow-sm backdrop-blur-sm"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1 mb-1" title={customer.name}>
                                    {customer.name}
                                </h3>

                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="truncate">{customer.phone}</span>
                                    </div>
                                    {customer.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span className="truncate" title={customer.email}>{customer.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-[#ff3d03] text-xs font-bold">
                                        <ShoppingBag className="h-3.5 w-3.5" />
                                        {customer.orders_count} pedidos
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0f1012] rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800">
                        <div className="h-16 w-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Users className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nenhum cliente encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tente buscar por outro termo.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
