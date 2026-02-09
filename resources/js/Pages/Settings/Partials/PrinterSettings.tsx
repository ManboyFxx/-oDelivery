import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { useForm, usePage } from "@inertiajs/react";
import { AlertCircle, Check, Copy, Printer, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function PrinterSettings() {
    const { printer_token_exists, flash_printer_token } = usePage<any>().props;
    const { post, processing } = useForm({});
    const [copied, setCopied] = useState(false);

    const generateToken = () => {
        if (confirm("Gerar um novo token irá desconectar qualquer impressora usando o token anterior. Deseja continuar?")) {
            post(route('settings.printer.generate-token'));
        }
    };

    const copyToken = () => {
        if (flash_printer_token) {
            navigator.clipboard.writeText(flash_printer_token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold">
                <Printer className="h-5 w-5 text-[#ff3d03]" />
                Token de Impressão Local
            </h3>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium">Como Configurar</p>
                    <p className="mt-1">
                        Para imprimir automaticamente os pedidos, instale o software de impressão no computador onde a impressora está conectada e utilize o token gerado abaixo.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status do Token</h4>
                    <div className="flex items-center gap-2">
                        {printer_token_exists ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                                <Check className="h-3 w-3" />
                                Ativo
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium">
                                Nenhum token gerado
                            </span>
                        )}
                    </div>
                </div>

                {flash_printer_token && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-2xl p-6">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-3">
                            ⚠️ Copie este token agora! Ele não será exibido novamente por segurança.
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white dark:bg-black/20 p-3 rounded-xl border border-yellow-200 dark:border-yellow-800/30 font-mono text-sm break-all">
                                {flash_printer_token}
                            </code>
                            <SecondaryButton onClick={copyToken} className="h-12 w-12 flex items-center justify-center p-0 shrink-0">
                                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                            </SecondaryButton>
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <PrimaryButton
                        type="button"
                        onClick={generateToken}
                        disabled={processing}
                        className="w-full sm:w-auto"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                        {printer_token_exists ? 'Gerar Novo Token' : 'Gerar Token de Acesso'}
                    </PrimaryButton>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        * Ao gerar um novo token, o anterior deixará de funcionar imediatamente.
                    </p>
                </div>
            </div>
        </div>
    );
}
