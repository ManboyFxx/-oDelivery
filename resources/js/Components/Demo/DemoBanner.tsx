import { motion, AnimatePresence } from 'framer-motion';
import { Info, Play, X, Zap } from 'lucide-react';
import { useState } from 'react';

interface DemoBannerProps {
    onStartTour?: () => void;
}

export default function DemoBanner({ onStartTour }: DemoBannerProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="bg-gradient-to-r from-[#FF3D03] to-[#FF7A00] text-white py-3 px-6 shadow-2xl relative z-[60] flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden"
                >
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-20 transform translate-x-32 hidden md:block" />
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/20">
                            <Zap className="w-6 h-6 text-white animate-pulse fill-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-sm uppercase tracking-[0.2em]">Ambiente de Demonstração</h4>
                                <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">Sandbox v1.0</span>
                            </div>
                            <p className="text-white/80 text-[11px] font-bold uppercase tracking-wide">Ambiente temporário de 5h. Após esse período, os dados serão resetados e a conta encerrada.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                        <button
                            onClick={onStartTour}
                            className="flex-1 md:flex-none bg-white text-[#FF3D03] px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.1em] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 group"
                        >
                            <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
                            Começar Tour Guiado
                        </button>
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="bg-black/10 hover:bg-black/20 p-3 rounded-2xl transition-all border border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
