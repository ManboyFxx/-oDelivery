import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-8 sm:px-6 lg:px-8 font-sans selection:bg-[#ff3d03] selection:text-white antialiased">
            <Head title="Recuperar Senha - ÓoDelivery" />

            {/* Main Card Container */}
            <div className="w-full max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex min-h-[600px] lg:min-h-[700px]">

                {/* Left Side - Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative text-center">

                    {/* Back to Login Button */}
                    <div className="absolute top-6 left-6 sm:top-10 sm:left-10">
                        <Link href={route('login')} className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ff3d03] transition-colors font-medium">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Voltar para Login</span>
                        </Link>
                    </div>

                    {/* Logo (Centered) */}
                    <div className="flex flex-col items-center justify-center gap-2 mb-8 mx-auto mt-12 lg:mt-0">
                        <img src="/images/logo-icon.png" alt="ÓoDelivery" className="h-10 w-auto" />
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">ÓoDelivery.</span>
                    </div>

                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-10">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Recuperar Senha</h1>
                            <p className="text-gray-600 font-medium text-lg leading-relaxed">
                                Esqueceu sua senha? Sem problemas. Informe seu email e enviaremos um link para criar uma nova.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm font-medium text-green-700 text-left">{status}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#ff3d03] transition-colors" />
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full pl-12 pr-5 py-4 bg-white border-2 border-gray-100 focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-normal placeholder-gray-500 transition-colors shadow-sm"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <PrimaryButton
                                className="w-full flex items-center justify-center py-4 bg-[#ff3d03] hover:bg-[#e63700] text-white font-medium text-lg rounded-xl shadow-lg shadow-[#ff3d03]/30 transition-colors mt-4"
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        Enviando...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Enviar Link de Recuperação <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </PrimaryButton>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} ÓoDelivery. Todos os direitos reservados.
                        </p>
                    </div>
                </div>

                {/* Right Side - Visual (Static Illustration) */}
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
