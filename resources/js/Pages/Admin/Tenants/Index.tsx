import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Store, MoreHorizontal, Search, Filter, ShieldCheck, AlertCircle } from 'lucide-react';
import { useState } from 'react';

// ... (metrics interface)

interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: string;
    is_active: boolean;
    created_at: string;
}

interface IndexProps {
    tenants: {
        data: Tenant[];
        links: any[];
    };
    metrics: any;
}

export default function AdminTenantIndex({ tenants, metrics }: IndexProps) {
    const [search, setSearch] = useState('');

    return (
        <AuthenticatedLayout>
            <Head title="Gerenciar Lojas" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Lojas</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Gerenciamento de assinantes</p>
                    </div>
                    <Link
                        href={route('admin.tenants.create')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ff3d03] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63700] transition-colors"
                    >
                        <Store className="w-4 h-4" />
                        Nova Loja
                    </Link>
                </div>

                {/* Tenants Table */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5">
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase">Loja</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase">Plano</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.data.map((tenant) => (
                                    <tr key={tenant.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold">
                                                    {tenant.slug.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{tenant.name}</p>
                                                    <p className="text-xs text-gray-500">/{tenant.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-bold">
                                                {tenant.plan}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${tenant.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {tenant.is_active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <Link
                                                href={route('admin.tenants.edit', tenant.id)}
                                                className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold hover:opacity-90"
                                            >
                                                Editar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
