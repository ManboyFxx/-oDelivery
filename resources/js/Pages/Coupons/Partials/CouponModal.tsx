import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { Ticket, X, DollarSign, Percent, Save } from 'lucide-react';
import { FormEvent, useEffect } from 'react';
import { toast } from 'sonner';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'fixed' | 'percent';
    discount_value: number;
    is_active: boolean;
    valid_until?: string;
    max_uses?: number;
    min_order_value?: number;
}

interface Props {
    show: boolean;
    onClose: () => void;
    coupon?: Coupon | null;
}

export default function CouponModal({ show, onClose, coupon }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        discount_type: 'fixed' as 'fixed' | 'percent',
        discount_value: '',
        is_active: true,
        valid_until: '',
        max_uses: '',
        min_order_value: '',
    });

    useEffect(() => {
        if (coupon) {
            setData({
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value.toString(),
                is_active: coupon.is_active,
                valid_until: coupon.valid_until || '',
                max_uses: coupon.max_uses?.toString() || '',
                min_order_value: coupon.min_order_value?.toString() || '',
            });
        } else {
            reset();
        }
        clearErrors();
    }, [coupon, show]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (coupon) {
            put(route('coupons.update', coupon.id), {
                onSuccess: () => {
                    toast.success('Cupom atualizado com sucesso!');
                    onClose();
                },
            });
        } else {
            post(route('coupons.store'), {
                onSuccess: () => {
                    toast.success('Cupom criado com sucesso!');
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                            {coupon ? 'Editar Cupom' : 'Criar Novo Cupom'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Code */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Código do Cupom *
                        </label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={e => setData('code', e.target.value.toUpperCase())}
                            placeholder="Ex: PROMO20"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                        {errors.code && <p className="mt-1 text-sm text-red-600 font-bold">{errors.code}</p>}
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Tipo de Desconto *
                            </label>
                            <select
                                value={data.discount_type}
                                onChange={e => setData('discount_type', e.target.value as 'fixed' | 'percent')}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-bold"
                            >
                                <option value="fixed">Valor Fixo (R$)</option>
                                <option value="percent">Percentual (%)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Valor do Desconto *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={data.discount_value}
                                    onChange={e => setData('discount_value', e.target.value)}
                                    placeholder="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-black"
                                    required
                                />
                                <div className="absolute right-4 top-3 text-gray-500">
                                    {data.discount_type === 'percent' ? <Percent className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                                </div>
                            </div>
                            {errors.discount_value && <p className="mt-1 text-sm text-red-600 font-bold">{errors.discount_value}</p>}
                        </div>
                    </div>

                    {/* Minimum Order Value */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Valor Mínimo do Pedido (R$)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.min_order_value}
                                onChange={e => setData('min_order_value', e.target.value)}
                                placeholder="0"
                                step="0.01"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                            <div className="absolute right-4 top-3 text-gray-500">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        {errors.min_order_value && <p className="mt-1 text-sm text-red-600 font-bold">{errors.min_order_value}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Valid Until */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Válido Até
                            </label>
                            <input
                                type="date"
                                value={data.valid_until}
                                onChange={e => setData('valid_until', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                            {errors.valid_until && <p className="mt-1 text-sm text-red-600 font-bold">{errors.valid_until}</p>}
                        </div>

                        {/* Max Uses */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Limite de Uso
                            </label>
                            <input
                                type="number"
                                value={data.max_uses}
                                onChange={e => setData('max_uses', e.target.value)}
                                placeholder="Ilimitado"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                            {errors.max_uses && <p className="mt-1 text-sm text-red-600 font-bold">{errors.max_uses}</p>}
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Cupom disponível para uso imediato
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                        >
                            {processing ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            {coupon ? 'Salvar Alterações' : 'Criar Cupom'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
