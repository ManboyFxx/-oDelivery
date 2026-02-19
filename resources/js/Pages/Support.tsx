import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    ShoppingBag, 
    Menu, 
    X, 
    Search, 
    MessageCircle, 
    Mail, 
    HelpCircle,
    ChevronDown,
    ChevronUp,
    ArrowLeft
} from 'lucide-react';
import { useState } from 'react';

export default function Support({ auth }: PageProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const navLinks = [
        { name: 'OoBot (WhatsApp)', href: '/oobot' },
        { name: 'OoPrint', href: '/ooprint' }, 
        { name: 'Plano', href: '/register' },
    ];

    const faqs = [
        { q: 'Como funciona o teste grátis?', a: 'Atualmente não oferecemos teste grátis, mas temos uma garantia de satisfação de 7 dias. Se não gostar, devolvemos seu dinheiro.' },
        { q: 'Preciso de computador potente?', a: 'Não! O OoDelivery roda direto no navegador. Qualquer notebook ou tablet básico funciona perfeitamente.' },
        { q: 'O bot de WhatsApp é oficial?', a: 'Sim! Utilizamos a API Oficial do WhatsApp (Cloud API) para garantir estabilidade e evitar banimentos.' },
        { q: 'Posso usar minha impressora atual?', a: 'Provavelmente sim. Suportamos 99% das impressoras térmicas via integração Windows/Android.' },
        { q: 'Como recebo os pagamentos?', a: 'O dinheiro cai direto na sua conta via PIX ou Gateway de Pagamento, sem passar por nós. Taxa zero nossa.' },
    ];

    return (
        <div className="relative min-h-screen bg-[#f8f6f5] text-[#181210] selection:bg-[#FF3D03]/20 font-sans antialiased overflow-x-hidden">
            <Head title="Suporte OoDelivery - Central de Ajuda" />
            
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
                </svg>
            </div>

            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#e7ddda]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <ShoppingBag className="text-[#FF3D03] transition-transform group-hover:scale-110" size={28} strokeWidth={2.5} />
                        <span className="text-2xl font-black tracking-tighter text-[#181210]">
                            Oo<span className="text-[#FF3D03]">Delivery</span>
                        </span>
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
                        <Link href="/login" className="hidden sm:block text-sm font-bold px-5 py-2.5 rounded-xl bg-[#ede7e5] hover:bg-[#e7ddda] transition-all">
                            Entrar
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
                    </div>
                )}
            </header>

            <main>
                <section className="bg-[#181210] py-20 px-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FF3D03]/20 via-transparent to-transparent opacity-50"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Como podemos ajudar?</h1>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Busque por 'impressora', 'cardápio', 'pix'..." 
                                className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#FF3D03] transition-colors backdrop-blur-sm"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                        </div>
                    </div>
                </section>

                <section className="max-w-4xl mx-auto px-6 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                        <div className="bg-white p-8 rounded-[2rem] border-2 border-[#e7ddda] hover:border-[#FF3D03] transition-all group cursor-pointer hover:shadow-xl">
                            <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MessageCircle size={24} />
                            </div>
                            <h3 className="text-xl font-black mb-2">WhatsApp Suporte</h3>
                            <p className="text-[#8d695e] text-sm font-medium mb-4">Fale direto com nosso time técnico.</p>
                            <span className="text-[#FF3D03] font-bold text-sm flex items-center gap-2">Iniciar Conversa <ArrowLeft size={16} className="rotate-180" /></span>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border-2 border-[#e7ddda] hover:border-[#FF3D03] transition-all group cursor-pointer hover:shadow-xl">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-xl font-black mb-2">Email / Ticket</h3>
                            <p className="text-[#8d695e] text-sm font-medium mb-4">Para questões financeiras ou complexas.</p>
                            <span className="text-[#FF3D03] font-bold text-sm flex items-center gap-2">Abrir Ticket <ArrowLeft size={16} className="rotate-180" /></span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-[#181210] mb-8 text-center uppercase tracking-tight">Dúvidas Frequentes</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-[#e7ddda] overflow-hidden">
                                <button 
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                >
                                    <span className="font-bold text-[#181210]">{faq.q}</span>
                                    {openFaq === i ? <ChevronUp className="text-[#FF3D03]" /> : <ChevronDown className="text-gray-400" />}
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-6 text-[#5c4a45] font-medium leading-relaxed bg-gray-50/50">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="bg-[#f8f6f5] py-12 px-6 border-t border-[#e7ddda]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FF3D03] rounded-lg flex items-center justify-center text-white font-black text-lg italic shadow-md shadow-[#FF3D03]/20">O</div>
                        <span className="text-lg font-black tracking-tighter text-[#181210]">OoDelivery</span>
                    </div>

                    <p className="text-[10px] font-black text-gray-400/50 uppercase tracking-[0.2em] text-center md:text-right">
                        © 2026 OoDelivery Systems.
                    </p>
                </div>
            </footer>
        </div>
    );
}
