import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ArrowRight,
    Smartphone,
    LayoutDashboard,
    Zap,
    MessageCircle,
    ShoppingBag,
    TrendingUp,
    ShieldCheck,
    Truck,
    Clock,
    ChevronDown,
    Printer,
    Menu,
    X,
    Bike,
    FileText,
    Star,
    Quote
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Dropdown Component
function ProductDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-[#ff3d03] transition-colors py-2"
            >
                Produtos
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-96 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 transition-all duration-200 origin-top transform ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                <div className="space-y-2">
                    <Link href="/" className="flex items-start gap-4 p-4 rounded-xl hover:bg-orange-50 transition-colors group">
                        <div className="shrink-0 h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center text-[#ff3d03] group-hover:scale-110 transition-transform">
                            <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 mb-1">ÓoDelivery</div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Cardápio digital completo com pedidos via WhatsApp.</p>
                        </div>
                    </Link>

                    <Link href="/ooprint" className="flex items-start gap-4 p-4 rounded-xl hover:bg-orange-50 transition-colors group">
                        <div className="shrink-0 h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center text-[#ff3d03] group-hover:scale-110 transition-transform">
                            <Printer className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 mb-1">ÓoPrint</div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Impressão automática de comandas na cozinha.</p>
                        </div>
                    </Link>

                    <Link href="/oomotoboy" className="flex items-start gap-4 p-4 rounded-xl hover:bg-orange-50 transition-colors group">
                        <div className="shrink-0 h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center text-[#ff3d03] group-hover:scale-110 transition-transform">
                            <Bike className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 mb-1">ÓoMotoboy</div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Gestão e rastreamento de entregadores.</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Welcome({ auth }: PageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans antialiased selection:bg-[#ff3d03] selection:text-white overflow-x-hidden">
            <Head title="Crie seu Cardápio Digital Grátis - ÓoDelivery" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/">
                            <div className="flex items-center">
                                <img
                                    src="/images/landing/header-icon.png"
                                    alt="ÓoDelivery"
                                    className="h-10 w-auto object-contain" // Slightly smaller icon
                                />
                                <span className="ml-2 text-2xl font-bold text-gray-900 tracking-tight">ÓoDelivery</span>
                            </div>
                        </Link>

                        {/* Center Links (Desktop) */}
                        <div className="hidden md:flex items-center gap-8">
                            <ProductDropdown />
                            <Link href={route('plans')} className="text-sm font-bold text-gray-700 hover:text-[#ff3d03] transition-colors">
                                Planos
                            </Link>
                            <Link href="#" className="text-sm font-bold text-gray-700 hover:text-[#ff3d03] transition-colors">
                                Sobre nós
                            </Link>
                            <Link href="#" className="text-sm font-bold text-gray-700 hover:text-[#ff3d03] transition-colors">
                                Blog
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                href={route('login')}
                                className="text-sm font-bold text-gray-700 hover:text-[#ff3d03] transition-colors block"
                            >
                                Entrar
                            </Link>
                            <Link
                                href={route('register')}
                                className="px-6 py-2.5 rounded-xl bg-[#ff3d03] text-white font-bold text-sm hover:bg-[#e63703] transition-all shadow-lg shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40"
                            >
                                Começar Grátis
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                 {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl z-50 animate-in slide-in-from-top-5 duration-200">
                        <div className="flex flex-col p-4 space-y-4">
                            <div className="px-4 py-2">
                                <ProductDropdown />
                            </div>
                            <Link href={route('plans')} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#ff3d03] rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                                Planos
                            </Link>
                            <Link href="#" className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#ff3d03] rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                                Sobre nós
                            </Link>
                            <Link href="#" className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#ff3d03] rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                                Blog
                            </Link>
                            
                            <div className="h-px bg-gray-100 my-2"></div>
                            
                            <div className="flex flex-col gap-3">
                                <Link
                                    href={route('login')}
                                    className="w-full text-center px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50 rounded-lg"
                                >
                                    Entrar
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="w-full text-center px-6 py-3 rounded-xl bg-[#ff3d03] text-white font-bold text-sm hover:bg-[#e63703] transition-all shadow-lg hover:shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40"
                                >
                                    Começar Grátis
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="space-y-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/50 border border-orange-200 text-[#ff3d03] font-bold text-xs uppercase tracking-wider mb-8">
                                    <span className="w-2 h-2 rounded-full bg-[#ff3d03] animate-pulse"></span>
                                    Sistema para Delivery e Gestão
                                </div>

                                {/* New Headline */}
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-8">
                                    Crie seu <span className="text-[#ff3d03]">Cardápio Digital</span> gratuito e comece a receber pedidos hoje mesmo!
                                </h1>
                            </div>
                            <div className="text-xl text-gray-600 font-medium space-y-4">
                                {[
                                    'Pedidos no WhatsApp com atendente virtual',
                                    'Canal de vendas sem taxas e com link próprio',
                                    'Funcionalidades avançadas exclusivas'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-center gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-gray-900 flex-shrink-0" />
                                        <span className="text-lg text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ff3d03] text-white font-bold text-lg hover:bg-[#e63703] shadow-xl shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40 transition-all transform hover:-translate-y-1"
                                >
                                    Criar cardápio grátis
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WhatsApp Feature Section */}
            <section className="py-24 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto rounded-[3rem] bg-gray-50 relative overflow-hidden">
                    <div className="grid lg:grid-cols-2 items-center">
                        <div className="p-12 lg:p-24 space-y-8">
                            <span className="block text-[#ff3d03] font-bold text-lg mb-2 uppercase tracking-wide">ÓoMotoboy</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                                Perdido em comandas do delivery?
                            </h2>
                            <p className="text-xl text-gray-600 font-medium">
                                Sistema completo de gestão de entregas com rastreamento e relatórios detalhados.
                            </p>

                            <div className="space-y-6">
                                {[
                                    'Seus entregadores na palma da mão',
                                    'Rastreamento dos entregadores',
                                    'Delivery organizado começa com gestão inteligente'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <CheckCircle2 className="w-6 h-6 text-gray-900" />
                                        </div>
                                        <span className="text-lg text-gray-700 font-medium leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ff3d03] text-white font-bold text-lg hover:bg-[#e63703] shadow-xl shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40 transition-all"
                                >
                                    Criar cardápio grátis
                                </Link>
                            </div>
                        </div>

                        <div className="relative h-full min-h-[400px] lg:min-h-full">
                            <img
                                src="/images/landing/whatsapp-feature.jpg"
                                alt="Atendimento via WhatsApp"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ÓoPrint Feature Section */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto rounded-[3rem] bg-gray-900 relative overflow-hidden">
                    <div className="grid lg:grid-cols-2 items-center">
                        <div className="relative h-full min-h-[400px] lg:min-h-full bg-gray-800 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ff3d03_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            <img
                                src="/images/landing/ooprint-preview.png"
                                alt="Sistema ÓoPrint"
                                className="relative z-10 w-full h-full object-contain opacity-90 p-8"
                            />
                        </div>

                        <div className="p-12 lg:p-24 space-y-8">
                            <span className="block text-[#ff3d03] font-bold text-lg mb-2 uppercase tracking-wide">ÓoPrint</span>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                Cozinha organizada, cliente feliz.
                            </h2>
                            <p className="text-xl text-gray-400 font-medium">
                                Esqueça as comandas manuais. O ÓoPrint automatiza a impressão dos pedidos assim que eles chegam.
                            </p>

                            <div className="space-y-6">
                                {[
                                    'Impressão automática em 1 segundo',
                                    'Sem erros de anotação ou leitura',
                                    'Compatível com impressoras térmicas (Windows)'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <CheckCircle2 className="w-6 h-6 text-[#ff3d03]" />
                                        </div>
                                        <span className="text-lg text-gray-300 font-medium leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ff3d03] text-white font-bold text-lg hover:bg-[#e63703] shadow-xl shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40 transition-all"
                                >
                                    Começar agora
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Integration Showcase */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                            Acompanhe tudo com recursos<br />
                            avançados integrados ao seu ERP
                        </h2>
                    </div>

                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                        <div className="absolute top-0 left-0 right-0 h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="pt-12">
                            <img
                                src="/images/landing/kanban-dashboard-update.jpg"
                                alt="Painel de Pedidos ÓoDelivery"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Advantages Grid */}
            <section className="py-24 px-6 bg-[#dbeafe]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                                Vantagens do Cardápio<br />
                                Digital para Delivery
                            </h2>

                            <div className="space-y-8">
                                {[
                                    {
                                        icon: Truck,
                                        title: '0% taxas, 100% ganhos',
                                        desc: 'Marketplaces tradicionais cobram taxas de até 30% sobre os pedidos. No ÓoDelivery, não há taxas, e seu delivery cresce sem aumento.'
                                    },
                                    {
                                        icon: ShoppingBag,
                                        title: 'Entregas sem motoboys',
                                        desc: 'Utilizando a funcionalidade de "Entrega Sob Demanda" (em breve), você pode solicitar entregadores parceiros.'
                                    },
                                    {
                                        icon: Clock,
                                        title: 'Fluxo totalmente integrado',
                                        desc: 'Sincronize automaticamente pedidos, estoque e financeiro, eliminando o retrabalho e erros.'
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: 'Lucre mais em cada pedido',
                                        desc: 'Aumente seu ticket médio com preços calculados automaticamente para combinações personalizadas.'
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                                            <p className="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative flex justify-center lg:justify-end">
                            <div className="relative z-10">
                                <img
                                    src="/images/app-mockup.png"
                                    alt="App Mobile"
                                    className="relative w-[320px] rounded-[2.5rem] shadow-2xl border-8 border-gray-900"
                                />
                            </div>
                            {/* Decorative circles */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/30 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Testimonials */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/50 border border-orange-200 text-[#ff3d03] font-bold text-xs uppercase tracking-wider mb-6">
                            <Star className="w-4 h-4 fill-current" />
                            Quem usa, recomenda
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                            Junte-se a quem já fatura mais
                        </h2>
                        <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                            Milhares de estabelecimentos transformaram seu delivery com nossa tecnologia.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Carlos Mendes",
                                role: "Dono da Burger Kingo",
                                content: "Desde que começamos a usar o ÓoDelivery, eliminamos os erros nos pedidos de WhatsApp e aumentamos nosso faturamento em 30%. O sistema é muito intuitivo!",
                                stars: 5
                            },
                            {
                                name: "Fernanda Oliveira",
                                role: "Pizzaria Bella Napoli",
                                content: "A integração com a impressora térmica foi um divisor de águas para nossa cozinha. As comandas saem automaticamente e a agilidade no preparo melhorou muito.",
                                stars: 5
                            },
                            {
                                name: "Ricardo Silva",
                                role: "Sushi House",
                                content: "O melhor custo-benefício do mercado. Ter um cardápio digital próprio sem pagar taxas abusivas fez toda a diferença na nossa margem de lucro.",
                                stars: 5
                            }
                        ].map((testimonial, i) => (
                            <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 relative hover:border-orange-200 transition-colors group">
                                <Quote className="absolute top-8 right-8 w-10 h-10 text-orange-100 fill-orange-100 group-hover:text-orange-200 group-hover:fill-orange-200 transition-colors" />
                                <div className="flex gap-1 mb-6">
                                    {[...Array(testimonial.stars)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 font-medium mb-8 leading-relaxed relative z-10">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white border-2 border-orange-100 overflow-hidden shadow-sm">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${testimonial.name}&background=ff3d03&color=fff`}
                                            alt={testimonial.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-500 font-medium">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 pt-20 pb-10 px-6 border-t border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2 space-y-6">
                            <div className="flex items-center gap-2">
                                <img src="/images/landing/logo-header.png" alt="ÓoDelivery" className="h-8 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                                <span className="text-2xl font-black text-gray-900 tracking-tight">ÓoDelivery</span>
                            </div>
                            <p className="text-gray-500 font-medium max-w-sm">
                                A plataforma completa para revolucionar o delivery do seu restaurante. Venda mais, sem taxas.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Produto</h4>
                            <ul className="space-y-3 text-gray-500 font-medium text-sm">
                                <li><a href="#" className="hover:text-[#ff3d03]">Funcionalidades</a></li>
                                <li><a href="#" className="hover:text-[#ff3d03]">Planos e Preços</a></li>
                                <li><a href="#" className="hover:text-[#ff3d03]">Entregadores</a></li>
                                <li><a href="#" className="hover:text-[#ff3d03]">Integrações</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Empresa</h4>
                            <ul className="space-y-3 text-gray-500 font-medium text-sm">
                                <li><a href="#" className="hover:text-[#ff3d03]">Sobre Nós</a></li>
                                <li><a href="#" className="hover:text-[#ff3d03]">Blog</a></li>
                                <li><a href="#" className="hover:text-[#ff3d03]">Carreiras</a></li>
                                <li><a href="#" className="hover:text-[#ff3d03]">Contato</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 font-medium">
                        <p>© 2026 ÓoDelivery Tecnologia. CNPJ 00.000.000/0001-00</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-gray-600">Termos de Uso</a>
                            <a href="#" className="hover:text-gray-600">Política de Privacidade</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
