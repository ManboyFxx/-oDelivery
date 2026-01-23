import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Ticket, Plus, Pencil, Percent, DollarSign } from 'lucide-react';
import clsx from 'clsx';

interface Coupon {
    id: string;
    code: string;
    type: 'fixed' | 'percent';
    value: number;
    is_active: boolean;
    valid_until?: string;
}

export default function CouponIndex({ coupons }: { coupons: { data: Coupon[] } }) {
    return (
        <AuthenticatedLayout>
            <Head title="Cupons" />
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Ticket className="h-6 w-6 text-[var(--color-primary)]" />
                    Gerenciar Cupons
                </h2>
                <Link
                    href={route('coupons.create')}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Criar Cupom
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.data.map((coupon) => (
                    <div key={coupon.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Ticket className="h-24 w-24 transform rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-lg font-bold bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-gray-700 dark:text-gray-200 tracking-wider">
                                    {coupon.code}
                                </span>
                                <span className={clsx("h-2 w-2 rounded-full", coupon.is_active ? "bg-green-500" : "bg-red-500")}></span>
                            </div>

                            <div className="flex items-baseline gap-1 my-3 text-[var(--color-primary)]">
                                {coupon.type === 'percent' ? <Percent className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                                <span className="text-3xl font-bold">{coupon.value}</span>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {coupon.type === 'percent' ? '% OFF' : 'reais OFF'}
                                </span>
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Válido até: {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Indeterminado'}
                            </div>

                            <Link
                                href={route('coupons.edit', coupon.id)}
                                className="inline-flex items-center text-sm font-bold text-[var(--color-primary)] hover:underline"
                            >
                                <Pencil className="h-3 w-3 mr-1" /> Editar Cupom
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            {coupons.data.length === 0 && (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl">
                    Nenhum cupom ativo. Crie promoções para atrair mais clientes!
                </div>
            )}
        </AuthenticatedLayout>
    );
}
