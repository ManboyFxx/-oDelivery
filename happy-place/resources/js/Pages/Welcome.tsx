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
    Clock
} from 'lucide-react';

export default function Welcome({ auth }: PageProps) {
    return (
        <div className="min-h-screen bg-white font-sans antialiased selection:bg-[#ff3d03] selection:text-white overflow-x-hidden">
            <Head title="Crie seu Cardápio Digital Grátis - ÓoDelivery" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/">
                            <div className="flex items-center gap-2">
                                <div className="bg-[#ff3d03] text-white p-1.5 rounded-lg">
                                    <ShoppingBag className="w-6 h-6" fill="currentColor" />
                                </div>
                                <span className="text-2xl font-black text-gray-900 tracking-tight">ÓoDelivery</span>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                            <Link href="#funcionalidades" className="hover:text-[#ff3d03] transition-colors">Funcionalidades</Link>
                            <Link href={route('plans')} className="hover:text-[#ff3d03] transition-colors">Planos</Link>
                            <Link href="#sobre" className="hover:text-[#ff3d03] transition-colors">Sobre nós</Link>
                            <Link href="#blog" className="hover:text-[#ff3d03] transition-colors">Blog</Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-6 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-[#ff3d03] hover:text-[#ff3d03] transition-all"
                                >
                                    Ir para o Painel
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-6 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-[#ff3d03] hover:text-[#ff3d03] transition-all"
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-6 py-2.5 rounded-lg bg-[#ff3d03] text-white font-bold text-sm hover:bg-[#e63703] shadow-lg shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Criar cardápio grátis
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide">
                                <Zap className="w-3 h-3 fill-current" />
                                Delivery 2.0
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                                Crie grátis seu<br />
                                <span className="text-[#ff3d03]">Cardápio Digital</span><br />
                                para Delivery
                            </h1>

                            <div className="space-y-4">
                                {[
                                    'Pedidos no WhatsApp com atendente virtual',
                                    'Canal de vendas sem taxas e com link próprio',
                                    'Funcionalidades avançadas exclusivas'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
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

                        <div className="relative lg:h-[600px] flex items-center justify-center">
                            {/* Decorative blobs */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff3d03]/5 rounded-full blur-3xl" />
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />

                            <img
                                src="/images/dashboard-mockup.png"
                                alt="Dashboard ÓoDelivery"
                                className="relative w-[140%] max-w-none transform translate-x-10 rotate-y-12 rounded-2xl shadow-2xl border-4 border-white"
                                style={{ transform: 'perspective(1000px) rotateY(-10deg) rotateX(2deg) scale(1.1)' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* WhatsApp Feature Section */}
            <section className="py-24 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto rounded-[3rem] bg-gray-50 p-12 lg:p-24 relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                                Quer responder rapidamente aos clientes?
                            </h2>
                            <p className="text-xl text-gray-600 font-medium">
                                O atendente virtual faz isso por você. Na hora, pelo WhatsApp, sem um colaborador exclusivo.
                            </p>

                            <div className="space-y-6">
                                {[
                                    'Respostas imediatas sobre cardápio, horários, entregas etc.',
                                    'Status dos pedidos atualizados do preparo até a entrega',
                                    'Seu cliente não fica esperando, e você não perde vendas'
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

                        <div className="relative flex justify-center lg:justify-end">
                            {/* Phone Mockup Placeholder - using CSS shapes for now if image fails, but ideally image */}
                            <div className="relative w-[300px] h-[600px] bg-black rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                                <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative">
                                    <img
                                        src="/images/app-mockup.png"
                                        alt="App Interface"
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Chat overlay simulation */}
                                    <div className="absolute bottom-8 right-4 left-4 bg-white/90 backdrop-blur shadow-lg rounded-2xl p-4 border border-green-100 animate-in slide-in-from-bottom-10 fade-in duration-1000">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div className="text-xs font-bold text-green-800">WhatsApp</div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800">✅ Seu pedido #472 saiu para entrega!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                        Venda mais – e mais rápido – com<br />
                        o Cardápio Online para Delivery
                    </h2>
                </div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            icon: Smartphone,
                            title: 'Facilite para o cliente',
                            desc: 'Garanta que seus clientes encontrem facilmente o seu cardápio, através de um link exclusivo para compartilhar'
                        },
                        {
                            icon: LayoutDashboard,
                            title: 'Centralize os pedidos',
                            desc: 'Organize os pedidos que chegam via WhatsApp e no seu gestor, facilitando e agilizando o fluxo de atendimento'
                        },
                        {
                            icon: MessageCircle,
                            title: 'Informe o status',
                            desc: 'Automatize o envio de notificações para o WhatsApp do cliente para informar sobre o andamento do pedido'
                        },
                        {
                            icon: TrendingUp,
                            title: 'Fidelize e Venda Mais',
                            desc: 'Use ferramentas de fidelização e promoções para fazer seus clientes comprarem mais vezes'
                        }
                    ].map((item, i) => (
                        <div key={i} className="text-center group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-[#ff3d03] group-hover:bg-[#ff3d03] group-hover:text-white transition-colors">
                                <item.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        href={route('register')}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ff3d03] text-white font-bold text-lg hover:bg-[#e63703] shadow-xl shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40 transition-all"
                    >
                        Começar delivery grátis
                    </Link>
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
                                src="/images/dashboard-mockup.png"
                                alt="Dashboard Full"
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

            {/* Footer */}
            <footer className="bg-gray-50 pt-20 pb-10 px-6 border-t border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2 space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="bg-[#ff3d03] text-white p-1.5 rounded-lg">
                                    <ShoppingBag className="w-6 h-6" fill="currentColor" />
                                </div>
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
