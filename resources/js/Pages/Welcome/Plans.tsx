import { Head, Link } from '@inertiajs/react';
import { Check, Star, Zap, TrendingDown, DollarSign, Globe, Smartphone, LayoutDashboard, MessageCircle, Printer, Trophy, HeartHandshake, ArrowRight, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import GuaranteeSeals from '@/Components/GuaranteeSeals';

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
    plan: Plan;
}

export default function Plans({ plan }: Props) {
    const [isYearly, setIsYearly] = useState(false);
    const [displayPrice, setDisplayPrice] = useState(plan.price);

    // Track page view
    useEffect(() => {
        if (window.gtag) {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                'page_path': '/planos',
                'page_title': 'Plano Único - ÓoDelivery'
            });
        }

        if (window.fbq) {
            window.fbq('track', 'PageView');
        }
    }, []);

    // Handle billing toggle
    const handleBillingToggle = (yearly: boolean) => {
        setIsYearly(yearly);
        setDisplayPrice(yearly ? 1299.00 : 129.90);
    };

    const trackCtaClick = (ctaText: string) => {
        if (window.gtag) {
            window.gtag('event', 'pricing_cta_click', {
                'plan': 'unified',
                'cta_text': ctaText,
                'billing_period': isYearly ? 'yearly' : 'monthly'
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 selection:bg-[#ff3d03] selection:text-white overflow-x-hidden">
            <Head title="Plano Único - ÓoDelivery" />

            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff3d03]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ff3d03]/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl z-50 border-b border-gray-100/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#ff3d03] blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <img
                                    src="/images/landing/plans-logo.png"
                                    alt="ÓoDelivery"
                                    className="h-10 w-auto object-contain relative transition-transform group-hover:scale-105"
                                />
                            </div>
                            <span className="text-2xl font-black text-gray-900 tracking-tighter">ÓoDelivery</span>
                        </Link>
                        <div className="flex items-center gap-8">
                            <Link href={route('login')} className="hidden md:block text-sm font-bold text-gray-600 hover:text-[#ff3d03] transition-colors">
                                Entrar
                            </Link>
                            <Link 
                                href={route('register')} 
                                className="px-7 py-3 rounded-2xl bg-[#ff3d03] text-white font-bold text-sm hover:bg-[#e63703] transition-all shadow-xl shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40 active:scale-95"
                            >
                                Começar Agora
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-32 pb-24">
                {/* Hero Section */}
                <section className="text-center max-w-4xl mx-auto px-6 mb-16">
                    <div className="inline-flex items-center gap-2 bg-[#ff3d03]/10 text-[#ff3d03] px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-8 border border-[#ff3d03]/20 animate-pulse">
                        <Zap className="h-3.5 w-3.5 fill-current" />
                        Acesso Total & Ilimitado
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight mb-8">
                        Seu delivery merece <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff3d03] to-[#ff7a00]">
                            poder ilimitado
                        </span>
                    </h1>
                    <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Esqueça comissões por pedido ou limites de produtos. Um plano único com tudo o que você precisa para dominar o mercado.
                    </p>
                </section>

                {/* Marketplace Comparison - The Hook */}
                <section className="max-w-5xl mx-auto px-6 mb-24">
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3d03]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        
                        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 mb-6 leading-tight">
                                    Por que pagar <span className="text-red-500">27% de comissão</span> se você pode pagar valor fixo?
                                </h2>
                                <p className="text-gray-500 font-medium mb-8">
                                    No iFood e outros apps, quanto mais você vende, mais você paga. No ÓoDelivery, seu sucesso não tem impostos extras.
                                </p>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-4">
                                        <TrendingDown className="h-6 w-6 text-red-500" />
                                        <div>
                                            <span className="block font-bold text-red-900 text-sm">Apps de Marketplace</span>
                                            <span className="text-red-700/70 text-xs font-medium">Taxas de 12% a 30% por cada venda</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-4">
                                        <Trophy className="h-6 w-6 text-green-500" />
                                        <div>
                                            <span className="block font-bold text-green-900 text-sm">Com o ÓoDelivery</span>
                                            <span className="text-green-700/70 text-xs font-medium">0% de comissão. O lucro é todo seu.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-inner">
                                <h4 className="text-center font-black text-gray-400 uppercase tracking-widest text-xs mb-8">Simulador de Economia Anual</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-gray-500">Venda Mensal de R$ 10.000</span>
                                        <span className="text-xs font-black text-[#ff3d03] bg-[#ff3d03]/10 px-2 py-1 rounded">ECONOMIA REAL</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-gray-400">
                                            <span>Taxas iFood (20%)</span>
                                            <span className="text-red-500">R$ 2.000,00/mês</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-400 w-[80%] rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-gray-400">
                                            <span>ÓoDelivery</span>
                                            <span className="text-[#ff3d03]">R$ 129,90/mês</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#ff3d03] w-[15%] rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-gray-200 mt-6 text-center">
                                        <span className="text-3xl font-black text-gray-900">Economize R$ 22.441</span>
                                        <span className="block text-xs font-bold text-gray-500 mt-1 uppercase tracking-tighter">Por ano com o ÓoDelivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Toggle */}
                <div className="text-center mb-12">
                     <p className="text-sm font-bold text-[#ff3d03] uppercase tracking-widest mb-6 px-4">Escolha seu ciclo de faturamento</p>
                    <div className="inline-flex items-center bg-white shadow-xl shadow-gray-200/50 rounded-2xl p-1.5 border border-gray-100">
                        <button
                            onClick={() => handleBillingToggle(false)}
                            className={`px-8 py-3 rounded-xl font-black text-sm transition-all duration-300 ${!isYearly ? 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/30 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => handleBillingToggle(true)}
                            className={`px-8 py-3 rounded-xl font-black text-sm transition-all duration-300 flex items-center gap-2 ${isYearly ? 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/30 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Anual
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${isYearly ? 'bg-white/20 text-white' : 'bg-green-100 text-green-600'}`}>
                                -17% OFF
                            </span>
                        </button>
                    </div>
                </div>

                {/* The Plan Card - Glassmorphism style */}
                <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center mb-32">
                    {/* Left: Included Features List */}
                    <div className="lg:col-span-7 space-y-12">
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Tudo o que você precisa em uma única plataforma.</h3>
                            <p className="text-gray-500 font-medium">Recursos profissionais desenvolvidos para quem quer vender de verdade.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                            <FeatureItem icon={<Smartphone className="text-[#ff3d03]"/>} title="Web App PWA" description="Site leve que funciona como aplicativo." />
                            <FeatureItem icon={<MessageCircle className="text-[#ff3d03]"/>} title="ÓoBot (WhatsApp)" description="Atendimento automático por WhatsApp." />
                            <FeatureItem icon={<Printer className="text-[#ff3d03]"/>} title="ÓoPrint" description="Impressão automática de pedidos." />
                            <FeatureItem icon={<LayoutDashboard className="text-[#ff3d03]"/>} title="Gestão Completa" description="PDV, Cozinha, Motoboys e Estoque." />
                            <FeatureItem icon={<Trophy className="text-[#ff3d03]"/>} title="Ponto Fidelidade" description="Sistema de pontos para fidelizar clientes." />
                            <FeatureItem icon={<Globe className="text-[#ff3d03]"/>} title="Sem Limites" description="Pedidos, produtos e usuários ilimitados." />
                        </div>
                    </div>

                    {/* Right: The Pricing Card */}
                    <div className="lg:col-span-5">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-[#ff3d03] rounded-[48px] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            
                            <div className="relative bg-white border border-gray-100 rounded-[48px] p-10 md:p-12 shadow-2xl shadow-gray-200/40 hover:shadow-[#ff3d03]/10 transition-all duration-300">
                                {/* Seasonal Badge */}
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    Plano Mais Vendido
                                </div>

                                <div className="text-center mb-10 pt-4">
                                    <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6">Plano Único</h4>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-gray-400 text-2xl font-bold">R$</span>
                                        <span className="text-7xl font-black text-gray-900 tracking-tighter">
                                            {Math.floor(displayPrice)}
                                        </span>
                                        <div className="flex flex-col items-start">
                                            <span className="text-2xl font-black text-gray-900">
                                                ,{displayPrice.toFixed(2).split('.')[1]}
                                            </span>
                                            <span className="text-gray-400 font-black text-xs uppercase tracking-tighter">
                                                /{isYearly ? 'ano' : 'mês'}
                                            </span>
                                        </div>
                                    </div>
                                    {isYearly && (
                                        <p className="mt-4 inline-block bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-xs font-black">
                                            Economia de R$ 259,80 por ano
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Todos os recursos liberados
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Configuração gratuita
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Suporte humanizado
                                    </div>
                                </div>

                                <Link
                                    href={route('register', { plan: 'unified' })}
                                    className="block w-full py-6 rounded-3xl bg-[#ff3d03] text-white font-black text-xl text-center shadow-2xl shadow-[#ff3d03]/30 hover:bg-[#e63703] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    onClick={() => trackCtaClick('Assinar Agora')}
                                >
                                    Assinar Agora
                                    <ArrowRight className="inline-block ml-2 h-5 w-5" />
                                </Link>

                                <div className="mt-8">
                                    <GuaranteeSeals />
                                </div>

                                <div className="mt-8 text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                                        🔒 Checkout seguro via Stripe <br />
                                        Cancelamento instantâneo a qualquer momento
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Social Proof / Brands (Placeholders) */}
                <section className="bg-white py-24 border-y border-gray-100 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                         <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-12">O sistema preferido por donos de deliveries inteligentes</h3>
                         <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                             <div className="text-3xl font-black italic tracking-tighter decoration-[#ff3d03] underline underline-offset-8">BurgerKing Clone</div>
                             <div className="text-3xl font-black italic tracking-tighter decoration-[#ff3d03] underline underline-offset-8">PizzaTop</div>
                             <div className="text-3xl font-black italic tracking-tighter decoration-[#ff3d03] underline underline-offset-8">SushiMaster</div>
                             <div className="text-3xl font-black italic tracking-tighter decoration-[#ff3d03] underline underline-offset-8">AçaiFlow</div>
                         </div>
                    </div>
                </section>
                
                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">Dúvidas comuns.</h2>
                        <p className="text-gray-500 font-medium font-medium">Tudo o que você precisa saber antes de assinar.</p>
                    </div>

                    <div className="space-y-4">
                        <FaqItem 
                            question="Preciso pagar mensalidade + comissão?" 
                            answer="De jeito nenhum. No ÓoDelivery você paga apenas o valor fixo da sua assinatura mensal ou anual. 100% do lucro das suas vendas cai direto na sua conta, sem descontos nossos." 
                        />
                        <FaqItem 
                            question="Como funciona a garantia de 7 dias?" 
                            answer="Se por qualquer motivo você achar que o sistema não é para você nos primeiros 7 dias após a assinatura, basta solicitar o reembolso pelo chat ou painel. Devolvemos 100% do seu dinheiro sem pedir explicações." 
                        />
                         <FaqItem 
                            question="O ÓoBot (WhatsApp) já está incluso?" 
                            answer="Sim! O módulo de automação de WhatsApp faz parte do Plano Único. Você conecta seu número e o sistema atende e envia o cardápio automaticamente para seus clientes." 
                        />
                        <FaqItem 
                            question="Posso cancelar a qualquer momento?" 
                            answer="Sim. Não trabalhamos com contratos de fidelidade. Você pode cancelar sua assinatura com apenas um clique pelo seu painel administrativo quando desejar." 
                        />
                    </div>
                </section>
            </main>

            {/* Simple Premium Footer */}
            <footer className="bg-white border-t border-gray-100 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                                <img src="/images/landing/plans-logo.png" className="h-8 w-auto grayscale" alt="" />
                                <span className="text-xl font-black text-gray-400 tracking-tighter">ÓoDelivery</span>
                            </div>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                A revolução na gestão de deliveries. Sem taxas, sem limites, apenas crescimento.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h5 className="text-xs font-black uppercase text-gray-900 tracking-widest">Produto</h5>
                            <ul className="text-sm text-gray-400 font-bold space-y-2">
                                <li><Link href="/" className="hover:text-[#ff3d03]">Início</Link></li>
                                <li><Link href="#planos" className="hover:text-[#ff3d03]">Preços</Link></li>
                                <li><Link href={route('ooprint')} className="hover:text-[#ff3d03]">ÓoPrint</Link></li>
                            </ul>
                        </div>
                         <div className="space-y-4">
                            <h5 className="text-xs font-black uppercase text-gray-900 tracking-widest">Suporte</h5>
                            <ul className="text-sm text-gray-400 font-bold space-y-2">
                                <li><Link href="#" className="hover:text-[#ff3d03]">Ajuda</Link></li>
                                <li><Link href={route('terms')} className="hover:text-[#ff3d03]">Termos</Link></li>
                                <li><Link href="#" className="hover:text-[#ff3d03]">Contato</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h5 className="text-xs font-black uppercase text-gray-900 tracking-widest">Conecte-se</h5>
                            <ul className="text-sm text-gray-400 font-bold space-y-2">
                                <li><a href="#" className="hover:text-[#ff3d03]">Instagram</a></li>
                                <li><a href="#" className="hover:text-[#ff3d03]">YouTube</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} ÓoDelivery Digital Solutions. CNPJ: 00.000.000/0001-00</p>
                        <div className="flex items-center gap-4 opacity-30 grayscale saturate-0 pointer-events-none">
                            <img src="https://logodownload.org/wp-content/uploads/2014/07/visa-logo-1.png" className="h-4" alt="Visa" />
                            <img src="https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-7.png" className="h-6" alt="Mastercard" />
                            <img src="https://logodownload.org/wp-content/uploads/2015/03/pix-logo-1.png" className="h-4" alt="Pix" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex gap-4 group">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-[#ff3d03]/5">
                {icon}
            </div>
            <div>
                <h4 className="font-black text-gray-900 text-sm mb-1">{title}</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`border rounded-[24px] overflow-hidden transition-all duration-500 ${isOpen ? 'border-[#ff3d03] bg-white shadow-2xl shadow-[#ff3d03]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-8 text-left group"
            >
                <span className={`font-black text-lg transition-colors ${isOpen ? 'text-[#ff3d03]' : 'text-gray-900 group-hover:text-[#ff3d03]'}`}>{question}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-[#ff3d03] text-white rotate-180' : 'bg-gray-100 text-gray-400 group-hover:bg-[#ff3d03]/10 group-hover:text-[#ff3d03]'}`}>
                    {isOpen ? <Minus className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                </div>
            </button>
            <div className={`px-8 transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <p className="text-gray-500 font-medium leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
}
