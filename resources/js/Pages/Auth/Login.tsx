import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#ff3d03] selection:text-white antialiased">
            <Head title="Acessar Painel - ÓoDelivery" />

            <div className="flex min-h-screen overflow-hidden">
                {/* Visual Side (Left) */}
                <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gray-900 items-center justify-center p-20">
                    <img
                        src="/images/auth-background.jpg"
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>

                    <div className="relative z-10 max-w-xl space-y-12">
                        <div className="mb-20 flex justify-center">
                            <img src="/images/landing/header-icon.png" alt="ÓoDelivery" className="h-40 w-auto drop-shadow-2xl" />
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-6xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-lg">
                                Sua gestão <br /> em outro <span className="text-[#ff3d03]">nível.</span>
                            </h2>
                            <p className="text-xl text-gray-300 font-medium leading-relaxed drop-shadow-md">
                                Faça o login para gerenciar seus pedidos, estoque e performance em tempo real.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <div className="space-y-3">
                                <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-[#ff3d03]" />
                                </div>
                                <div className="text-white font-bold uppercase tracking-widest text-xs">Agilidade Total</div>
                                <p className="text-gray-400 text-sm">Processamentos 40% mais rápidos que a média.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                    <ShieldCheck className="h-5 w-5 text-[#ff3d03]" />
                                </div>
                                <div className="text-white font-bold uppercase tracking-widest text-xs">Segurança Bancária</div>
                                <p className="text-gray-400 text-sm">Dados criptografados e backups diários.</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-12 left-12 flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-gray-400/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Servidores Estáveis
                    </div>
                </div>

                {/* Form Side (Right) */}
                <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white">
                    <div className="max-w-md w-full mx-auto">
                        <div className="text-center mb-10">
                            <Link href="/" className="text-4xl font-black text-[#ff3d03] tracking-tight hover:opacity-90 transition-opacity">
                                ÓoDelivery.
                            </Link>
                        </div>

                        <div className="mb-10">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bem-vindo de volta.</h1>
                            <p className="text-gray-600 font-medium mt-2">Insira suas credenciais para acessar o painel administrativo.</p>
                        </div>

                        {status && (
                            <div className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-[#ff3d03]">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <InputLabel htmlFor="email" value="E-mail Corporativo" className="text-xs font-black uppercase tracking-widest text-gray-900" />
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#ff3d03]">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 focus:border-[#ff3d03] focus:ring-4 focus:ring-[#ff3d03]/10 rounded-2xl text-gray-900 font-bold placeholder-gray-600 transition-all shadow-sm"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="seu@restaurante.com"
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <InputLabel htmlFor="password" value="Sua Senha" className="text-xs font-black uppercase tracking-widest text-gray-900" />
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs font-black text-[#ff3d03] uppercase tracking-widest hover:text-black transition-colors"
                                        >
                                            Esqueceu?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#ff3d03]">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 focus:border-[#ff3d03] focus:ring-4 focus:ring-[#ff3d03]/10 rounded-2xl text-gray-900 font-bold placeholder-gray-600 transition-all shadow-sm"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded-md border-gray-100 text-[#ff3d03] focus:ring-[#ff3d03]"
                                    />
                                    <span className="ml-2 text-sm font-bold text-gray-600">Permanecer conectado</span>
                                </div>

                                <div className="flex items-center pt-2 border-t border-gray-200">
                                    <Checkbox
                                        name="is_motoboy"
                                        checked={data.is_motoboy}
                                        onChange={(e) => setData('is_motoboy', e.target.checked)}
                                        className="rounded-md border-gray-100 text-[#ff3d03] focus:ring-[#ff3d03]"
                                    />
                                    <span className="ml-2 text-sm font-bold text-gray-600">Sou um entregador/motoboy</span>
                                </div>
                            </div>

                            <PrimaryButton
                                className="w-full flex items-center justify-center gap-3 py-5 bg-[#ff3d03] hover:bg-[#e63700] text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#ff3d03]/20 transition-all active:scale-95"
                                disabled={processing}
                            >
                                {processing ? 'Verificando...' : 'Acessar Painel'}
                                {!processing && <ArrowRight className="h-5 w-5" />}
                            </PrimaryButton>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-gray-600 font-medium">
                                Ainda não tem conta?{' '}
                                <Link
                                    href={route('register')}
                                    className="text-[#ff3d03] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all"
                                >
                                    Cadastre-se grátis
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
