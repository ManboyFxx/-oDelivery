import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Check,
    CreditCard,
    Zap,
    Shield,
    HelpCircle,
    AlertTriangle,
    ArrowUpRight,
    Star
} from 'lucide-react';
import clsx from 'clsx';

interface Plan {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
    current: boolean;
}

interface Props {
    auth: any;
    tenant: any;
    plans: Plan[];
}

export default function SubscriptionIndex({ auth, tenant, plans }: Props) {
    const { post, processing } = useForm();

    const handleDowngrade = () => {
        if (confirm('Tem certeza que deseja voltar para o plano grátis? Algumas funcionalidades serão limitadas.')) {
            post(route('subscription.downgrade'));
        }
    };

    const handleUpgrade = (planId: string) => {
        window.location.href = route('subscription.checkout', planId);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Minha Assinatura" />

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#ff3d03]/10 text-[#ff3d03] text-[10px] font-bold uppercase tracking-wider">
                                Financeiro
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Minha Assinatura</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Gerencie seu plano e método de pagamento</p>
                    </div>

                    {tenant.plan === 'free' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 rounded-xl border border-orange-200 shadow-sm">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold uppercase tracking-wide">Plano Grátis</span>
                                <span className="text-[10px] leading-tight">Faça upgrade para remover limites</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Current Plan Status */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3d03] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Plano Atual</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-[#ff3d03]">{tenant.plan_display_name || 'Básico'}</span>
                                <span className="text-gray-500 font-medium">/ mês</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 max-w-md">
                                {tenant.plan === 'free'
                                    ? 'Você está utilizando a versão gratuita com recursos limitados.'
                                    : 'Sua assinatura está ativa e você tem acesso a todos os recursos Pro.'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {tenant.subscription_status === 'active' || tenant.subscription_status === 'trialing'
                                            ? <span className="text-green-500">Ativo</span>
                                            : <span className="text-red-500">Inativo / Cancelado</span>
                                        }
                                        {tenant.subscription_status === 'trialing' && (
                                            <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-bold">TRIAL</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isPro = plan.id === 'price_pro';
                        const isBasic = plan.id === 'price_basic';

                        return (
                            <div
                                key={plan.id}
                                className={clsx(
                                    "relative p-8 rounded-[32px] border transition-all duration-300 flex flex-col",
                                    isPro
                                        ? "bg-gray-900 border-gray-900 text-white shadow-2xl"
                                        : isBasic
                                            ? "bg-white border-[#ff3d03] shadow-xl shadow-[#ff3d03]/10 scale-105 z-10"
                                            : "bg-white border-gray-200 shadow-sm hover:border-gray-300"
                                )}
                            >
                                {isBasic && !plan.current && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff3d03] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#ff3d03]/30 flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-white" />
                                        Recomendado
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className={clsx("text-xl font-black mb-2 uppercase tracking-wide", isPro ? "text-white" : "text-gray-900")}>
                                        {plan.name}
                                    </h3>
                                    <p className={clsx("text-sm font-medium mb-4", isPro ? "text-gray-400" : "text-gray-500")}>
                                        {plan.id === 'free' && "Para quem está começando com recursos essenciais"}
                                        {plan.id === 'price_basic' && "Todos os recursos liberados para fazer seu negócio crescer"}
                                        {plan.id === 'price_pro' && "A solução mais completa com tudo que você precisa"}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        {plan.price > 0 && <span className={clsx("text-sm font-bold", isPro ? "text-gray-400" : "text-gray-500")}>R$</span>}
                                        <span className={clsx("text-4xl font-black", isPro ? "text-white" : "text-gray-900")}>
                                            {plan.price > 0 ? plan.price.toString().replace('.', ',') : '0'}
                                        </span>
                                        <span className={clsx("text-sm font-medium", isPro ? "text-gray-400" : "text-gray-500")}>/{plan.interval}</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className={clsx(
                                                "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                                                isPro ? "bg-white/10" : "bg-green-100"
                                            )}>
                                                <Check className={clsx("h-3 w-3", isPro ? "text-green-400" : "text-green-600")} />
                                            </div>
                                            <span className={clsx("text-sm font-medium", isPro ? "text-gray-300" : "text-gray-600")}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    {plan.current ? (
                                        <button
                                            disabled
                                            className={clsx(
                                                "w-full py-4 rounded-xl border font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2",
                                                isPro ? "border-gray-700 bg-gray-800 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-400"
                                            )}
                                        >
                                            <Check className="h-4 w-4" />
                                            Plano Atual
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgrade(plan.id)}
                                            className={clsx(
                                                "w-full py-4 rounded-xl font-bold text-sm transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2",
                                                isPro
                                                    ? "bg-white text-gray-900 hover:bg-gray-100"
                                                    : isBasic
                                                        ? "bg-[#ff3d03] hover:bg-[#e03603] text-white shadow-lg shadow-[#ff3d03]/30"
                                                        : "bg-gray-900 hover:bg-black text-white"
                                            )}
                                        >
                                            <Zap className="h-4 w-4" />
                                            {isPro ? 'Falar com Consultor' : 'Fazer Upgrade'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ / Help */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[24px] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-xl text-blue-600 dark:text-blue-400">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Pagamento Seguro</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                    Seus pagamentos são processados com segurança pelo Stripe. Seus dados estão protegidos com criptografia de ponta a ponta.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-[24px] bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-xl text-purple-600 dark:text-purple-400">
                                <HelpCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-1">Precisa de Ajuda?</h4>
                                <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                                    Entrou em dúvida sobre qual plano escolher? Nossa equipe de suporte está pronta para te ajudar a decidir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {tenant.plan !== 'free' && (
                    <div className="flex justify-center pt-8 border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={handleDowngrade}
                            className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors"
                        >
                            Cancelar assinatura ou voltar para o plano Grátis
                        </button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
