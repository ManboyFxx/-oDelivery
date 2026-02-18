import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Ticket, Plus, Calendar, CheckCircle, XCircle, Trash2,
    Edit, AlertCircle, Percent, DollarSign
} from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

interface PlanCoupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_uses: number | null;
    current_uses: number;
    valid_until: string | null;
    is_active: boolean;
    plan_restriction: string | null;
    created_at: string;
}

interface IndexProps {
    coupons: {
        data: PlanCoupon[];
        links: any[];
    };
}

export default function AdminPlanCouponsIndex({ coupons }: IndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<PlanCoupon | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        max_uses: '',
        valid_until: '',
        plan_restriction: '',
        is_active: true
    });

    const openModal = (coupon?: PlanCoupon) => {
        clearErrors();
        if (coupon) {
            setEditingCoupon(coupon);
            setData({
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value.toString(),
                max_uses: coupon.max_uses ? coupon.max_uses.toString() : '',
                valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
                plan_restriction: coupon.plan_restriction || '',
                is_active: coupon.is_active
            });
        } else {
            setEditingCoupon(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCoupon) {
            put(route('admin.plan-coupons.update', editingCoupon.id), {
                onSuccess: closeModal
            });
        } else {
            post(route('admin.plan-coupons.store'), {
                onSuccess: closeModal
            });
        }
    };

    const handleToggle = (coupon: PlanCoupon) => {
        router.post(route('admin.plan-coupons.toggle', coupon.id));
    };

    const handleDelete = (coupon: PlanCoupon) => {
        if (confirm('Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.')) {
            router.delete(route('admin.plan-coupons.destroy', coupon.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gerenciar Cupons de Planos" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Cupons de Planos</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Gerencie descontos para assinaturas</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ff3d03] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63700] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Cupom
                    </button>
                </div>

                {/* Coupons Table */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">Código</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase">Desconto</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase">Uso</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                                    <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                                            Nenhum cupom encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.data.map((coupon) => (
                                        <tr key={coupon.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-bold text-gray-900 dark:text-white">{coupon.code}</span>
                                                    {coupon.plan_restriction && (
                                                        <span className="text-xs text-blue-500">Apenas {coupon.plan_restriction.toUpperCase()}</span>
                                                    )}
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5" title="Sincronizado com Stripe">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#635BFF]"></div>
                                                        Stripe
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
                                                    {coupon.discount_type === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                                                    {coupon.discount_value}
                                                    {coupon.discount_type === 'percentage' ? '%' : ''}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {coupon.current_uses} / {coupon.max_uses || '∞'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleToggle(coupon)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${coupon.is_active
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {coupon.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                    {coupon.is_active ? 'Ativo' : 'Inativo'}
                                                </button>
                                                {coupon.valid_until && (
                                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                        <Calendar size={10} />
                                                        Até {new Date(coupon.valid_until).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openModal(coupon)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit size={16} />
                                                    </button>

                                                    {coupon.current_uses === 0 && (
                                                        <button onClick={() => handleDelete(coupon)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Criação/Edição */}
                <Modal show={isModalOpen} onClose={closeModal}>
                    <form onSubmit={handleSubmit} className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
                        </h2>

                        <div className="space-y-4">
                            {/* Código */}
                            <div>
                                <InputLabel value="Código do Cupom" />
                                <TextInput
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase())}
                                    className="w-full uppercase font-mono"
                                    placeholder="EX: PRO30"
                                    disabled={!!editingCoupon} // Não pode mudar código depois de criado
                                />
                                <InputError message={errors.code} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Tipo */}
                                <div>
                                    <InputLabel value="Tipo de Desconto" />
                                    <select
                                        value={data.discount_type}
                                        onChange={e => setData('discount_type', e.target.value as any)}
                                        className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-[#ff3d03] focus:ring-[#ff3d03] rounded-xl shadow-sm"
                                    >
                                        <option value="percentage">Porcentagem (%)</option>
                                        <option value="fixed">Valor Fixo (R$)</option>
                                    </select>
                                </div>

                                {/* Valor */}
                                <div>
                                    <InputLabel value="Valor do Desconto" />
                                    <TextInput
                                        type="number"
                                        value={data.discount_value}
                                        onChange={e => setData('discount_value', e.target.value)}
                                        className="w-full"
                                        placeholder="EX: 30"
                                    />
                                    <InputError message={errors.discount_value} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Limite de Uso */}
                                <div>
                                    <InputLabel value="Limite de Uso (Opcional)" />
                                    <TextInput
                                        type="number"
                                        value={data.max_uses}
                                        onChange={e => setData('max_uses', e.target.value)}
                                        className="w-full"
                                        placeholder="Infinito"
                                    />
                                </div>

                                {/* Validade */}
                                <div>
                                    <InputLabel value="Validade (Opcional)" />
                                    <TextInput
                                        type="date"
                                        value={data.valid_until}
                                        onChange={e => setData('valid_until', e.target.value)}
                                        className="w-full"
                                    />
                                    <InputError message={errors.valid_until} className="mt-2" />
                                </div>
                            </div>

                            {/* Restrição de Plano */}
                            <div>
                                <InputLabel value="Restrito ao Plano (Opcional)" />
                                <select
                                    value={data.plan_restriction}
                                    onChange={e => setData('plan_restriction', e.target.value)}
                                    className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-[#ff3d03] focus:ring-[#ff3d03] rounded-xl shadow-sm"
                                >
                                    <option value="">Todos os Planos</option>
                                    <option value="pro">Pro</option>
                                    <option value="custom">Personalizado</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {editingCoupon ? 'Atualizar' : 'Criar'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
