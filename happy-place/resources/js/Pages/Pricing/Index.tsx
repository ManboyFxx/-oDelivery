import { Head, Link } from '@inertiajs/react';
import { ChefHat, Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export default function Pricing() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            name: 'Gratuito',
            price: { monthly: 0, yearly: 0 },
            description: 'Comece com o essencial',
            features: {
                users: 'Ilimitados',
                products: '100 produtos',
                orders: '3.000/mês',
                menu: true,
                reports: true,
                integrations: false,
                loyalty: true,
            },
            cta: 'Começar Grátis',
            popular: false,
        },
        {
            name: 'Básico',
            price: { monthly: 79.90, yearly: 838.80 },
            description: 'Para crescer com tudo',
            features: {
                users: 'Ilimitados',
                products: 'Ilimitados',
                orders: 'Ilimitados',
                menu: true,
                reports: true,
                integrations: true,
                loyalty: true,
            },
            cta: 'Teste 14 Dias Grátis',
            popular: true,
            savings: '~2% off anual',
        },
        {
            name: 'Pro',
            price: { monthly: null, yearly: null },
            description: 'Solução completa',
            features: {
                users: 'Ilimitados',
                products: 'Ilimitados',
                orders: 'Ilimitados',
                menu: true,
                reports: true,
                integrations: true,
                loyalty: true,
            },
            cta: 'Falar com Consultor',
            popular: false,
        },
    ];

    const allFeatures = [
        {
            category: 'Gestão', items: [
                { name: 'Usuários', free: 'Ilimitados', pro: 'Ilimitados', enterprise: 'Ilimitados' },
                { name: 'Produtos', free: '100', pro: 'Ilimitados', enterprise: 'Ilimitados' },
                { name: 'Pedidos/Mês', free: '3.000', pro: 'Ilimitados', enterprise: 'Ilimitados' },
                { name: 'Estoque', free: '25 itens', pro: 'Ilimitado', enterprise: 'Ilimitado' },
                { name: 'Mesas', free: true, pro: true, enterprise: true },
            ]
        },
        {
            category: 'Recursos', items: [
                { name: 'Cardápio Digital', free: true, pro: true, enterprise: true },
                { name: 'PDV', free: true, pro: true, enterprise: true },
                { name: 'Impressão Automática (ÓoPrint)', free: true, pro: true, enterprise: true },
                { name: 'Relatórios Avançados', free: true, pro: true, enterprise: true },
                { name: 'Programa de Fidelidade', free: true, pro: true, enterprise: true },
                { name: 'Múltiplas Formas de Pagamento', free: true, pro: true, enterprise: true },
            ]
        },
        {
            category: 'Recursos Premium', items: [
                { name: 'Robô WhatsApp (ÓoBot)', free: false, pro: true, enterprise: true },
                { name: 'Sistema de Motoboys (ÓoMotoboy)', free: false, pro: true, enterprise: true },
                { name: 'Integrações (iFood, Rappi)', free: false, pro: true, enterprise: true },
                { name: 'API de Acesso', free: false, pro: true, enterprise: true },
                { name: 'Domínio Personalizado', free: false, pro: true, enterprise: true },
                { name: 'Suporte Prioritário', free: false, pro: true, enterprise: true },
                { name: 'Remove Watermark', free: false, pro: true, enterprise: true },
            ]
        },
    ];

    const renderFeatureValue = (value: any) => {
        if (typeof value === 'boolean') {
            return value ? (
                <Check className="h-5 w-5 text-gray-800 mx-auto" />
            ) : (
                <span className="text-gray-300">-</span>
            );
        }
        return <span className="text-sm text-gray-700 font-medium">{value}</span>;
    };

    return (
        <>
            <Head title="Planos - ÓoDelivery" />

            <div className="min-h-screen bg-[#e4e4e4] text-gray-800">
                {/* Header */}
                <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            <Link href="/" className="flex items-center gap-3">
                                <img src="/images/logo.png" alt="ÓoDelivery" className="h-10 w-auto" />
                                <span className="text-xl font-bold tracking-tight text-[#ff3d03]">ÓoDelivery</span>
                            </Link>

                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('login')}
                                    className="text-gray-600 hover:text-[#ff3d03] font-bold transition-colors"
                                >
                                    Entrar
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="bg-[#ff3d03] hover:bg-[#d13302] text-white px-5 py-2 rounded-lg font-bold transition-colors"
                                >
                                    Começar
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                            Investimento Inteligente
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 font-medium">
                            Escolha a ferramenta certa para escalar seu negócio.
                        </p>

                        {/* Billing Toggle */}
                        <div className="inline-flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${billingCycle === 'monthly'
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Mensal
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${billingCycle === 'yearly'
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Anual
                            </button>
                        </div>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {plans.map((plan, index) => (
                                <div
                                    key={index}
                                    className={`relative p-8 bg-white rounded-xl ${plan.popular
                                            ? 'border-2 border-[#ff3d03] shadow-lg'
                                            : 'border border-gray-200 shadow-sm'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff3d03] text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
                                            Recomendado
                                        </div>
                                    )}
                                    <div className="text-center mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                                        <div className="flex items-end justify-center gap-1">
                                            {plan.price[billingCycle] !== null ? (
                                                <>
                                                    <span className="text-4xl font-black text-gray-900 tracking-tight">
                                                        R$ {plan.price[billingCycle].toFixed(2).replace('.', ',')}
                                                    </span>
                                                    <span className="text-gray-500 font-medium mb-1">
                                                        /mês
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-3xl font-black text-gray-900 tracking-tight">Consultar</span>
                                            )}
                                        </div>
                                        {plan.savings && (
                                            <p className="text-xs text-green-600 font-semibold mt-2">{plan.savings}</p>
                                        )}
                                    </div>

                                    <Link
                                        href={route('register')}
                                        className={`block w-full py-3 rounded-lg font-bold text-center transition-all mb-8 ${plan.popular
                                                ? 'bg-[#ff3d03] hover:bg-[#d13302] text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Link>

                                    <div className="space-y-4 pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Usuários</span>
                                            <strong className="text-gray-900">{plan.features.users}</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Produtos</span>
                                            <strong className="text-gray-900">{plan.features.products}</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Relatórios</span>
                                            {plan.features.reports ? (
                                                <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <X className="h-4 w-4 text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-black text-gray-900 text-center mb-10 tracking-tight">
                            Dúvidas Comuns
                        </h2>

                        <div className="space-y-4">
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="font-bold text-gray-900 mb-2">Preciso de cartão de crédito para testar?</h3>
                                <p className="text-gray-600">Não. O teste de 14 dias é totalmente gratuito e sem compromisso.</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="font-bold text-gray-900 mb-2">Posso cancelar quando quiser?</h3>
                                <p className="text-gray-600">Sim. Não exigimos fidelidade e você pode cancelar sua assinatura a qualquer momento.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#e4e4e4] border-t border-gray-300 py-12 px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-500 text-sm">© 2026 ÓoDelivery. Todos os direitos reservados.</p>
                </footer>
            </div>
        </>
    );
}
