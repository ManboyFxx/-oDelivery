import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Smartphone, QrCode, Wifi, WifiOff, Trash2, RefreshCw, X } from 'lucide-react';

interface WhatsAppInstance {
    id: string;
    instance_name: string;
    phone_number: string | null;
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    qr_code: string | null;
    last_connected_at: string | null;
}

export default function WhatsAppInstances({ instances: initialInstances }: { instances: WhatsAppInstance[] }) {
    const [instances, setInstances] = useState<WhatsAppInstance[]>(initialInstances);
    const [newInstanceName, setNewInstanceName] = useState('');
    const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createInstance = async () => {
        if (!newInstanceName.trim()) return;

        setLoading(true);
        setError(null);

        try {
            router.post(route('whatsapp.instances.store'), {
                instance_name: newInstanceName,
            }, {
                onSuccess: () => {
                    setNewInstanceName('');
                    // Reload instances
                    setTimeout(() => window.location.reload(), 500);
                },
                onError: (errors: any) => {
                    setError(errors.error || 'Erro ao criar instância');
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const loadQrCode = async (instance: WhatsAppInstance) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(route('whatsapp.instances.qrcode', instance.id));
            const data = await response.json();

            if (response.ok) {
                setQrCode(data.qr_code);
                setSelectedInstance(instance);
            } else {
                setError(data.error || 'QR Code não disponível');
            }
        } catch (err) {
            setError('Erro ao carregar QR Code');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async (instance: WhatsAppInstance) => {
        try {
            const response = await fetch(route('whatsapp.instances.status', instance.id));
            const data = await response.json();

            if (response.ok) {
                // Update instance in local state
                setInstances(instances.map(i =>
                    i.id === instance.id
                        ? { ...i, status: data.status, phone_number: data.phone_number }
                        : i
                ));
            }
        } catch (err) {
            console.error('Erro ao verificar status:', err);
        }
    };

    const deleteInstance = (instance: WhatsAppInstance) => {
        if (confirm(`Deseja realmente remover a instância "${instance.instance_name}"?`)) {
            router.delete(route('whatsapp.instances.destroy', instance.id), {
                onSuccess: () => {
                    setInstances(instances.filter(i => i.id !== instance.id));
                },
            });
        }
    };

    // Auto-refresh status para instâncias conectando
    useEffect(() => {
        const interval = setInterval(() => {
            instances
                .filter(i => i.status === 'connecting')
                .forEach(checkStatus);
        }, 5000);

        return () => clearInterval(interval);
    }, [instances]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected':
                return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
            case 'connecting':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
            default:
                return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected':
                return <Wifi className="h-4 w-4" />;
            case 'connecting':
                return <RefreshCw className="h-4 w-4 animate-spin" />;
            default:
                return <WifiOff className="h-4 w-4" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'connected':
                return 'Conectado';
            case 'connecting':
                return 'Conectando';
            default:
                return 'Desconectado';
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Gerenciar Instâncias WhatsApp
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Configure e gerencie suas conexões WhatsApp Business via Evolution API
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Create New Instance Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        Nova Instância
                    </h2>
                    <div className="flex gap-4 flex-col sm:flex-row">
                        <input
                            type="text"
                            value={newInstanceName}
                            onChange={(e) => setNewInstanceName(e.target.value)}
                            placeholder="Nome da instância (ex: loja-centro)"
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            onKeyPress={(e) => e.key === 'Enter' && createInstance()}
                            disabled={loading}
                        />
                        <button
                            onClick={createInstance}
                            disabled={!newInstanceName.trim() || loading}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Criando...' : 'Criar Instância'}
                        </button>
                    </div>
                </div>

                {/* Instances Grid */}
                {instances.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
                        <Smartphone className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Nenhuma instância criada
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Crie sua primeira instância WhatsApp para começar a enviar mensagens
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {instances.map((instance) => (
                            <div
                                key={instance.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
                            >
                                {/* Instance Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Smartphone className="h-8 w-8 text-green-600" />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                                {instance.instance_name}
                                            </h3>
                                            {instance.phone_number && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {instance.phone_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${getStatusColor(instance.status)}`}>
                                        {getStatusIcon(instance.status)}
                                        {getStatusLabel(instance.status)}
                                    </div>
                                </div>

                                {/* Last Connected Info */}
                                {instance.last_connected_at && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                                        Última conexão: {new Date(instance.last_connected_at).toLocaleDateString('pt-BR', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {instance.status !== 'connected' && (
                                        <button
                                            onClick={() => loadQrCode(instance)}
                                            disabled={loading}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <QrCode className="h-4 w-4" />
                                            Ver QR Code
                                        </button>
                                    )}

                                    {instance.status === 'connected' && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Desconectar esta instância?')) {
                                                    router.post(route('whatsapp.instances.disconnect', instance.id), {}, {
                                                        onSuccess: () => {
                                                            setInstances(instances.map(i =>
                                                                i.id === instance.id
                                                                    ? { ...i, status: 'disconnected', qr_code: null }
                                                                    : i
                                                            ));
                                                        },
                                                    });
                                                }
                                            }}
                                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                        >
                                            Desconectar
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deleteInstance(instance)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* QR Code Modal */}
                {selectedInstance && qrCode && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setQrCode(null)}
                    >
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Conectar via QR Code
                                </h3>
                                <button
                                    onClick={() => setQrCode(null)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Instance Name */}
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Instância: <span className="font-semibold text-gray-900 dark:text-white">{selectedInstance.instance_name}</span>
                            </p>

                            {/* Instructions */}
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                Abra o WhatsApp no seu celular e escaneie este código para conectar a instância.
                            </p>

                            {/* QR Code */}
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 flex items-center justify-center">
                                <img
                                    src={qrCode}
                                    alt="QR Code"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Status Info */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    ℹ️ O status será atualizado automaticamente assim que você escanear o código. Isso pode levar alguns segundos.
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setQrCode(null)}
                                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
