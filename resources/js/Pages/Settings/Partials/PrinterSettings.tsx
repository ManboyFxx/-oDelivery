import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { useForm, usePage } from "@inertiajs/react";
import { AlertCircle, Check, Copy, Printer, RefreshCw } from "lucide-react";
import { useState } from "react";

interface PrinterSettingsProps {
    data: any;
    setData: (field: string, value: any) => void;
}

export default function PrinterSettings({ data, setData }: PrinterSettingsProps) {
    const { printer_token_exists, flash_printer_token, printer_token_raw } = usePage<any>().props;
    console.log("PrinterSettings Debug:", { printer_token_exists, hasFlash: !!flash_printer_token, hasRaw: !!printer_token_raw });
    const { post, processing } = useForm({});
    const [copied, setCopied] = useState(false);
    const [showToken, setShowToken] = useState(false);

    const generateToken = () => {
        if (confirm("Gerar um novo token irá desconectar qualquer impressora usando o token anterior. Deseja continuar?")) {
            post(route('settings.printer.generate-token'));
        }
    };

    const copyToken = (token: string) => {
        if (token) {
            navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold text-lg">
                    <Printer className="h-5 w-5 text-[#ff3d03]" />
                    Configurações de Impressão
                </h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Largura do Papel
                        </label>
                        <div className="flex bg-gray-100 dark:bg-premium-dark p-1 rounded-xl border border-gray-200 dark:border-white/10">
                            {[58, 80].map((width) => (
                                <button
                                    key={width}
                                    type="button"
                                    onClick={() => setData('printer_paper_width', width)}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${data.printer_paper_width === width ? 'bg-white dark:bg-premium-card text-[#ff3d03] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    {width}mm
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cópias por Pedido
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={data.print_copies}
                            onChange={(e) => setData('print_copies', parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white font-bold"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-premium-dark rounded-2xl border border-gray-100 dark:border-white/5">
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white">Impressão Automática</p>
                        <p className="text-sm text-gray-500">Imprimir automaticamente ao confirmar o pedido.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={data.auto_print_on_confirm}
                            onChange={(e) => setData('auto_print_on_confirm', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#ff3d03]"></div>
                    </label>
                </div>
            </div>

            <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold text-lg">
                    <RefreshCw className="h-5 w-5 text-[#ff3d03]" />
                    Token de Impressão Local
                </h3>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium">Como Configurar</p>
                        <p className="mt-1">
                            Para imprimir pedidos localmente, baixe o app <strong>óoprint</strong> e use o token abaixo.
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
                                    Token Ativo
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
                                ⚠️ Copie este token agora! Ele não será exibido novamente nesta forma expandida.
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white dark:bg-black/20 p-3 rounded-xl border border-yellow-200 dark:border-yellow-800/30 font-mono text-sm break-all">
                                    {flash_printer_token}
                                </code>
                                <SecondaryButton onClick={() => copyToken(flash_printer_token)} className="h-12 w-12 flex items-center justify-center p-0 shrink-0">
                                    {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                                </SecondaryButton>
                            </div>
                        </div>
                    )}

                    {printer_token_raw && !flash_printer_token && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">🎫 Seu Token de Impressão Local</h4>
                            <div className="flex items-center gap-2 relative">
                                <div className="flex-1 relative">
                                    <input
                                        type={showToken ? "text" : "password"}
                                        readOnly
                                        value={printer_token_raw}
                                        className="w-full bg-gray-50 dark:bg-premium-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 font-mono text-sm pr-12"
                                    />
                                    <button
                                        onClick={() => setShowToken(!showToken)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        {showToken ? <span role="img" aria-label="hide">🙈</span> : <span role="img" aria-label="show">👁️</span>}
                                    </button>
                                </div>
                                <SecondaryButton onClick={() => copyToken(printer_token_raw)} className="h-12 w-12 flex items-center justify-center p-0 shrink-0">
                                    {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                                </SecondaryButton>
                            </div>
                            <p className="text-[10px] text-gray-500">
                                Este token permite que o app <b>óoprint</b> se conecte a este terminal.
                            </p>
                        </div>
                    )}

                    {printer_token_exists && !printer_token_raw && !flash_printer_token && (
                        <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Você possui um token ativo, mas ele foi gerado antes desta atualização e não pode ser exibido.
                            </p>
                            <p className="text-xs text-gray-400">
                                Gere um novo token abaixo para que ele fique sempre visível aqui.
                            </p>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
