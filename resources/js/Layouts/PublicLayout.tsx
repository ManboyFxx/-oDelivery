import { Link } from '@inertiajs/react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

interface PublicLayoutProps {
    title?: string;
}

export default function PublicLayout({ children }: PropsWithChildren<PublicLayoutProps>) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'OoBot (WhatsApp)', href: route('oobot') },
        { name: 'OoPrint', href: route('ooprint') },
        { name: 'Planos', href: route('plans.public') },
    ];

    return (
        <div className="relative min-h-screen bg-[#f8f6f5] text-[#181210] selection:bg-[#FF3D03]/20 font-sans antialiased overflow-x-hidden">
            {/* Grainy Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
            </div>

            {/* Header */}
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

                {/* Mobile Menu */}
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
                        <Link
                            href={route('login')}
                            className="w-full text-center font-bold py-3 rounded-xl bg-[#ede7e5]"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Entrar
                        </Link>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="relative z-10">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-[#f8f6f5] py-12 px-6 border-t border-[#e7ddda]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FF3D03] rounded-lg flex items-center justify-center text-white font-black text-lg italic shadow-md shadow-[#FF3D03]/20">O</div>
                        <span className="text-lg font-black tracking-tighter text-[#181210]">OoDelivery</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-[11px] font-bold text-[#8d695e] uppercase tracking-widest">
                        <Link href={route('terms')} className="hover:text-[#FF3D03] transition-colors">Termos de Uso</Link>
                        <Link href={route('privacy')} className="hover:text-[#FF3D03] transition-colors">Privacidade</Link>
                        <Link href={route('support')} className="hover:text-[#FF3D03] transition-colors">Suporte</Link>
                    </div>

                    <p className="text-[10px] font-black text-gray-400/50 uppercase tracking-[0.2em] text-center md:text-right">
                        © {new Date().getFullYear()} OoDelivery Systems.
                    </p>
                </div>
            </footer>
        </div>
    );
}
