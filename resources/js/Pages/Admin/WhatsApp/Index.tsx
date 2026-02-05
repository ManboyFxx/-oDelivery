import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Smartphone, QrCode, Wifi, WifiOff, RefreshCw, Trash2, MessageSquare, Key } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WhatsAppInstance {
    id: string;
    instance_name: string;
    phone_number: string | null;
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    qr_code: string | null;
    last_connected_at: string | null;
}

interface Log {
    id: string;
    tenant: { name: string };
    phone_number: string;
    template_key: string;
    status: string;
    created_at: string;
}

interface Props {
    instance: WhatsAppInstance | null;
    logs: Log[];
    currentConfig: {
        url: string;
        apikey: string;
    };
}

export default function AdminWhatsAppIndex({ instance, logs, currentConfig }: Props) {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [localStatus, setLocalStatus] = useState(instance?.status || 'disconnected');
    const [instanceName, setInstanceName] = useState(instance?.instance_name || 'odelivery_master');
    const [evolutionUrl, setEvolutionUrl] = useState(currentConfig.url);
    const [evolutionApiKey, setEvolutionApiKey] = useState(currentConfig.apikey);
    const [qrCodeLoading, setQrCodeLoading] = useState(false);

    const handleConnect = () => {
        setLoading(true);
        router.post(route('admin.whatsapp.connect'), {
            instance_name: instanceName,
            evolution_url: evolutionUrl,
            evolution_apikey: evolutionApiKey
        }, {
            onFinish: () => setLoading(false)
        });
    };

    const handleDisconnect = () => {
        if (confirm('Tem certeza? Isso irá desconectar o WhatsApp de todos os clientes do plano Basic/Pro.')) {
            router.post(route('admin.whatsapp.disconnect'));
        }
    };

    const loadQrCode = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('admin.whatsapp.qrcode'));
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('QR Code still not available, will retry...');
                    return;
                }
                const error = await response.json();
                console.error('Error fetching QR code:', error);
                return;
            }
            const data = await response.json();
            if (data.qr_code) {
                setQrCode(data.qr_code);
            }
        } catch (error) {
            console.error('Failed to load QR code:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async () => {
        try {
            const response = await fetch(route('admin.whatsapp.status'));
            const data = await response.json();
            setLocalStatus(data.status);
            if (data.status === 'connected') {
                setQrCode(null);
                // Reload page to update server-side state
                if (instance?.status !== 'connected') {
                    router.reload();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        let statusInterval: NodeJS.Timeout;
        let qrCodeInterval: NodeJS.Timeout;

        if (localStatus === 'connecting' || qrCode) {
            statusInterval = setInterval(checkStatus, 3000);
        }

        if (localStatus === 'connecting' && !qrCode) {
            setQrCodeLoading(true);
            qrCodeInterval = setInterval(async () => {
                await loadQrCode();
            }, 4000);
        }

        return () => {
            clearInterval(statusInterval);
            clearInterval(qrCodeInterval);
            if (localStatus === 'connecting' && !qrCode) {
                setQrCodeLoading(false);
            }
        };
    }, [localStatus, qrCode]);

    return (
        <AuthenticatedLayout>
            <Head title="WhatsApp Master" />

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-[#ff3d03]/10 text-[#ff3d03] text-[10px] font-bold uppercase tracking-wider">
                            Infraestrutura
                        </span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">WhatsApp Master</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Gerencie a conexão principal compartilhada (Planos Basic/Pro).
                    </p>
                </div>

                {/* @ts-ignore */}
                {/* Display Flash Messages */}
                {/* @ts-ignore */}
                {usePage().props.flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                        {/* @ts-ignore */}
                        {usePage().props.flash.error}
                    </div>
                )}
                {/* @ts-ignore */}
                {usePage().props.errors?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                        {/* @ts-ignore */}
                        {usePage().props.errors.error}
                    </div>
                )}
                {/* @ts-ignore */}
                {usePage().props.flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium">
                        {/* @ts-ignore */}
                        {usePage().props.flash.success}
                    </div>
                )}



                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Connection Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Status da Conexão</h3>

                            <div className="flex flex-col items-center justify-center py-8">
                                <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-4 ${localStatus === 'connected'
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                                    : localStatus === 'connecting'
                                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 animate-pulse'
                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                                    }`}>
                                    {localStatus === 'connected' ? (
                                        <Wifi className="h-10 w-10" />
                                    ) : localStatus === 'connecting' ? (
                                        <RefreshCw className="h-10 w-10 animate-spin" />
                                    ) : (
                                        <WifiOff className="h-10 w-10" />
                                    )}
                                </div>

                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    {localStatus === 'connected' ? 'Conectado' : localStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                                </h4>

                                {instance?.phone_number && (
                                    <p className="text-sm text-gray-500">{instance.phone_number}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                {!instance ? (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Evolution API URL</label>
                                            <input
                                                type="url"
                                                value={evolutionUrl}
                                                onChange={(e) => setEvolutionUrl(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium focus:ring-[#ff3d03]/20 focus:border-[#ff3d03]/50"
                                                placeholder="https://sua-evolution.com"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Global API Key</label>
                                            <input
                                                type="password"
                                                value={evolutionApiKey}
                                                onChange={(e) => setEvolutionApiKey(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium focus:ring-[#ff3d03]/20 focus:border-[#ff3d03]/50"
                                                placeholder="Sua chave global da Evolution"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Nome da Instância</label>
                                            <input
                                                type="text"
                                                value={instanceName}
                                                onChange={(e) => setInstanceName(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium focus:ring-[#ff3d03]/20 focus:border-[#ff3d03]/50"
                                                placeholder="Ex: odelivery_master"
                                            />
                                        </div>
                                        <button
                                            onClick={handleConnect}
                                            disabled={loading || !instanceName || !evolutionUrl || !evolutionApiKey}
                                            className="w-full py-3 bg-[#ff3d03] hover:bg-[#e03603] text-white rounded-xl font-bold shadow-lg shadow-[#ff3d03]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                                            Salvar e Iniciar
                                        </button>
                                    </div>
                                ) : localStatus !== 'connected' ? (
                                    <>
                                        <button
                                            onClick={loadQrCode}
                                            disabled={loading || qrCodeLoading}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <QrCode className="h-4 w-4" />
                                            Ler QR Code
                                        </button>
                                        {qrCodeLoading && (
                                            <p className="text-sm text-gray-500 text-center py-2">
                                                Preparando QR Code...
                                            </p>
                                        )}
                                        <button
                                            onClick={handleDisconnect}
                                            className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                        >
                                            Resetar
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleDisconnect}
                                        className="w-full py-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Desconectar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* QR Code / Logs Area */}
                    <div className="lg:col-span-2">
                        {qrCode ? (
                            <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Escanear QR Code</h3>
                                <p className="text-gray-500 mb-6">Abra o WhatsApp e escaneie para conectar.</p>
                                <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-100">
                                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden min-h-[400px]">
                                <div className="p-6 border-b border-gray-100 dark:border-white/5">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-gray-400" />
                                        Logs Recentes
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-medium border-b border-gray-100 dark:border-white/5">
                                            <tr>
                                                <th className="px-6 py-3">Tenant</th>
                                                <th className="px-6 py-3">Telefone</th>
                                                <th className="px-6 py-3">Template</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Data</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {logs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                        Nenhum log registrado ainda.
                                                    </td>
                                                </tr>
                                            ) : logs.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                        {log.tenant?.name || 'Sistema'}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">{log.phone_number}</td>
                                                    <td className="px-6 py-4 text-gray-500">{log.template_key}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.status === 'sent'
                                                            ? 'bg-green-100 text-green-700'
                                                            : log.status === 'failed'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {log.status === 'sent' ? 'Enviado' : 'Falha'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
