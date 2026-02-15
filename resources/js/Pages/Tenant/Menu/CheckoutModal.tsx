import { useState, useEffect, useMemo } from 'react';
import Modal from '@/Components/Modal';
import { PointsEarnedAnimation } from '@/Components/PointsEarnedAnimation';
import { X, MapPin, DollarSign, Wallet, CreditCard, Banknote, CheckCircle, Loader2, Gift, Ticket, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { useToast } from '@/Hooks/useToast';
import AddressForm from './Components/AddressForm';
import { Switch } from '@headlessui/react';

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

export default function CheckoutModal({ show, onClose, cart, store, customer, total, addresses: initialAddresses, onSuccess }: CheckoutModalProps) {
    const [step, setStep] = useState<'delivery' | 'payment' | 'review'>('delivery');
    const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
    const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [isAddingAddress, setIsAddingAddress] = useState(false);

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

    const [usePoints, setUsePoints] = useState(false);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [pointsDiscount, setPointsDiscount] = useState(0);

    const { success: showSuccess } = useToast();

    useEffect(() => {
        setAddresses(initialAddresses);
    }, [initialAddresses]);

    useEffect(() => {
        if (show && addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find(a => a.is_default);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else setSelectedAddressId(addresses[0].id);
        }
    }, [show, addresses, selectedAddressId]);

    // Calculate details
    const deliveryFee = mode === 'delivery' ? (store.settings?.delivery_fee || 5.00) : 0;

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        return appliedCoupon.discount_amount || 0;
    };

    const discountAmount = calculateDiscount() + pointsDiscount;
    const subtotal = total;
    const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

    const estimatedPoints = useMemo(() => {
        if (!store?.loyalty_enabled || !store?.settings?.points_per_currency) return 0;
        return Math.ceil(subtotal * store.settings.points_per_currency);
    }, [subtotal, store]);

    const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

    const handleNextStep = () => {
        if (step === 'delivery') {
            if (mode === 'delivery' && !selectedAddressId) {
                setError('Selecione um endereço para entrega.');
                return;
            }
            setError('');
            setStep('payment');
        } else if (step === 'payment') {
            if (paymentMethod === 'cash' && changeFor) {
                const changeVal = parseFloat(changeFor.replace(',', '.'));
                if (changeVal < finalTotal) {
                    setError('O valor do troco deve ser maior que o total.');
                    return;
                }
            }
            setError('');
            setStep('review');
        }
    };

    const handleBackStep = () => {
        if (step === 'review') setStep('payment');
        else if (step === 'payment') setStep('delivery');
    };

    const handleSubmit = async () => {
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
                loyalty_points_used: usePoints ? pointsToUse : 0,
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    notes: item.notes,
                    complements: item.selectedComplements.map(c => ({
                        id: c.optionId || c.id,
                        quantity: 1
                    }))
                }))
            };

            const response = await axios.post('/customer/checkout', payload);

            // Redirect to tracking page
            const slug = window.location.pathname.split('/')[1];
            const trackingUrl = `/${slug}/orders/${response.data.order_id}`;

            if (response.data.loyalty_points_earned > 0) {
                setEarnedPoints(response.data.loyalty_points_earned);
                setShowPointsAnimation(true);
                setTimeout(() => {
                    showSuccess('Pedido Realizado!', 'Redirecionando para acompanhamento...');
                    window.location.href = trackingUrl;
                }, 3500);
            } else {
                showSuccess('Pedido Realizado!', 'Redirecionando para acompanhamento...');
                setTimeout(() => {
                    window.location.href = trackingUrl;
                }, 1500);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Erro ao processar pedido.');
        } finally {
            setLoading(false);
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setValidatingCoupon(true);
        setCouponError('');
        try {
            const response = await axios.post('/api/validate-coupon', {
                code: couponCode,
                cart_total: subtotal,
                tenant_id: store.tenant_id || window.location.pathname.split('/')[1],
            });

            if (response.data.valid) {
                setAppliedCoupon({
                    ...response.data.coupon,
                    discount_amount: response.data.discount
                });
                showSuccess('Cupom Aplicado!', response.data.message);
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

    const handleAddressSuccess = (newAddress: Address) => {
        setAddresses(prev => [...prev, newAddress]);
        setSelectedAddressId(newAddress.id);
        setIsAddingAddress(false);
    };

    // Render Steps
    const renderStepper = () => (
        <div className="flex justify-between items-center mb-6 px-2">
            {[
                { id: 'delivery', label: 'Entrega', icon: MapPin },
                { id: 'payment', label: 'Pagamento', icon: Wallet },
                { id: 'review', label: 'Confirmação', icon: CheckCircle }
            ].map((s, idx) => {
                const isActive = s.id === step;
                const isCompleted =
                    (step === 'payment' && idx === 0) ||
                    (step === 'review' && idx <= 1);

                return (
                    <div key={s.id} className="flex flex-col items-center relative z-10">
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                            isActive ? "bg-[#ff3d03] border-[#ff3d03] text-white shadow-lg scale-110" :
                                isCompleted ? "bg-green-500 border-green-500 text-white" :
                                    "bg-white border-gray-300 text-gray-400"
                        )}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className={clsx(
                            "text-xs font-semibold mt-2",
                            isActive ? "text-[#ff3d03]" : isCompleted ? "text-green-600" : "text-gray-400"
                        )}>{s.label}</span>
                    </div>
                );
            })}
            {/* Progress Bar Background */}
            <div className="absolute top-[4.5rem] left-10 right-10 h-0.5 bg-gray-200 -z-0" />
            <div className={clsx(
                "absolute top-[4.5rem] left-10 h-0.5 bg-green-500 transition-all duration-300 -z-0",
                step === 'delivery' ? "w-0" : step === 'payment' ? "w-1/2" : "w-[calc(100%-5rem)]"
            )} />
        </div>
    );

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <PointsEarnedAnimation
                points={earnedPoints}
                show={showPointsAnimation}
                onComplete={() => setShowPointsAnimation(false)}
            />

            <div className="p-6 min-h-[500px] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    {step !== 'delivery' ? (
                        <button onClick={handleBackStep} className="p-1 hover:bg-gray-100 rounded-full">
                            <ArrowLeft className="h-6 w-6 text-gray-600" />
                        </button>
                    ) : (
                        <div />
                    )}
                    <h2 className="text-xl font-bold text-gray-900">
                        {step === 'delivery' && 'Entrega ou Retirada'}
                        {step === 'payment' && 'Pagamento'}
                        {step === 'review' && 'Resumo do Pedido'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {!isAddingAddress && renderStepper()}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto max-h-[60vh] px-1 py-1">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium flex items-center gap-2">
                            <X className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {isAddingAddress ? (
                        <AddressForm
                            onCancel={() => setIsAddingAddress(false)}
                            onSuccess={handleAddressSuccess}
                            tenantId={store.settings.tenant_id}
                            customerId={customer.id}
                        />
                    ) : (
                        <>
                            {/* Step 1: Delivery */}
                            {step === 'delivery' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setMode('delivery')}
                                            className={clsx(
                                                "p-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-2",
                                                mode === 'delivery'
                                                    ? "border-[#ff3d03] bg-orange-50 text-[#ff3d03]"
                                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                            )}
                                        >
                                            <MapPin className="w-6 h-6" />
                                            Entrega
                                        </button>
                                        <button
                                            onClick={() => setMode('pickup')}
                                            className={clsx(
                                                "p-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-2",
                                                mode === 'pickup'
                                                    ? "border-[#ff3d03] bg-orange-50 text-[#ff3d03]"
                                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                            )}
                                        >
                                            <div className="w-6 h-6 relative">
                                                <Wallet className="absolute w-full h-full" />
                                            </div>
                                            Retirada
                                        </button>
                                    </div>

                                    {mode === 'delivery' && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-bold text-gray-800">Selecione o Endereço</h3>
                                                <button
                                                    onClick={() => setIsAddingAddress(true)}
                                                    className="text-sm font-bold text-[#ff3d03] hover:underline"
                                                >
                                                    + Novo Endereço
                                                </button>
                                            </div>

                                            {addresses.length === 0 ? (
                                                <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                                    <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-gray-500 mb-2">Nenhum endereço cadastrado</p>
                                                    <button
                                                        onClick={() => setIsAddingAddress(true)}
                                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                                                    >
                                                        Cadastrar Agora
                                                    </button>
                                                </div>
                                            ) : (
                                                addresses.map(addr => (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => setSelectedAddressId(addr.id)}
                                                        className={clsx(
                                                            "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between group",
                                                            selectedAddressId === addr.id
                                                                ? "border-[#ff3d03] bg-orange-50/50"
                                                                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                                        )}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={clsx(
                                                                "mt-1 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0",
                                                                selectedAddressId === addr.id ? "border-[#ff3d03] bg-[#ff3d03]" : "border-gray-300"
                                                            )}>
                                                                {selectedAddressId === addr.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{addr.street}, {addr.number}</p>
                                                                <p className="text-sm text-gray-500">{addr.neighborhood} - {addr.city}</p>
                                                                {addr.complement && <p className="text-xs text-gray-400 mt-0.5">{addr.complement}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Payment */}
                            {step === 'payment' && (
                                <div className="space-y-6">
                                    {/* Coupon */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                                            <Ticket className="h-4 w-4 text-[#ff3d03]" />
                                            Cupom de Desconto
                                        </h3>
                                        {appliedCoupon ? (
                                            <div className="bg-white border border-green-200 rounded-lg p-3 flex justify-between items-center shadow-sm">
                                                <div>
                                                    <p className="font-bold text-green-700 text-sm">✓ {appliedCoupon.code}</p>
                                                    <p className="text-xs text-green-600">
                                                        Desconto de {appliedCoupon.discount_type === 'fixed' ? formatPrice(appliedCoupon.discount_value) : `${appliedCoupon.discount_value}%`}
                                                    </p>
                                                </div>
                                                <button onClick={() => setAppliedCoupon(null)} className="text-gray-400 hover:text-red-500">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                                                    placeholder="Código do cupom"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#ff3d03] focus:border-[#ff3d03]"
                                                />
                                                <button
                                                    onClick={applyCoupon}
                                                    disabled={validatingCoupon || !couponCode}
                                                    className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                                                >
                                                    Aplicar
                                                </button>
                                            </div>
                                        )}
                                        {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
                                    </div>

                                    {/* Loyalty Points Cashback */}
                                    {store?.loyalty_enabled && customer?.loyalty_points > 0 && (
                                        <div className={clsx(
                                            "p-4 rounded-xl border transition-all",
                                            usePoints ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-100"
                                        )}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                                                    <Gift className="h-4 w-4 text-orange-500" />
                                                    Abater com Pontos
                                                </h3>
                                                <Switch
                                                    checked={usePoints}
                                                    onChange={(checked: boolean) => {
                                                        setUsePoints(checked);
                                                        if (checked) {
                                                            const value = customer.loyalty_points * (store.settings?.currency_per_point || 0.10);
                                                            setPointsToUse(customer.loyalty_points);
                                                            setPointsDiscount(value);
                                                            showSuccess('Pontos Aplicados!', `Desconto de ${formatPrice(value)} adicionado.`);
                                                        } else {
                                                            setPointsToUse(0);
                                                            setPointsDiscount(0);
                                                        }
                                                    }}
                                                    className={clsx(
                                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                                        usePoints ? "bg-[#ff3d03]" : "bg-gray-200"
                                                    )}
                                                >
                                                    <span className={clsx(
                                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                        usePoints ? "translate-x-6" : "translate-x-1"
                                                    )} />
                                                </Switch>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-gray-500">Saldo: <span className="font-bold">{customer.loyalty_points} pontos</span></p>
                                                    <p className="text-[10px] text-gray-400">1 ponto = {formatPrice(store.settings?.currency_per_point || 0.10)}</p>
                                                </div>
                                                {usePoints && (
                                                    <p className="text-sm font-bold text-orange-600">-{formatPrice(pointsDiscount)}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Methods */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">Forma de Pagamento</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'credit_card', label: 'Crédito', sub: 'Maquininha', icon: CreditCard },
                                                { id: 'debit_card', label: 'Débito', sub: 'Maquininha', icon: CreditCard },
                                                { id: 'pix', label: 'PIX', sub: 'Na entrega', icon: Wallet },
                                                { id: 'cash', label: 'Dinheiro', sub: 'Espécie', icon: Banknote },
                                            ].map((m) => (
                                                <div
                                                    key={m.id}
                                                    onClick={() => setPaymentMethod(m.id as any)}
                                                    className={clsx(
                                                        "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 hover:shadow-md",
                                                        paymentMethod === m.id
                                                            ? "border-[#ff3d03] bg-orange-50 shadow-sm"
                                                            : "border-gray-100 hover:border-gray-200"
                                                    )}
                                                >
                                                    <m.icon className={clsx("w-6 h-6", paymentMethod === m.id ? "text-[#ff3d03]" : "text-gray-400")} />
                                                    <div>
                                                        <p className={clsx("font-bold text-sm", paymentMethod === m.id ? "text-[#ff3d03]" : "text-gray-700")}>{m.label}</p>
                                                        <p className="text-[10px] text-gray-400">{m.sub}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {paymentMethod === 'cash' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Troco para quanto?</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                                                <input
                                                    type="text"
                                                    value={changeFor}
                                                    onChange={(e) => setChangeFor(e.target.value)}
                                                    placeholder="0,00"
                                                    className="w-full pl-9 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ff3d03] focus:border-[#ff3d03]"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Total do pedido: {formatPrice(finalTotal)}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Review */}
                            {step === 'review' && (
                                <div className="space-y-6">
                                    {/* Order Summary Card */}
                                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-800">Resumo do Pedido</h3>
                                            <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                                                {cart.length} itens
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-3 max-h-40 overflow-y-auto">
                                            {cart.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <div className="flex gap-2">
                                                        <span className="font-bold text-gray-900">{item.quantity}x</span>
                                                        <span className="text-gray-600 line-clamp-1">{item.product.name}</span>
                                                    </div>
                                                    <span className="text-gray-900 font-medium">{formatPrice(item.subtotal)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Info */}
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
                                        <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">{mode === 'delivery' ? 'Entrega em:' : 'Retirada em Loja'}</p>
                                            {mode === 'delivery' && selectedAddressId ? (
                                                <p className="opacity-90">
                                                    {addresses.find(a => a.id === selectedAddressId)?.street}, {addresses.find(a => a.id === selectedAddressId)?.number}
                                                </p>
                                            ) : (
                                                <p className="opacity-90">Retirar no balcão.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Estimated Loyalty Points */}
                                    {estimatedPoints > 0 && (
                                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                                            <div className="bg-yellow-100 p-1.5 rounded-full text-yellow-600">
                                                <Gift className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-yellow-800">Você ganhará {estimatedPoints} pontos!</p>
                                                <p className="text-xs text-yellow-600">Neste pedido</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Totals */}
                                    <div className="space-y-2 pt-2 border-t border-gray-100">
                                        <div className="flex justify-between text-gray-500 text-sm">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        {mode === 'delivery' && (
                                            <div className="flex justify-between text-gray-500 text-sm">
                                                <span>Taxa de Entrega</span>
                                                <span>{formatPrice(deliveryFee)}</span>
                                            </div>
                                        )}
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600 text-sm font-medium">
                                                <span>Desconto</span>
                                                <span>- {formatPrice(discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end pt-2 mt-2 border-t border-gray-100">
                                            <span className="text-gray-900 font-bold">Total Final</span>
                                            <span className="text-2xl font-black text-[#ff3d03]">{formatPrice(finalTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                {!isAddingAddress && (
                    <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                        {step !== 'delivery' ? (
                            <button
                                onClick={handleBackStep}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Voltar
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                        )}

                        {step === 'review' ? (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-[2] bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Pedido'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNextStep}
                                className="flex-[2] bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                            >
                                Continuar <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
