import { useState, useEffect, useMemo } from 'react';
import Modal from '@/Components/Modal';
import { PointsEarnedAnimation } from '@/Components/PointsEarnedAnimation';
import { X, MapPin, DollarSign, Wallet, CreditCard, Banknote, CheckCircle, Loader2, Gift, Ticket } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { useToast } from '@/Hooks/useToast';

interface Address {
    id: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    is_default: boolean;
}

interface PaymentMethod {
    id: string;
    name: string;
    type: string; // money, card
}

interface Item {
    product: { id: string; name: string };
    quantity: number;
    subtotal: number;
    selectedComplements: any[];
    notes: string;
}

interface CheckoutModalProps {
    show: boolean;
    onClose: () => void;
    cart: Item[];
    store: any;
    customer: any;
    total: number;
    addresses: Address[];
    onSuccess: (orderId: string) => void;
}

export default function CheckoutModal({ show, onClose, cart, store, customer, total, addresses, onSuccess }: CheckoutModalProps) {
    const [step, setStep] = useState<'delivery' | 'payment'>('delivery');
    const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'debit_card' | 'pix'>('credit_card');
    const [changeFor, setChangeFor] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPointsAnimation, setShowPointsAnimation] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const { success: showSuccess } = useToast();

    useEffect(() => {
        if (show && addresses.length > 0) {
            const defaultAddr = addresses.find(a => a.is_default);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else setSelectedAddressId(addresses[0].id);
        }
    }, [show, addresses]);

    // Calculate estimated loyalty points
    const estimatedPoints = useMemo(() => {
        if (!store?.loyalty_enabled || !store?.settings?.points_per_currency) {
            return 0;
        }
        // Use order subtotal (without delivery fee) for points calculation
        const orderSubtotal = total - (mode === 'delivery' ? 5 : 0); // Subtract delivery fee if applicable
        const pointsRate = store.settings.points_per_currency || 1.0;
        return Math.ceil(orderSubtotal * pointsRate);
    }, [total, store?.loyalty_enabled, store?.settings?.points_per_currency, mode]);

    const handleSubmit = async () => {
        if (mode === 'delivery' && !selectedAddressId) {
            setError('Selecione um endereço para entrega.');
            return;
        }

        if (paymentMethod === 'cash' && changeFor) {
            const changeVal = parseFloat(changeFor.replace(',', '.'));
            if (changeVal < total) {
                setError('O valor do troco deve ser maior que o total do pedido.');
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                tenant_id: store.settings.tenant_id,
                customer_id: customer.id,
                mode,
                address_id: mode === 'delivery' ? selectedAddressId : null,
                payment_method: paymentMethod,
                change_for: paymentMethod === 'cash' ? parseFloat(changeFor.replace(',', '.')) : null,
                coupon_id: appliedCoupon?.id || null,
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    notes: item.notes,
                    complements: item.selectedComplements.map(c => ({
                        id: c.optionId || c.id, // Adaptation based on cart structure
                        quantity: 1
                    }))
                }))
            };

            const response = await axios.post('/customer/checkout', payload);

            // Show points animation if points were earned
            if (response.data.loyalty_points_earned > 0) {
                setEarnedPoints(response.data.loyalty_points_earned);
                setShowPointsAnimation(true);
                // Wait for animation to complete before closing
                setTimeout(() => {
                    showSuccess('Pedido Realizado!', 'Seu pedido foi enviado com sucesso. Acompanhe o status pelo WhatsApp.');
                    onSuccess(response.data.order_id);
                    onClose();
                }, 3500);
            } else {
                showSuccess('Pedido Realizado!', 'Seu pedido foi enviado com sucesso. Acompanhe o status pelo WhatsApp.');
                onSuccess(response.data.order_id);
                onClose();
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Erro ao processar pedido. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Digite um código de cupom');
            return;
        }

        setValidatingCoupon(true);
        setCouponError('');
        try {
            const response = await axios.post('/customer/validate-coupon', {
                code: couponCode,
                order_total: total,
                tenant_id: store.settings.tenant_id,
            });

            if (response.data.valid) {
                setAppliedCoupon(response.data.coupon);
                setCouponCode('');
            } else {
                setCouponError(response.data.message || 'Cupom inválido');
            }
        } catch (err: any) {
            setCouponError(err.response?.data?.message || 'Erro ao validar cupom');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.discount_type === 'fixed') {
            return appliedCoupon.discount_value;
        }
        return (total * appliedCoupon.discount_value) / 100;
    };

    const discountAmount = calculateDiscount();
    const finalTotal = Math.max(0, total - discountAmount);

    const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

    return (
        <Modal show={show} onClose={onClose}>
            <PointsEarnedAnimation
                points={earnedPoints}
                show={showPointsAnimation}
                onComplete={() => setShowPointsAnimation(false)}
            />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Finalizar Pedido</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Steps */}
                <div className="space-y-6">
                    {/* Delivery Method */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-[#ff3d03]" />
                            Entrega
                        </h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={() => setMode('delivery')}
                                className={clsx(
                                    "p-3 rounded-xl border-2 font-bold transition-all",
                                    mode === 'delivery'
                                        ? "border-[#ff3d03] bg-orange-50 text-[#ff3d03]"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                )}
                            >
                                Entrega
                            </button>
                            <button
                                onClick={() => setMode('pickup')}
                                className={clsx(
                                    "p-3 rounded-xl border-2 font-bold transition-all",
                                    mode === 'pickup'
                                        ? "border-[#ff3d03] bg-orange-50 text-[#ff3d03]"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                )}
                            >
                                Retirada
                            </button>
                        </div>

                        {mode === 'delivery' && (
                            <div className="space-y-3">
                                {addresses.length === 0 ? (
                                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                                        <p className="text-gray-500 mb-2">Nenhum endereço cadastrado</p>
                                        <button className="text-[#ff3d03] font-bold text-sm hover:underline">
                                            Adicionar endereço
                                        </button>
                                    </div>
                                ) : (
                                    addresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            className={clsx(
                                                "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between",
                                                selectedAddressId === addr.id
                                                    ? "border-[#ff3d03] bg-orange-50"
                                                    : "border-gray-100 hover:border-gray-200"
                                            )}
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900">{addr.street}, {addr.number}</p>
                                                <p className="text-sm text-gray-500">{addr.neighborhood} - {addr.city}</p>
                                            </div>
                                            {selectedAddressId === addr.id && (
                                                <CheckCircle className="h-5 w-5 text-[#ff3d03]" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Coupon Section */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-[#ff3d03]" />
                            Cupom de Desconto
                        </h3>
                        {appliedCoupon ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-green-700">✓ Cupom aplicado!</p>
                                        <p className="text-sm text-green-600">{appliedCoupon.code}</p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Desconto: {appliedCoupon.discount_type === 'fixed' ? `R$ ${appliedCoupon.discount_value.toFixed(2)}` : `${appliedCoupon.discount_value}%`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setAppliedCoupon(null)}
                                        className="text-green-600 hover:text-green-700"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => {
                                        setCouponCode(e.target.value);
                                        setCouponError('');
                                    }}
                                    placeholder="Cole seu cupom aqui..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                />
                                <button
                                    onClick={applyCoupon}
                                    disabled={validatingCoupon}
                                    className="bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {validatingCoupon ? '...' : 'Aplicar'}
                                </button>
                            </div>
                        )}
                        {couponError && (
                            <p className="text-sm text-red-600 mb-2">{couponError}</p>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-[#ff3d03]" />
                            Pagamento (na entrega)
                        </h3>
                        <div className="space-y-3">
                            {[
                                { id: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard },
                                { id: 'debit_card', label: 'Cartão de Débito', icon: CreditCard },
                                { id: 'cash', label: 'Dinheiro', icon: Banknote },
                                { id: 'pix', label: 'PIX (na entrega)', icon: Wallet },
                            ].map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id as any)}
                                    className={clsx(
                                        "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                                        paymentMethod === method.id
                                            ? "border-[#ff3d03] bg-orange-50"
                                            : "border-gray-100 hover:border-gray-200"
                                    )}
                                >
                                    <div className={clsx(
                                        "p-2 rounded-lg",
                                        paymentMethod === method.id ? "bg-white text-[#ff3d03]" : "bg-gray-100 text-gray-500"
                                    )}>
                                        <method.icon className="h-5 w-5" />
                                    </div>
                                    <span className={clsx(
                                        "font-bold",
                                        paymentMethod === method.id ? "text-[#ff3d03]" : "text-gray-700"
                                    )}>{method.label}</span>
                                </div>
                            ))}
                        </div>

                        {paymentMethod === 'cash' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precisa de troco para quanto?</label>
                                <input
                                    type="text"
                                    value={changeFor}
                                    onChange={(e) => setChangeFor(e.target.value)}
                                    placeholder="Ex: 50,00"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Loyalty Points Preview */}
                {estimatedPoints > 0 && (
                    <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-3">
                            <Gift className="h-6 w-6 text-orange-500" />
                            <div>
                                <p className="font-bold text-orange-900 dark:text-orange-100">
                                    Você vai ganhar {estimatedPoints} pontos!
                                </p>
                                <p className="text-sm text-orange-700 dark:text-orange-300">
                                    Equivalente a R$ {(estimatedPoints * (store?.settings?.currency_per_point || 0.1)).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Total & Action */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    {discountAmount > 0 && (
                        <div className="mb-4 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between text-red-600 font-bold">
                                <span>Desconto</span>
                                <span>-{formatPrice(discountAmount)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between items-center">
                                <span className="text-gray-600">Total a pagar</span>
                                <span className="text-2xl font-black text-[#ff3d03]">{formatPrice(finalTotal)}</span>
                            </div>
                        </div>
                    )}
                    {discountAmount === 0 && (
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-600">Total a pagar</span>
                            <span className="text-2xl font-black text-[#ff3d03]">{formatPrice(finalTotal)}</span>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            'Confirmar Pedido'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
