import { useState, useEffect, useMemo } from 'react';
import Modal from '@/Components/Modal';
import { PointsEarnedAnimation } from '@/Components/PointsEarnedAnimation';
import { X, MapPin, DollarSign, Wallet, CreditCard, Banknote, CheckCircle, Loader2, Gift, Ticket, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { useToast } from '@/Hooks/useToast';
import { usePushNotifications } from '@/Hooks/usePushNotifications';
import AddressForm from './Components/AddressForm';
import { Switch } from '@headlessui/react';
import { toast } from 'sonner';

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
    activeTable?: any;
}

export default function CheckoutModal({ show, onClose, cart, store, customer, total, addresses: initialAddresses, onSuccess, activeTable }: CheckoutModalProps) {
    const [step, setStep] = useState<'delivery' | 'payment' | 'review'>(activeTable ? 'review' : 'delivery');
    const [mode, setMode] = useState<'delivery' | 'pickup' | 'table'>(activeTable ? 'table' : 'delivery');
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

    const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);
    const [verificationDigits, setVerificationDigits] = useState('');

    // Delivery Zone Validation
    const [isValidZone, setIsValidZone] = useState<boolean | null>(null);
    const [validatingAddress, setValidatingAddress] = useState(false);
    const [deliveryFeeOverride, setDeliveryFeeOverride] = useState<number | null>(null);
    const [zoneMessage, setZoneMessage] = useState('');
    const [availableZones, setAvailableZones] = useState<any[]>([]);
    const [neighborhoodOverride, setNeighborhoodOverride] = useState('');

    const { success: showSuccess } = useToast();
    const { requestPermission } = usePushNotifications(customer);

    useEffect(() => {
        setAddresses(initialAddresses);
    }, [initialAddresses]);

    useEffect(() => {
        if (show && addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find(a => a.is_default);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else setSelectedAddressId(addresses[0].id);
        }
        
        // Auto-open address form if delivery and no addresses
        if (show && mode === 'delivery' && addresses.length === 0 && !isAddingAddress && !activeTable) {
            setIsAddingAddress(true);
        }

        if (show) {
            if (activeTable) {
                setStep('review');
                setMode('table');
            } else if (step === 'review') {
                // If closed and reopened, could reset to delivery. Wait, let's keep current behavior.
            }
        }
    }, [show, addresses, mode, isAddingAddress, activeTable]);

    // Fetch available delivery zones once
    useEffect(() => {
        const tenantId = store?.settings?.tenant_id;
        if (!tenantId) return;
        axios.get(`/api/delivery-zones?tenant_id=${tenantId}`)
            .then(res => setAvailableZones(res.data))
            .catch(() => {});
    }, [store?.settings?.tenant_id]);

    // Validate Zone when address changes
    useEffect(() => {
        if (mode !== 'delivery' || !selectedAddressId) {
            setIsValidZone(true);
            setDeliveryFeeOverride(null);
            setZoneMessage('');
            return;
        }

        const addr = addresses.find(a => a.id === selectedAddressId);
        if (!addr) return;

        // Reset override when switching address
        setNeighborhoodOverride('');

        // If no zones configured, allow any neighborhood
        if (availableZones.length === 0) {
            setIsValidZone(true);
            setDeliveryFeeOverride(null);
            setZoneMessage('');
            return;
        }

        const neighborhood = addr.neighborhood;
        const zone = availableZones.find(
            z => z.neighborhood.toLowerCase() === neighborhood.toLowerCase()
        );

        if (zone) {
            setIsValidZone(true);
            setDeliveryFeeOverride(Number(zone.delivery_fee));
            setZoneMessage('');
        } else {
            setIsValidZone(false);
            setDeliveryFeeOverride(null);
            setZoneMessage('Não entregamos neste bairro. Selecione um bairro atendido abaixo.');
        }
    }, [selectedAddressId, mode, addresses, availableZones]);

    const deliveryNeighborhood = (() => {
        if (mode !== 'delivery') return null;
        if (neighborhoodOverride) return neighborhoodOverride;
        const addr = addresses.find(a => a.id === selectedAddressId);
        return addr?.neighborhood || null;
    })();

    // Calculate details
    const deliveryFee = (mode === 'delivery' && isValidZone !== false) ? (deliveryFeeOverride !== null ? deliveryFeeOverride : (store.settings?.delivery_fee || 5.00)) : 0;

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

    const handleNextStep = async () => {
        if (step === 'delivery') {
            if (mode === 'delivery' && !selectedAddressId) {
                setError('Selecione um endereço para entrega.');
                return;
            }

            // If neighborhood was overridden because of invalid zone, update the address
            if (mode === 'delivery' && neighborhoodOverride) {
                const currentAddr = addresses.find(a => a.id === selectedAddressId);
                if (currentAddr) {
                    try {
                        setLoading(true);
                        const response = await axios.put(`/customer/addresses/${selectedAddressId}`, {
                            ...currentAddr,
                            neighborhood: neighborhoodOverride
                        });

                        // Update local state with new address details
                        setAddresses(prev => prev.map(a => 
                            a.id === selectedAddressId ? response.data.address : a
                        ));
                        
                        // Clear override as the address is now correct
                        setNeighborhoodOverride('');
                        setIsValidZone(true); // Should be valid now
                    } catch (err) {
                        console.error("Error updating address neighborhood:", err);
                        toast.error("Erro ao atualizar bairro do endereço. Tente novamente.");
                        setLoading(false);
                        return; // Stop here
                    } finally {
                        setLoading(false);
                    }
                }
            }

            if (mode === 'delivery' && isValidZone === false) {
                setError('Selecione um bairro atendido para continuar.');
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
        if (!store.is_open) {
            setError('A loja está fechada no momento. Não é possível concluir o pedido.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                tenant_id: store.settings.tenant_id,
                customer_id: customer.id,
                mode: activeTable ? 'table' : mode,
                table_id: activeTable ? activeTable.id : null,
                address_id: mode === 'delivery' && !activeTable ? selectedAddressId : null,
                payment_method: activeTable ? null : paymentMethod,
                change_for: paymentMethod === 'cash' && !activeTable ? parseFloat(changeFor.replace(',', '.')) : null,
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
                    requestPermission();
                    window.location.href = trackingUrl;
                }, 3500);
            } else {
                showSuccess('Pedido Realizado!', 'Redirecionando para acompanhamento...');
                setTimeout(() => {
                    requestPermission();
                    window.location.href = trackingUrl;
                }, 1500);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 403 && err.response?.data?.requires_identity_verification) {
                setIsVerifyingIdentity(true);
                toast.warning('Confirme sua identidade para continuar.');
            } else {
                setError(err.response?.data?.message || 'Erro ao processar pedido.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleIdentityVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ensure fingerprint exists
            let fingerprint = localStorage.getItem('device_fingerprint');
            if (!fingerprint) {
                 fingerprint = 'device-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
                 localStorage.setItem('device_fingerprint', fingerprint);
            }

            const response = await axios.post('/customer/quick-login', {
                phone_last_4: verificationDigits,
                customer_id: customer.id,
                device_fingerprint: fingerprint
            });

            if (response.data.success) {
                toast.success('Identidade confirmada!');
                setIsVerifyingIdentity(false);
                // Retry checkout automatically
                handleSubmit(); 
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Dígitos incorretos.');
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
                            isActive ? "bg-primary border-primary text-white shadow-lg scale-110" :
                                isCompleted ? "bg-green-500 border-green-500 text-white" :
                                    "bg-white dark:bg-premium-card border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                        )}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className={clsx(
                            "text-xs font-semibold mt-2 transition-colors duration-300",
                            isActive ? "text-primary" : isCompleted ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"
                        )}>{s.label}</span>
                    </div>
                );
            })}
            {/* Progress Bar Background */}
            {!activeTable && (
                <>
                    <div className="absolute top-[4.5rem] left-10 right-10 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0 transition-colors duration-300" />
                    <div className={clsx(
                        "absolute top-[4.5rem] left-10 h-0.5 bg-green-500 transition-all duration-300 -z-0",
                        step === 'delivery' ? "w-0" : step === 'payment' ? "w-1/2" : "w-[calc(100%-5rem)]"
                    )} />
                </>
            )}
        </div>
    );

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <PointsEarnedAnimation
                points={earnedPoints}
                show={showPointsAnimation}
                onComplete={() => setShowPointsAnimation(false)}
            />

            <div className="p-6 min-h-[500px] flex flex-col bg-white dark:bg-premium-dark transition-colors duration-300">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    {step !== 'delivery' && !activeTable ? (
                        <button onClick={handleBackStep} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors duration-300">
                            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        </button>
                    ) : (
                        <div />
                    )}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                        {isVerifyingIdentity ? 'Confirmação de Segurança' : (
                            <>
                                {step === 'delivery' && 'Entrega ou Retirada'}
                                {step === 'payment' && 'Pagamento'}
                                {step === 'review' && 'Resumo do Pedido'}
                            </>
                        )}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {isVerifyingIdentity ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4 transition-colors duration-300">
                             <CheckCircle className="w-8 h-8 text-[#ff3d03]" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center transition-colors duration-300">Protegendo sua conta</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6 transition-colors duration-300">
                              Para continuar, confirme os <strong>4 últimos dígitos</strong> do seu telefone.
                          </p>
                         
                         <form onSubmit={handleIdentityVerify} className="w-full max-w-xs space-y-4">
                             <input
                                type="text"
                                value={verificationDigits}
                                onChange={(e) => setVerificationDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                 placeholder="0000"
                                 className="w-full text-center text-2xl font-bold tracking-widest py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-white/5 dark:text-white rounded-xl focus:border-primary dark:focus:border-primary focus:ring-0 outline-none transition-all duration-300"
                                 autoFocus
                              />
                             <button
                                type="submit"
                                disabled={loading || verificationDigits.length < 4}
                                className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                             >
                                 {loading ? 'Verificando...' : 'Confirmar'}
                             </button>
                              <button
                                 type="button"
                                 onClick={() => setIsVerifyingIdentity(false)}
                                 className="w-full text-gray-400 dark:text-gray-500 font-medium text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                              >
                                 Cancelar
                             </button>
                         </form>
                    </div>
                ) : (
                    <>
                    {!isAddingAddress && !activeTable && renderStepper()}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto max-h-[60vh] px-1 py-1">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm font-medium flex items-center gap-2 transition-colors duration-300">
                            <X className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {isAddingAddress ? (
                        <AddressForm
                            onCancel={() => setIsAddingAddress(false)}
                            onSuccess={handleAddressSuccess}
                            tenantId={store.settings.tenant_id}
                            customerId={customer.id}
                            preloadedZones={availableZones}
                            store={store}
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
                                            "p-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-2 duration-300",
                                            mode === 'delivery'
                                                ? "border-[#ff3d03] bg-[#ff3d03]/5 text-[#ff3d03] shadow-md shadow-orange-500/10"
                                                : "border-gray-200 dark:border-gray-700 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 bg-white"
                                        )}
                                    >
                                        <MapPin className="w-6 h-6" />
                                        Entrega
                                    </button>
                                    <button
                                        onClick={() => setMode('pickup')}
                                        className={clsx(
                                            "p-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-2 duration-300",
                                            mode === 'pickup'
                                                ? "border-[#ff3d03] bg-[#ff3d03]/5 text-[#ff3d03] shadow-md shadow-orange-500/10"
                                                : "border-gray-200 dark:border-gray-700 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 bg-white"
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
                                            <div className="flex justify-between items-center bg-white dark:bg-premium-dark transition-colors duration-300">
                                                <h3 className="font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">Selecione o Endereço</h3>
                                                <button
                                                    onClick={() => setIsAddingAddress(true)}
                                                    className="px-3 py-1.5 rounded-lg bg-[#ff3d03]/10 text-[#ff3d03] text-sm font-bold hover:bg-[#ff3d03]/20 transition-colors"
                                                >
                                                    + Novo Endereço
                                                </button>
                                            </div>

                                            {validatingAddress && (
                                                <div className="flex items-center gap-2 text-xs text-gray-400 py-1 transition-colors duration-300">
                                                    <Loader2 className="w-3 h-3 animate-spin text-primary" /> Validando entrega...
                                                </div>
                                            )}

                                            {!validatingAddress && isValidZone === false && zoneMessage && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-colors duration-300">
                                                        <X className="w-4 h-4" /> {zoneMessage}
                                                    </div>
                                                    {availableZones.length > 0 && (
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                                                Selecione um bairro atendido:
                                                            </label>
                                                            <select
                                                                value={neighborhoodOverride}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setNeighborhoodOverride(val);
                                                                    const zone = availableZones.find(z => z.neighborhood === val);
                                                                    if (zone) {
                                                                        setIsValidZone(true);
                                                                        setDeliveryFeeOverride(Number(zone.delivery_fee));
                                                                        setZoneMessage('');
                                                                    }
                                                                }}
                                                                className="w-full text-sm p-3 rounded-xl border-2 border-orange-200 dark:border-orange-800/50 dark:bg-white/5 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                                            >
                                                                <option value="">Selecione o bairro...</option>
                                                                {availableZones.map(zone => (
                                                                    <option key={zone.id || zone.neighborhood} value={zone.neighborhood}>
                                                                        {zone.neighborhood} — R$ {Number(zone.delivery_fee).toFixed(2).replace('.', ',')}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <div className="mt-1 text-[10px] text-gray-500 text-right">
                                                                * Seleção obrigatória para cálculo do frete
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {addresses.length === 0 ? (
                                                <div className="text-center py-6 bg-gray-50 dark:bg-white/5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                                    <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2 transition-colors duration-300" />
                                                    <p className="text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">Nenhum endereço cadastrado</p>
                                                    <button
                                                        onClick={() => setIsAddingAddress(true)}
                                                        className="px-4 py-2 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white transition-colors duration-300"
                                                    >
                                                        Cadastrar Agora
                                                    </button>
                                                </div>
                                            ) : (
                                                addresses.map(addr => {
                                                    const isSelected = selectedAddressId === addr.id;
                                                    return (
                                                        <div
                                                            key={addr.id}
                                                            onClick={() => setSelectedAddressId(addr.id)}
                                                            className={clsx(
                                                                "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between group duration-300",
                                                                isSelected
                                                                    ? (isValidZone === false 
                                                                        ? "border-red-400 bg-red-50 dark:bg-red-900/10 ring-1 ring-red-400" 
                                                                        : "border-[#ff3d03] bg-[#ff3d03]/5 dark:bg-[#ff3d03]/10 ring-1 ring-[#ff3d03]")
                                                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 hover:border-orange-200 hover:bg-orange-50/30"
                                                            )}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className={clsx(
                                                                    "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300",
                                                                    isSelected 
                                                                        ? (isValidZone === false 
                                                                            ? "border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/20" 
                                                                            : "border-[#ff3d03] bg-[#ff3d03] text-white shadow-sm shadow-orange-500/20") 
                                                                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5"
                                                                )}>
                                                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{addr.street}, {addr.number}</p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{addr.neighborhood} - {addr.city}</p>
                                                                    {addr.complement && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 transition-colors duration-300">{addr.complement}</p>}
                                                                </div>
                                                            </div>
                                                            {isSelected && isValidZone && (
                                                                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full animate-in zoom-in-95 duration-300 uppercase tracking-tighter">
                                                                    Área Coberta
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Payment */}
                            {step === 'payment' && (
                                <div className="space-y-6">
                                    {/* Coupon */}
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 transition-colors duration-300">
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm transition-colors duration-300">
                                            <Ticket className="h-4 w-4 text-primary" />
                                            Cupom de Desconto
                                        </h3>
                                        {appliedCoupon ? (
                                            <div className="bg-white dark:bg-white/5 border border-green-200 dark:border-green-800/50 rounded-lg p-3 flex justify-between items-center shadow-sm transition-colors duration-300">
                                                <div>
                                                    <p className="font-bold text-green-700 dark:text-green-400 text-sm transition-colors duration-300">✓ {appliedCoupon.code}</p>
                                                    <p className="text-xs text-green-600 dark:text-green-500/80 transition-colors duration-300">
                                                        Desconto de {appliedCoupon.discount_type === 'fixed' ? formatPrice(appliedCoupon.discount_value) : `${appliedCoupon.discount_value}%`}
                                                    </p>
                                                </div>
                                                <button onClick={() => setAppliedCoupon(null)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-300">
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
                                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-white/5 dark:text-white rounded-lg text-sm focus:ring-primary focus:border-primary transition-colors duration-300"
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
                                            "p-4 rounded-xl border transition-all duration-300",
                                            usePoints ? "bg-orange-50 dark:bg-[#ff3d03]/10 border-orange-200 dark:border-[#ff3d03]/30" : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5"
                                        )}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm transition-colors duration-300">
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
                                                        usePoints ? "bg-primary" : "bg-gray-200"
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
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Saldo: <span className="font-bold">{customer.loyalty_points} pontos</span></p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 transition-colors duration-300">1 ponto = {formatPrice(store.settings?.currency_per_point || 0.10)}</p>
                                                </div>
                                                {usePoints && (
                                                    <p className="text-sm font-bold text-orange-600">-{formatPrice(pointsDiscount)}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Methods */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Forma de Pagamento</h3>
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
                                                        "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 hover:shadow-md duration-300",
                                                        paymentMethod === m.id
                                                            ? "border-primary bg-orange-50 dark:bg-primary/10 shadow-sm"
                                                            : "border-gray-100 dark:border-gray-700 bg-white dark:bg-white/5 hover:border-gray-200 dark:hover:border-gray-600"
                                                    )}
                                                >
                                                    <m.icon className={clsx("w-6 h-6 transition-colors duration-300", paymentMethod === m.id ? "text-primary" : "text-gray-400 dark:text-gray-500")} />
                                                    <div>
                                                        <p className={clsx("font-bold text-sm transition-colors duration-300", paymentMethod === m.id ? "text-primary" : "text-gray-700 dark:text-gray-200")}>{m.label}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 transition-colors duration-300">{m.sub}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {paymentMethod === 'cash' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Troco para quanto?</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400 transition-colors duration-300">R$</span>
                                                <input
                                                    type="text"
                                                    value={changeFor}
                                                    onChange={(e) => setChangeFor(e.target.value)}
                                                    placeholder="0,00"
                                                    className="w-full pl-9 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-white/5 dark:text-white rounded-lg focus:ring-[#ff3d03] focus:border-[#ff3d03] transition-colors duration-300"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Total do pedido: {formatPrice(finalTotal)}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Review */}
                            {step === 'review' && (
                                <div className="space-y-6">
                                    {/* Order Summary Card */}
                                    <div className="bg-white dark:bg-premium-card border border-gray-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
                                        <div className="bg-gray-50 dark:bg-white/5 px-4 py-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center transition-colors duration-300">
                                            <h3 className="font-bold text-gray-800 dark:text-white transition-colors duration-300">Resumo do Pedido</h3>
                                            <span className="text-xs font-medium bg-gray-200 dark:bg-white/10 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                                {cart.length} itens
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-3 max-h-40 overflow-y-auto">
                                            {cart.map((item, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <div className="flex gap-2">
                                                            <span className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{item.quantity}x</span>
                                                            <span className="font-bold text-gray-700 dark:text-gray-200 transition-colors duration-300 line-clamp-1">{item.product.name}</span>
                                                        </div>
                                                        <span className="text-gray-900 dark:text-white font-medium transition-colors duration-300">{formatPrice(item.subtotal)}</span>
                                                    </div>
                                                    
                                                    {/* Complements */}
                                                    {item.selectedComplements.length > 0 && (
                                                        <div className="pl-7 space-y-0.5">
                                                            {item.selectedComplements.map((c: any, cIdx: number) => (
                                                                <p key={cIdx} className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                                                                    + {c.name}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Notes */}
                                                    {item.notes && (
                                                        <div className="pl-7">
                                                            <p className="text-[10px] italic text-gray-400 dark:text-gray-500 line-clamp-2">
                                                                Obs: {item.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Info */}
                                    <div className={clsx("flex items-start gap-3 p-3 rounded-xl text-sm transition-colors duration-300", activeTable ? "bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300" : "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300")}>
                                        <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            {activeTable ? (
                                                <>
                                                    <p className="font-bold">Consumo na Mesa</p>
                                                    <p className="opacity-90">Mesa {activeTable.number}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-bold">{mode === 'delivery' ? 'Entrega em:' : 'Retirada em Loja'}</p>
                                                    {mode === 'delivery' && selectedAddressId ? (
                                                        <p className="opacity-90">
                                                            {addresses.find(a => a.id === selectedAddressId)?.street}, {addresses.find(a => a.id === selectedAddressId)?.number}
                                                        </p>
                                                    ) : (
                                                        <p className="opacity-90">Retirar no balcão.</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Estimated Loyalty Points */}
                                    {/* Estimated Loyalty Points */}
                                    {estimatedPoints > 0 && (
                                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/20 transition-colors duration-300">
                                            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-1.5 rounded-full text-yellow-600 dark:text-yellow-400 transition-colors duration-300">
                                                <Gift className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400 transition-colors duration-300">Você ganhará {estimatedPoints} pontos!</p>
                                                <p className="text-xs text-yellow-600 dark:text-yellow-500/80 transition-colors duration-300">Neste pedido</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Totals */}
                                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
                                        <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        {mode === 'delivery' && (
                                            <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
                                                <span>Taxa de Entrega</span>
                                                <span>{formatPrice(deliveryFee)}</span>
                                            </div>
                                        )}
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600 dark:text-green-400 text-sm font-medium transition-colors duration-300">
                                                <span>Desconto</span>
                                                <span>- {formatPrice(discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end pt-2 mt-2 border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
                                            <span className="text-gray-900 dark:text-white font-bold transition-colors duration-300">Total Final</span>
                                            <span className="text-2xl font-black text-primary">{formatPrice(finalTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                {!isAddingAddress && (
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex gap-3 transition-colors duration-300">
                        {step !== 'delivery' && !activeTable ? (
                            <button
                                onClick={handleBackStep}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors duration-300"
                            >
                                Voltar
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors duration-300"
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
                                disabled={loading || (mode === 'delivery' && !selectedAddressId) || (mode === 'delivery' && isValidZone === false)}
                                className={clsx(
                                    "flex-[2] px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200",
                                    (loading || (mode === 'delivery' && !selectedAddressId) || (mode === 'delivery' && isValidZone === false))
                                        ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none text-gray-500" 
                                        : "bg-[#ff3d03] hover:bg-[#e63700] hover:shadow-orange-500/40 text-white"
                                )}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>Continuar <ChevronRight className="w-5 h-5" /></>
                                )}
                            </button>
                        )}
                    </div>
                )}
                </>
            )}
            </div>
        </Modal>
    );
}
