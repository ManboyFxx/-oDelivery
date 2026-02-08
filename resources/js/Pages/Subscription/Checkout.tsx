import { Head, usePage, useForm } from '@inertiajs/react';
import { ShieldCheck, CheckCircle, CreditCard, Loader2, QrCode, Barcode, Lock, Tag, X } from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CreditCardForm from '@/Components/CreditCardForm';
import PixPayment from '@/Components/PixPayment';
import BoletoPayment from '@/Components/BoletoPayment';
import axios from 'axios';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || '');

type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

interface CheckoutProps {
    plan: string;
    price: number;
    planName: string;
    features: string[];
}

export default function Checkout({ plan, price, planName, features }: CheckoutProps) {
    const { auth } = usePage().props as any;
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit_card');
    const { data, setData, post, processing } = useForm({
        plan,
        payment_method: 'credit_card',
        coupon_code: '',
    });

    const [couponInput, setCouponInput] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discount_type: 'percentage' | 'fixed';
        discount_value: number;
    } | null>(null);

    const handleValidateCoupon = async () => {
        if (!couponInput.trim()) return;

        setIsValidatingCoupon(true);
        setCouponError('');

        try {
            const response = await axios.post(route('subscription.validate-coupon'), {
                code: couponInput,
                plan: plan
            });

            if (response.data.valid) {
                setAppliedCoupon({
                    code: response.data.code,
                    discount_type: response.data.discount_type,
                    discount_value: parseFloat(response.data.discount_value)
                });
                setData('coupon_code', response.data.code);
                setCouponInput('');
            }
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'Erro ao validar cupom');
            setAppliedCoupon(null);
            setData('coupon_code', '');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setData('coupon_code', '');
        setCouponInput('');
    };

    const calculateTotal = () => {
        if (!appliedCoupon) return price;

        let discount = 0;
        if (appliedCoupon.discount_type === 'percentage') {
            discount = price * (appliedCoupon.discount_value / 100);
        } else {
            discount = appliedCoupon.discount_value;
        }

        return Math.max(0, price - discount);
    };

    const paymentMethods = [
        {
            id: 'credit_card' as PaymentMethod,
            name: 'Cartão de Crédito',
            icon: CreditCard,
            description: 'Aprovação instantânea',
        },
        {
            id: 'pix' as PaymentMethod,
            name: 'Pix',
            icon: QrCode,
            description: 'Pagamento via QR Code',
        },
        {
            id: 'boleto' as PaymentMethod,
            name: 'Boleto',
            icon: Barcode,
            description: 'Vencimento em 3 dias',
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-white leading-tight">Checkout Seguro</h2>}
        >
            <Head title="Checkout" />

            <div className="py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Main Content - Payment Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-2xl p-8">

                                {/* Header */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center">
                                            <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Pagamento Seguro</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Seus dados estão protegidos</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Tabs */}
                                <div className="mb-8">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Escolha a forma de pagamento</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {paymentMethods.map((method) => {
                                            const Icon = method.icon;
                                            const isSelected = selectedMethod === method.id;

                                            return (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedMethod(method.id);
                                                        setData('payment_method', method.id);
                                                    }}
                                                    className={`
                                                        relative p-4 rounded-xl border-2 transition-all text-left
                                                        ${isSelected
                                                            ? 'border-[#ff3d03] bg-orange-50 dark:bg-orange-900/20'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                        }
                                                    `}
                                                >
                                                    <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-[#ff3d03]' : 'text-gray-400'}`} />
                                                    <div className="font-bold text-sm text-gray-900 dark:text-white">{method.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{method.description}</div>
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2">
                                                            <CheckCircle className="h-5 w-5 text-[#ff3d03]" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Payment Forms */}
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-8">
                                    {selectedMethod === 'credit_card' && (
                                        <Elements stripe={stripePromise}>
                                            <CreditCardForm plan={plan} price={price} couponCode={appliedCoupon?.code} />
                                        </Elements>
                                    )}

                                    {selectedMethod === 'pix' && (
                                        <PixPayment plan={plan} price={calculateTotal()} couponCode={appliedCoupon?.code} />
                                    )}

                                    {selectedMethod === 'boleto' && (
                                        <BoletoPayment plan={plan} price={calculateTotal()} couponCode={appliedCoupon?.code} />
                                    )}
                                </div>

                                {/* Security Badges */}
                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            <span>SSL Seguro</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span>PCI Compliant</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Dados Criptografados</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 sticky top-8">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Resumo do Pedido</h4>

                                {/* Plan Details */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{planName}</span>
                                        <span className="font-bold text-xl text-gray-900 dark:text-white">
                                            R$ {price.toFixed(2)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Cobrança mensal</span>
                                </div>

                                {/* Features */}
                                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Incluído no plano:</p>
                                    <ul className="space-y-2">
                                        {features?.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        )) || (
                                                <>
                                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                        <span>Produtos ilimitados</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                        <span>Pedidos ilimitados</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                        <span>Suporte prioritário</span>
                                                    </li>
                                                </>
                                            )}
                                    </ul>
                                </div>

                                {/* Coupon Section */}
                                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Cupom de Desconto</label>

                                    {!appliedCoupon ? (
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Tag className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={couponInput}
                                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleValidateCoupon()}
                                                    className="w-full pl-9 pr-3 py-2 text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-[#ff3d03] focus:border-[#ff3d03]"
                                                    placeholder="Código"
                                                />
                                            </div>
                                            <button
                                                onClick={handleValidateCoupon}
                                                disabled={!couponInput.trim() || isValidatingCoupon}
                                                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-1.5 text-green-800 dark:text-green-300 font-bold text-sm">
                                                    <Tag className="h-3.5 w-3.5" />
                                                    {appliedCoupon.code}
                                                </div>
                                                <div className="text-xs text-green-600 dark:text-green-400">
                                                    Desconto de {appliedCoupon.discount_type === 'percentage'
                                                        ? `${appliedCoupon.discount_value}%`
                                                        : `R$ ${appliedCoupon.discount_value.toFixed(2)}`}
                                                </div>
                                            </div>
                                            <button
                                                onClick={removeCoupon}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}

                                    {couponError && (
                                        <p className="text-xs text-red-500 mt-2">{couponError}</p>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900 dark:text-white">Total</span>
                                        <div className="text-right">
                                            {appliedCoupon && (
                                                <span className="block text-sm text-gray-400 line-through">
                                                    R$ {price.toFixed(2)}
                                                </span>
                                            )}
                                            <span className="font-black text-2xl text-gray-900 dark:text-white">
                                                R$ {calculateTotal().toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Próxima cobrança em {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>

                                {/* Guarantee */}
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm text-green-900 dark:text-green-100">Garantia de 7 dias</p>
                                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                                Cancele a qualquer momento. Sem perguntas, sem burocracia.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
