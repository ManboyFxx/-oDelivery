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
    Twitter, 
    Instagram, 
    Linkedin 
} from 'lucide-react';
import { useState } from 'react';

export default function WelcomeV5({ auth }: PageProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'OoBot (WhatsApp)', href: '/oobot' },
        { name: 'OoPrint', href: '/ooprint' }, 
        { name: 'Plano', href: '/planos' },
    ];

    const mainFeatures = [
        {
            title: 'PDV (Ponto de Venda)',
            desc: 'Frente de caixa ultra-rápido para registrar vendas em balcão ou comandos em segundos, totalmente integrado ao estoque.',
            icon: <Monitor className="w-8 h-8" />,
            benefits: ['Venda em 2 cliques', 'Impressão automática'],
        },
        {
            title: 'Painel do Motoboy',
            desc: 'Controle sua frota de entregadores com despacho inteligente e acompanhamento de entregas em tempo real.',
            icon: <Bike className="w-8 h-8" />,
            benefits: ['Acerto de contas fácil', 'Roteirização nativa'],
        },
        {
            title: 'Gestão de Pedidos e Displays',
            desc: 'Monitore o fluxo da cozinha com telas interativas (KDS) que eliminam o papel e organizam a produção por tempo de saída.',
            icon: <LayoutDashboard className="w-8 h-8" />,
            benefits: ['TMS por turno', 'Papel ZERO na cozinha'],
        },
    ];

    const secondaryFeatures = [
        { icon: <MousePointer2 className="w-6 h-6 text-[#FF3D03]" />, title: 'Intuitivo', desc: 'Sua equipe aprende em 5 minutos. Interface limpa.' },
        { icon: <Zap className="w-6 h-6 text-[#FF3D03]" />, title: 'Facilidade no pedido', desc: 'Menos cliques para funcionários e clientes.' },
        { icon: <BarChart3 className="w-6 h-6 text-[#FF3D03]" />, title: 'Gestão Financeira', desc: 'Saiba quanto seu estabelecimento lucrou, com atualização de gastos e pagamentos internos.' },
        { icon: <ShieldCheck className="w-6 h-6 text-[#FF3D03]" />, title: 'Proteção com criptografia de dados', desc: 'Segurança para seu estabelecimento e dados de clientes. (Plataforma não guarda dados de cartões ou informações sensíveis de clientes ou funcionários).' },
    ];

    return (
        <div className="relative min-h-screen bg-[#f8f6f5] text-[#181210] selection:bg-[#FF3D03]/20 font-sans antialiased overflow-x-hidden">
            <Head title="OoDelivery | Gestão de Alta Performance para Delivery" />
            
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
                    <div className="flex items-center">
                        <img 
                            src="/images/logo-main.png" 
                            alt="OoDelivery Logo" 
                            className="h-14 w-auto object-contain"
                        />
                    </div>

                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-semibold text-gray-700 hover:text-[#FF3D03] transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:block text-sm font-bold px-5 py-2.5 rounded-xl bg-[#ede7e5] hover:bg-[#e7ddda] transition-all">
                            Entrar
                        </Link>
                        <Link href="/register" className="text-sm font-bold px-6 py-2.5 rounded-xl bg-[#FF3D03] text-white hover:opacity-90 transition-all shadow-lg shadow-[#FF3D03]/20">
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
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-base font-semibold text-gray-700 hover:text-[#FF3D03]"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <Link href="/login" className="w-full text-center font-bold py-3 rounded-xl bg-[#ede7e5]">
                            Entrar
                        </Link>
                    </div>
                )}
            </header>

            <main>
                {/* Hero - Centered */}
                <section className="relative pt-4 lg:pt-8 pb-8 lg:pb-12 px-6 overflow-hidden">
                    <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">


                        <h1 className="text-4xl lg:text-6xl font-black leading-[1] tracking-tight text-[#181210]">
                            Escalar seu delivery <br/>
                            <span className="text-[#FF3D03] italic relative inline-block">
                                sem taxas extras.
                                <svg className="absolute -bottom-2 lg:-bottom-3 left-0 w-full h-2 text-[#FF3D03]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 0 100 5 L 100 10 L 0 10 Z" fill="currentColor"/>
                                </svg>
                            </span>
                        </h1>
                        
                        <p className="text-base lg:text-lg text-[#8d695e] max-w-2xl leading-snug">
                            Recupere sua lucratividade. Uma plataforma síncrona que conecta cozinha, balcão e motoboy em tempo real.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <Link href="/register" className="h-14 px-8 rounded-xl bg-[#FF3D03] text-white font-bold text-lg hover:translate-y-[-2px] hover:shadow-[0_15px_30px_-5px_rgba(255,61,3,0.3)] transition-all flex items-center justify-center gap-2 group">
                                Começar Vender Hoje
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="#" className="h-14 px-8 rounded-xl bg-white border-2 border-[#e7ddda] font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <PlayCircle size={20} />
                                Falar com Especialista
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features - Asymmetric Grid (Compact) */}
                <section id="features" className="py-20 px-6 bg-white relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col items-center text-center gap-6 mb-16">
                            <div className="max-w-3xl">
                                <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight leading-none">Poder real para <br/> donos de restaurante.</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                            {mainFeatures.map((f, i) => (
                                <div key={i} className={`group p-6 rounded-[2rem] bg-[#f8f6f5] border-2 border-transparent hover:border-[#FF3D03] transition-all duration-500 hover:shadow-xl hover:shadow-[#FF3D03]/5 ${i === 1 ? 'lg:-translate-y-4' : ''}`}>
                                    <div className="w-12 h-12 rounded-xl bg-[#FF3D03] text-white flex items-center justify-center mb-6 shadow-md shadow-[#FF3D03]/20 group-hover:rotate-[360deg] transition-transform duration-700">
                                        {f.icon}
                                    </div>
                                    <h4 className="text-xl font-black mb-3 tracking-tight">{f.title}</h4>
                                    <p className="text-[#8d695e] text-sm leading-relaxed mb-6 font-medium">
                                        {f.desc}
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        {f.benefits.map((b, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs font-black text-gray-400 group-hover:text-gray-900 transition-colors">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#FF3D03]"></div>
                                                {b}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#f8f6f5] rounded-[2rem] border-2 border-[#e7ddda]">
                            {secondaryFeatures.map((f, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl flex flex-col items-start gap-4 hover:shadow-lg transition-all group">
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#FF3D03]/10 transition-colors">{f.icon}</div>
                                    <div className="space-y-1">
                                        <h5 className="font-black text-base tracking-tight">{f.title}</h5>
                                        <p className="text-[10px] text-[#8d695e] font-bold leading-relaxed uppercase tracking-widest">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Block - Human Centric (Compact) */}
                <section className="py-16 px-6">
                    <div className="max-w-7xl mx-auto rounded-[3rem] bg-[#181210] p-10 lg:p-16 text-center text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF3D03]/20 via-transparent to-transparent opacity-50"></div>
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF3D03]/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        
                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <h2 className="text-2xl md:text-4xl font-black max-w-4xl leading-[1] tracking-tighter uppercase italic">
                                Seus lucros não podem <br/> <span className="text-[#FF3D03] not-italic">ser fatiados por taxas.</span>
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-5 w-full justify-center mt-2">
                                <Link href="/register" className="bg-[#FF3D03] text-white px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#FF3D03]/30 uppercase tracking-widest">
                                    Ativar Minha Operação Agora
                                </Link>
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-black text-white/60 uppercase tracking-[0.3em]">
                                <span>Zero Instalação</span>
                                <span>•</span>
                                <span>Suporte em 2min</span>
                                <span>•</span>
                                <span>Cancele Quando Quiser</span>
                            </div>
                        </div>
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
                        <Link href="/termos" className="hover:text-[#FF3D03] transition-colors">Termos de Uso</Link>
                        <Link href="#" className="hover:text-[#FF3D03] transition-colors">Privacidade</Link>
                        <Link href="/suporte" className="hover:text-[#FF3D03] transition-colors">Suporte</Link>
                    </div>

                    <p className="text-[10px] font-black text-gray-400/50 uppercase tracking-[0.2em] text-center md:text-right">
                        © 2026 ÓoDelivery
                    </p>
                </div>
            </footer>
        </div>
    );
}
