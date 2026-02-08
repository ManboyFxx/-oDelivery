import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

interface CreditCardFormProps {
    plan: string;
    price: number;
    couponCode?: string;
}

export default function CreditCardForm({ plan, price, couponCode }: CreditCardFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const { data, setData } = useForm({
        plan,
        payment_method: 'credit_card',
        cardholder_name: '',
        cpf: '',
        coupon_code: couponCode || ''
    });

    useEffect(() => {
        setData('coupon_code', couponCode || '');
    }, [couponCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setError('Erro ao carregar formulário de cartão');
            setProcessing(false);
            return;
        }

        try {
            // Create payment method
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: data.cardholder_name,
                },
            });

            if (stripeError) {
                setError(stripeError.message || 'Erro ao processar cartão');
                setProcessing(false);
                return;
            }

            // Send to backend
            router.post(route('subscription.process-payment'), {
                ...data,
                payment_method_id: paymentMethod?.id,
            }, {
                onError: (errors) => {
                    setError(errors.payment || 'Erro ao processar pagamento');
                    setProcessing(false);
                },
                onSuccess: () => {
                    setProcessing(false);
                },
            });
        } catch (err: any) {
            setError(err.message || 'Erro inesperado');
            setProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': {
                    color: '#9ca3af',
                },
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            invalid: {
                color: '#ef4444',
            },
        },
        hidePostalCode: true,
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Dados do Cartão
                </h4>

                {/* Cardholder Name */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome no Cartão
                    </label>
                    <input
                        type="text"
                        value={data.cardholder_name}
                        onChange={(e) => setData('cardholder_name', e.target.value)}
                        placeholder="NOME COMPLETO"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Card Element */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dados do Cartão
                    </label>
                    <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                        <CardElement options={cardElementOptions} />
                    </div>
                </div>

                {/* CPF */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CPF do Titular
                    </label>
                    <input
                        type="text"
                        value={data.cpf}
                        onChange={(e) => {
                            // Simple CPF mask
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 11) {
                                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                            }
                            setData('cpf', value);
                        }}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-[#ff3d03] hover:bg-[#e63700] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
            >
                {processing ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processando Pagamento...
                    </>
                ) : (
                    <>
                        <CreditCard className="h-5 w-5" />
                        Pagar R$ {price.toFixed(2)}
                    </>
                )}
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Ao confirmar, você concorda com nossos <a href="#" className="underline">Termos de Serviço</a>
            </p>
        </form>
    );
}
