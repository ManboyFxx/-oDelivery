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
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-4 px-4 sm:py-8 sm:px-6 lg:px-8 font-sans selection:bg-[#ff3d03] selection:text-white antialiased">
            <Head title="Acessar Painel - ÓoDelivery" />

            {/* Main Card Container */}
            <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">

                {/* Left Side - Form */}
                <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center relative text-center">\
                    {/* Back to Home Button */}
                    <div className="absolute top-6 left-6 sm:top-10 sm:left-10">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ff3d03] transition-colors font-medium">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Voltar</span>
                        </Link>
                    </div>

                    {/* Logo (Centered) */}
                    <div className="flex flex-col items-center justify-center gap-2 mb-8 mx-auto">
                        <img src="/images/logo-icon.png" alt="ÓoDelivery" className="h-10 w-auto" />
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">ÓoDelivery.</span>
                    </div>

                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-6 sm:mb-10">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2 sm:mb-3">Olá, <br />Bem-vindo de volta</h1>
                            <p className="text-gray-800 font-medium text-base sm:text-lg">Acesse seu painel administrativo.</p>
                        </div>

                        {status && (
                            <div className="mb-6 p-4 rounded-xl bg-[#ff3d03]/10 border border-[#ff3d03]/20 text-sm font-medium text-[#ff3d03]">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6 text-left">
                            <div className="space-y-2">
                                <InputLabel htmlFor="email" value="E-mail" className="sr-only" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full px-5 py-4 bg-white border-2 border-gray-100 focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-normal placeholder-gray-500 transition-colors shadow-sm"
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
                                        className="block w-full px-5 py-4 bg-white border-2 border-gray-100 focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-normal placeholder-gray-500 transition-colors shadow-sm"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••••••"
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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-[#ff3d03] focus:ring-[#ff3d03] cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-gray-700 cursor-pointer select-none">Lembrar de mim</span>
                                </div>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-gray-500 hover:text-[#ff3d03] transition-colors"
                                    >
                                        Esqueceu a senha?
                                    </Link>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    name="is_motoboy"
                                    checked={data.is_motoboy}
                                    onChange={(e) => setData('is_motoboy', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[#ff3d03] focus:ring-[#ff3d03] cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-700 cursor-pointer select-none">Sou entregador</span>
                            </div>

                            <PrimaryButton
                                className="w-full flex items-center justify-center py-4 bg-[#ff3d03] hover:bg-[#e63700] text-white font-medium text-lg rounded-xl shadow-lg shadow-[#ff3d03]/30 transition-colors mt-4"
                                disabled={processing}
                            >
                                {processing ? 'Acessando...' : 'Acessar Painel'}
                            </PrimaryButton>
                        </form>

                        <div className="mt-6 sm:mt-12 text-sm font-medium text-gray-600">
                            Não tem uma conta?{' '}
                            <Link
                                href={route('register')}
                                className="text-[#ff3d03] hover:underline transition-all"
                            >
                                Crie agora
                            </Link>
                        </div>


                    </div>
                </div>

                <div className="hidden lg:flex lg:w-1/2 bg-black relative items-center justify-center p-12 overflow-hidden">
                    {/* Large Central Logo */}
                    <div className="relative z-10 flex flex-col items-center justify-center transform transition-transform hover:scale-105 duration-500">
                        <img
                            src="/images/logo-hq.png"
                            alt="ÓoDelivery"
                            className="w-96 h-96 object-contain drop-shadow-2xl"
                        />
                    </div>
                    {/* Subtle Texture */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}
