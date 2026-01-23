import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, Plus, Pencil, Phone } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    orders_count: number;
}

export default function CustomerIndex({ customers }: { customers: { data: Customer[] } }) {
    return (
        <AuthenticatedLayout>
            <Head title="Clientes" />
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-6 w-6 text-[var(--color-primary)]" />
                    Clientes
                </h2>
                <Link
                    href={route('customers.create')}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Novo Cliente
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Contato</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Pedidos</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {customers.data.map((customer) => (
                            <tr key={customer.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Phone className="h-3 w-3" /> {customer.phone}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                        {customer.orders_count} pedidos
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={route('customers.edit', customer.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {customers.data.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        Nenhum cliente cadastrado.
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
