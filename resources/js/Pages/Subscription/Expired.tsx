import { Head, Link, router } from '@inertiajs/react';
import React from 'react';
import { Clock, Check, X, ArrowRight, MessageCircle, Package, ArrowLeft, AlertTriangle } from 'lucide-react';

interface Plan {
    plan: string;
    name: string;
    price: number;
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
    downgradeRisks?: {
        can_downgrade: boolean;
        issues: Array<{
            resource: string;
            current: number;
            limit: number;
            excess: number;
            action: string;
        }>;
    };
}

export default function Expired({ tenant, plans, downgradeRisks }: Props) {
    const activePlans = plans.filter(p => p.plan !== 'custom'); // Filter out custom if any
    const [showWarningModal, setShowWarningModal] = React.useState(false);

    const handleSelectPlan = (plan: string) => {
        if (plan === 'free') {
            if (downgradeRisks && !downgradeRisks.can_downgrade) {
                setShowWarningModal(true);
            } else {
                router.post(route('subscription.downgrade'));
            }
        } else if (plan === 'pro' || plan === 'enterprise') {
            const message = encodeURIComponent(
                `Olá! Tenho interesse no plano ${plan.toUpperCase()} do ÓoDelivery.\nMeu estabelecimento: ${tenant.name}`
            );
            window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
        } else {
            router.visit(route('subscription.checkout', { plan }));
        }
    };

    const confirmDowngrade = () => {
        router.post(route('subscription.downgrade'), { force: true }, {
            onFinish: () => setShowWarningModal(false)
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-8 sm:px-6 lg:px-8 font-sans selection:bg-[#ff3d03] selection:text-white antialiased">
            <Head title="Período de Teste Expirado - ÓoDelivery" />

            {/* Warning Modal */}
            {showWarningModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 text-amber-500 mb-4">
                            <div className="p-2 bg-amber-100 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Atenção ao Downgrade</h3>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Ao mudar para o plano Gratuito, alguns limites serão aplicados e itens excedentes serão <b>desativados</b>:
                        </p>

                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6 space-y-2 max-h-60 overflow-y-auto">
                            {downgradeRisks?.issues.map((issue, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm text-amber-800">
                                    <span className="mt-0.5">•</span>
                                    <span>{issue.action || `Limite de ${issue.resource} excedido.`}</span>
                                </div>
                            ))}
                            <p className="text-xs text-amber-600 mt-2 font-medium border-t border-amber-200 pt-2">
                                * Os itens mais recentes serão desativados automaticamente.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowWarningModal(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDowngrade}
                                className="px-4 py-2 bg-[#ff3d03] text-white font-bold rounded-lg hover:bg-[#e63700] transition-colors"
                            >
                                Entendi, continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Card Container */}
            <div className="w-full max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex min-h-[600px] lg:min-h-[700px]">

                {/* Left Side - Content */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col relative text-center lg:text-left overflow-y-auto">

                    {/* Header Logo */}
                    <div className="flex flex-col items-center lg:items-start justify-center gap-2 mb-8 mt-12 lg:mt-0">
                        <div className="flex items-center gap-2">
                            <img src="/images/logo-icon.png" alt="ÓoDelivery" className="h-8 w-auto" />
                            <span className="text-xl font-bold text-gray-900 tracking-tight">ÓoDelivery.</span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="absolute top-6 right-6 sm:top-10 sm:right-10">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ff3d03] transition-colors font-medium text-sm"
                        >
                            <span>Sair da conta</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="max-w-md w-full mx-auto lg:mx-0">
                        {/* Alert Icon & Title */}
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-[#ff3d03] mb-6">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
                                Seu teste acabou...<br className="hidden lg:block" /> Mas não precisa ser o fim!
                            </h1>
                            <p className="text-gray-600 font-medium text-lg">
                                Escolha o plano ideal para continuar vendendo sem interrupções.
                            </p>
                        </div>

                        {/* Plans List */}
                        <div className="space-y-4 mb-8">
                            {activePlans.map((plan) => (
                                <div
                                    key={plan.plan}
                                    className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer hover:shadow-md ${plan.plan === 'basic'
                                        ? 'border-[#ff3d03] bg-orange-50/50'
                                        : 'border-gray-100 hover:border-gray-200 bg-white'
                                        }`}
                                >
                                    {plan.plan === 'basic' && (
                                        <div className="absolute -top-2.5 right-4 bg-[#ff3d03] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            Recomendado
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className={`font-bold ${plan.plan === 'basic' ? 'text-[#ff3d03]' : 'text-gray-900'}`}>{plan.name}</h3>
                                            <div className="text-xs text-gray-500 mt-1 flex flex-col sm:flex-row sm:gap-3">
                                                <span>{plan.max_products ? `${plan.max_products} produtos` : 'Produtos ilimitados'}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{plan.max_users ? `${plan.max_users} usuários` : 'Usuários ilimitados'}</span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-xl font-black text-gray-900">
                                                {plan.price_monthly > 0 ? (
                                                    `R$ ${plan.price_monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                                ) : (
                                                    'Grátis'
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleSelectPlan(plan.plan)}
                                                className={`text-xs font-bold mt-1 px-3 py-1.5 rounded-lg transition-colors ${plan.plan === 'basic' || plan.plan === 'pro'
                                                    ? 'bg-[#ff3d03] text-white hover:bg-[#e63700]'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {plan.price_monthly > 0 ? 'Assinar' : 'Escolher'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Help */}
                        <div className="text-center lg:text-left mt-auto">
                            <p className="text-sm text-gray-500 mb-2">Dúvidas sobre os planos?</p>
                            <a
                                href="https://wa.me/5511999999999"
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm font-bold text-[#ff3d03] hover:underline"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span className="underline">Fale com nosso time</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div className="hidden lg:flex lg:w-1/2 bg-black relative items-center justify-center p-12 overflow-hidden">
                    {/* Large Central Logo */}
                    <div className="relative z-10 flex flex-col items-center justify-center transform transition-transform hover:scale-105 duration-500">
                        <img
                            src="/images/logo-hq.png"
                            alt="ÓoDelivery"
                            className="w-96 h-96 object-contain drop-shadow-2xl opacity-90"
                        />
                    </div>

                    {/* Floating Elements Animation (Optional, keeping it clean for now) */}

                    {/* Subtle Texture/Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                    {/* Motivational Text */}
                    <div className="absolute bottom-12 text-center px-12 z-10">
                        <h2 className="text-white text-2xl font-bold mb-2">Não pare agora!</h2>
                        <p className="text-gray-400">Milhares de pedidos estão esperando por você. Regularize sua assinatura e volte a vender.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
