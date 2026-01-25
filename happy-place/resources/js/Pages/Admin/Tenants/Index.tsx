import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Store,
    Search,
    MoreHorizontal,
    Ban,
    CheckCircle,
    Globe,
    ExternalLink,
    Filter
} from 'lucide-react';
import { useState } from 'react';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    plan: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    tenants: {
        data: Tenant[];
        links: any[];
    };
    filters: {
        search: string;
    };
}

export default function AdminTenantsIndex({ tenants, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.tenants.index'), { search }, { preserveState: true });
    };

    const toggleStatus = (tenant: Tenant) => {
        if (confirm(`Tem certeza que deseja ${tenant.is_active ? 'suspender' : 'reativar'} esta loja?`)) {
            const routeName = tenant.is_active ? 'admin.tenants.suspend' : 'admin.tenants.restore';
            router.post(route(routeName, tenant.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gerenciar Lojas" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#ff3d03]/10 text-[#ff3d03] text-[10px] font-bold uppercase tracking-wider">
                                Administração
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Gerenciar Lojas</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Visualize e gerencie todos os tenants da plataforma</p>
                    </div>

                    <div className="flex gap-3">
                        {/* Add "New Tenant" button manually if needed later */}
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[24px] p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nome, link ou email..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-[#ff3d03]/30 focus:ring focus:ring-[#ff3d03]/10 text-sm font-bold transition-all"
                        />
                    </form>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors">
                            <Filter className="h-4 w-4" />
                            Status: Todos
                        </button>
                    </div>
                </div>

                {/* Tenants List */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Loja</th>
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Contato</th>
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Plano</th>
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-right py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {tenants.data.map((tenant) => (
                                    <tr key={tenant.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-[#ff3d03]/10 text-[#ff3d03] flex items-center justify-center font-black text-lg">
                                                    {tenant.name.substring(0, 1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-base">{tenant.name}</p>
                                                    <a href={`/${tenant.slug}/menu`} target="_blank" className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#ff3d03] transition-colors">
                                                        <Globe className="h-3 w-3" />
                                                        /{tenant.slug}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="text-sm">
                                                <p className="font-bold text-gray-700 dark:text-gray-300">{tenant.email}</p>
                                                <p className="text-gray-500 text-xs">{tenant.phone}</p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-bold uppercase tracking-wide">
                                                {tenant.plan}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            {tenant.is_active ? (
                                                <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-xs font-bold flex items-center gap-1.5 w-fit">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 w-fit">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                                    Suspenso
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleStatus(tenant)}
                                                    className={`p-2 rounded-xl transition-colors ${tenant.is_active
                                                            ? 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                                                            : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                                                        }`}
                                                    title={tenant.is_active ? "Suspender Loja" : "Reativar Loja"}
                                                >
                                                    {tenant.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                </button>
                                                <Link
                                                    href={route('admin.tenants.metrics', tenant.id)}
                                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                                    title="Ver Métricas"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {tenants.data.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-bold">Nenhuma loja encontrada.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
