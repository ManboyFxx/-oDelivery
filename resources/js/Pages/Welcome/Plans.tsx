import { Head, Link } from '@inertiajs/react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';

export default function Plans() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#ff3d03] selection:text-white">
            <Head title="Planos e Preços - ÓoDelivery" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/">
                            <div className="flex items-center">
                                <img
                                    src="/images/landing/plans-logo.png"
                                    alt="ÓoDelivery"
                                    className="h-10 w-auto object-contain"
                                />
                                <span className="ml-2 text-2xl font-bold text-gray-900 tracking-tight">ÓoDelivery</span>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href={route('login')} className="text-sm font-bold text-gray-700 hover:text-[#ff3d03] transition-colors">
                                Entrar
                            </Link>
                            <Link href={route('register')} className="px-6 py-2.5 rounded-xl bg-[#ff3d03] text-white font-bold text-sm hover:bg-[#e63703] transition-all shadow-lg shadow-[#ff3d03]/20 hover:shadow-[#ff3d03]/40">
                                Começar Grátis
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto px-6 mb-20">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                        Planos simples para <br />
                        <span className="text-[#ff3d03]">negócios de todos os tamanhos</span>
                    </h1>
                    <p className="text-xl text-gray-500 font-medium">
                        Comece grátis e cresça com a gente. Sem fidelidade, cancele quando quiser.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {/* Free Plan */}
                        <div className="relative p-8 rounded-3xl border border-gray-200 bg-white hover:border-[#ff3d03]/30 hover:shadow-2xl hover:shadow-[#ff3d03]/5 transition-all duration-300">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider mb-2">Gratuito</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-gray-900">R$0</span>
                                    <span className="text-gray-500 font-medium">/mês</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-2">Para testar e validar seu delivery.</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    30 produtos
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    2 usuários
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Até 300 pedidos/mês
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    8 categorias
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    3 cupons ativos
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Cardápio digital
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Programa de fidelidade básico
                                </li>
                                {/* Not Included */}
                                <li className="flex items-center gap-3 text-gray-400 font-medium opacity-60">
                                    <X className="h-5 w-5 text-gray-300" />
                                    Gestão de motoboys
                                </li>
                                <li className="flex items-center gap-3 text-gray-400 font-medium opacity-60">
                                    <X className="h-5 w-5 text-gray-300" />
                                    Impressão automática (ÓoPrint) <span className="text-xs text-[#ff3d03] italic">(Em breve)</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-400 font-medium opacity-60">
                                    <X className="h-5 w-5 text-gray-300" />
                                    Robô WhatsApp (ÓoBot) <span className="text-xs text-[#ff3d03] italic">(Em breve)</span>
                                </li>
                            </ul>
                            <Link href={route('register')} className="block w-full py-4 rounded-xl border-2 border-gray-100 text-gray-900 font-bold text-center hover:border-[#ff3d03] hover:text-[#ff3d03] transition-all">
                                Começar Grátis
                            </Link>
                        </div>

                        {/* Basic Plan (Highlighted) */}
                        <div className="relative p-8 rounded-3xl border-2 border-[#ff3d03] bg-white shadow-xl shadow-[#ff3d03]/10 scale-105 z-10">
                            <div className="absolute top-0 right-0 bg-[#ff3d03] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                                Melhor Custo-Benefício
                            </div>
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-[#ff3d03] uppercase tracking-wider mb-2">Básico</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-gray-900">R$79</span>
                                    <span className="text-2xl font-bold text-gray-900">,90</span>
                                    <span className="text-gray-500 font-medium">/mês</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-2">Para deliverys em crescimento.</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-900 font-bold">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    250 produtos
                                </li>
                                <li className="flex items-center gap-3 text-gray-900 font-bold">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    5 usuários
                                </li>
                                <li className="flex items-center gap-3 text-gray-900 font-bold">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Pedidos Ilimitados
                                </li>
                                <li className="flex items-center gap-3 text-gray-900 font-bold">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Categorias ilimitadas
                                </li>
                                <li className="flex items-center gap-3 text-gray-900 font-bold">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    15 cupons ativos
                                </li>
                                <li className="flex items-center gap-3 text-gray-900 font-bold">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    10 motoboys
                                </li>
                                <li className="flex items-center gap-3 text-gray-900 font-bold">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Impressão automática (ÓoPrint) <span className="text-xs text-[#ff3d03] italic font-normal ml-1">(Em breve)</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-900 font-bold">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Robô WhatsApp (ÓoBot) <span className="text-xs text-[#ff3d03] italic font-normal ml-1">(Em breve)</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-900 font-bold">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Gestão de estoque ilimitada
                                </li>
                            </ul>
                            <Link href={route('register')} className="block w-full py-4 rounded-xl bg-[#ff3d03] text-white font-bold text-center hover:bg-[#e63700] shadow-lg shadow-[#ff3d03]/30 hover:shadow-[#ff3d03]/50 transition-all">
                                Assinar Agora
                            </Link>
                        </div>

                        {/* Custom Plan */}
                        <div className="relative p-8 rounded-3xl border border-gray-200 bg-white hover:border-[#ff3d03]/30 hover:shadow-2xl hover:shadow-[#ff3d03]/5 transition-all duration-300">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider mb-2">Personalizado</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-gray-900">Sob Consulta</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-2">Para grandes operações e franquias.</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Tudo do Básico +
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Produtos ilimitados
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Usuários ilimitados
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Integrações customizadas (API)
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Motoboys ilimitados
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    White Label (Sua marca)
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Domínio personalizado
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Suporte prioritário WhatsApp
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Check className="h-5 w-5 text-[#ff3d03]" />
                                    Gerente de conta dedicado
                                </li>
                            </ul>
                            <a href="https://wa.me/5511999999999" target="_blank" className="block w-full py-4 rounded-xl border-2 border-gray-100 text-gray-900 font-bold text-center hover:border-[#ff3d03] hover:text-[#ff3d03] transition-all">
                                Falar com Consultor
                            </a>
                        </div>
                    </div>
                </div>

                {/* FAQ Style */}
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Perguntas Frequentes</h2>
                        <p className="text-gray-500">Tire suas dúvidas sobre o funcionamento do ÓoDelivery.</p>
                    </div>

                    <div className="space-y-4">
                        <FaqItem
                            question="Preciso pagar alguma taxa sobre os pedidos?"
                            answer="Não! Diferente dos aplicativos de marketplace (como iFood), nós não cobramos comissão sobre suas vendas. Você paga apenas a mensalidade do plano e vende o quanto quiser."
                        />
                        <FaqItem
                            question="O sistema funciona em celular e computador?"
                            answer="Sim! O ÓoDelivery é 100% em nuvem e responsivo. Você pode gerenciar sua loja pelo computador, tablet ou celular, de qualquer lugar."
                        />
                        <FaqItem
                            question="Como funciona a impressão de pedidos?"
                            answer="Com o módulo ÓoPrint (incluso no plano Básico), você instala nosso gerenciador no seu computador com Windows e os pedidos são impressos automaticamente na sua impressora térmica assim que chegam."
                        />
                        <FaqItem
                            question="Posso usar meu próprio domínio?"
                            answer="Sim, oferecemos um link personalizado (oodelivery.com/sua-loja), mas você também pode conectar seu domínio próprio se desejar."
                        />
                        <FaqItem
                            question="Tem fidelidade?"
                            answer="Não. Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas escondidas."
                        />
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-gray-400 font-medium text-sm">
                        &copy; {new Date().getFullYear()} ÓoDelivery. Todos os direitos reservados.
                    </p>
                    <div className="mt-4 flex justify-center gap-6 text-sm font-bold text-gray-500">
                        <Link href={route('terms')} className="hover:text-[#ff3d03] transition-colors">Termos de Uso</Link>
                        <Link href="#" className="hover:text-[#ff3d03] transition-colors">Privacidade</Link>
                        <Link href="#" className="hover:text-[#ff3d03] transition-colors">Contato</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:border-[#ff3d03]/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left"
            >
                <span className="font-bold text-gray-900 text-lg pr-4">{question}</span>
                {isOpen ? <ChevronUp className="text-[#ff3d03]" /> : <ChevronDown className="text-gray-400" />}
            </button>
            <div className={`px-6 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-600 font-medium leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
}
