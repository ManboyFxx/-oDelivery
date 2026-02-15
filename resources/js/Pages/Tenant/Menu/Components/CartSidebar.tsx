import { X, Trash2, Edit2, ShoppingCart } from 'lucide-react';
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

export default function CartSidebar({ isOpen, onClose, cart, onEdit, onRemove, onCheckout }: CartSidebarProps) {
    if (!isOpen) return null;

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full md:w-[400px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-50 p-2 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-[#ff3d03]" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900">Seu Pedido</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                            <div className="bg-gray-50 p-6 rounded-full">
                                <ShoppingCart className="h-12 w-12 text-gray-300" />
                            </div>
                            <p className="font-medium text-gray-500">Seu carrinho está vazio</p>
                            <button
                                onClick={onClose}
                                className="text-[#ff3d03] font-bold text-sm hover:underline"
                            >
                                Ver Cardápio
                            </button>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-orange-100 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.product.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {item.quantity}x
                                            </span>
                                            <span className="text-[#ff3d03] font-bold text-sm">
                                                R$ {item.subtotal.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onEdit(index)}
                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onRemove(index)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remover"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {(item.selectedComplements.length > 0 || item.notes) && (
                                    <div className="border-t border-gray-50 pt-3 mt-2 space-y-2">
                                        {item.selectedComplements.map((comp, i) => (
                                            <div key={i} className="flex justify-between text-xs text-gray-500">
                                                <span>+ {comp.name}</span>
                                                <span>R$ {Number(comp.price).toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        ))}
                                        {item.notes && (
                                            <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                                                "{item.notes}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-5 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600 font-medium">Subtotal</span>
                            <span className="text-xl font-black text-gray-900">
                                R$ {total.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="w-full bg-[#ff3d03] text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 hover:bg-[#e63700] hover:shadow-orange-500/50 transition-all transform active:scale-[0.98]"
                        >
                            Finalizar Pedido
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
