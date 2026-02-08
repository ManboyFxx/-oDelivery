import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Barcode, Download, Copy, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface BoletoPaymentProps {
    plan: string;
    price: number;
    couponCode?: string;
}

export default function BoletoPayment({ plan, price, couponCode }: BoletoPaymentProps) {
    const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
    const [boletoCode, setBoletoCode] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const { data, setData, post, processing } = useForm({
        plan,
        payment_method: 'boleto',
        cpf: '',
        coupon_code: couponCode || ''
    });

    useEffect(() => {
        setData('coupon_code', couponCode || '');
    }, [couponCode]);

    const generateBoleto = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('subscription.process-payment'), {
            onSuccess: (response: any) => {
                // Backend should return boleto URL and barcode
                setBoletoUrl(response.boleto_url);
                setBoletoCode(response.barcode);
                setDueDate(response.due_date);
            },
        });
    };

    const copyBoletoCode = () => {
        if (boletoCode) {
            navigator.clipboard.writeText(boletoCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const downloadBoleto = () => {
        if (boletoUrl) {
            window.open(boletoUrl, '_blank');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Barcode className="h-5 w-5" />
                    Pagamento via Boleto
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    O boleto vence em 3 dias úteis. Após o pagamento, a confirmação pode levar até 2 dias úteis.
                </p>
            </div>

            {!boletoUrl ? (
                <form onSubmit={generateBoleto} className="space-y-4">
                    {/* CPF/CNPJ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            CPF ou CNPJ
                        </label>
                        <input
                            type="text"
                            value={data.cpf}
                            onChange={(e) => {
                                // Simple CPF/CNPJ mask
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 11) {
                                    // CPF
                                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                                } else {
                                    // CNPJ
                                    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                                    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                                    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                                }
                                setData('cpf', value);
                            }}
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Necessário para emissão do boleto
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#ff3d03] hover:bg-[#e63700] disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Gerando Boleto...
                            </>
                        ) : (
                            <>
                                <Barcode className="h-5 w-5" />
                                Gerar Boleto
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    {/* Success Message */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-green-900 dark:text-green-100">
                                Boleto gerado com sucesso!
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                Vencimento: {dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : '3 dias'}
                            </p>
                        </div>
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={downloadBoleto}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Download className="h-5 w-5" />
                        Baixar Boleto (PDF)
                    </button>

                    {/* Barcode */}
                    {boletoCode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Código de Barras
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={boletoCode}
                                    readOnly
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white font-mono text-sm"
                                />
                                <button
                                    onClick={copyBoletoCode}
                                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <span className="text-sm font-medium text-green-600">Copiado!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Copiar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Use este código para pagar em qualquer banco ou lotérica
                            </p>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Como pagar:</p>
                        <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                            <li>Baixe o boleto em PDF</li>
                            <li>Pague em qualquer banco, lotérica ou app bancário</li>
                            <li>Use o código de barras para facilitar</li>
                            <li>Aguarde até 2 dias úteis para confirmação</li>
                        </ol>
                    </div>

                    {/* Warning */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-orange-900 dark:text-orange-100">
                                Atenção: Pague até a data de vencimento
                            </p>
                            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                                Após o vencimento, será necessário gerar um novo boleto. Seu acesso será liberado após a confirmação do pagamento.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
