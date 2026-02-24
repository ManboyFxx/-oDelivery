import { Head, Link } from '@inertiajs/react';
import { 
    Check, 
    ArrowLeft, 
    ShieldCheck, 
    Zap, 
    Monitor, 
    Bike, 
    LayoutDashboard, 
    BarChart3, 
    MousePointer2,
    Bot,
    Printer,
    Users
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import GuaranteeSeals from '@/Components/GuaranteeSeals';

interface PlanProps {
    plan: {
        display_name: string;
        price_monthly: number;
        price_yearly: number;
        features: any;
    } | null;
}

export default function Pricing({ plan }: PlanProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Load preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('billingPreference');
        if (saved === 'yearly') {
            setBillingCycle('yearly');
        }
    }, []);

    const handleBillingToggle = (cycle: 'monthly' | 'yearly') => {
        setBillingCycle(cycle);
        localStorage.setItem('billingPreference', cycle);
    };

    // Fallback if plan not found in database
    const planData = {
        name: plan?.display_name || 'Plano Único Profissional',
        description: 'Tudo o que você precisa para escalar sua operação sem limites.',
        priceMonthly: plan?.price_monthly || 129.90,
        priceYearly: plan?.price_yearly || 1299.00,
    };

    const monthlyTotal = planData.priceMonthly * 12;
    const savings = monthlyTotal - planData.priceYearly;

    const features = [
        { icon: <Monitor className="w-5 h-5" />, title: 'PDV Completo', desc: 'Venda rápida em balcão ou comandos.' },
        { icon: <Bot className="w-5 h-5" />, title: 'Robô WhatsApp', desc: 'Auto-atendimento (ÓoBot) incluso.' },
        { icon: <Printer className="w-5 h-5" />, title: 'ÓoPrint', desc: 'Impressão automática sem complicações.' },
        { icon: <Bike className="w-5 h-5" />, title: 'Painel do Motoboy', desc: 'Gestão de frotas e entregas em tempo real.' },
        { icon: <LayoutDashboard className="w-5 h-5" />, title: 'KDS & Displays', desc: 'Telas de cozinha para controle total.' },
        { icon: <BarChart3 className="w-5 h-5" />, title: 'Gestão Financeira', desc: 'DRE, fluxo de caixa e relatórios.' },
        { icon: <Users className="w-5 h-5" />, title: 'Equipe Ilimitada', desc: 'Cadastre quantos funcionários precisar.' },
        { icon: <ShieldCheck className="w-5 h-5" />, title: 'Criptografia de Dados', desc: 'Segurança bancária para seu negócio.' },
    ];

    const currentPriceDisplay = billingCycle === 'monthly' ? planData.priceMonthly : planData.priceYearly / 12;

    return (
        <div className="min-h-screen bg-[#f8f6f5] text-[#181210] selection:bg-[#FF3D03]/20 font-sans antialiased overflow-x-hidden">
            <Head title={`${planData.name} - OoDelivery`} />

            {/* Navbar / Header */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#e7ddda]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline font-bold text-sm">Voltar</span>
                        </Link>
                        <img 
                            src="/images/logo-main.png" 
                            alt="OoDelivery Logo" 
                            className="h-10 w-auto object-contain"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:block text-sm font-bold px-5 py-2.5 rounded-xl bg-[#ede7e5] hover:bg-[#e7ddda] transition-all">
                            Entrar
                        </Link>
                        <Link href="/register" className="text-sm font-bold px-6 py-2.5 rounded-xl bg-[#FF3D03] text-white hover:opacity-90 transition-all shadow-lg shadow-[#FF3D03]/20">
                            Testar Grátis
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-12 pb-24 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">
                            A única plataforma <br/>
                            <span className="text-[#FF3D03]">que você já precisou.</span>
                        </h1>
                        <p className="text-lg text-[#8d695e] max-w-2xl mx-auto font-medium">
                            Sem taxas ocultas, sem módulos à parte. Um único plano com todas as funcionalidades inclusas para seu delivery de alta performance.
                        </p>
                    </div>

                    {/* Pricing Core */}
                    <div className="flex flex-col lg:flex-row gap-12 items-stretch mb-20">
                        {/* Left Side: Benefit List */}
                        <div className="flex-1 space-y-8">
                            <h2 className="text-2xl font-black tracking-tight">O que está incluso?</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {features.map((f, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-[#e7ddda] text-[#FF3D03] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            {f.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">{f.title}</h3>
                                            <p className="text-[11px] text-[#8d695e] leading-tight mt-1">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Pricing Card */}
                        <div className="w-full lg:w-[400px] shrink-0">
                            <div className="bg-[#181210] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                                {/* Gradient Blur */}
                                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FF3D03]/20 rounded-full blur-[60px] -mr-16 -mt-16"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-center mb-10">
                                        <div className="bg-white/5 p-1 rounded-2xl flex border border-white/10">
                                            <button 
                                                onClick={() => handleBillingToggle('monthly')}
                                                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${billingCycle === 'monthly' ? 'bg-[#FF3D03] text-white shadow-lg shadow-[#FF3D03]/20' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                MENSAL
                                            </button>
                                            <button 
                                                onClick={() => handleBillingToggle('yearly')}
                                                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${billingCycle === 'yearly' ? 'bg-[#FF3D03] text-white shadow-lg shadow-[#FF3D03]/20' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                ANUAL
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center mb-8">
                                        {billingCycle === 'yearly' && savings > 0 && (
                                            <div className="text-[#FF3D03] text-[10px] font-black uppercase tracking-[0.2em] mb-4 bg-[#FF3D03]/10 py-1 px-3 rounded-full inline-block">
                                                Economize R$ {savings.toFixed(2).replace('.', ',')} /ano
                                            </div>
                                        )}
                                        <div className="flex items-center justify-center gap-1 group-hover:scale-105 transition-transform duration-500">
                                            <span className="text-sm font-bold opacity-60 mt-2">R$</span>
                                            <span className="text-6xl font-black tracking-tighter">
                                                {Math.floor(currentPriceDisplay)}
                                            </span>
                                            <div className="text-left mt-2">
                                                <span className="block text-2xl font-black leading-none">
                                                    ,{currentPriceDisplay.toFixed(2).split('.')[1]}
                                                </span>
                                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">/mês</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center gap-3 text-sm font-medium opacity-80">
                                            <div className="w-4 h-4 rounded-full bg-[#FF3D03] flex items-center justify-center text-[10px]">✓</div>
                                            Tudo ilimitado
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium opacity-80">
                                            <div className="w-4 h-4 rounded-full bg-[#FF3D03] flex items-center justify-center text-[10px]">✓</div>
                                            Suporte em menos de 2min
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium opacity-80">
                                            <div className="w-4 h-4 rounded-full bg-[#FF3D03] flex items-center justify-center text-[10px]">✓</div>
                                            Acesso total à plataforma
                                        </div>
                                    </div>

                                    <Link href="/register" className="block w-full text-center py-5 rounded-2xl bg-[#FF3D03] text-white font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#FF3D03]/30 uppercase tracking-widest mb-6">
                                        Começar Agora
                                    </Link>

                                    <p className="text-[10px] text-center opacity-40 font-bold uppercase tracking-widest">
                                        Sem fidelidade. Cancele quando quiser.
                                    </p>
                                </div>
                            </div>

                            <GuaranteeSeals />
                        </div>
                    </div>

                    {/* FAQ Mini */}
                    <div className="bg-white border-2 border-[#e7ddda] rounded-[2rem] p-8 lg:p-12">
                        <h2 className="text-2xl font-black mb-10 text-center tracking-tight">Dúvidas Frequentes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm">Tem custo de ativação?</h3>
                                <p className="text-xs text-[#8d695e] font-medium leading-relaxed">Não. Você mesmo ativa sua conta em segundos e já pode começar a cadastrar seus produtos.</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm">Cobram por pedido?</h3>
                                <p className="text-xs text-[#8d695e] font-medium leading-relaxed">Não. Somos contra taxas abusivas. Você paga um valor fixo mensal ou anual, independente de quanto vender.</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm">Posso cancelar qualquer dia?</h3>
                                <p className="text-xs text-[#8d695e] font-medium leading-relaxed">Sim. Não temos contrato de fidelidade. Você pode cancelar sua assinatura com apenas um clique.</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm">Oferecem suporte?</h3>
                                <p className="text-xs text-[#8d695e] font-medium leading-relaxed">Com certeza. Temos uma equipe de especialistas pronta para te ajudar via WhatsApp.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#f8f6f5] py-12 px-6 border-t border-[#e7ddda]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <img src="/images/logo-main.png" alt="OoDelivery" className="h-8 w-auto object-contain grayscale opacity-60" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        © 2026 ÓoDelivery
                    </p>
                </div>
            </footer>
        </div>
    );
}
