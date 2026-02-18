import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    FileText,
    Search,
    Filter,
    Download,
    RefreshCw,
    Activity,
    Users,
    TrendingUp
} from 'lucide-react';

interface AuditLog {
    id: string;
    action: string;
    model_type: string;
    model_id: string;
    user: {
        name: string;
        email: string;
    };
    old_values: any;
    new_values: any;
    created_at: string;
}

interface Props {
    logs: {
        data: AuditLog[];
        links: any[];
    };
    stats: {
        total_actions: number;
        today_actions: number;
        unique_users: number;
    };
}

export default function AuditLogs({ logs, stats }: Props) {
    const getActionBadge = (action: string) => {
        const colors: Record<string, string> = {
            created: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
            updated: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
            deleted: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
        };

        return (
            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${colors[action] || 'bg-gray-50 text-gray-700'}`}>
                {action}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Logs de Auditoria" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#ff3d03]/10 text-[#ff3d03] text-[10px] font-bold uppercase tracking-wider">
                                Sistema
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Logs de Auditoria</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Rastreie todas as alterações feitas no sistema</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1b1e] hover:bg-gray-50 dark:hover:bg-[#25262b] rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-white/5 shadow-sm">
                            <RefreshCw className="h-4 w-4" />
                            Atualizar
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#ff3d03] hover:bg-[#e03603] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#ff3d03]/30 transition-all">
                            <Download className="h-4 w-4" />
                            Exportar
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#1a1b1e] rounded-[24px] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total de Ações</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.total_actions.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1b1e] rounded-[24px] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600 dark:text-green-400">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hoje</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.today_actions.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1b1e] rounded-[24px] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Usuários Ativos</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.unique_users.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[24px] p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por ação, modelo ou usuário..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-[#ff3d03]/30 focus:ring focus:ring-[#ff3d03]/10 text-sm font-bold transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors">
                            <Filter className="h-4 w-4" />
                            Filtros
                        </button>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Ação</th>
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Modelo</th>
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Usuário</th>
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Data/Hora</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center">
                                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p className="font-bold text-gray-500">Nenhum log de auditoria encontrado.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-5 px-6">
                                                {getActionBadge(log.action)}
                                            </td>
                                            <td className="py-5 px-6">
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{log.model_type}</p>
                                                    <p className="text-xs text-gray-500">ID: {log.model_id}</p>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div>
                                                    <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">{log.user?.name || 'Sistema'}</p>
                                                    <p className="text-xs text-gray-500">{log.user?.email || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{log.created_at}</p>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
