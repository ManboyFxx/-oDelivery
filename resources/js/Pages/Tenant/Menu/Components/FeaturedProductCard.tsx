import { Plus, Star } from 'lucide-react';
import { Product } from './types';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface FeaturedProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    isStoreOpen?: boolean;
}

export default function FeaturedProductCard({ product, onAdd, isStoreOpen = true }: FeaturedProductCardProps) {
    const hasDiscount = product.promotional_price && Number(product.promotional_price) > 0;
    const currentPrice = hasDiscount ? Number(product.promotional_price) : Number(product.price);
    const originalPrice = Number(product.price);

    return (
        <motion.div
            whileHover={isStoreOpen ? { y: -5 } : {}}
            onClick={() => isStoreOpen && onAdd(product)}
            className={clsx(
                "group relative w-full max-w-[200px] md:max-w-[220px] bg-white dark:bg-white/5 rounded-[24px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm transition-all duration-500 flex flex-col",
                isStoreOpen ? "hover:shadow-xl cursor-pointer" : "opacity-80 grayscale-[20%] cursor-not-allowed"
            )}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-white/5 text-4xl">
                        🍕
                    </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    <div className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-current" /> Destaque
                    </div>
                    {hasDiscount && (
                        <div className="bg-premium-orange text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                            Oferta
                        </div>
                    )}
                </div>

                {/* Bottom Content (Overlay) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1.5">
                    <h3 className="text-sm md:text-base font-black text-white leading-tight drop-shadow-md line-clamp-2">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            {hasDiscount && (
                                <span className="text-[10px] text-white/60 line-through font-bold">
                                    R$ {originalPrice.toFixed(2).replace('.', ',')}
                                </span>
                            )}
                            <span className="text-base md:text-lg font-black text-white drop-shadow-md">
                                R$ {currentPrice.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        
                        <button
                            className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-xl"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAdd(product);
                            }}
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Subtle Info section below if needed, but keeping it clean like the reference */}
            {product.description && (
                <div className="p-3 bg-white dark:bg-transparent">
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 line-clamp-2 font-medium leading-relaxed">
                        {product.description}
                    </p>
                </div>
            )}
        </motion.div>
    );
}
