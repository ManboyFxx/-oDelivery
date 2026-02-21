import { Plus } from 'lucide-react';
import { Product } from './types';
import clsx from 'clsx';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    viewMode?: 'grid' | 'list';
    isStoreOpen?: boolean;
}

export default function ProductCard({ product, onAdd, viewMode = 'grid', isStoreOpen = true }: ProductCardProps) {
    const hasDiscount = product.promotional_price && Number(product.promotional_price) > 0;
    const currentPrice = hasDiscount ? Number(product.promotional_price) : Number(product.price);
    const originalPrice = Number(product.price);

    return (
        <div
            onClick={() => isStoreOpen && onAdd(product)}
            className={clsx(
                "group bg-gray-100 dark:bg-white/5 rounded-[20px] border border-gray-200 dark:border-white/5 shadow-sm transition-all duration-300 relative overflow-hidden",
                isStoreOpen ? "hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/30 cursor-pointer" : "opacity-80 grayscale-[20%] cursor-not-allowed",
                viewMode === 'grid' 
                    ? "flex flex-col h-full p-2.5 md:p-3 gap-3" 
                    : "flex flex-row items-center p-2.5 gap-3 h-28 md:h-32"
            )}
        >
            {/* Discount/Status Badges */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex flex-col gap-1 items-end">
                {hasDiscount && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-purple-500/50">
                        PROMO
                    </span>
                )}
                {product.loyalty_points_multiplier > 1 && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-orange-500/50 flex items-center gap-1">
                        🔥 {product.loyalty_points_multiplier}x PONTOS
                    </span>
                )}
                {product.is_new && (
                    <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-green-500/50">
                        NOVO
                    </span>
                )}
            </div>

            {/* Image */}
            <div className={clsx(
                "shrink-0 relative transition-colors duration-300",
                viewMode === 'grid' 
                    ? "w-full aspect-square md:mb-2" 
                    : "h-full aspect-square"
            )}>
                <div className={clsx(
                    "w-full h-full overflow-hidden bg-gray-50 dark:bg-white/5 relative",
                    viewMode === 'grid' ? "rounded-[14px]" : "rounded-[12px]"
                )}>
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                            <span className={viewMode === 'grid' ? "text-4xl" : "text-2xl"}>🍽️</span>
                        </div>
                    )}

                    {/* Desktop Overlay Add Button (Grid Only) */}
                    {viewMode === 'grid' && (
                        <div className="hidden md:flex absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                            <button 
                                className="text-white rounded-full p-3 shadow-xl shadow-primary/40 transform translate-y-4 group-hover:translate-y-0 transition-transform"
                                style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)' }}
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 justify-between h-full">
                <div>
                    <h3 className={clsx(
                        "font-bold text-gray-900 dark:text-white leading-tight mb-1 transition-colors duration-300",
                        viewMode === 'grid' ? "text-sm md:text-base line-clamp-2" : "text-xs md:text-sm line-clamp-1"
                    )}>
                        {product.name}
                    </h3>
                    <p className={clsx(
                        "text-xs text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300 leading-relaxed",
                        viewMode === 'grid' ? "line-clamp-2 md:line-clamp-3" : "line-clamp-2 hidden md:block" // Hide desc on mobile list for space
                    )}>
                        {product.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 line-through transition-colors duration-300 font-medium">
                                R$ {originalPrice.toFixed(2).replace('.', ',')}
                            </span>
                        )}
                        <span className={clsx(
                            "font-black text-primary",
                            viewMode === 'grid' ? "text-sm md:text-lg" : "text-xs md:text-base"
                        )}>
                            R$ {currentPrice.toFixed(2).replace('.', ',')}
                        </span>
                    </div>

                    {/* Mobile/List Add Button */}
                    <button 
                        className={clsx(
                            "h-7 w-7 text-white rounded-lg flex items-center justify-center shadow-md transition-all active:scale-95",
                            viewMode === 'grid' && "md:hidden" // Hide on desktop grid (uses overlay)
                        )}
                        style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)' }}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
