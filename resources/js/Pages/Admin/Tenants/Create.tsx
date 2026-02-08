import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { FormEventHandler, useEffect } from 'react';
import { Save, ArrowLeft, Store, User, Lock, Clock } from 'lucide-react';

export default function CreateTenant() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        email: '',
        owner_name: '',
        owner_email: '',
        password: '',
        plan: 'free',
        // Trial fields
        enable_trial: true,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subscription_status: 'trialing'
    });

    // Auto-generate slug from name
    useEffect(() => {
        const slug = data.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setData('slug', slug);
    }, [data.name]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.tenants.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Nova Loja" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.tenants.index')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Nova Loja</h2>
                        <p className="text-sm text-gray-500">Cadastrar um novo estabelecimento e administrador</p>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-8">

                    {/* Store Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Store className="w-5 h-5 text-gray-400" />
                            Dados da Loja
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
                                    placeholder="Ex: Pizzaria do João"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="slug" value="Link (Slug)" />
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm">
                                        oodelivery.online/
                                    </span>
                                    <TextInput
                                        id="slug"
                                        className="flex-1 min-w-0 block w-full rounded-none rounded-r-md"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError className="mt-2" message={errors.slug} />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email da Loja (Contato)" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    placeholder="contato@loja.com"
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            <div>
                                <InputLabel htmlFor="plan" value="Plano Inicial" />
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
                                </select>
                                <InputError className="mt-2" message={errors.plan} />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100 dark:border-white/5" />

                    {/* Trial Period Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            Período de Teste (Trial)
                        </h3>

                        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="checkbox"
                                    id="enable_trial"
                                    checked={data.enable_trial}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setData(prev => ({
                                            ...prev,
                                            enable_trial: isChecked,
                                            subscription_status: isChecked ? 'trialing' : 'active',
                                            trial_ends_at: isChecked
                                                ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                                : ''
                                        }));
                                    }}
                                    className="rounded border-gray-300 text-[#ff3d03] shadow-sm focus:ring-[#ff3d03] w-5 h-5"
                                />
                                <div>
                                    <label htmlFor="enable_trial" className="font-bold text-gray-900 dark:text-white">
                                        Ativar Trial Gratuito (7 dias)
                                    </label>
                                    <p className="text-xs text-gray-500">O cliente terá acesso total durante este período.</p>
                                </div>
                            </div>

                            {data.enable_trial && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                    <div>
                                        <InputLabel htmlFor="trial_ends_at" value="Trial Encerra em" />
                                        <TextInput
                                            id="trial_ends_at"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.trial_ends_at}
                                            onChange={(e) => setData('trial_ends_at', e.target.value)}
                                            required={data.enable_trial}
                                        />
                                        <InputError className="mt-2" message={(errors as any).trial_ends_at} />
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">
                                            Status Inicial: Em Teste (Trialing)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100 dark:border-white/5" />

                    {/* Owner Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            Dono / Administrador Inicial
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="owner_name" value="Nome do Proprietário" />
                                <TextInput
                                    id="owner_name"
                                    className="mt-1 block w-full"
                                    value={data.owner_name}
                                    onChange={(e) => setData('owner_name', e.target.value)}
                                    required
                                    placeholder="Ex: João da Silva"
                                />
                                <InputError className="mt-2" message={errors.owner_name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="owner_email" value="Email de Acesso (Login)" />
                                <TextInput
                                    id="owner_email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.owner_email}
                                    onChange={(e) => setData('owner_email', e.target.value)}
                                    required
                                    placeholder="admin@loja.com"
                                />
                                <InputError className="mt-2" message={errors.owner_email} />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="password" value="Senha Inicial" />
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <TextInput
                                        id="password"
                                        type="text" // Visible by default for admin creation convenience
                                        className="mt-1 block w-full pl-10"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                </div>
                                <InputError className="mt-2" message={errors.password} />
                            </div>
                        </div>
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
                            Criar Loja
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
