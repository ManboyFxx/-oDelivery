import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    ShoppingBag, 
    Menu, 
    X, 
    ArrowRight, 
    PlayCircle, 
    UtensilsCrossed, 
    Bot, 
    LayoutDashboard, 
    Zap, 
    BarChart3, 
    ShieldCheck, 
    MousePointer2, 
    CheckCircle2,
    Monitor,
    Bike,
    Sparkles,
    Package,
    Twitter, 
    Instagram, 
    Linkedin 
} from 'lucide-react';
import { useState } from 'react';

export default function WelcomeV5({ auth }: PageProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'OoBot (WhatsApp)', href: route('oobot') },
        { name: 'OoPrint', href: route('ooprint') },
        { name: 'Planos', href: route('plans.public') },
    ];

    return (
        <div className="relative min-h-screen bg-[#f8f6f5] text-[#181210] selection:bg-[#FF3D03]/20 font-sans antialiased overflow-x-hidden">
            <Head>
                <title>ÓoDelivery | Sua própria plataforma de delivery.</title>
                <meta name="description" content="Tenha controle total do seu delivery com PDV, WhatsApp Automático, Gestão de Motoboys e muito mais. Pare de pagar taxas por pedido." />
                
                {/* Facebook / Standard Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.origin} />
                <meta property="og:title" content="ÓoDelivery | Sua própria plataforma de delivery." />
                <meta property="og:description" content="Tenha controle total do seu delivery com PDV, WhatsApp Automático, Gestão de Motoboys e muito mais. Pare de pagar taxas por pedido." />
                <meta property="og:image" content={`${window.location.origin}/images/logo-main.png`} />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={window.location.origin} />
                <meta property="twitter:title" content="ÓoDelivery | Sua própria plataforma de delivery." />
                <meta property="twitter:description" content="Tenha controle total do seu delivery com PDV, WhatsApp Automático, Gestão de Motoboys e muito mais. Pare de pagar taxas por pedido." />
                <meta property="twitter:image" content={`${window.location.origin}/images/logo-main.png`} />
            </Head>
            
            {/* SVG Noise Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
                </svg>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#e7ddda]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img 
                            src="/images/logo-main.png" 
                            alt="OoDelivery Logo" 
                            className="h-14 w-auto object-contain"
                        />
                    </Link>

                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-semibold text-gray-700 hover:text-[#FF3D03] transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href={route('login')} className="hidden sm:block text-sm font-bold px-5 py-2.5 rounded-xl bg-[#ede7e5] hover:bg-[#e7ddda] transition-all">
                            Entrar
                        </Link>
                        <Link href={route('register')} className="text-sm font-bold px-6 py-2.5 rounded-xl bg-[#FF3D03] text-white hover:opacity-90 transition-all shadow-lg shadow-[#FF3D03]/20">
                            Criar Minha Loja
                        </Link>
                        <button 
                            className="md:hidden text-gray-700"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-[#e7ddda] px-6 py-6 flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-base font-semibold text-gray-700 hover:text-[#FF3D03]"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link href={route('login')} className="w-full text-center font-bold py-3 rounded-xl bg-[#ede7e5]">
                            Entrar
                        </Link>
                    </div>
                )}
            </header>

            <main>

                {/* Hero - Centered and Punchy */}
                <section className="relative pt-12 lg:pt-20 pb-12 lg:pb-20 px-6 overflow-hidden">
                    <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF3D03]/10 text-[#FF3D03] font-bold text-xs uppercase tracking-widest animate-fade-in">
                            <Zap size={14} className="fill-[#FF3D03]" />
                            Seu delivery no automático
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-[#181210]">
                            Pare de pagar <br/>
                            <span className="text-[#FF3D03] italic relative inline-block">
                                taxa por pedido.
                                <svg className="absolute -bottom-2 lg:-bottom-3 left-0 w-full h-2 text-[#FF3D03]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 0 100 5 L 100 10 L 0 10 Z" fill="currentColor"/>
                                </svg>
                            </span>
                        </h1>
                        
                        <p className="text-lg lg:text-xl text-[#8d695e] max-w-2xl leading-relaxed font-medium">
                            Tenha sua própria plataforma de delivery e controle pedidos, cozinha e motoboys em tempo real.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-green-500" />
                                Pedidos ilimitados
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-green-500" />
                                Sem taxa por pedido
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-green-500" />
                                Tudo em uma única tela
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href={route('register')} className="h-16 px-10 rounded-2xl bg-[#FF3D03] text-white font-black text-xl hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-10px_rgba(255,61,3,0.4)] transition-all flex items-center justify-center gap-3 group">
                                Quero minha plataforma
                                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href={route('demo.access')} className="h-16 px-10 rounded-2xl bg-white border-2 border-[#e7ddda] font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <PlayCircle size={22} />
                                Ver demonstração
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Section 2: A DOR (The Pain) */}
                <section className="py-24 px-6 bg-[#181210] text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF3D03] to-transparent opacity-30"></div>
                    <div className="max-w-6xl mx-auto relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight mb-8">
                                    Você trabalha. <br/>
                                    <span className="text-[#FF3D03]">O marketplace lucra.</span>
                                </h2>
                                <div className="space-y-6 text-lg text-gray-400 font-medium leading-relaxed">
                                    <p>
                                        Se você faz 300 pedidos por mês de R$50, pode estar pagando até <span className="text-white font-bold underline decoration-[#FF3D03] decoration-2">R$4.000 em taxas</span>.
                                    </p>
                                    <p className="text-2xl text-white font-black italic">
                                        Dinheiro que poderia estar no seu caixa.
                                    </p>
                                    <div className="pt-4 flex flex-col gap-4">
                                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                            <X className="text-red-500 mt-1 shrink-0" />
                                            <p className="text-sm">Delivery não é para dar comissão, É para gerar lucro.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#FF3D03]/20 blur-[100px] rounded-full"></div>
                                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Comissão Típica</span>
                                            <span className="text-3xl font-black text-red-500">18% a 27%</span>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Taxa OoDelivery</span>
                                            <span className="text-3xl font-black text-green-500">0%</span>
                                        </div>
                                        <div className="pt-4">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Seu resultado:</p>
                                            <p className="text-lg font-medium text-gray-300">Independência total para crescer sem medo de vender mais.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: A CONTA (The Math) */}
                <section className="py-24 px-6 bg-[#f8f6f5]">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tighter mb-12">
                            A conta que <span className="text-[#FF3D03]">ninguém te mostra.</span>
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            <div className="p-8 rounded-[2rem] bg-white border-2 border-[#e7ddda] flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-black mb-6 uppercase tracking-wider text-gray-400">Cenário Marketplaces</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>300 pedidos × R$50</span>
                                            <span>R$ 15.000</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-red-500">
                                            <span>Taxa média (18%)</span>
                                            <span>- R$ 2.700</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-500">Você recebe:</span>
                                    <span className="text-2xl font-black text-gray-900">R$ 12.300</span>
                                </div>
                            </div>

                            <div className="p-8 rounded-[2rem] bg-white border-4 border-[#FF3D03] shadow-2xl shadow-[#FF3D03]/10 relative flex flex-col justify-between">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#FF3D03] text-white text-xs font-black uppercase tracking-[0.2em] rounded-full">
                                    Sua Independência
                                </div>
                                <div>
                                    <h3 className="text-xl font-black mb-6 uppercase tracking-wider text-[#FF3D03]">Com ÓoDelivery</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>300 pedidos × R$50</span>
                                            <span>R$ 15.000</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-green-500">
                                            <span>Mensalidade Fixa</span>
                                            <span>- R$ 129,90</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-500">Você recebe:</span>
                                    <span className="text-3xl font-black text-[#FF3D03]">R$ 14.870,10</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 inline-flex flex-col items-center gap-6">
                            <p className="text-xl font-bold text-[#8d695e]">Quanto você quer economizar este mês?</p>
                            <Link href={route('register')} className="h-16 px-12 rounded-2xl bg-[#181210] text-white font-black text-lg hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center gap-3">
                                Calcular minha economia
                                <ArrowRight size={20} className="text-[#FF3D03]" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Section 4: COMO FUNCIONA (The Flow) */}
                <section className="py-24 px-6 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter mb-4">
                                Do pedido à entrega. <span className="text-[#FF3D03]">Automático.</span>
                            </h2>
                            <p className="text-[#8d695e] font-medium">Você só acompanha e o sistema organiza.</p>
                        </div>

                        <div className="grid md:grid-cols-5 gap-8 relative">
                            {/* Connector line for large screens */}
                            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#FF3D03]/0 via-[#FF3D03]/20 to-[#FF3D03]/0"></div>
                            
                            {[
                                { step: '1', title: 'Cardápio', desc: 'Cliente pede no seu cardápio próprio' },
                                { step: '2', title: 'Painel', desc: 'Pedido entra no painel (kanban visual)' },
                                { step: '3', title: 'Cozinha', desc: 'Cozinha recebe em tempo real' },
                                { step: '4', title: 'Motoboy', desc: 'Motoboy é atribuído com 1 clique' },
                                { step: '5', title: 'Update', desc: 'Cliente recebe atualização no WhatsApp' }
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-6 relative z-10 group">
                                    <div className="w-24 h-24 rounded-3xl bg-[#f8f6f5] border-2 border-[#e7ddda] flex items-center justify-center text-3xl font-black text-[#FF3D03] group-hover:bg-[#FF3D03] group-hover:text-white group-hover:border-[#FF3D03] transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-[#FF3D03]/20 group-hover:-translate-y-2">
                                        {s.step}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-black text-lg tracking-tight uppercase">{s.title}</h4>
                                        <p className="text-sm text-[#8d695e] font-medium leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 5: UMA PLATAFORMA COMPLETA (Features) */}
                <section className="py-24 px-6 bg-[#f8f6f5]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col items-center text-center gap-4 mb-16">
                            <div className="max-w-3xl">
                                <h2 className="text-3xl lg:text-5xl font-black tracking-tighter leading-none mb-4 uppercase">
                                    Uma plataforma <span className="text-[#FF3D03]">completa.</span>
                                </h2>
                                <p className="text-[#8d695e] text-lg font-medium italic">Não é um sistema simples, É a plataforma do seu negócio.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {[
                                { name: 'Cardápio Digital', icon: <UtensilsCrossed size={24} />, desc: 'Profissional e rápido' },
                                { name: 'Kanban Pedidos', icon: <LayoutDashboard size={24} />, desc: 'Gestão visual total' },
                                { name: 'Tela Cozinha', icon: <LayoutDashboard size={24} />, desc: 'KDS exclusivo' },
                                { name: 'Painel Motoboy', icon: <Bike size={24} />, desc: 'Despacho com 1 clique' },
                                { name: 'WhatsApp Autom.', icon: <Sparkles size={24} />, desc: 'Status em tempo real' },
                                { name: 'PDV & Mesas', icon: <Monitor size={24} />, desc: 'Frente de caixa nativo' },
                                { name: 'Estoque', icon: <Package size={24} />, desc: 'Controle de insumos' },
                                { name: 'Relatórios', icon: <BarChart3 size={24} />, desc: 'Métricas de lucro' },
                                { name: 'Cupons/Fidelidade', icon: <Zap size={24} />, desc: 'Venda mais vezes' },
                                { name: 'Gamificação', icon: <Bot size={24} />, desc: 'Em breve: Retenção' },
                            ].map((feature, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-[#e7ddda] hover:border-[#FF3D03] transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-[#f8f6f5] flex items-center justify-center text-[#FF3D03] mb-4 group-hover:bg-[#FF3D03] group-hover:text-white transition-all">
                                        {feature.icon}
                                    </div>
                                    <h4 className="font-black text-sm mb-1 tracking-tight">{feature.name}</h4>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 6: RESULTADOS (Metrics) */}
                <section className="py-24 px-6 bg-[#181210] text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl lg:text-5xl font-black tracking-tighter mb-8 leading-tight">
                                    O que muda quando você <br/> <span className="text-[#FF3D03]">organiza seu delivery.</span>
                                </h2>
                                <p className="text-gray-400 font-medium text-lg leading-relaxed">
                                    Sistema não é custo. É multiplicador de lucro. Veja o impacto médio nos nossos parceiros:
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { val: '-90%', lab: 'Pedidos perdidos' },
                                    { val: '-80%', lab: 'Tempo de atendimento' },
                                    { val: '-87%', lab: 'Erros de pedido' },
                                    { val: '+22%', lab: 'Ticket médio' },
                                    { val: '+125%', lab: 'Retorno de clientes' },
                                    { val: '-30%', lab: 'Tempo de entrega' },
                                ].map((m, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center">
                                        <div className="text-2xl lg:text-3xl font-black text-[#FF3D03] mb-1">{m.val}</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{m.lab}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 7: INDEPENDÊNCIA (Branding) */}
                <section className="py-24 px-6 bg-white overflow-hidden relative">
                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tighter mb-12">
                            Sua marca, <span className="text-[#FF3D03]">sua história, seu lucro.</span>
                        </h2>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { title: 'Cardápio Intuitivo', desc: 'Seu cliente compra sem nenhum atrito.' },
                                { title: 'Base de Clientes', desc: 'Os dados são seus, não do marketplace.' },
                                { title: 'Gamificação', desc: 'Fidelize e recupere clientes no automático.' },
                                { title: 'Controle Total', desc: 'Saiba cada centavo que entra e sai.' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <h4 className="font-black text-lg tracking-tight">{item.title}</h4>
                                    <p className="text-sm text-[#8d695e] font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 p-8 rounded-[3rem] bg-[#f8f6f5] border-2 border-[#e7ddda] max-w-3xl">
                            <p className="text-xl font-bold text-[#181210]">Você deixa de depender de marketplace para construir um negócio real.</p>
                        </div>
                    </div>
                </section>

                {/* Section 8 & 9: OBJEÇÃO & PLANO (Pricing) */}
                <section id="pricing" className="py-24 px-6 bg-[#f8f6f5]">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter mb-6 uppercase">
                                “Mas R$129 é caro…”
                            </h2>
                            <div className="space-y-2 text-[#8d695e] font-medium italic">
                                <p>Caro é pagar 12% a 27% por pedido.</p>
                                <p>Caro é perder venda por erro ou depender de terceiros.</p>
                                <p className="text-[#181210] font-black not-italic mt-4 text-xl">O sistema se paga em poucos dias.</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-r from-[#FF3D03] to-orange-400 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white rounded-[3rem] p-8 lg:p-12 border-2 border-[#FF3D03] shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 px-8 py-3 bg-[#FF3D03] text-white text-xs font-black uppercase tracking-[0.2em] rounded-bl-[2rem]">
                                    Plano Único
                                </div>
                                
                                <div className="grid lg:grid-cols-2 gap-12 items-center">
                                    <div>
                                        <div className="mb-8">
                                            <div className="text-5xl lg:text-6xl font-black text-[#181210] flex items-baseline gap-2">
                                                R$ 129,90 <span className="text-xl text-gray-400 font-bold uppercase tracking-widest">/mês</span>
                                            </div>
                                        </div>
                                        
                                        <ul className="space-y-4">
                                            {[
                                                'Pedidos ilimitados',
                                                'Produtos ilimitados',
                                                'Usuários ilimitados',
                                                'Motoboys ilimitados',
                                                'Todas as funcionalidades inclusas'
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-gray-700 font-bold">
                                                    <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div className="bg-[#f8f6f5] rounded-3xl p-8 flex flex-col gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                                Sem taxa por pedido
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                                Sem taxa de instalação
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                                Sem fidelidade
                                            </div>
                                        </div>
                                        
                                        <Link href={route('register')} className="w-full h-16 rounded-2xl bg-[#FF3D03] text-white font-black text-xl hover:scale-105 transition-all shadow-xl shadow-[#FF3D03]/20 flex items-center justify-center gap-3">
                                            Começar agora
                                            <ArrowRight size={22} />
                                        </Link>
                                        
                                        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Cancele em até 7 dias
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final Section: CHAMADA FORTE (Conclusion) */}
                <section className="py-32 px-6 bg-[#181210] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FF3D03] via-transparent to-transparent"></div>
                    </div>
                    
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight tracking-tighter mb-12 uppercase italic">
                            Seu delivery pode ser <span className="text-[#FF3D03] not-italic">profissional.</span> <br/>
                            Ou pode continuar <span className="text-gray-600">improvisado.</span>
                        </h2>
                        
                        <p className="text-xl text-gray-400 font-medium mb-12">A decisão é sua.</p>
                        
                        <Link href={route('register')} className="inline-flex h-20 px-12 rounded-[2rem] bg-[#FF3D03] text-white font-black text-2xl hover:translate-y-[-4px] transition-all shadow-2xl shadow-[#FF3D03]/30 items-center gap-4 group">
                            Quero vender mais e pagar menos
                            <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer - Minimalist Professional */}
            <footer className="bg-[#f8f6f5] py-12 px-6 border-t border-[#e7ddda]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo-main.png" alt="OoDelivery" className="h-8 w-auto object-contain" />
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-[11px] font-bold text-[#8d695e] uppercase tracking-widest">
                        <Link href={route('terms')} className="hover:text-[#FF3D03] transition-colors">Termos de Uso</Link>
                        <Link href={route('privacy')} className="hover:text-[#FF3D03] transition-colors">Privacidade</Link>
                        <Link href={route('support')} className="hover:text-[#FF3D03] transition-colors">Suporte</Link>
                    </div>

                    <p className="text-[10px] font-black text-gray-400/50 uppercase tracking-[0.2em] text-center md:text-right">
                        © 2026 ÓoDelivery
                    </p>
                </div>
            </footer>
        </div>
    );
}
