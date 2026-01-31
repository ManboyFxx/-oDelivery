import { Head, Link, router } from '@inertiajs/react';
import { Clock, ArrowRight, MessageCircle, Check, X } from 'lucide-react';

interface Plan {
    plan: string;
    display_name: string;
    price_monthly: number;
    price_yearly: number;
    max_products: number | null;
    max_users: number | null;
    features: string[];
}

interface Props {
    tenant: {
        name: string;
        plan: string;
        trial_ends_at: string | null;
    };
    plans: Plan[];
}

export default function Expired({ tenant, plans }: Props) {
    const freePlan = plans.find(p => p.plan === 'free');
    const basicPlan = plans.find(p => p.plan === 'basic');

    const handleSelectPlan = (plan: string) => {
        if (plan === 'free') {
            router.post(route('subscription.downgrade-to-free'));
        } else if (plan === 'pro') {
            // Open WhatsApp
            const message = encodeURIComponent(
                `Olá! Tenho interesse no plano Pro do ÓoDelivery.\nMeu estabelecimento: ${tenant.name}`
            );
            window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
        } else {
            router.visit(route('subscription.checkout', { plan }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Período de Teste Expirado - ÓoDelivery" />

            <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
                {/* Logo */}
                <Link href="/" className="mb-8">
                    <img src="/images/logo-full.png" alt="ÓoDelivery" className="h-16" />
                </Link>

                {/* Icon */}
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                    <Clock className="w-10 h-10 text-[#ff3d03]" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-gray-900 text-center mb-3">
                    Seu período de teste expirou
                </h1>
                <p className="text-gray-500 text-center max-w-md mb-10">
                    Não se preocupe! Seus dados estão seguros.<br />
                    Escolha um plano para continuar usando o ÓoDelivery.
                </p>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 transition-all">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Gratuito</h3>
                        <p className="text-3xl font-black text-gray-900 mb-4">
                            R$ 0<span className="text-sm font-medium text-gray-400">/mês</span>
                        </p>

                        <ul className="space-y-3 mb-6">
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" />
                                {freePlan?.max_products || 15} produtos
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" />
                                {freePlan?.max_users || 1} usuário
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" />
                                Cardápio digital
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-400">
                                <X className="w-4 h-4 text-gray-300" />
                                <span className="line-through">Impressão automática</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-400">
                                <X className="w-4 h-4 text-gray-300" />
                                <span className="line-through">Fidelidade</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleSelectPlan('free')}
                            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                        >
                            Continuar Grátis
                        </button>
                    </div>

                    {/* Basic Plan */}
                    <div className="bg-white rounded-2xl border-2 border-[#ff3d03] p-6 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ff3d03] text-white text-xs font-bold px-3 py-1 rounded-full">
                            RECOMENDADO
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">Básico</h3>
                        <p className="text-3xl font-black text-[#ff3d03] mb-4">
                            R$ {basicPlan?.price_monthly.toFixed(2).replace('.', ',') || '79,90'}
                            <span className="text-sm font-medium text-gray-400">/mês</span>
                        </p>

                        <ul className="space-y-3 mb-6">
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" />
                                {basicPlan?.max_products || 100} produtos
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" />
                                {basicPlan?.max_users || 5} usuários
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" />
                                Pedidos ilimitados
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" />
                                Impressão automática
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" />
                                Programa de fidelidade
                            </li>
                        </ul>

                        <button
                            onClick={() => handleSelectPlan('basic')}
                            className="w-full py-3 px-4 bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            Assinar Básico
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Pro Plan CTA */}
                <div className="text-center">
                    <p className="text-gray-500 mb-2">Precisa de mais recursos?</p>
                    <button
                        onClick={() => handleSelectPlan('pro')}
                        className="inline-flex items-center gap-2 text-[#ff3d03] font-bold hover:underline"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Fale com nosso consultor sobre o Plano Pro
                    </button>
                </div>

                {/* Logout */}
                <div className="mt-12">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm text-gray-400 hover:text-gray-600"
                    >
                        Sair da conta
                    </Link>
                </div>
            </div>
        </div>
    );
}
