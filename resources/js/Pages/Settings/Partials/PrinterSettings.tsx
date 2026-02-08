import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { Copy, RefreshCw, Printer, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function PrinterSettings() {
    const { auth, flash } = usePage<any>().props;
    const user = auth.user;
    const [token, setToken] = useState<string | null>(null);
    const [logs, setLogs] = useState<any[]>([]);

    const fetchLogs = async () => {
        try {
            const response = await fetch(route('settings.printer.logs'));
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        }
    };

    // If a new token arrived in flash session, show it
    React.useEffect(() => {
        if (flash?.flash_token) {
            setToken(flash.flash_token);
        }
        fetchLogs();
    }, [flash]);

    const generateToken = () => {
        if (token && !confirm('Gerar um novo token irá invalidar qualquer token anterior usado na impressora. Continuar?')) {
            return;
        }

        router.post(route('api.tokens.create'), {
            name: 'Printer Token'
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Token gerado com sucesso!');
            }
        });
    };

    return (
        <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <div className="mb-6">
                <h3 className="text-gray-900 dark:text-gray-200 flex items-center gap-2 font-bold text-lg">
                    <Printer className="h-5 w-5 text-[#ff3d03]" />
                    Integração de Impressora
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gerencie o código de acesso para o software de impressão automática.
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium">Importante</p>
                        <p className="mt-1">
                            Este token concede acesso apenas para leitura de pedidos para impressão.
                            Mantenha-o seguro. Cole-o no aplicativo de impressão do computador.
                        </p>
                    </div>
                </div>

                {/* DEBUG: Remove in production */}
                {/* <div className="p-2 border border-red-500 text-xs text-red-500">
                    DEBUG FLASH: {JSON.stringify(flash)}
                </div> */}

                <div className="space-y-2">
                    <InputLabel value="Token de Acesso" />
                    <div className="flex gap-2">
                        <TextInput
                            value={flash?.flash_token || token || "********************************"}
                            readOnly
                            className={`flex-1 font-mono ${token ? "bg-green-50 border-green-200 text-green-700" : ""}`}
                            type={token ? "text" : "password"}
                        />
                        <SecondaryButton onClick={() => {
                            if (token) {
                                navigator.clipboard.writeText(token);
                                toast.success("Token copiado!");
                            } else {
                                toast.error("Gere um novo token para visualizar.");
                            }
                        }} title="Copiar Token">
                            <Copy className="w-4 h-4" />
                        </SecondaryButton>
                    </div>
                    {token && <p className="text-xs text-green-600 font-medium">⚠ Copie este token agora. Ele não será exibido novamente.</p>}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-gray-100 dark:border-white/5">
                    <PrimaryButton type="button" onClick={generateToken} className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Gerar Novo Token
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={() => {
                        router.post(route('settings.printer.test'), {}, {
                            onSuccess: () => {
                                toast.success('Teste enviado!');
                                fetchLogs(); // Refresh logs
                            }
                        });
                    }} className="flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Testar Impressão
                    </SecondaryButton>
                </div>

                {/* Logs Section */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">Histórico de Testes (Últimos 10)</h4>
                    <div className="bg-gray-50 dark:bg-premium-dark rounded-xl p-4 space-y-2 max-h-60 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-xs text-center text-gray-500">Nenhum teste registrado.</p>
                        ) : (
                            logs.map((log: any) => (
                                <div key={log.id} className="flex justify-between items-center text-xs border-b border-gray-200 dark:border-white/5 last:border-0 pb-2 last:pb-0">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {new Date(log.created_at).toLocaleString()}
                                    </span>
                                    <span className="text-green-600 font-medium">
                                        Enviado por {log.user?.name || 'Sistema'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
