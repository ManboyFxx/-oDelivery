import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    ShoppingBag, 
    Menu, 
    X, 
    ArrowRight, 
    Bot, 
    Zap, 
    MessageCircle, 
    CheckCircle2,
    Smartphone,
    Send
} from 'lucide-react';
import { useState } from 'react';

export default function OoBot({ auth }: PageProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'OoBot (WhatsApp)', href: '/oobot' },
        { name: 'OoPrint', href: '/ooprint' }, 
        { name: 'Plano', href: '/register' },
    ];

    return (
        <div className="relative min-h-screen bg-[#f8f6f5] text-[#181210] selection:bg-[#FF3D03]/20 font-sans antialiased overflow-x-hidden">
            <Head title="OoBot | Atendente IA para WhatsApp Delivery" />
            
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
                                className={`text-sm font-semibold transition-colors ${link.name.includes('OoBot') ? 'text-[#FF3D03]' : 'text-gray-700 hover:text-[#FF3D03]'}`}
                            >
                                {link.name}
                            </Link>
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
                {/* Hero Section */}
                <section className="relative pt-20 lg:pt-32 pb-24 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="flex flex-col gap-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3D03]/10 text-[#FF3D03] text-[10px] md:text-xs font-bold uppercase tracking-wider w-fit">
                                <MessageCircle size={14} />
                                Automação WhatsApp Oficial
                            </div>
                            
                            <h1 className="text-4xl lg:text-6xl font-black leading-[0.95] tracking-tight text-[#181210]">
                                Seus clientes informados <br/>
                                <span className="text-[#FF3D03] italic relative inline-block">
                                    em tempo real.
                                </span>
                            </h1>
                            
                            <p className="text-lg lg:text-xl text-[#8d695e] max-w-2xl leading-snug">
                                Mantenha seu cliente informado a cada etapa. Pedido confirmado, em preparo e saiu para entrega. Tudo automático via WhatsApp.
                            </p>
                        </div>

                        {/* Phone Mockup with Chat Simulation */}
                        <div className="relative h-full min-h-[500px] flex items-center justify-center lg:justify-end">
                            <div className="relative w-[300px] h-[600px] bg-[#181210] rounded-[3rem] border-8 border-[#333] shadow-2xl overflow-hidden">
                                {/* Screen Header */}
                                <div className="bg-[#FF3D03] h-16 flex items-center px-4 gap-3 text-white">
                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border-2 border-white/20 overflow-hidden">
                                        <ShoppingBag size={20} className="text-[#FF3D03]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">OoDelivery</p>
                                        <p className="text-[10px] opacity-80">visto por último hoje às 19:42</p>
                                    </div>
                                </div>
                                {/* Chat Area */}
                                <div className="bg-[#ece5dd] h-full p-4 flex flex-col gap-4 font-sans text-sm relative">
                                    {/* Bot Message 1 */}
                                    <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm self-start max-w-[85%]">
                                        <p className="text-[#181210]">Olá Ricardo! Recebemos seu pedido <strong>#9281</strong>. 🍔</p>
                                        <p className="text-[#181210] mt-1">O tempo estimado é de 40-50 min.</p>
                                        <p className="text-[10px] text-gray-400 text-right mt-1">19:42</p>
                                    </div>
                                    
                                    {/* Bot Message 2 */}
                                    <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm self-start max-w-[85%]">
                                        <p className="text-[#181210]">Seu pedido saiu para entrega! 🛵</p>
                                        <p className="text-[#181210] mt-1">Acompanhe o entregador em tempo real:</p>
                                        <div className="mt-2 bg-[#f5f5f5] p-2 rounded border border-gray-200">
                                            <p className="text-[#FF3D03] font-bold text-xs truncate">oodelivery.app/track/9281</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 text-right mt-1">20:15</p>
                                    </div>

                                    {/* User Message */}
                                    <div className="bg-[#FF3D03]/20 p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-sm self-end max-w-[85%]">
                                        <p className="text-[#181210]">Show! Obrigado 🙌</p>
                                        <p className="text-[10px] text-[#FF3D03] text-right mt-1 flex items-center justify-end gap-1">20:16 <CheckCircle2 size={10} /></p>
                                    </div>
                                </div>
                                {/* Input Area */}
                                <div className="absolute bottom-0 w-full h-16 bg-[#f0f0f0] flex items-center px-4 gap-2">
                                    <div className="flex-1 h-10 bg-white rounded-full px-4 text-xs flex items-center text-gray-400">Digite uma mensagem...</div>
                                    <div className="w-10 h-10 bg-[#FF3D03] rounded-full flex items-center justify-center text-white">
                                        <Send size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#f8f6f5] py-12 px-6 border-t border-[#e7ddda]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FF3D03] rounded-lg flex items-center justify-center text-white font-black text-lg italic shadow-md shadow-[#FF3D03]/20">O</div>
                        <span className="text-lg font-black tracking-tighter text-[#181210]">OoDelivery</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-[11px] font-bold text-[#8d695e] uppercase tracking-widest">
                        <Link href="/termos" className="hover:text-[#FF3D03] transition-colors">Termos de Uso</Link>
                        <Link href="#" className="hover:text-[#FF3D03] transition-colors">Privacidade</Link>
                        <Link href="/suporte" className="hover:text-[#FF3D03] transition-colors">Suporte</Link>
                    </div>

                    <p className="text-[10px] font-black text-gray-400/50 uppercase tracking-[0.2em] text-center md:text-right">
                        © 2026 OoDelivery Systems.
                    </p>
                </div>
            </footer>
        </div>
    );
}
