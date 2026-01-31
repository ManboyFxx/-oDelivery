import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Download,
    RefreshCw
} from 'lucide-react';

interface SecurityLog {
    id: string;
    event_type: string;
    user_email: string;
    ip_address: string;
    user_agent: string;
    status: 'success' | 'failed' | 'blocked';
    created_at: string;
}

interface Props {
    logs: {
        data: SecurityLog[];
        links: any[];
    };
}

export default function SecurityLogs({ logs }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <span className="px-3 py-1 rounded-lg bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-xs font-bold flex items-center gap-1.5 w-fit">
                        <CheckCircle className="h-3 w-3" />
                        Sucesso
                    </span>
                );
            case 'failed':
                return (
                    <span className="px-3 py-1 rounded-lg bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 w-fit">
                        <XCircle className="h-3 w-3" />
                        Falhou
                    </span>
                );
            case 'blocked':
                return (
                    <span className="px-3 py-1 rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 text-xs font-bold flex items-center gap-1.5 w-fit">
                        <AlertTriangle className="h-3 w-3" />
                        Bloqueado
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Logs de Segurança" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#ff3d03]/10 text-[#ff3d03] text-[10px] font-bold uppercase tracking-wider">
                                Sistema
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Logs de Segurança</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monitore tentativas de acesso e eventos de segurança</p>
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

                {/* Filters */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[24px] p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por IP, email ou evento..."
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
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Evento</th>
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Usuário</th>
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">IP</th>
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Data/Hora</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center">
                                            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p className="font-bold text-gray-500">Nenhum log de segurança encontrado.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                        <Shield className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{log.event_type}</p>
                                                        <p className="text-xs text-gray-500 truncate max-w-xs">{log.user_agent}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">{log.user_email || 'N/A'}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                <code className="px-2 py-1 rounded bg-gray-100 dark:bg-white/5 text-xs font-mono text-gray-700 dark:text-gray-300">
                                                    {log.ip_address}
                                                </code>
                                            </td>
                                            <td className="py-5 px-6">
                                                {getStatusBadge(log.status)}
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
