import { Category, Product } from './types';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

interface ProductGridProps {
    categories: Category[];
    onAdd: (product: Product) => void;
    viewMode?: 'grid' | 'list';
    isStoreOpen?: boolean;
    isLoading?: boolean;
}

export default function ProductGrid({ categories, onAdd, viewMode = 'grid', isStoreOpen = true, isLoading = false }: ProductGridProps) {
    if (isLoading) {
        // Fallback fake categories to loop skeletons
        const skeletonCategories = categories.length > 0 ? categories : [{ id: 'skeleton', name: 'Carregando Produtos...', products: [1,2,3,4,5,6] }];
        
        return (
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-8 animate-pulse">
                {skeletonCategories.map((cat, i) => (
                    <div key={`skel-cat-${i}`}>
                         <div className="flex items-center gap-3 mb-4 opacity-50">
                            <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight bg-gray-200 dark:bg-white/10 text-transparent rounded">
                                {cat.name}
                            </h2>
                            <div className="h-1 flex-1 bg-gray-100 dark:bg-white/5 rounded-full" />
                        </div>
                        <div className={clsx(
                            viewMode === 'grid' 
                                ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6"
                                : "flex flex-col gap-4"
                        )}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <ProductCardSkeleton key={`skel-${i}`} viewMode={viewMode} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-8">
            {categories.map((category) => {
                if (!category.products || category.products.length === 0) return null;

                return (
                    <div key={category.id} id={category.id} className="scroll-mt-40 md:scroll-mt-48">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors duration-300">
                                {category.name}
                            </h2>
                            <div className="h-1 flex-1 bg-gray-100 dark:bg-white/5 rounded-full transition-colors duration-300" />
                            <span className="text-sm font-bold text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full transition-colors duration-300">
                                {category.products.length} {category.products.length === 1 ? 'item' : 'itens'}
                            </span>
                        </div>

                        {/* 
                            Grid Layout:
                            - Mobile: Single column (Stack)
                            - Tablet: 2 columns
                            - Desktop: 3 or 4 columns depending on screen size
                        */}
                        <div className={clsx(
                            viewMode === 'grid' 
                                ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6"
                                : "flex flex-col gap-4"
                        )}>
                            {category.products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAdd={onAdd}
                                    viewMode={viewMode}
                                    isStoreOpen={isStoreOpen}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Empty State if no categories */}
            {categories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-full mb-4 transition-colors duration-300">
                        <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Cardápio Vazio</h3>
                    <p className="max-w-md text-center">Nenhum produto disponível no momento.</p>
                </div>
            )}
        </div>
    );
}
