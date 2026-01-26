import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Ticket, Plus, Pencil, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import clsx from 'clsx';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'fixed' | 'percent';
    discount_value: number;
    is_active: boolean;
    valid_until?: string;
    max_uses?: number;
    current_uses?: number;
    min_order_value?: number;
}

export default function CouponIndex({ coupons }: { coupons: { data: Coupon[] } }) {
    return (
        <AuthenticatedLayout>
            <Head title="Cupons" />

            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                            <Ticket className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Cupons de Desconto</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Crie e gerencie promoções para atrair clientes</p>
                        </div>
                    </div>
                    <Link
                        href={route('coupons.create')}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all"
                    >
                        <Plus className="h-5 w-5" /> Criar Cupom
                    </Link>
                </div>
            </div>

            {coupons.data.length === 0 ? (
                <div className="p-12 text-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-orange-200 dark:border-gray-700">
                    <Ticket className="h-16 w-16 mx-auto text-orange-300 dark:text-orange-600 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Nenhum cupom criado ainda</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Comece criando um cupom para atrair e premiar seus clientes!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.data.map((coupon) => {
                        const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
                        const isUsageLimited = coupon.max_uses && coupon.current_uses >= coupon.max_uses;

                        return (
                            <div
                                key={coupon.id}
                                className={clsx(
                                    "rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-2",
                                    coupon.is_active && !isExpired && !isUsageLimited
                                        ? "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 border-orange-200 dark:border-orange-700"
                                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75"
                                )}
                            >
                                {/* Status Badge */}
                                <div className="relative">
                                    <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-500"></div>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {coupon.is_active && !isExpired && !isUsageLimited && (
                                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">Ativo</span>
                                        )}
                                        {isExpired && (
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">Expirado</span>
                                        )}
                                        {isUsageLimited && (
                                            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">Limite atingido</span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Coupon Code */}
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Código</p>
                                        <p className="font-mono text-2xl font-black text-orange-600 dark:text-orange-400 tracking-widest">
                                            {coupon.code}
                                        </p>
                                    </div>

                                    {/* Discount Value */}
                                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 mb-4 border border-orange-100 dark:border-orange-900">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-baseline gap-2">
                                                {coupon.discount_type === 'percent' ? (
                                                    <>
                                                        <span className="text-4xl font-black text-orange-600">{coupon.discount_value}</span>
                                                        <span className="text-xl text-gray-600 dark:text-gray-400 font-bold">%</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-xl text-gray-600 dark:text-gray-400 font-bold">R$</span>
                                                        <span className="text-4xl font-black text-orange-600">{coupon.discount_value.toFixed(2)}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 rounded-lg flex items-center justify-center">
                                                {coupon.discount_type === 'percent' ? (
                                                    <Percent className="h-6 w-6 text-orange-600" />
                                                ) : (
                                                    <DollarSign className="h-6 w-6 text-orange-600" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 mb-4 text-sm">
                                        {coupon.min_order_value && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <DollarSign className="h-4 w-4" />
                                                <span>Mínimo: R$ {coupon.min_order_value.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {coupon.valid_until && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <Calendar className="h-4 w-4" />
                                                <span>Válido até: {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        )}

                                        {coupon.max_uses && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <Users className="h-4 w-4" />
                                                <span>{coupon.current_uses || 0} / {coupon.max_uses} utilizações</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar for Usage */}
                                    {coupon.max_uses && (
                                        <div className="mb-4">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 transition-all"
                                                    style={{ width: `${Math.min(((coupon.current_uses || 0) / coupon.max_uses) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Edit Button */}
                                    <Link
                                        href={route('coupons.edit', coupon.id)}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 font-bold py-2 px-4 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" /> Editar
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
