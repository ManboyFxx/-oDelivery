import { X, Trash2, Edit2, ShoppingCart, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from './types';

interface CartItem {
    product: Product;
    quantity: number;
    notes: string;
    selectedComplements: any[];
    subtotal: number;
}

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onUpdateQuantity?: (index: number, newQuantity: number) => void;
    onEdit: (index: number) => void;
    onRemove: (index: number) => void;
    onCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, cart, onUpdateQuantity, onEdit, onRemove, onCheckout }: CartSidebarProps) {
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const themeColor = '#ff3d03';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-premium-card z-[120] shadow-2xl flex flex-col border-l border-gray-100 dark:border-white/5 transition-colors duration-300"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors duration-300">
                                Minha Sacola <span className="text-sm font-bold text-gray-400">({cart.length})</span>
                            </h2>
                            <button
                                onClick={onClose}
                                className="h-10 w-10 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <div className="text-7xl mb-6 text-gray-300 dark:text-gray-600 transition-colors duration-300">🛒</div>
                                    <p className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">Sua sacola está vazia</p>
                                    <p className="text-sm font-medium mt-2 text-gray-500 dark:text-gray-400 transition-colors duration-300">Adicione delícias para continuar</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="h-24 w-24 rounded-2xl bg-gray-50 dark:bg-white/5 overflow-hidden shrink-0 border border-gray-100 dark:border-white/5 relative transition-colors duration-300">
                                            {item.product.image_url ? (
                                                <img src={item.product.image_url} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-3xl">🍔</div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2 transition-colors duration-300">{item.product.name}</h4>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => onEdit(index)} className="p-1.5 text-gray-400 hover:text-blue-500 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                                                    <button onClick={() => onRemove(index)} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                                </div>
                                            </div>
                                            
                                            {/* Complements Summary */}
                                            {item.selectedComplements.length > 0 && (
                                                <p className="text-[10px] text-gray-400 font-medium mb-2 line-clamp-1">
                                                    + {item.selectedComplements.map(c => c.name).join(', ')}
                                                </p>
                                            )}

                                            <div className="mt-auto flex items-center justify-between">
                                                <p className="text-sm font-black" style={{ color: themeColor }}>
                                                    R$ {item.subtotal.toFixed(2).replace('.', ',')}
                                                </p>

                                                <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 transition-colors duration-300">
                                                <button 
                                                    onClick={() => onUpdateQuantity && onUpdateQuantity(index, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#ff3d03] disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">{item.quantity}</span>
                                                <button 
                                                    onClick={() => onUpdateQuantity && onUpdateQuantity(index, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#ff3d03] transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-8 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 space-y-6 transition-colors duration-300">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-widest transition-colors duration-300">Total do Pedido</span>
                                    <span className="text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">R$ {total.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <button 
                                    onClick={onCheckout}
                                    className="w-full py-5 rounded-[24px] text-white font-black text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    style={{ backgroundColor: themeColor, boxShadow: `0 20px 50px -15px ${themeColor}40` }}
                                >
                                    Finalizar Pedido
                                </button>
                                <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest">Pague na entrega ou via PIX</p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
