import { ShoppingCart } from 'lucide-react';

interface CartFloatingButtonProps {
    itemCount: number;
    total: number;
    onClick: () => void;
}

export default function CartFloatingButton({ itemCount, total, onClick }: CartFloatingButtonProps) {
    if (itemCount === 0) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
            <button
                onClick={onClick}
                className="w-full bg-[#ff3d03] text-white rounded-xl shadow-lg shadow-orange-500/30 p-4 flex items-center justify-between hover:bg-[#e63700] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-medium text-orange-100">Meu Pedido</p>
                        <p className="font-bold">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
                    </div>
                </div>
                <div className="font-bold text-lg">
                    R$ {total.toFixed(2).replace('.', ',')}
                </div>
            </button>
        </div>
    );
}
