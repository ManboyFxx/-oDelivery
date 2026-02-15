import { Plus } from 'lucide-react';
import { Product } from './types';
import clsx from 'clsx';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
    const hasDiscount = product.promotional_price && Number(product.promotional_price) > 0;
    const currentPrice = hasDiscount ? Number(product.promotional_price) : Number(product.price);
    const originalPrice = Number(product.price);

    return (
        <div
            onClick={() => onAdd(product)}
            className="group bg-white rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all cursor-pointer flex md:flex-col gap-4 md:gap-0 h-full relative overflow-hidden"
        >
            {/* Discount/Status Badges */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex flex-col gap-1 items-end">
                {hasDiscount && (
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        PROMO
                    </span>
                )}
                {product.is_new && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        NOVO
                    </span>
                )}
            </div>

            {/* Image */}
            <div className="shrink-0 md:mb-4 relative">
                <div className="h-24 w-24 md:h-48 md:w-full rounded-xl overflow-hidden bg-gray-50 relative">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                            <span className="text-2xl">🍽️</span>
                        </div>
                    )}

                    {/* Desktop Overlay Add Button */}
                    <div className="hidden md:flex absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                        <button className="bg-white text-[#ff3d03] rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Plus className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 justify-between md:space-y-2">
                <div>
                    <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2 md:text-lg">
                        {product.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 line-clamp-2 md:line-clamp-3 mb-2">
                        {product.description}
                    </p>
                </div>

                <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                                R$ {originalPrice.toFixed(2).replace('.', ',')}
                            </span>
                        )}
                        <span className="text-base md:text-xl font-black text-[#ff3d03]">
                            R$ {currentPrice.toFixed(2).replace('.', ',')}
                        </span>
                    </div>

                    {/* Mobile Add Button */}
                    <button className="md:hidden h-8 w-8 bg-gray-50 text-[#ff3d03] rounded-lg flex items-center justify-center hover:bg-[#ff3d03] hover:text-white transition-colors">
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
