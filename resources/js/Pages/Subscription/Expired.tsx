import { Head, Link, router } from '@inertiajs/react';
import React from 'react';
import { Clock, Check, X, ArrowRight, MessageCircle, Package, ArrowLeft, AlertTriangle, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Plan {
    plan: string;
    name: string;
    price: number;
    price_monthly: number;
    price_yearly: number;
    max_products: number | null;
    max_users: number | null;
    features: string[];
}

interface Props {
    tenant: {
        name: string;
        plan: string;
    };
    plans: Plan[];
    downgradeRisks?: {
        can_downgrade: boolean;
        issues: Array<{
            resource: string;
            current: number;
            limit: number;
            excess: number;
            action: string;
        }>;
    };
}

export default function Expired({ tenant, plans, downgradeRisks }: Props) {
    const activePlans = plans.filter(p => p.plan !== 'custom');
    const [showWarningModal, setShowWarningModal] = React.useState(false);

    const handleSelectPlan = (plan: string) => {
        if (plan === 'free') {
            if (downgradeRisks && !downgradeRisks.can_downgrade) {
                setShowWarningModal(true);
            } else {
                router.post(route('subscription.downgrade'));
            }
        } else {
            router.visit(route('subscription.checkout', { plan }));
        }
    };

    const confirmDowngrade = () => {
        router.post(route('subscription.downgrade'), { force: true }, {
            onFinish: () => setShowWarningModal(false)
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0b0c10] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#ff3d03] selection:text-white antialiased overflow-x-hidden">
            <Head title="Assinatura Expirada - ÓoDelivery" />

            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ff3d03]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <AnimatePresence>
                {showWarningModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-[#1a1b1e] rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-white/10"
                        >
                            <div className="flex items-center gap-4 text-amber-500 mb-6">
                                <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-2xl">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Aviso de Downgrade</h3>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium leading-relaxed">
                                Ao mudar para o plano Gratuito, os itens que excedem o limite serão <span className="text-red-500 font-bold underline">desativados</span> automaticamente.
                            </p>

                            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-2xl p-5 mb-8 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                {downgradeRisks?.issues.map((issue, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200">
                                        <div className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                                        <span className="font-medium">{issue.action || `Limite de ${issue.resource} excedido.`}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowWarningModal(false)}
                                    className="flex-1 px-6 py-4 text-gray-500 dark:text-gray-400 font-black uppercase text-xs tracking-widest hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={confirmDowngrade}
                                    className="flex-1 px-6 py-4 bg-gray-900 dark:bg-white dark:text-black text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-6xl mx-auto bg-white dark:bg-[#121214] rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col lg:flex-row min-h-[700px] relative z-10"
            >
                {/* Left Side - Content */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col relative text-left">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#ff3d03] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff3d03]/20 p-2">
                                <img src="/images/logo-main.png" alt="" className="w-full h-full object-contain brightness-0 invert" />
                            </div>
                            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">ÓoDelivery</span>
                        </div>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="group flex items-center gap-2 text-gray-400 hover:text-red-500 transition-all font-black uppercase text-[10px] tracking-widest"
                        >
                            Sair
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="max-w-md">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-500 px-4 py-2 rounded-full mb-6">
                                <Clock className="w-4 h-4 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Acesso Expirado</span>
                            </div>
                            
                            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-[1.1]">
                                Não pare seu<br /> <span className="text-[#ff3d03]">sucesso</span> agora.
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-12">
                                Milhares de pedidos estão esperando. Escolha seu plano e volte a vender em segundos.
                            </p>
                        </motion.div>

                        <div className="space-y-4 mb-12">
                            {activePlans.map((plan, index) => (
                                <motion.div
                                    key={plan.plan}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    onClick={() => handleSelectPlan(plan.plan)}
                                    className={`group relative rounded-3xl border-2 p-6 transition-all cursor-pointer ${
                                        plan.plan === 'unified' || plan.plan === 'basic'
                                        ? 'border-[#ff3d03] bg-orange-50/30 dark:bg-[#ff3d03]/5 shadow-xl shadow-[#ff3d03]/5'
                                        : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                                    }`}
                                >
                                    {(plan.plan === 'unified' || plan.plan === 'basic') && (
                                        <div className="absolute -top-3 right-6 bg-[#ff3d03] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-[#ff3d03]/20">
                                            Recomendado
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{plan.name}</h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                                    <Zap className="w-3 h-3 text-orange-400" />
                                                    {plan.max_products ? `${plan.max_products} Itens` : 'Ilimitado'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                                    <Sparkles className="w-3 h-3 text-blue-400" />
                                                    Tudo incluso
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                                {plan.price_monthly > 0 ? (
                                                    `R$ ${plan.price_monthly.toFixed(2).replace('.', ',')}`
                                                ) : 'Grátis'}
                                                <span className="text-sm text-gray-400 font-medium ml-1">/mês</span>
                                            </div>
                                            <div className="bg-gray-900 dark:bg-white text-white dark:text-black p-1.5 rounded-full inline-block mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem]">
                            <div className="w-12 h-12 bg-white dark:bg-[#1a1b1e] rounded-2xl flex items-center justify-center shadow-sm">
                                <MessageCircle className="w-6 h-6 text-[#25D366]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Precisa de ajuda?</p>
                                <a href="#" className="text-sm font-black text-gray-900 dark:text-white hover:text-[#ff3d03] transition-colors underline decoration-[#ff3d03]/30">Falar com Consultor</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Visual Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-[#0b0c10] relative items-center justify-center p-20 overflow-hidden">
                    {/* Animated Background Rings */}
                    <div className="absolute inset-0 z-0">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-white/5 rounded-full" 
                        />
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/5 rounded-full" 
                        />
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "backOut" }}
                            className="mb-12"
                        >
                            <img src="/images/logo-main.png" alt="ÓoDelivery" className="w-72 h-auto object-contain drop-shadow-[0_0_50px_rgba(255,61,3,0.3)]" />
                        </motion.div>
                        
                        <h2 className="text-3xl font-black text-white tracking-tight mb-4 uppercase">Sua operação não pode parar</h2>
                        <p className="text-gray-500 max-w-sm leading-relaxed font-medium">
                            Junte-se a milhares de estabelecimentos que aumentaram suas vendas em até 40% com o ÓoDelivery.
                        </p>

                        <div className="mt-12 flex gap-8">
                            <div className="text-center">
                                <p className="text-2xl font-black text-white tracking-tighter">1.5M+</p>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Pedidos Entregues</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-2xl font-black text-white tracking-tighter">98%</p>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Satisfação</p>
                            </div>
                        </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                </div>
            </motion.div>

            {/* Support Link Mobile */}
            <div className="mt-8 text-center lg:hidden">
                <p className="text-sm text-gray-500 mb-2">Dúvidas? <a href="#" className="font-bold text-[#ff3d03]">Fale com o suporte</a></p>
            </div>
        </div>
    );
}
