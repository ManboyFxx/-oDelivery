import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Check, X, ArrowLeft, Headphones, Zap, ShieldCheck, MessageCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Plans({ auth }: PageProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            id: 'free',
            name: 'Gratuito',
            price: 0,
            priceYearly: 0,
            period: '/mês',
            description: 'Para quem está começando com recursos essenciais',
            features: [
                { text: '100 produtos', included: true },
                { text: 'Pedidos ilimitados (até 3.000/mês)', included: true },
                { text: 'Cardápio digital', included: true },
                { text: 'Impressão automática (ÓoPrint)', included: true },
                { text: 'Relatórios', included: true },
                { text: 'Programa de fidelidade', included: true },
                { text: 'Múltiplas formas de pagamento', included: true },
                { text: 'Gestão de estoque (até 25 produtos)', included: true },
                { text: 'Robô WhatsApp (ÓoBot)', included: false },
                { text: 'Sistema de motoboys (ÓoMotoboy)', included: false },
            ],
            cta: 'Começar Grátis',
            ctaLink: route('register'),
            popular: false,
            color: 'border-gray-200 bg-gray-50',
            buttonStyle: 'bg-gray-900 text-white hover:bg-black',
        },
        {
            id: 'basic',
            name: 'Básico',
            price: 79.90,
            priceYearly: 838.80,
            period: '/mês',
            description: 'Todos os recursos liberados para fazer seu negócio crescer',
            features: [
                { text: '100+ produtos', included: true },
                { text: 'Pedidos ilimitados', included: true },
                { text: 'Tudo do Gratuito +', included: true },
                { text: 'Robô WhatsApp (ÓoBot)', included: true },
                { text: 'Sistema de motoboys (ÓoMotoboy)', included: true },
                { text: 'Integrações', included: true },
                { text: 'Gestão de estoque ilimitada', included: true },
                { text: 'Múltiplas unidades', included: true },
                { text: 'API de acesso', included: true },
                { text: 'Domínio personalizado', included: true },
                { text: 'Suporte prioritário', included: true },
            ],
            cta: 'Teste Grátis 14 dias',
            ctaLink: route('register'),
            popular: true,
            color: 'border-[#ff3d03] bg-white shadow-xl',
            buttonStyle: 'bg-[#ff3d03] text-white hover:bg-[#e53703]',
        },
        {
            id: 'pro',
            name: 'Pro',
            price: null,
            priceYearly: null,
            period: '',
            description: 'A solução mais completa com tudo que você precisa',
            features: [
                { text: 'Tudo do Básico +', included: true },
                { text: 'Produtos ilimitados', included: true },
                { text: 'Usuários ilimitados', included: true },
                { text: 'Pedidos ilimitados', included: true },
                { text: 'Estoque ilimitado', included: true },
                { text: 'Remoção de marca d\'água', included: true },
                { text: 'Temas avançados', included: true },
                { text: 'Onboarding dedicado', included: true },
                { text: 'Suporte WhatsApp prioritário', included: true },
                { text: 'Tudo descrito acima garantido', included: true },
            ],
            cta: 'Falar com Consultor',
            ctaLink: 'https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Pro do ÓoDelivery.',
            ctaExternal: true,
            popular: false,
            color: 'border-gray-900 bg-gray-900 text-white',
            buttonStyle: 'bg-white text-gray-900 hover:bg-gray-100',
        },
    ];

    const faqs = [
        {
            q: 'Como funciona o período de teste?',
            a: 'Ao se cadastrar, você ganha 14 dias grátis com acesso a todos os recursos do plano Básico. Não é necessário cartão de crédito.'
        },
        {
            q: 'Posso mudar de plano a qualquer momento?',
            a: 'Sim! Você pode fazer upgrade ou downgrade do seu plano diretamente pelo painel administrativo, sem burocracias.'
        },
        {
            q: 'Há cobrança de comissão sobre os pedidos?',
            a: 'Não cobramos nenhuma comissão sobre suas vendas. O valor que você ganha é 100% seu.'
        },
        {
            q: 'O que acontece quando o período de teste termina?',
            a: 'Você pode escolher assinar um plano pago ou continuar usando o plano Gratuito com recursos limitados.'
        },
    ];

    const getPrice = (plan: typeof plans[0]) => {
        if (plan.price === null) return 'Personalizado';
        if (plan.price === 0) return 'R$ 0';

        if (billingCycle === 'yearly' && plan.priceYearly) {
            const monthlyPrice = plan.priceYearly / 12;
            return `R$ ${monthlyPrice.toFixed(2).replace('.', ',')}`;
        }

        return `R$ ${plan.price.toFixed(2).replace('.', ',')}`;
    };

    const getYearlyDiscount = (plan: typeof plans[0]) => {
        if (!plan.price || !plan.priceYearly) return 0;
        const monthlyTotal = plan.price * 12;
        return Math.round(((monthlyTotal - plan.priceYearly) / monthlyTotal) * 100);
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#ff3d03] selection:text-white antialiased">
            <Head title="Planos e Preços - ÓoDelivery" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-[#ff3d03] transition-colors font-semibold">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Voltar</span>
                        </Link>

                        <Link href="/">
                            <img src="/images/logo-full.png" alt="ÓoDelivery" className="h-16 w-auto" />
                        </Link>

                        <Link
                            href={route('login')}
                            className="text-sm font-semibold text-gray-700 hover:text-[#ff3d03] transition-colors"
                        >
                            Entrar
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12 space-y-6">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
                            Escolha o plano ideal para{' '}
                            <span className="text-[#ff3d03]">seu negócio</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
                            Comece grátis e faça upgrade quando precisar. Sem taxas ocultas, sem comissões.
                        </p>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex justify-center mb-12">
                        <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                    billingCycle === 'monthly'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Mensal
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                                    billingCycle === 'yearly'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Anual
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                    -12%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-24">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col p-8 rounded-3xl border-2 ${plan.color} ${
                                    plan.popular ? 'scale-105 z-10' : ''
                                } transition-all hover:shadow-lg`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff3d03] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Recomendado
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className={`text-2xl font-black mb-2 uppercase tracking-wide ${
                                        plan.id === 'pro' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm font-medium leading-relaxed ${
                                        plan.id === 'pro' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-4xl font-black ${
                                            plan.id === 'pro' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {getPrice(plan)}
                                        </span>
                                        {plan.price !== null && (
                                            <span className={`font-bold ${
                                                plan.id === 'pro' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>
                                    {billingCycle === 'yearly' && getYearlyDiscount(plan) > 0 && (
                                        <p className="text-sm text-green-600 font-semibold mt-1">
                                            Economia de {getYearlyDiscount(plan)}% no plano anual
                                        </p>
                                    )}
                                </div>

                                <ul className={`space-y-3 mb-8 flex-1 font-medium ${
                                    plan.id === 'pro' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    {plan.features.map((feature) => (
                                        <li key={feature.text} className="flex gap-3 text-sm">
                                            {feature.included ? (
                                                <Check className={`w-5 h-5 flex-shrink-0 ${
                                                    plan.popular ? 'text-[#ff3d03]' :
                                                    plan.id === 'pro' ? 'text-green-400' : 'text-green-500'
                                                }`} />
                                            ) : (
                                                <X className="w-5 h-5 flex-shrink-0 text-gray-300" />
                                            )}
                                            <span className={!feature.included ? 'text-gray-400 line-through' : ''}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.ctaExternal ? (
                                    <a
                                        href={plan.ctaLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full py-4 px-6 rounded-2xl text-center font-bold transition-all flex items-center justify-center gap-2 ${plan.buttonStyle}`}
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        {plan.cta}
                                    </a>
                                ) : (
                                    <Link
                                        href={plan.ctaLink}
                                        className={`w-full py-4 px-6 rounded-2xl text-center font-bold transition-all flex items-center justify-center gap-2 ${plan.buttonStyle}`}
                                    >
                                        {plan.cta}
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto mb-24">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-[#ff3d03]">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Sem Comissões</h4>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                O valor das suas vendas é 100% seu. Não cobramos taxa por pedido.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-[#ff3d03]">
                                <Headphones className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Suporte Humanizado</h4>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                Nossa equipe está disponível para ajudar quando você precisar.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-[#ff3d03]">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Setup Instantâneo</h4>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                Configure seu estabelecimento e comece a vender no mesmo dia.
                            </p>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="max-w-3xl mx-auto bg-gray-50 rounded-3xl p-8 md:p-12">
                        <h2 className="text-3xl font-black text-gray-900 mb-10 text-center">
                            Perguntas Frequentes
                        </h2>
                        <div className="space-y-8">
                            {faqs.map((faq) => (
                                <div key={faq.q}>
                                    <h5 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h5>
                                    <p className="text-gray-600 font-medium leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <img
                            src="/images/logo-full.png"
                            alt="ÓoDelivery"
                            className="h-16 w-auto brightness-0 invert"
                        />
                        <p className="text-gray-500 text-sm font-medium">
                            © 2026 ÓoDelivery. Todos os direitos reservados.
                        </p>
                        <div className="flex gap-6 text-sm font-semibold">
                            <a href="#" className="hover:text-[#ff3d03] transition-colors">Termos</a>
                            <a href="#" className="hover:text-[#ff3d03] transition-colors">Privacidade</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
