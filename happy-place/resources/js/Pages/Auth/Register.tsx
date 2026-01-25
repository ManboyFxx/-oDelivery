import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState, useCallback } from 'react';
import { User, Mail, Lock, ArrowRight, Check, Sparkles, Building2, Smartphone, Link2, Phone, Loader2, X, CheckCircle2 } from 'lucide-react';
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
    const { data, setData, post, processing, errors, reset } = useForm({
        store_name: '',
        slug: '',
        name: '',
        whatsapp: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [slugStatus, setSlugStatus] = useState<SlugStatus>({
        available: null,
        message: '',
        suggested: null,
        checking: false,
    });

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

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

    const steps = [
        {
            icon: Building2,
            title: 'Dados do Negócio',
            desc: 'Configure o nome e perfil do seu estabelecimento em segundos.'
        },
        {
            icon: Smartphone,
            title: 'Cardápio Digital',
            desc: 'Crie seu catálogo e comece a receber pedidos via QR Code.'
        },
        {
            icon: Sparkles,
            title: 'I.A. Assistente',
            desc: 'Deixe nossa inteligência sugerir melhores horários e pratos.'
        }
    ];

    const useSuggested = () => {
        if (slugStatus.suggested) {
            setData('slug', slugStatus.suggested);
            setSlugManuallyEdited(true);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#ff3d03] selection:text-white antialiased">
            <Head title="Criar Conta Empresarial - ÓoDelivery" />

            <div className="flex min-h-screen overflow-hidden">
                {/* Form Side (Left) */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white py-12 overflow-y-auto">
                    <div className="max-w-lg w-full mx-auto">
                        <div className="text-center mb-8">
                            <Link href="/">
                                <img src="/images/logo-full.png" alt="ÓoDelivery" className="h-20 w-auto mx-auto drop-shadow-sm" />
                            </Link>
                        </div>
                        <div className="mb-8">
                            <div className="h-1.5 w-12 bg-[#ff3d03] rounded-full mb-4"></div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
                                Crie sua conta <span className="text-[#ff3d03]">gratuita.</span>
                            </h1>
                            <p className="text-gray-500 font-medium mt-3 text-sm">
                                14 dias grátis do plano Básico. Sem cartão de crédito.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Store Name */}
                            <div className="space-y-1.5">
                                <InputLabel htmlFor="store_name" value="Nome do Estabelecimento" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#ff3d03]">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="store_name"
                                        type="text"
                                        name="store_name"
                                        value={data.store_name}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 focus:border-[#ff3d03] focus:ring-4 focus:ring-[#ff3d03]/10 rounded-xl text-gray-900 font-semibold placeholder-gray-300 transition-all"
                                        autoComplete="organization"
                                        onChange={(e) => handleStoreNameChange(e.target.value)}
                                        placeholder="Ex: Pizzaria do João"
                                        required
                                    />
                                </div>
                                <InputError message={errors.store_name} className="mt-1" />
                            </div>

                            {/* Slug */}
                            <div className="space-y-1.5">
                                <InputLabel htmlFor="slug" value="Seu Link Personalizado" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#ff3d03]">
                                        <Link2 className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="slug"
                                        type="text"
                                        name="slug"
                                        value={data.slug}
                                        className={`block w-full pl-12 pr-12 py-3.5 bg-white border focus:ring-4 rounded-xl text-gray-900 font-semibold placeholder-gray-300 transition-all ${
                                            slugStatus.available === true
                                                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10'
                                                : slugStatus.available === false
                                                ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10'
                                                : 'border-gray-200 focus:border-[#ff3d03] focus:ring-[#ff3d03]/10'
                                        }`}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            setSlugManuallyEdited(true);
                                            setData('slug', generateSlug(e.target.value));
                                        }}
                                        placeholder="pizzaria-do-joao"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                        {slugStatus.checking ? (
                                            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                        ) : slugStatus.available === true ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : slugStatus.available === false ? (
                                            <X className="h-5 w-5 text-red-400" />
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-400">
                                        oodelivery.com.br/<span className="font-semibold text-gray-600">{data.slug || 'seu-link'}</span>
                                    </p>
                                    {slugStatus.message && (
                                        <p className={`text-xs font-medium ${slugStatus.available ? 'text-green-600' : 'text-red-500'}`}>
                                            {slugStatus.message}
                                        </p>
                                    )}
                                </div>
                                {slugStatus.suggested && (
                                    <button
                                        type="button"
                                        onClick={useSuggested}
                                        className="text-xs text-[#ff3d03] font-semibold hover:underline"
                                    >
                                        Usar sugestão: {slugStatus.suggested}
                                    </button>
                                )}
                                <InputError message={errors.slug} className="mt-1" />
                            </div>

                            {/* Responsible Name and WhatsApp */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <InputLabel htmlFor="name" value="Seu Nome" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#ff3d03]">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 focus:border-[#ff3d03] focus:ring-4 focus:ring-[#ff3d03]/10 rounded-xl text-gray-900 font-semibold placeholder-gray-300 transition-all"
                                            autoComplete="name"
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="João Silva"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div className="space-y-1.5">
                                    <InputLabel htmlFor="whatsapp" value="WhatsApp" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#ff3d03]">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="whatsapp"
                                            type="tel"
                                            name="whatsapp"
                                            value={data.whatsapp}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 focus:border-[#ff3d03] focus:ring-4 focus:ring-[#ff3d03]/10 rounded-xl text-gray-900 font-semibold placeholder-gray-300 transition-all"
                                            autoComplete="tel"
                                            onChange={(e) => handleWhatsAppChange(e.target.value)}
                                            placeholder="(11) 99999-9999"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.whatsapp} className="mt-1" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <InputLabel htmlFor="email" value="E-mail" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#ff3d03]">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 focus:border-[#ff3d03] focus:ring-4 focus:ring-[#ff3d03]/10 rounded-xl text-gray-900 font-semibold placeholder-gray-300 transition-all"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <InputLabel htmlFor="password" value="Senha" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#ff3d03]">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 focus:border-[#ff3d03] focus:ring-4 focus:ring-[#ff3d03]/10 rounded-xl text-gray-900 font-semibold placeholder-gray-300 transition-all"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.password} className="mt-1" />
                                </div>

                                <div className="space-y-1.5">
                                    <InputLabel htmlFor="password_confirmation" value="Confirmar" className="text-xs font-bold uppercase tracking-wider text-gray-500" />
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#ff3d03]">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 focus:border-[#ff3d03] focus:ring-4 focus:ring-[#ff3d03]/10 rounded-xl text-gray-900 font-semibold placeholder-gray-300 transition-all"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-1" />
                                </div>
                            </div>

                            <PrimaryButton
                                className="w-full flex items-center justify-center gap-3 py-4 bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff3d03]/20 transition-all active:scale-[0.98] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={processing || slugStatus.available === false}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Criando Conta...
                                    </>
                                ) : (
                                    <>
                                        Criar Conta Grátis
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </PrimaryButton>

                            <p className="text-xs text-center text-gray-400 mt-4">
                                Ao criar sua conta, você concorda com nossos{' '}
                                <a href="/termos" className="text-[#ff3d03] hover:underline">Termos de Uso</a>
                                {' '}e{' '}
                                <a href="/privacidade" className="text-[#ff3d03] hover:underline">Política de Privacidade</a>.
                            </p>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 font-medium text-sm">
                                Já possui uma conta?{' '}
                                <Link
                                    href={route('login')}
                                    className="text-[#ff3d03] font-bold hover:underline decoration-2 underline-offset-4 transition-all"
                                >
                                    Fazer Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visual Side (Right) */}
                <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center p-16 xl:p-24">
                    <img
                        src="/images/hero-restaurant.jpg"
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>

                    <div className="relative z-10 max-w-lg">
                        <div className="mb-16 flex justify-center">
                            <img src="/images/logo-full.png" alt="ÓoDelivery" className="h-32 w-auto brightness-0 invert drop-shadow-2xl" />
                        </div>

                        <div className="space-y-10">
                            {steps.map((step, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="shrink-0 w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#ff3d03] group-hover:bg-[#ff3d03] group-hover:text-white transition-all duration-300">
                                        <step.icon className="h-7 w-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-white tracking-tight">{step.title}</h3>
                                        <p className="text-gray-300 font-medium leading-relaxed text-sm">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Check key={s} className="h-4 w-4 text-[#ff3d03]" />
                                ))}
                            </div>
                            <p className="text-white text-base font-medium italic leading-relaxed">
                                "O ÓoDelivery mudou a forma como lidamos com os pedidos. O cardápio digital é impecável e a cozinha nunca esteve tão organizada."
                            </p>
                            <div className="mt-5 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-800 border-2 border-[#ff3d03]"></div>
                                <div>
                                    <div className="text-white font-bold text-sm">Marcelo Silva</div>
                                    <div className="text-[#ff3d03] text-xs font-semibold">Dono de Hamburgueria</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
