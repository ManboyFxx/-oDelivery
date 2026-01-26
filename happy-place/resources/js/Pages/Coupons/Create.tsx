import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Ticket, ArrowLeft, DollarSign, Percent } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

export default function CouponCreate() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'fixed' as 'fixed' | 'percent',
        discount_value: '',
        is_active: true,
        valid_until: '',
        max_uses: '',
        min_order_value: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await router.post(route('coupons.store'), formData, {
                onSuccess: () => {
                    toast.success('Cupom criado com sucesso!');
                    router.visit(route('coupons.index'));
                },
                onError: (errors) => {
                    toast.error('Erro ao criar cupom');
                    console.error(errors);
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Criar Cupom" />

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <button
                        onClick={() => router.visit(route('coupons.index'))}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Criar Cupom</h1>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    {/* Code */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Código do Cupom *
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="Ex: PROMO20"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Tipo de Desconto *
                            </label>
                            <select
                                name="discount_type"
                                value={formData.discount_type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                                    name="discount_value"
                                    value={formData.discount_value}
                                    onChange={handleChange}
                                    placeholder="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                />
                                <div className="absolute right-4 top-3 text-gray-500">
                                    {formData.discount_type === 'percent' ? <Percent className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Minimum Order Value */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Valor Mínimo do Pedido (R$)
                        </label>
                        <input
                            type="number"
                            name="min_order_value"
                            value={formData.min_order_value}
                            onChange={handleChange}
                            placeholder="0"
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Valid Until */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Válido Até
                        </label>
                        <input
                            type="date"
                            name="valid_until"
                            value={formData.valid_until}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Max Uses */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Uso Máximo (deixe vazio para ilimitado)
                        </label>
                        <input
                            type="number"
                            name="max_uses"
                            value={formData.max_uses}
                            onChange={handleChange}
                            placeholder="Ex: 100"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Active Status */}
                    <div className="mb-8 flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-gray-300"
                        />
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Cupom Ativo
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit(route('coupons.index'))}
                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all"
                        >
                            {loading ? 'Criando...' : 'Criar Cupom'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
