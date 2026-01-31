import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ArrowRight, Printer, Zap, BarChart3 } from 'lucide-react';

export default function OoPrint() {
    return (
        <>
            <Head title="ÓoPrint - Sistema de Impressão Inteligente" />

            <div className="min-h-screen bg-white font-sans antialiased selection:bg-[#ff3d03] selection:text-white overflow-x-hidden">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            <Link href="/">
                                <div className="flex items-center">
                                    <img
                                        src="/images/landing/header-icon.png"
                                        alt="ÓoDelivery"
                                        className="h-10 w-auto object-contain"
                                    />
                                    <span className="ml-2 text-2xl font-bold text-gray-900 tracking-tight">ÓoDelivery</span>
                                </div>
                            </Link>
                            <Link href="/" className="text-sm font-bold text-gray-700 hover:text-[#ff3d03] transition-colors">
                                Voltar
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="space-y-8">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/50 border border-orange-200 text-[#ff3d03] font-bold text-xs uppercase tracking-wider mb-8">
                                        <span className="w-2 h-2 rounded-full bg-[#ff3d03] animate-pulse"></span>
                                        Impressão Inteligente
                                    </div>

                                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-8">
                                        Cozinha <span className="text-[#ff3d03]">organizada</span>, cliente feliz
                                    </h1>
                                </div>
                                <div className="text-xl text-gray-600 font-medium space-y-4">
                                    {[
                                        'Impressão automática em 1 segundo',
                                        'Sem erros de anotação ou leitura',
                                        'Compatível com impressoras térmicas'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-center gap-3">
                                            <CheckCircle2 className="w-6 h-6 text-gray-900 flex-shrink-0" />
                                            <span className="text-lg text-gray-700 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <Link
                                        href="#"
                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ff3d03] text-white font-bold text-lg hover:bg-[#e63703] shadow-xl shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40 transition-all transform hover:-translate-y-1"
                                    >
                                        Começar agora
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 px-6 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto rounded-[3rem] bg-gray-900 relative overflow-hidden">
                        <div className="grid lg:grid-cols-2 items-center">
                            <div className="relative h-full min-h-[400px] lg:min-h-full bg-gray-800 flex items-center justify-center overflow-hidden order-2 lg:order-1">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ff3d03_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                <Printer className="relative z-10 w-24 h-24 text-[#ff3d03]" />
                            </div>

                            <div className="p-12 lg:p-24 space-y-8 order-1 lg:order-2">
                                <span className="block text-[#ff3d03] font-bold text-lg mb-2 uppercase tracking-wide">ÓoPrint</span>
                                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                    Esqueça as comandas manuais
                                </h2>
                                <p className="text-xl text-gray-400 font-medium">
                                    O ÓoPrint automatiza a impressão dos pedidos assim que eles chegam, eliminando erros e acelerando todo o processo.
                                </p>

                                <div className="space-y-6">
                                    {[
                                        'Fila inteligente com priorização automática',
                                        'Templates personalizáveis com sua marca',
                                        'Relatórios detalhados de consumo e desempenho'
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
                                        href="#"
                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ff3d03] text-white font-bold text-lg hover:bg-[#e63703] shadow-xl shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40 transition-all"
                                    >
                                        Começar agora
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 px-6 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                Benefícios para sua operação
                            </h2>
                            <p className="text-xl text-gray-600 font-medium">
                                Menos erros, mais eficiência
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Zap,
                                    title: 'Mais velocidade',
                                    description: 'Pedidos impressos em menos de 1 segundo após chegarem'
                                },
                                {
                                    icon: BarChart3,
                                    title: 'Menos papel',
                                    description: 'Fila inteligente reduz reimpressões e desperdício'
                                },
                                {
                                    icon: Printer,
                                    title: 'Sem erros',
                                    description: 'Elimina erros de anotação ou leitura manual'
                                }
                            ].map((benefit, i) => {
                                const Icon = benefit.icon;
                                return (
                                    <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow">
                                        <Icon className="w-12 h-12 text-[#ff3d03] mb-4" />
                                        <h3 className="text-2xl font-black text-gray-900 mb-3">{benefit.title}</h3>
                                        <p className="text-gray-600 font-medium">{benefit.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-6 bg-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                            Pronto para transformar sua cozinha?
                        </h2>
                        <p className="text-xl text-gray-600 font-medium mb-8">
                            Implemente ÓoPrint em minutos e veja resultados imediatos
                        </p>
                        <Link
                            href="#"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ff3d03] text-white font-bold text-lg hover:bg-[#e63703] shadow-xl shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40 transition-all"
                        >
                            Solicitar demonstração
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6">
                    <div className="max-w-7xl mx-auto text-center text-gray-600">
                        <p className="mb-4">ÓoDelivery © 2026 - Sistema Inteligente de Entregas</p>
                        <div className="flex justify-center gap-6">
                            <a href="#" className="hover:text-[#ff3d03] transition-colors font-medium">Documentação</a>
                            <a href="#" className="hover:text-[#ff3d03] transition-colors font-medium">Suporte</a>
                            <a href="#" className="hover:text-[#ff3d03] transition-colors font-medium">Contato</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
