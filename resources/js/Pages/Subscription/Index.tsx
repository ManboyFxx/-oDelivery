import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Check,
    CreditCard,
    AlertTriangle,
    Star,
    X,
    AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

interface Feature {
    text: string;
    included: boolean;
}

interface Plan {
    id: string;
    original_id: string;
    name: string;
    price: number | null;
    interval: string;
    features: Feature[];
    limits: {
        products: number | null;
        users: number | null;
        orders: number | null;
        motoboys: number | null;
        stock_items: number | null;
        coupons: number | null;
    };
    current: boolean;
    subscription_status?: string;
}

interface Usage {
    products: number;
    users: number;
    orders: number;
    motoboys: number;
    stock_items: number;
    coupons: number;
}

interface Props {
    auth: any;
    tenant: any;
    plans: Plan[];
    usage: Usage;
}

export default function SubscriptionIndex({ auth, tenant, plans, usage }: Props) {
    const { post } = useForm();
    const currentPlan = plans.find(p => p.current);

    const handleDowngrade = () => {
        if (confirm('Tem certeza que deseja voltar para o plano grátis? Algumas funcionalidades serão limitadas.')) {
            post(route('subscription.downgrade'));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Assinatura e Planos</h2>}
        >
            <Head title="Minha Assinatura" />

            <div className="max-w-5xl mx-auto space-y-8 py-12 px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#ff3d03]/10 text-[#ff3d03] text-[10px] font-bold uppercase tracking-wider">
                                Financeiro
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Minha Assinatura</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Gerencie seu plano e acompanhe o consumo</p>
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

                {/* STATUS DO PLANO E CONSUMO */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Card Status */}
                    <div className="md:col-span-1 bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3d03] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Plano Atual</h3>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-3xl font-black text-[#ff3d03]">{tenant.plan_display_name || currentPlan?.name || 'Básico'}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                                <p className="text-sm font-bold text-green-500">
                                    {tenant.subscription_status === 'active' ? 'Ativo' : 'Ativo'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card Consumption Limit Bars */}
                    <div className="md:col-span-2 bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#ff3d03]"></div>
                            Consumo de Recursos
                        </h3>
                        {currentPlan ? (
                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                                <UsageItem label="Pedidos (Mês)" current={usage.orders} limit={currentPlan.limits.orders} />
                                <UsageItem label="Produtos" current={usage.products} limit={currentPlan.limits.products} />
                                <UsageItem label="Estoque (Itens)" current={usage.stock_items} limit={currentPlan.limits.stock_items} />
                                <UsageItem label="Usuários da Equipe" current={usage.users} limit={currentPlan.limits.users} />
                                <UsageItem label="Motoboys" current={usage.motoboys} limit={currentPlan.limits.motoboys} />
                                <UsageItem label="Cupons Ativos" current={usage.coupons} limit={currentPlan.limits.coupons} />
                            </div>
                        ) : (
                            <p className="text-gray-500">Informações de consumo indisponíveis.</p>
                        )}
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {plans.map((plan) => {
                        const isPro = plan.original_id === 'pro' || plan.id === 'price_pro';
                        const isBasic = plan.original_id === 'free' || plan.id === 'free';

                        return (
                            <div
                                key={plan.id}
                                className={clsx(
                                    "relative p-8 rounded-[32px] border transition-all duration-300 flex flex-col",
                                    isPro
                                        ? "bg-gray-900 border-gray-900 text-white shadow-2xl"
                                        : plan.current
                                            ? "bg-white border-[#ff3d03] shadow-xl shadow-[#ff3d03]/10 scale-105 z-10"
                                            : "bg-white border-gray-200 shadow-sm hover:border-gray-300"
                                )}
                            >
                                {isPro && !plan.current && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff3d03] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#ff3d03]/30 flex items-center gap-1 z-20">
                                        <Star className="h-3 w-3 fill-white" />
                                        Recomendado
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className={clsx("text-xl font-black mb-2 uppercase tracking-wide", isPro ? "text-white" : "text-gray-900")}>
                                        {plan.name}
                                    </h3>
                                    <p className={clsx("text-sm font-medium mb-4 min-h-[40px]", isPro ? "text-gray-400" : "text-gray-500")}>
                                        {plan.original_id === 'free' && "Para quem está começando com recursos essenciais"}
                                        {plan.original_id === 'pro' && "Todos os recursos liberados para fazer seu negócio crescer"}
                                        {plan.original_id === 'custom' && "A solução mais completa com tudo que você precisa"}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        {plan.price !== null && (
                                            <>
                                                {plan.price > 0 && <span className={clsx("text-sm font-bold", isPro ? "text-gray-400" : "text-gray-500")}>R$</span>}
                                                <span className={clsx("text-4xl font-black", isPro ? "text-white" : "text-gray-900")}>
                                                    {plan.price === 0 ? 'Grátis' : plan.price.toString().replace('.', ',')}
                                                </span>
                                                {plan.price > 0 && <span className={clsx("text-sm font-medium", isPro ? "text-gray-400" : "text-gray-500")}>/{plan.interval}</span>}
                                            </>
                                        )}
                                        {plan.price === null && (
                                            <span className={clsx("text-3xl font-black", isPro ? "text-white" : "text-gray-900")}>Sob Consulta</span>
                                        )}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className={clsx(
                                                "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                                                feature.included
                                                    ? (isPro ? "bg-white/10" : "bg-green-100")
                                                    : "bg-gray-100"
                                            )}>
                                                {feature.included ? (
                                                    <Check className={clsx("h-3 w-3", isPro ? "text-green-400" : "text-green-600")} />
                                                ) : (
                                                    <X className="h-3 w-3 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                {feature.text.split('\n').map((line, i) => (
                                                    <span key={i} className={clsx(
                                                        "text-sm font-medium",
                                                        feature.included
                                                            ? (isPro ? "text-gray-300" : "text-gray-600")
                                                            : "text-gray-400 line-through"
                                                    )}>
                                                        {line}
                                                    </span>
                                                ))}
                                            </div>
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
                                        <Link
                                            href={route('subscription.checkout', plan.original_id || plan.id)}
                                            className={clsx(
                                                "block w-full py-4 rounded-xl font-bold text-center transition-all",
                                                isPro
                                                    ? "bg-[#ff3d03] text-white hover:bg-[#e63700] shadow-lg shadow-[#ff3d03]/20"
                                                    : "border border-gray-200 text-gray-900 hover:border-[#ff3d03] hover:text-[#ff3d03]"
                                            )}
                                        >
                                            {plan.price === 0 ? 'Fazer Downgrade' : 'Assinar Agora'}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function UsageItem({ label, current, limit }: { label: string, current: number, limit: number | null }) {
    if (limit === null) return (
        <div className="mb-2">
            <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                <span className="text-green-500 font-bold">Ilimitado</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full bg-green-500 w-full opacity-20"></div>
            </div>
        </div>
    );

    // Safety check: if limit is 0 (blocked feature), show as full red.
    // If limit > 0, calculate percentage.
    const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 100;
    const isCritical = percentage >= 90;
    const isFull = percentage >= 100;

    return (
        <div className="mb-2">
            <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                <span className={clsx(isFull ? "text-red-500 font-bold" : "text-gray-500")}>
                    {current} / {limit}
                </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                    className={clsx("h-1.5 rounded-full transition-all duration-500",
                        isFull ? "bg-red-500" : (isCritical ? "bg-orange-500" : "bg-green-500")
                    )}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            {isFull && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-bold"><AlertCircle className="h-3 w-3" /> Limite atingido</p>}
        </div>
    );
}
