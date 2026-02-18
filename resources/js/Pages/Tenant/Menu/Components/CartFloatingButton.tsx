import { ShoppingCart, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartFloatingButtonProps {
    itemCount: number;
    total: number;
    onClick: () => void;
}

export default function CartFloatingButton({ itemCount, total, onClick }: CartFloatingButtonProps) {
    const themeColor = '#ff3d03'; // Fallback ou passar via props se necessário

    return (
        <AnimatePresence>
            {itemCount > 0 && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-0 right-0 z-[100] px-4 flex justify-center pointer-events-none"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClick}
                        className="flex items-center gap-6 bg-[#ff3d03] text-white px-8 py-5 rounded-full shadow-[0_20px_50px_-15px_rgba(255,61,3,0.5)] pointer-events-auto border-[3px] border-white ring-4 ring-[#ff3d03]/10"
                    >
                        <div className="relative">
                            <ShoppingCart className="h-6 w-6 stroke-[3]" />
                            <span className="absolute -top-2 -right-2 bg-gray-950 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-sm">
                                {itemCount}
                            </span>
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Meu Pedido</span>
                            <span className="text-sm font-black tracking-tight">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                            </span>
                        </div>
                        <div className="h-8 w-8 bg-black/10 rounded-full flex items-center justify-center ml-2">
                            <ChevronRight className="h-5 w-5 text-white" />
                        </div>
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
