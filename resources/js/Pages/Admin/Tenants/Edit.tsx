
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { FormEventHandler, useState } from 'react';
import { Save, ArrowLeft, Shield } from 'lucide-react';

interface Props {
    tenant: any;
    plans: any[];
    currentLimits: any;
}

export default function EditTenant({ tenant, plans, currentLimits }: Props) {
    // Check if current plan is not in standard plans list (or has overrides), implying custom behavior
    const isCustomInitially = tenant.plan === 'custom' || !plans.find(p => p.plan === tenant.plan);

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: tenant.name,
        slug: tenant.slug,
        is_active: tenant.is_active,
        plan: tenant.plan,
        is_custom: isCustomInitially,
        max_products: currentLimits.max_products?.toString() ?? '',
        max_users: currentLimits.max_users?.toString() ?? '',
        max_orders_per_month: currentLimits.max_orders_per_month?.toString() ?? '',
        max_motoboys: currentLimits.max_motoboys?.toString() ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.tenants.update', tenant.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar ${tenant.name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.tenants.index')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Editar Loja</h2>
                        <p className="text-sm text-gray-500">Gerenciamento avançado e planos</p>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-8">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-400" />
                            Informações Básicas
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Nome da Loja" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="slug" value="Slug (URL)" />
                                <TextInput
                                    id="slug"
                                    className="mt-1 block w-full bg-gray-50 dark:bg-white/5 text-gray-500"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    required
                                />
                                <InputError className="mt-2" message={errors.slug} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-[#ff3d03] shadow-sm focus:ring-[#ff3d03]"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Loja Ativa (Acesso permitido)
                            </label>
                        </div>
                    </div>

                    <hr className="border-gray-100 dark:border-white/5" />

                    {/* Plan & Limits */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Plano e Limites</h3>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_custom"
                                    checked={data.is_custom}
                                    onChange={(e) => setData('is_custom', e.target.checked)}
                                    className="rounded border-gray-300 text-[#ff3d03] shadow-sm focus:ring-[#ff3d03]"
                                />
                                <label htmlFor="is_custom" className="text-sm font-bold text-[#ff3d03]">
                                    Habilitar Limites Personalizados
                                </label>
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="plan" value="Plano Base" />
                            <select
                                id="plan"
                                value={data.plan}
                                onChange={(e) => setData('plan', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ff3d03] focus:ring-[#ff3d03] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            >
                                <option value="free">Gratuito</option>
                                <option value="starter">Starter</option>
                                <option value="basic">Basic</option>
                                <option value="pro">Pro</option>
                                <option value="custom">Custom (Totalmente Manual)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Selecione o plano base para definir os recursos padrão.</p>
                            <InputError className="mt-2" message={errors.plan} />
                        </div>

                        {/* Custom Limits Fields */}
                        <Transition
                            show={data.is_custom}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-2"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-2"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 dark:bg-[#ff3d03]/5 p-6 rounded-2xl border border-orange-100 dark:border-[#ff3d03]/10 mt-4">
                                <div className="col-span-2">
                                    <h4 className="font-bold text-[#ff3d03] text-sm uppercase tracking-wide mb-2">Overrides Manuais</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Deixe em branco para usar o ilimitado ou o padrão do plano.</p>
                                </div>

                                <div>
                                    <InputLabel htmlFor="max_products" value="Max Produtos" />
                                    <TextInput
                                        id="max_products"
                                        type="number"
                                        className="mt-1 block w-full"
                                        placeholder="Ex: 5000"
                                        value={data.max_products}
                                        onChange={(e) => setData('max_products', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="max_orders_per_month" value="Max Pedidos/Mês" />
                                    <TextInput
                                        id="max_orders_per_month"
                                        type="number"
                                        className="mt-1 block w-full"
                                        placeholder="Ex: 1000"
                                        value={data.max_orders_per_month}
                                        onChange={(e) => setData('max_orders_per_month', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="max_users" value="Max Usuários" />
                                    <TextInput
                                        id="max_users"
                                        type="number"
                                        className="mt-1 block w-full"
                                        placeholder="Ex: 10"
                                        value={data.max_users}
                                        onChange={(e) => setData('max_users', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="max_motoboys" value="Max Motoboys" />
                                    <TextInput
                                        id="max_motoboys"
                                        type="number"
                                        className="mt-1 block w-full"
                                        placeholder="Ex: 5"
                                        value={data.max_motoboys}
                                        onChange={(e) => setData('max_motoboys', e.target.value)}
                                    />
                                </div>
                            </div>
                        </Transition>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <Link
                            href={route('admin.tenants.index')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <PrimaryButton disabled={processing} className="flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Salvar Alterações
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
