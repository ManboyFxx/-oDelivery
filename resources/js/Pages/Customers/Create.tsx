import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { User, Phone, Mail, Save, ArrowLeft } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function CustomerCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customers.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Novo Cliente" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="h-6 w-6 text-[#ff3d03]" />
                            Novo Cliente
                        </h2>
                        <p className="text-gray-500 text-sm">Cadastrar um novo cliente manualmente</p>
                    </div>
                    <Link
                        href={route('customers.index')}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1 text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" /> Voltar
                    </Link>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-[#1a1b1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Nome Completo" />
                                    <TextInput
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full mt-1"
                                        required
                                        autoFocus
                                        placeholder="Ex: João da Silva"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <InputLabel value="Telefone (WhatsApp)" />
                                    <div className="relative mt-1">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <TextInput
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="w-full pl-9"
                                            required
                                            placeholder="Ex: 11999999999"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel value="Email (Opcional)" />
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <TextInput
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full pl-9"
                                            placeholder="Ex: joao@email.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel value="Endereço Principal" />
                                    <TextInput
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="Rua, Número, Bairro - Cidade/UF"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Endereço inicial do cliente. Você poderá adicionar mais endereços após o cadastro.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 gap-3">
                                <Link
                                    href={route('customers.index')}
                                >
                                    <SecondaryButton>
                                        Cancelar
                                    </SecondaryButton>
                                </Link>
                                <PrimaryButton disabled={processing} className="gap-2">
                                    <Save className="h-4 w-4" /> Cadastrar Cliente
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
