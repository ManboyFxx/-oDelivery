import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, Store, ShoppingBag } from 'lucide-react';
import { Customer } from './types';
import clsx from 'clsx';

interface MenuNavbarProps {
    customer: Customer | null;
    cartCount: number;
    onHome: () => void;
    onAccount: () => void;
    onStore: () => void;
    onCart: () => void;
    activeTab?: 'home' | 'account' | 'store' | 'cart';
}

export default function MenuNavbar({ 
    customer, 
    cartCount,
    onHome, 
    onAccount, 
    onStore,
    onCart,
    activeTab = 'home' 
}: MenuNavbarProps) {
    
    const items = [
        { 
            id: 'home', 
            label: 'Início', 
            icon: Home, 
            onClick: onHome 
        },
        { 
            id: 'store', 
            label: 'Loja', 
            icon: Store, 
            onClick: onStore 
        },
        { 
            id: 'cart', 
            label: 'Carrinho', 
            icon: ShoppingBag, 
            onClick: onCart,
            badge: cartCount
        },
        { 
            id: 'account', 
            label: customer ? customer.name.split(' ')[0] : 'Conta', 
            icon: User, 
            onClick: onAccount 
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
            <motion.nav 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full bg-white/70 dark:bg-[#0f1012]/70 backdrop-blur-2xl border-t border-gray-100/50 dark:border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] pointer-events-auto"
            >
                <div className="max-w-lg mx-auto flex items-center justify-around py-3 px-2">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        
                        return (
                            <button
                                key={item.id}
                                onClick={item.onClick}
                                className="relative flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all duration-300 group"
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-[var(--primary-color)]/10 dark:bg-[var(--primary-color)]/20 rounded-2xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                
                                <div className={clsx(
                                    "relative transition-all duration-300 group-active:scale-90",
                                    isActive ? "text-[var(--primary-color)]" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
                                )}>
                                    <Icon className={clsx(
                                        "h-6 w-6 stroke-[2.5px]",
                                        isActive && "drop-shadow-[0_0_8px_var(--primary-color)]/30"
                                    )} />

                                    {/* Cart Badge */}
                                    <AnimatePresence>
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <motion.span 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[var(--primary-color)] text-white text-[10px] font-black flex items-center justify-center rounded-full px-1 shadow-sm ring-2 ring-white dark:ring-[#0f1012]"
                                            >
                                                {item.badge}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                                
                                <span className={clsx(
                                    "text-[9px] font-black uppercase tracking-wider transition-all duration-300",
                                    isActive ? "text-[var(--primary-color)]" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
                                )}>
                                    {item.label}
                                </span>
                                
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeIndicator"
                                        className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[var(--primary-color)] rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </motion.nav>
        </div>
    );
}
