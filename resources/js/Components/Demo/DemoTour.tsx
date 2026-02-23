import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Star, Zap, ShoppingBag, BookOpen, UserCog, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Step {
    title: string;
    content: string;
    target: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    icon: any;
}

const steps: Step[] = [
    {
        title: "Painel de Controle",
        content: "Seja bem-vindo! Aqui você tem uma visão 360º da sua operação. Acompanhe o faturamento, pedidos e clientes em tempo real.",
        target: "dashboard-revenue",
        position: "bottom",
        icon: Zap
    },
    {
        title: "Gestão de Pedidos",
        content: "Acompanhe cada etapa dos seus pedidos. Do recebimento à entrega, tudo síncrono para evitar atrasos.",
        target: "sidebar-orders",
        position: "right",
        icon: ShoppingBag
    },
    {
        title: "Cardápio Digital",
        content: "Gerencie seus produtos, categorias e preços de forma ultra-rápida. Suas alterações aparecem na hora para os clientes.",
        target: "sidebar-menu",
        position: "right",
        icon: BookOpen
    },
    {
        title: "Sua Equipe",
        content: "Gerencie garçons e motoboys. Controle permissões e acompanhe o desempenho de quem faz o negócio acontecer.",
        target: "sidebar-settings",
        position: "right",
        icon: UserCog
    },
    {
        title: "O Futuro é Agora",
        content: "O OoDelivery foi feito para escalar seu negócio sem taxas abusivas. Pronto para começar sua jornada?",
        target: "dashboard-bestsellers",
        position: "left",
        icon: Star
    }
];

export default function DemoTour({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('resize', updateCoords);
        }
        return () => window.removeEventListener('resize', updateCoords);
    }, [isOpen, currentStep]);

    const updateCoords = () => {
        const element = document.getElementById(steps[currentStep].target);
        if (element) {
            const rect = element.getBoundingClientRect();
            setCoords({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height
            });
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    if (!isOpen) return null;

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Overlay with Cutout */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
                style={{
                    clipPath: `polygon(
                        0% 0%, 0% 100%, 100% 100%, 100% 0%,
                        ${coords.left}px 0%, 
                        ${coords.left}px ${coords.top}px, 
                        ${coords.left + coords.width}px ${coords.top}px, 
                        ${coords.left + coords.width}px ${coords.top + coords.height}px, 
                        ${coords.left}px ${coords.top + coords.height}px, 
                        ${coords.left}px 0%
                    )`
                }}
            />

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute pointer-events-auto bg-white dark:bg-[#1a1b1e] rounded-3xl shadow-2xl p-6 w-80 border border-white/10"
                    style={{
                        top: step.position === 'bottom' ? coords.top + coords.height + 20 : 
                             step.position === 'top' ? coords.top - 250 :
                             coords.top + (coords.height / 2) - 100,
                        left: step.position === 'right' ? coords.left + coords.width + 20 :
                              step.position === 'left' ? coords.left - 340 :
                              coords.left + (coords.width / 2) - 160
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-[#FF3D03]/10 p-2 rounded-xl">
                            <step.icon className="w-5 h-5 text-[#FF3D03]" />
                        </div>
                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{step.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                        {step.content}
                    </p>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1 rounded-full transition-all ${i === currentStep ? 'w-4 bg-[#FF3D03]' : 'w-1 bg-gray-200 dark:bg-white/10'}`} 
                                />
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {currentStep > 0 && (
                                <button 
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors p-2"
                                >
                                    Anterior
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (currentStep < steps.length - 1) {
                                        setCurrentStep(prev => prev + 1);
                                    } else {
                                        onClose();
                                    }
                                }}
                                className="bg-[#FF3D03] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FF3D03]/20"
                            >
                                {currentStep < steps.length - 1 ? 'Próximo' : 'Finalizar'}
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="absolute -top-3 -right-3 bg-white dark:bg-[#2c2d30] p-1.5 rounded-full shadow-lg border border-gray-100 dark:border-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            </AnimatePresence>

            {/* Pulsing Highlight */}
            <motion.div
                animate={{
                    boxShadow: ["0 0 0 0px rgba(255, 61, 3, 0.4)", "0 0 0 20px rgba(255, 61, 3, 0)"]
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute border-2 border-[#FF3D03] rounded-2xl pointer-events-none"
                style={{
                    top: coords.top - 4,
                    left: coords.left - 4,
                    width: coords.width + 8,
                    height: coords.height + 8
                }}
            />
        </div>
    );
}
