import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { User, Mail, Lock, ArrowRight, Sparkles, Building2, Smartphone, Link2, Phone, Loader2, X, CheckCircle2, Eye, EyeOff, Package, Check, ArrowLeft, Star, Zap } from 'lucide-react';
import axios from 'axios';

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Slug generator
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Espaços viram hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .replace(/^-|-$/g, ''); // Remove hífen do início/fim
}

interface SlugStatus {
    available: boolean | null;
    message: string;
    suggested: string | null;
    checking: boolean;
}

export default function Register() {
    const { props } = usePage();
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPlan = 'unified';

    const { data, setData, post, processing, errors, reset } = useForm({
        store_name: '',
        slug: '',
        name: '',
        whatsapp: '',
        email: '',
        password: '',
        password_confirmation: '',
        plan: 'unified',
    });

    const [slugStatus, setSlugStatus] = useState<SlugStatus>({
        available: null,
        message: '',
        suggested: null,
        checking: false,
    });

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const debouncedSlug = useDebounce(data.slug, 500);

    // Auto-generate slug from store name
    const handleStoreNameChange = (value: string) => {
        setData('store_name', value);
        if (!slugManuallyEdited) {
            setData('slug', generateSlug(value));
        }
    };

    // Check slug availability
    useEffect(() => {
        if (debouncedSlug.length < 3) {
            setSlugStatus({
                available: null,
                message: debouncedSlug.length > 0 ? 'Mínimo 3 caracteres' : '',
                suggested: null,
                checking: false,
            });
            return;
        }

        setSlugStatus(prev => ({ ...prev, checking: true }));

        axios.post('/check-slug', { slug: debouncedSlug })
            .then((response) => {
                setSlugStatus({
                    available: response.data.available,
                    message: response.data.message,
                    suggested: response.data.suggested,
                    checking: false,
                });
            })
            .catch(() => {
                setSlugStatus({
                    available: null,
                    message: 'Erro ao verificar disponibilidade',
                    suggested: null,
                    checking: false,
                });
            });
    }, [debouncedSlug]);

    // Format WhatsApp
    const formatWhatsApp = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const handleWhatsAppChange = (value: string) => {
        setData('whatsapp', formatWhatsApp(value));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const useSuggested = () => {
        if (slugStatus.suggested) {
            setData('slug', slugStatus.suggested);
            setSlugManuallyEdited(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-8 sm:px-6 lg:px-8 font-sans selection:bg-[#ff3d03] selection:text-white antialiased">
            <Head title="Criar Conta Empresarial - ÓoDelivery" />

            {/* Main Card Container */}
            <div className="w-full max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex min-h-[600px] lg:min-h-[700px]">

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

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-white h-full lg:overflow-y-auto lg:max-h-full text-center">

                    {/* Back to Home Button */}
                    <div className="absolute top-6 left-6 sm:top-10 sm:left-10 z-20">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ff3d03] transition-colors font-medium">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Voltar</span>
                        </Link>
                    </div>

                    <div className="max-w-md w-full mx-auto">
                        <div className="space-y-4 mb-8">
                            {/* Logo Centered */}
                            <div className="flex justify-center items-center gap-2 mb-4">
                                <img src="/images/logo-icon.png" alt="ÓoDelivery" className="h-10 w-auto" />
                                <span className="text-2xl font-bold text-gray-900 tracking-tight">ÓoDelivery.</span>
                            </div>
                            {/* Main Title - KEPT BOLD/BLACK */}
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Comece grátis.</h1>
                            <p className="text-gray-600 font-medium text-lg">Crie sua loja digital completa em segundos.</p>

                                <div className="bg-gradient-to-r from-[#ff3d03]/10 to-orange-50 border-2 border-[#ff3d03] rounded-2xl p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Sparkles className="h-5 w-5 text-[#ff3d03] fill-[#ff3d03]" />
                                        <h3 className="text-lg font-black text-gray-900">Plano Único - Tudo Liberado</h3>
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">Recursos ilimitados por R$ 129,90/mês</p>
                                </div>
                        </div>

                        <form onSubmit={submit} className="space-y-5 text-left">
                            {/* Step 1: Store Info */}
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="store_name" value="Nome do Estabelecimento" className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5" />
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff3d03] transition-colors">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="store_name"
                                            type="text"
                                            value={data.store_name}
                                            onChange={(e) => handleStoreNameChange(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-normal placeholder-gray-500 transition-colors shadow-sm"
                                            placeholder="Ex: Pizzaria do João"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.store_name} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="slug" value="Link do Cardápio" className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5" />
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-medium group-focus-within:text-[#ff3d03] transition-colors text-sm">
                                            app.oodelivery.com/
                                        </div>
                                        <input
                                            id="slug"
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => {
                                                setData('slug', generateSlug(e.target.value));
                                                setSlugManuallyEdited(true);
                                            }}
                                            className={`block w-full pl-[170px] pr-12 py-4 bg-white border-2 focus:ring-0 rounded-xl text-gray-900 font-normal placeholder-gray-500 transition-colors shadow-sm ${slugStatus.available === true ? 'border-green-500 focus:border-green-500' :
                                                slugStatus.available === false ? 'border-red-500 focus:border-red-500' :
                                                    'border-gray-200 focus:border-[#ff3d03]'
                                                }`}
                                            placeholder="seunome"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                            {slugStatus.checking ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> :
                                                slugStatus.available === true ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                                                    slugStatus.available === false ? <X className="h-5 w-5 text-red-500" /> :
                                                        <Link2 className="h-5 w-5 text-gray-400" />}
                                        </div>
                                    </div>

                                    {/* Slug Feedback */}
                                    <div className="min-h-[24px]">
                                        {slugStatus.available === false && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-sm font-medium text-red-500">{slugStatus.message}</span>
                                                {slugStatus.suggested && (
                                                    <button
                                                        type="button"
                                                        onClick={useSuggested}
                                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors font-bold"
                                                    >
                                                        Usar {slugStatus.suggested}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {slugStatus.available === true && (
                                            <p className="text-sm font-medium text-green-500 mt-1">Este link está disponível!</p>
                                        )}
                                    </div>
                                    <InputError message={errors.slug} className="mt-1" />
                                </div>
                            </div>

                            <div className="relative flex items-center gap-4 py-2">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dados de Acesso</span>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            {/* Step 2: Personal Info */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="name" value="Seu Nome" className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5" />
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff3d03] transition-colors">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-normal placeholder-gray-500 transition-colors shadow-sm"
                                                placeholder="Nome Completo"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.name} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="whatsapp" value="WhatsApp" className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5" />
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff3d03] transition-colors">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <input
                                                id="whatsapp"
                                                type="tel"
                                                value={data.whatsapp}
                                                onChange={(e) => handleWhatsAppChange(e.target.value)}
                                                className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-normal placeholder-gray-500 transition-colors shadow-sm"
                                                placeholder="(00) 00000-0000"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.whatsapp} className="mt-1" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="E-mail" className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5" />
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff3d03] transition-colors">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-normal placeholder-gray-500 transition-colors shadow-sm"
                                            placeholder="seu@email.com"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="password" value="Senha" className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5" />
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff3d03] transition-colors">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="block w-full pl-12 pr-10 py-4 bg-white border-2 border-gray-200 focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-normal placeholder-gray-500 transition-colors shadow-sm"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="password_confirmation" value="Confirmar" className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5" />
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff3d03] transition-colors">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="block w-full pl-12 pr-10 py-4 bg-white border-2 border-gray-200 focus:border-[#ff3d03] focus:ring-0 rounded-xl text-gray-900 font-normal placeholder-gray-500 transition-colors shadow-sm"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password_confirmation} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            <PrimaryButton
                                className="w-full flex items-center justify-center py-4 bg-[#ff3d03] hover:bg-[#e63700] text-white font-medium text-lg rounded-xl shadow-lg shadow-[#ff3d03]/30 transition-colors mt-6"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Criando Loja...
                                    </>
                                ) : (
                                    <>
                                        Criar Minha Loja e Iniciar
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </PrimaryButton>
                        </form>

                        <div className="mt-8 text-center border-t border-gray-100 pt-6">
                            <div className="text-sm font-medium text-gray-500">
                                Já tem uma conta?{' '}
                                <Link
                                    href={route('login')}
                                    className="text-[#ff3d03] hover:underline transition-all"
                                >
                                    Fazer Login
                                </Link>
                            </div>
                            <div className="mt-4 flex justify-center gap-4 text-xs font-medium text-gray-400">
                                <Link href="#" className="hover:text-gray-600">Termos de Uso</Link>
                                <span>•</span>
                                <Link href="#" className="hover:text-gray-600">Privacidade</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
