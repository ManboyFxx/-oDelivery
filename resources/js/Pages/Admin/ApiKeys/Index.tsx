import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Key,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Shield,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface Credential {
    id: string;
    tenant_id: string | null;
    tenant_name: string;
    service: string;
    key_name: string;
    is_active: boolean;
    last_used_at: string | null;
    created_at: string;
}

interface Tenant {
    id: string;
    name: string;
}

interface Props {
    credentials: Credential[];
    tenants: Tenant[];
}

export default function ApiKeysIndex({ credentials, tenants }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewingKey, setViewingKey] = useState<string | null>(null);
    const [decryptedValue, setDecryptedValue] = useState<string>('');

    const { data, setData, post, processing, reset } = useForm({
        tenant_id: '',
        service: 'evolution',
        key_name: '',
        value: '',
        is_active: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.api-keys.store'), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            }
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja remover esta credencial? Esta ação não pode ser desfeita.')) {
            router.delete(route('admin.api-keys.destroy', id));
        }
    };

    const viewKey = async (id: string) => {
        try {
            const response = await fetch(route('admin.api-keys.show', id));
            const data = await response.json();
            setDecryptedValue(data.decrypted_value);
            setViewingKey(id);
        } catch (error) {
            console.error('Failed to fetch key:', error);
        }
    };

    const getServiceBadge = (service: string) => {
        const colors: Record<string, string> = {
            evolution: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
            mercadopago: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
            mapbox: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
        };

        return (
            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${colors[service] || 'bg-gray-50 text-gray-700'}`}>
                {service}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="API Keys" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#ff3d03]/10 text-[#ff3d03] text-[10px] font-bold uppercase tracking-wider">
                                Sistema
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Credenciais de API</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Gerencie as credenciais de serviços externos</p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#ff3d03] hover:bg-[#e03603] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#ff3d03]/30 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Credencial
                    </button>
                </div>

                {/* Security Notice */}
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-[24px] p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-800/30 rounded-xl text-orange-600 dark:text-orange-400">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-1">Importante: Segurança das Credenciais</h4>
                            <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                                Todas as credenciais são armazenadas de forma criptografada. Mantenha-as seguras e não as compartilhe publicamente.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Credentials Table */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                    {credentials.length === 0 ? (
                        <div className="py-16 text-center">
                            <Key className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Nenhuma credencial cadastrada</h3>
                            <p className="text-gray-500 mb-6">Adicione credenciais para integrar serviços externos.</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff3d03] hover:bg-[#e03603] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#ff3d03]/30 transition-all"
                            >
                                <Plus className="h-4 w-4" />
                                Adicionar Primeira Credencial
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                                        <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Serviço</th>
                                        <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</th>
                                        <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Tenant</th>
                                        <th className="text-left py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {credentials.map((credential) => (
                                        <tr key={credential.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-5 px-6">
                                                {getServiceBadge(credential.service)}
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                        <Key className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{credential.key_name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {credential.last_used_at ? `Usado ${credential.last_used_at}` : 'Nunca usado'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{credential.tenant_name}</p>
                                            </td>
                                            <td className="py-5 px-6">
                                                {credential.is_active ? (
                                                    <span className="px-3 py-1 rounded-lg bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-xs font-bold flex items-center gap-1.5 w-fit">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Ativo
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-lg bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 text-xs font-bold flex items-center gap-1.5 w-fit">
                                                        <XCircle className="h-3 w-3" />
                                                        Inativo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => viewKey(credential.id)}
                                                        className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        title="Ver Credencial"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(credential.id)}
                                                        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                        title="Remover"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-2xl max-w-md w-full p-8">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Nova Credencial</h3>
                        <p className="text-sm text-gray-500 mb-6">Adicione uma credencial de serviço externo.</p>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Serviço</label>
                                <select
                                    value={data.service}
                                    onChange={(e) => setData('service', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ff3d03]/30 focus:ring focus:ring-[#ff3d03]/10 text-sm font-medium"
                                >
                                    <option value="evolution">Evolution API</option>
                                    <option value="mercadopago">Mercado Pago</option>
                                    <option value="mapbox">Mapbox</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tenant (Opcional)</label>
                                <select
                                    value={data.tenant_id}
                                    onChange={(e) => setData('tenant_id', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ff3d03]/30 focus:ring focus:ring-[#ff3d03]/10 text-sm font-medium"
                                >
                                    <option value="">Global</option>
                                    {tenants.map((tenant) => (
                                        <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome da Chave</label>
                                <input
                                    type="text"
                                    value={data.key_name}
                                    onChange={(e) => setData('key_name', e.target.value)}
                                    placeholder="Ex: API Key Principal"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ff3d03]/30 focus:ring focus:ring-[#ff3d03]/10 text-sm font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Valor da Credencial</label>
                                <input
                                    type="password"
                                    value={data.value}
                                    onChange={(e) => setData('value', e.target.value)}
                                    placeholder="Cole a chave aqui"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#ff3d03]/30 focus:ring focus:ring-[#ff3d03]/10 text-sm font-medium font-mono"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        reset();
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-3 bg-[#ff3d03] hover:bg-[#e03603] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#ff3d03]/30 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Criando...' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Key Modal */}
            {viewingKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-2xl max-w-md w-full p-8">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Credencial Descriptografada</h3>

                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10 mb-6">
                            <code className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">{decryptedValue}</code>
                        </div>

                        <button
                            onClick={() => {
                                setViewingKey(null);
                                setDecryptedValue('');
                            }}
                            className="w-full px-4 py-3 bg-[#ff3d03] hover:bg-[#e03603] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#ff3d03]/30 transition-all"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
