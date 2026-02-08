import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { QrCode, Copy, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface PixPaymentProps {
    plan: string;
    price: number;
    couponCode?: string;
}

export default function PixPayment({ plan, price, couponCode }: PixPaymentProps) {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [pixCode, setPixCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [checking, setChecking] = useState(false);

    const { data, setData, post, processing } = useForm({
        plan,
        payment_method: 'pix',
        coupon_code: couponCode || ''
    });

    useEffect(() => {
        setData('coupon_code', couponCode || '');
    }, [couponCode]);

    const generatePix = () => {
        post(route('subscription.process-payment'), {
            onSuccess: (response: any) => {
                // Backend should return QR code and pix code
                setQrCode(response.qr_code_url);
                setPixCode(response.qr_code);
                startPaymentCheck();
            },
        });
    };

    const copyPixCode = () => {
        if (pixCode) {
            navigator.clipboard.writeText(pixCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const startPaymentCheck = () => {
        // Poll backend every 5 seconds to check if payment was received
        setChecking(true);
        const interval = setInterval(() => {
            // TODO: Call backend to check payment status
            // If paid, redirect to success page
        }, 5000);

        // Stop checking after 15 minutes
        setTimeout(() => {
            clearInterval(interval);
            setChecking(false);
        }, 15 * 60 * 1000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Pagamento via Pix
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Escaneie o QR Code ou copie o código Pix para pagar
                </p>
            </div>

            {!qrCode ? (
                <button
                    onClick={generatePix}
                    disabled={processing}
                    className="w-full bg-[#ff3d03] hover:bg-[#e63700] disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Gerando QR Code...
                        </>
                    ) : (
                        <>
                            <QrCode className="h-5 w-5" />
                            Gerar QR Code Pix
                        </>
                    )}
                </button>
            ) : (
                <div className="space-y-6">
                    {/* QR Code Display */}
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-lg mb-4">
                            {qrCode ? (
                                <img src={qrCode} alt="QR Code Pix" className="w-64 h-64" />
                            ) : (
                                <div className="w-64 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <QrCode className="h-16 w-16 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                            Escaneie com o app do seu banco
                        </p>
                    </div>

                    {/* Pix Code */}
                    {pixCode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Ou copie o código Pix
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={pixCode}
                                    readOnly
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white font-mono text-sm"
                                />
                                <button
                                    onClick={copyPixCode}
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
                        </div>
                    )}

                    {/* Payment Status */}
                    {checking && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                                    Aguardando pagamento...
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Você será redirecionado automaticamente após a confirmação
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Como pagar:</p>
                        <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                            <li>Abra o app do seu banco</li>
                            <li>Escolha pagar via Pix</li>
                            <li>Escaneie o QR Code ou cole o código</li>
                            <li>Confirme o pagamento de R$ {price.toFixed(2)}</li>
                        </ol>
                    </div>

                    {/* Expiration Warning */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-800 dark:text-orange-200">
                            Este QR Code expira em 15 minutos. Após esse período, será necessário gerar um novo.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
