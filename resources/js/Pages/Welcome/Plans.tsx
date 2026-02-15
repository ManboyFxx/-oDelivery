import { Head, Link } from '@inertiajs/react';
import { Check, ChevronDown, ChevronUp, X, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import BillingToggle from '@/Components/BillingToggle';
import GuaranteeSeals from '@/Components/GuaranteeSeals';
import PricingComparison from '@/Components/PricingComparison';

interface Feature {
    text: string;
    included: boolean;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: Feature[];
}

interface Props {
    plans: Plan[];
}

interface ComparisonFeature {
    name: string;
    free?: string | boolean;
    pro?: string | boolean;
    custom?: string | boolean;
    description?: string;
}

export default function Plans({ plans, comparisonData }: Props & { comparisonData: ComparisonFeature[] }) {
    const [isYearly, setIsYearly] = useState(false);
    const [displayPlans, setDisplayPlans] = useState<Plan[]>(plans);

    // Track page view
    useEffect(() => {
        // Google Analytics page view
        if (window.gtag) {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                'page_path': '/planos',
                'page_title': 'Planos e Preços'
            });
        }

        // Facebook Pixel page view
        if (window.fbq) {
            window.fbq('track', 'PageView');
        }
    }, []);

    // Handle billing toggle
    const handleBillingToggle = (yearly: boolean) => {
        setIsYearly(yearly);

        // Update displayed prices
        const updatedPlans = plans.map(plan => {
            if (yearly && plan.price > 0) {
                // Find yearly price from server data if available
                // For now, calculate as monthly * 12
                return {
                    ...plan,
                    price: plan.price * 12,
                    interval: 'ano'
                };
            }
            return plan;
        });

        setDisplayPlans(updatedPlans);
    };

    // Track CTA clicks
    const trackCtaClick = (planId: string, ctaText: string) => {
        if (window.gtag) {
            window.gtag('event', 'pricing_cta_click', {
                'plan': planId,
                'cta_text': ctaText,
                'billing_period': isYearly ? 'yearly' : 'monthly'
            });
        }

        if (window.fbq) {
            window.fbq('track', 'Click', {
                'content_name': `CTA - ${planId}`,
                'value': plans.find(p => p.id === planId)?.price || 0,
                'currency': 'BRL'
            });
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#ff3d03] selection:text-white">
            <Head title="Planos e Preços - ÓoDelivery" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/">
                            <div className="flex items-center">
                                <img
                                    src="/images/landing/plans-logo.png"
                                    alt="ÓoDelivery"
                                    className="h-10 w-auto object-contain"
                                />
                                <span className="ml-2 text-2xl font-bold text-gray-900 tracking-tight">ÓoDelivery</span>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href={route('login')} className="text-sm font-bold text-gray-700 hover:text-[#ff3d03] transition-colors">
                                Entrar
                            </Link>
                            <Link href={route('register')} className="px-6 py-2.5 rounded-xl bg-[#ff3d03] text-white font-bold text-sm hover:bg-[#e63703] transition-all shadow-lg shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40">
                                Começar Grátis
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto px-6 mb-20">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                        Planos simples para <br />
                        <span className="text-[#ff3d03]">negócios de todos os tamanhos</span>
                    </h1>
                    <p className="text-xl text-gray-500 font-medium">
                        Comece grátis e cresça com a gente. Sem fidelidade, cancele quando quiser.
                    </p>
                </div>

                {/* Trial Banner */}
                <div className="max-w-4xl mx-auto px-6 mb-8">
                    <div className="bg-gradient-to-r from-[#ff3d03] to-[#e63700] rounded-2xl p-6 text-center shadow-xl">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Star className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                            <h3 className="text-2xl font-black text-white">Teste Grátis por 14 Dias!</h3>
                            <Star className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                        </div>
                        <p className="text-white/90 font-medium text-lg">
                            Comece com <span className="font-bold text-yellow-300">acesso completo ao Plano PRO</span> sem compromisso.
                        </p>
                        <p className="text-white/80 text-sm mt-2">
                            Após 14 dias, escolha continuar no PRO (R$ 109,90/mês) ou use o plano Gratuito para sempre.
                        </p>
                    </div>
                </div>

                {/* Billing Toggle */}
                <BillingToggle
                    onToggle={handleBillingToggle}
                    discount={plans.find(p => p.id === 'pro')?.id ? 20 : 0}
                />

                {/* Pricing Cards */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {displayPlans.map((plan) => {
                            const isPro = plan.price > 0 && plan.price < 100; // Heuristic for Pro plan (middle tier)
                            const isFree = plan.price === 0;
                            const isCustom = plan.price >= 100 && plan.interval !== 'mês'; // Custom logic usually price is high or placeholder.
                            // Actually better to check ID if standard
                            const isProById = plan.id === 'pro';

                            return (
                                <div
                                    key={plan.id}
                                    className={clsx(
                                        "relative p-8 rounded-3xl border transition-all duration-300 flex flex-col h-full",
                                        isProById
                                            ? "border-2 border-[#ff3d03] bg-white shadow-xl shadow-[#ff3d03]/10 scale-105 z-10"
                                            : "border-gray-200 bg-white hover:border-[#ff3d03]/30 hover:shadow-2xl hover:shadow-[#ff3d03]/5"
                                    )}
                                >
                                    {isProById && (
                                        <div className="absolute top-0 right-0 bg-[#ff3d03] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                                            Recomendado
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className={clsx("text-lg font-bold uppercase tracking-wider mb-2", isProById ? "text-[#ff3d03]" : "text-gray-500")}>
                                            {plan.name}
                                        </h3>
                                        <div className="flex items-baseline gap-1">
                                            {plan.price > 0 ? (
                                                <>
                                                    <span className="text-5xl font-black text-gray-900">R${Math.floor(plan.price)}</span>
                                                    <span className="text-2xl font-bold text-gray-900">,{plan.price.toFixed(2).split('.')[1]}</span>
                                                </>
                                            ) : (
                                                <span className="text-5xl font-black text-gray-900">{plan.price === 0 ? 'R$0' : 'Sob Consulta'}</span>
                                            )}
                                            <span className="text-gray-500 font-medium">/{plan.interval}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-2">
                                            {plan.id === 'free' && "Ideal para começar a operar com qualidade."}
                                            {plan.id === 'pro' && "Liberdade total para crescer e organizar a logística."}
                                            {plan.id === 'custom' && "Sob medida para redes e grandes operações."}
                                        </p>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className={clsx("flex items-center gap-3 font-medium", feature.included ? (isProById ? "text-gray-900 font-bold" : "text-gray-600") : "text-gray-400 opacity-60")}>
                                                {feature.included ? (
                                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                                ) : (
                                                    <X className="h-5 w-5 text-gray-300" />
                                                )}
                                                {feature.text}
                                            </li>
                                        ))}
                                    </ul>

                                    {plan.id === 'custom' ? (
                                        <a
                                            href="https://wa.me/5511999999999"
                                            target="_blank"
                                            className="block w-full py-4 rounded-xl border-2 border-gray-100 text-gray-900 font-bold text-center hover:border-[#ff3d03] hover:text-[#ff3d03] transition-all"
                                            onClick={() => trackCtaClick('custom', 'Falar com Consultor')}
                                        >
                                            Falar com Consultor
                                        </a>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('register', { plan: plan.id })}
                                                className={clsx(
                                                    "block w-full py-4 rounded-xl font-bold text-center transition-all",
                                                    isProById
                                                        ? "bg-[#ff3d03] text-white hover:bg-[#e63700] shadow-lg shadow-[#ff3d03]/30 hover:shadow-[#ff3d03]/50"
                                                        : "border-2 border-gray-100 text-gray-900 hover:border-[#ff3d03] hover:text-[#ff3d03]"
                                                )}
                                                onClick={() => trackCtaClick(plan.id, plan.price === 0 ? 'Começar Grátis' : 'Assinar Agora')}
                                            >
                                                {plan.price === 0 ? 'Começar Grátis' : 'Assinar Agora'}
                                            </Link>

                                            {/* Guarantee Seals */}
                                            <GuaranteeSeals />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pricing Comparison Table */}
                <PricingComparison
                    plans={displayPlans}
                    comparisonData={comparisonData}
                />

                {/* FAQ Style */}
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Perguntas Frequentes</h2>
                        <p className="text-gray-500">Tire suas dúvidas sobre o funcionamento do ÓoDelivery.</p>
                    </div>

                    <div className="space-y-4">
                        <FaqItem
                            question="Preciso pagar alguma taxa sobre os pedidos?"
                            answer="Não! Diferente dos aplicativos de marketplace (como iFood), nós não cobramos comissão sobre suas vendas. Você paga apenas a mensalidade do plano e vende o quanto quiser."
                        />
                        <FaqItem
                            question="O sistema funciona em celular e computador?"
                            answer="Sim! O ÓoDelivery é 100% em nuvem e responsivo. Você pode gerenciar sua loja pelo computador, tablet ou celular, de qualquer lugar."
                        />
                        <FaqItem
                            question="Como funciona a impressão de pedidos?"
                            answer="Com o módulo ÓoPrint (incluso no plano Básico), você instala nosso gerenciador no seu computador com Windows e os pedidos são impressos automaticamente na sua impressora térmica assim que chegam."
                        />
                        <FaqItem
                            question="Posso usar meu próprio domínio?"
                            answer="Sim, oferecemos um link personalizado (oodelivery.com/sua-loja), mas você também pode conectar seu domínio próprio se desejar."
                        />
                        <FaqItem
                            question="Tem fidelidade?"
                            answer="Não. Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas escondidas."
                        />
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-gray-400 font-medium text-sm">
                        &copy; {new Date().getFullYear()} ÓoDelivery. Todos os direitos reservados.
                    </p>
                    <div className="mt-4 flex justify-center gap-6 text-sm font-bold text-gray-500">
                        <Link href={route('terms')} className="hover:text-[#ff3d03] transition-colors">Termos de Uso</Link>
                        <Link href="#" className="hover:text-[#ff3d03] transition-colors">Privacidade</Link>
                        <Link href="#" className="hover:text-[#ff3d03] transition-colors">Contato</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:border-[#ff3d03]/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left"
            >
                <span className="font-bold text-gray-900 text-lg pr-4">{question}</span>
                {isOpen ? <ChevronUp className="text-[#ff3d03]" /> : <ChevronDown className="text-gray-400" />}
            </button>
            <div className={`px-6 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-600 font-medium leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
}
