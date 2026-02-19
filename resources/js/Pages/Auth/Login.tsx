import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Lock, Eye, EyeOff, Package, Check, User, ArrowLeft } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
        is_motoboy: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex h-screen w-full font-sans selection:bg-[#ff3d03] selection:text-white antialiased overflow-hidden">
            <Head title="Acessar Painel - ÓoDelivery" />

            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 xl:px-32 overflow-y-auto relative h-full">
                {/* Back to Home Button */}
                <div className="absolute top-8 left-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ff3d03] transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Voltar</span>
                    </Link>
                </div>

                <div className="w-full max-w-sm mx-auto">
                    {/* Logo */}
                    <div className="flex flex-col items-center justify-center gap-2 mb-10">
                        <img src="/images/logo-icon.png" alt="ÓoDelivery" className="h-12 w-auto" />
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">ÓoDelivery.</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">Bem-vindo de volta</h1>
                        <p className="text-gray-600 font-medium">Acesse seu painel administrativo.</p>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-[#ff3d03]/10 border border-[#ff3d03]/20 text-sm font-medium text-[#ff3d03]">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <InputLabel htmlFor="email" value="E-mail" className="sr-only" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-medium placeholder-gray-400 transition-all"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="seu@email.com"
                                required
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="password" value="Senha" className="sr-only" />
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-medium placeholder-gray-400 transition-all"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Sua senha secreta"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[#ff3d03] focus:ring-[#ff3d03] cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-600 cursor-pointer select-none">Lembrar</span>
                            </div>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-bold text-[#ff3d03] hover:underline transition-all"
                                >
                                    Esqueceu a senha?
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pb-2">
                            <Checkbox
                                name="is_motoboy"
                                checked={data.is_motoboy}
                                onChange={(e) => setData('is_motoboy', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-[#ff3d03] focus:ring-[#ff3d03] cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-600 cursor-pointer select-none">Sou entregador</span>
                        </div>

                        <PrimaryButton
                            className="w-full flex items-center justify-center py-4 bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40 hover:-translate-y-0.5 transition-all"
                            disabled={processing}
                        >
                            {processing ? 'Entrando...' : 'Entrar na Conta'}
                        </PrimaryButton>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            Ainda não tem conta?{' '}
                            <Link
                                href={route('register')}
                                className="text-[#ff3d03] font-bold hover:underline transition-all"
                            >
                                Criar loja grátis
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 items-center justify-center p-16 overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-gray-100 -z-0"></div>
                 <img 
                    src="/images/login-illustration-v3.png" 
                    alt="Login Illustration" 
                    className="relative z-10 w-full max-w-2xl object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                />
            </div>
        </div>
    );
}
