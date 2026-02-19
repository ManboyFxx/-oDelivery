import React, { useState } from 'react';
import { CreditCard, AlertCircle, Coins, Banknote, QrCode } from 'lucide-react';
import { Switch } from '@headlessui/react';
import { router } from '@inertiajs/react';

interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    type: 'credit_card' | 'debit_card' | 'money' | 'pix';
    is_active: boolean;
    fee_percentage: number | null;
    fee_fixed: number | null;
    pix_key?: string | null;
    pix_key_type?: string | null;
}

interface PaymentSettingsProps {
    paymentMethods: PaymentMethod[];
}

const FIXED_PAYMENT_METHODS = [
    { type: 'credit_card', name: 'Cartão de Crédito', icon: CreditCard },
    { type: 'debit_card', name: 'Cartão de Débito', icon: CreditCard },
    { type: 'money', name: 'Dinheiro', icon: Banknote },
    { type: 'pix', name: 'PIX', icon: QrCode },
];

export default function PaymentSettings({ paymentMethods }: PaymentSettingsProps) {
    // Sync with props when they change (e.g. after save)
    const [methods, setMethods] = useState(() => mergeMethods(paymentMethods));

    // Helper to merge fixed + backend methods
    function mergeMethods(backendMethods: PaymentMethod[]) {
        return FIXED_PAYMENT_METHODS.map(fixed => {
            const current = backendMethods.find(m => m.type === fixed.type);
            return {
                ...fixed,
                ...current,
                id: current?.id, // Ensure ID is preserved if it exists
                is_active: !!current?.is_active,
                fee_percentage: current?.fee_percentage || '',
                fee_fixed: current?.fee_fixed || '',
                pix_key: current?.pix_key || '',
                pix_key_type: current?.pix_key_type || 'random'
            };
        });
    }

    // Effect to update local state when props change (Inertia reload)
    React.useEffect(() => {
        setMethods(mergeMethods(paymentMethods));
    }, [paymentMethods]);

    const handlePaymentToggle = (method: any) => {
        const newStatus = !method.is_active;

        // Optimistic update
        setMethods(prev => prev.map(m =>
            m.type === method.type ? { ...m, is_active: newStatus } : m
        ));

        const commonData = {
            name: method.name,
            type: method.type,
            fee_percentage: method.fee_percentage || 0,
            fee_fixed: method.fee_fixed || 0,
            is_active: newStatus,
            pix_key: method.pix_key,
            pix_key_type: method.pix_key_type
        };

        if (method.id) {
            // Update existing
            router.put(route('payment-methods.update', method.id), commonData, {
                preserveScroll: true,
                onError: () => {
                   // Rollback
                   setMethods(prev => prev.map(m =>
                        m.type === method.type ? { ...m, is_active: !newStatus } : m
                    ));
                }
            });
        } else if (newStatus) {
            // Create new (only if turning ON)
            router.post(route('payment-methods.store'), commonData, {
                preserveScroll: true,
                onError: () => {
                    // Rollback
                    setMethods(prev => prev.map(m =>
                        m.type === method.type ? { ...m, is_active: false } : m
                    ));
                }
            });
        }
    };

    const handlePaymentUpdate = (method: any, field: string, value: any) => {
        setMethods(prev => prev.map(m =>
            m.type === method.type ? { ...m, [field]: value } : m
        ));
    };

    const savePaymentMethod = (method: any) => {
        if (!method.id) return;

        router.put(route('payment-methods.update', method.id), {
            name: method.name,
            type: method.type,
            is_active: method.is_active,
            fee_percentage: method.fee_percentage || 0,
            fee_fixed: method.fee_fixed || 0,
            pix_key: method.pix_key,
            pix_key_type: method.pix_key_type
        }, {
            preserveScroll: true
        });
    };

    return (
        <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 dark:text-gray-200 flex items-center gap-2 font-bold">
                    <CreditCard className="h-5 w-5 text-[#ff3d03]" />
                    Formas de Pagamento
                </h3>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium">Validação em Todo o Sistema</p>
                    <p className="mt-1">Gerencie as formas de pagamento aceitas. Ative as opções e configure as taxas.</p>
                </div>
            </div>

            <div className="space-y-4">
                {methods.map((method: any) => {
                    const Icon = method.icon;
                    return (
                        <div key={method.type} className="bg-gray-50 dark:bg-premium-dark rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm">
                                        <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{method.name}</h4>
                                </div>
                                <Switch
                                    checked={method.is_active}
                                    onChange={() => handlePaymentToggle(method)}
                                    className={`${method.is_active ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                >
                                    <span className={`${method.is_active ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                </Switch>
                            </div>

                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ${!method.is_active ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                {(method.type === 'credit_card' || method.type === 'debit_card' || method.type === 'pix') && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Taxa (%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={method.fee_percentage}
                                                onChange={(e) => handlePaymentUpdate(method, 'fee_percentage', e.target.value)}
                                                onBlur={() => savePaymentMethod(method)}
                                                disabled={!method.is_active}
                                                className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Taxa Fixa (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={method.fee_fixed}
                                                onChange={(e) => handlePaymentUpdate(method, 'fee_fixed', e.target.value)}
                                                onBlur={() => savePaymentMethod(method)}
                                                disabled={!method.is_active}
                                                className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                                            />
                                        </div>
                                    </>
                                )}

                                {method.type === 'pix' && (
                                    <div className="md:col-span-2 space-y-4 pt-2 border-t border-gray-200 dark:border-white/5 mt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Tipo de Chave</label>
                                                <select
                                                    value={method.pix_key_type || 'random'}
                                                    onChange={(e) => handlePaymentUpdate(method, 'pix_key_type', e.target.value)}
                                                    onBlur={() => savePaymentMethod(method)}
                                                    disabled={!method.is_active}
                                                    className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                                                >
                                                    <option value="cpf">CPF</option>
                                                    <option value="cnpj">CNPJ</option>
                                                    <option value="email">E-mail</option>
                                                    <option value="phone">Telefone</option>
                                                    <option value="random">Chave Aleatória</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Chave PIX</label>
                                                <input
                                                    type="text"
                                                    value={method.pix_key || ''}
                                                    onChange={(e) => handlePaymentUpdate(method, 'pix_key', e.target.value)}
                                                    onBlur={() => savePaymentMethod(method)}
                                                    disabled={!method.is_active}
                                                    placeholder="Digite sua chave PIX..."
                                                    className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
