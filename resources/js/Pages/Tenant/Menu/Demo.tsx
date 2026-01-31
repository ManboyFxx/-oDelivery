import { Head } from '@inertiajs/react';
import { Search, ShoppingCart, User, Star, Plus, Minus, X, ChevronRight, Flame, MapPin, Phone } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import clsx from 'clsx';

// --- Types ---
interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    promotional_price?: string;
    image_url?: string;
    is_featured?: boolean;
    is_available?: boolean;
    is_promotional?: boolean;
    is_new?: boolean;
    is_exclusive?: boolean;
}

interface Category {
    id: string;
    name: string;
    products: Product[];
}

interface CartItem {
    product: Product;
    quantity: number;
}

// --- Components ---

const Badge = ({ children, color }: { children: React.ReactNode, color: string }) => (
    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
        {children}
    </span>
);

export default function PublicMenuDemo({ store, categories, authCustomer }: any) {
    // Standardizing the theme color with a fallback
    const themeColor = store?.theme_color || '#F97316'; // Default orange

    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCart, setShowCart] = useState(false);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        let all = categories?.flatMap((c: Category) => c.products || []) || [];
        if (selectedCategory) {
            all = categories?.find((c: Category) => c.id === selectedCategory)?.products || [];
        }
        if (searchQuery) {
            all = all.filter((p: Product) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return all;
    }, [categories, selectedCategory, searchQuery]);

    // Cart Logic
    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
        toast.success(`${product.name} adicionado!`);
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.promotional_price || item.product.price) * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-black/10">
            <Head title={`Demo - ${store?.name || 'Cardápio'}`} />
            <Toaster position="top-center" richColors />

            {/* --- HEADER --- */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl overflow-hidden shadow-sm shrink-0" style={{ backgroundColor: themeColor }}>
                            {store?.logo_url ? (
                                <img src={store.logo_url} className="h-full w-full object-cover" alt="Logo" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-white font-bold text-xl">
                                    {store?.name?.charAt(0) || 'M'}
                                </div>
                            )}
                        </div>
                        <div className="hidden sm:block leading-tight">
                            <h1 className="font-bold text-lg md:text-xl truncate max-w-[200px]">{store?.name || 'Meu Restaurante'}</h1>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <span>Entrega em toda a região</span>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex-1 max-w-lg hidden md:block">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gray-800 transition-colors" />
                            <input
                                type="text"
                                placeholder="O que você quer comer hoje?"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:bg-white transition-all outline-none"
                                style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCart(true)}
                            className="relative p-3 rounded-2xl text-white shadow-lg flex items-center gap-2 transition-transform"
                            style={{ backgroundColor: themeColor }}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span className="font-bold hidden sm:inline">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </motion.button>
                        {authCustomer ? (
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                                {authCustomer.name.charAt(0)}
                            </div>
                        ) : (
                            <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black">
                                <User className="h-5 w-5" /> Entrar
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden px-4 pb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar no cardápio..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100/50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gray-400"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-6 pb-32">

                {/* --- HERO BANNER (Simple & Solid) --- */}
                {!searchQuery && !selectedCategory && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-xl"
                        style={{ backgroundColor: themeColor }}
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <Flame size={400} />
                        </div>

                        <div className="relative z-10 max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold mb-4 border border-white/30">
                                <Star className="h-4 w-4 fill-white" /> Destaque da Casa
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                                Experimente o Verdadeiro Sabor!
                            </h2>
                            <p className="text-white/90 text-lg mb-8 max-w-lg">
                                Ingredientes selecionados e preparo artesanal para você. Peça agora e receba quentinho.
                            </p>
                            <button
                                onClick={() => {
                                    const featured = categories?.flatMap((c: Category) => c.products).find((p: Product) => p.is_featured);
                                    if (featured) addToCart(featured);
                                }}
                                className="bg-white text-gray-900 px-8 py-3 rounded-xl font-black shadow-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                            >
                                Pedir Agora <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* --- CATEGORIES (Clean Pills) --- */}
                <div className="mb-10 sticky top-[80px] z-30 py-2 -mx-4 px-4 bg-gray-50/95 backdrop-blur-sm md:static md:bg-transparent md:p-0">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={clsx(
                                'px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all border',
                                !selectedCategory
                                    ? 'text-white border-transparent shadow-md transform scale-105'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            )}
                            style={!selectedCategory ? { backgroundColor: themeColor } : {}}
                        >
                            Todos
                        </button>
                        {categories?.map((cat: Category) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={clsx(
                                    'px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all border',
                                    selectedCategory === cat.id
                                        ? 'text-white border-transparent shadow-md transform scale-105'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                )}
                                style={selectedCategory === cat.id ? { backgroundColor: themeColor } : {}}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- PRODUCT GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product: Product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col group relative"
                        >
                            {/* Image Area */}
                            <div className="aspect-[4/3] rounded-2xl bg-gray-100 mb-4 overflow-hidden relative">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">🍽️</div>
                                        </div>
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {product.is_promotional && (
                                        <Badge color="#EF4444">🔥 Promoção</Badge>
                                    )}
                                    {product.is_new && (
                                        <Badge color="#8B5CF6">✨ Novo</Badge>
                                    )}
                                    {product.is_exclusive && (
                                        <Badge color="#06B6D4">💎 Exclusivo</Badge>
                                    )}
                                    {product.is_featured && (
                                        <Badge color="#F59E0B">⭐ Destaque</Badge>
                                    )}
                                    {product.promotional_price && !product.is_promotional && (
                                        <Badge color="#EF4444">💰 Desconto</Badge>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col">
                                <div className="mb-auto">
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{product.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div>
                                        {product.promotional_price && (
                                            <span className="text-xs text-gray-400 line-through block">
                                                R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                            </span>
                                        )}
                                        <span className="text-xl font-black text-gray-900">
                                            R$ {Number(product.promotional_price || product.price).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => addToCart(product)}
                                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100 hover:shadow-xl transition-shadow"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        <Plus className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-24 opacity-50">
                        <div className="text-6xl mb-4 grayscale">🥗</div>
                        <p className="text-xl font-medium">Nenhum item encontrado nesta categoria.</p>
                    </div>
                )}

            </main>

            {/* --- CART DRAWER --- */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowCart(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h2 className="text-2xl font-black text-gray-900">Sua Sacola</h2>
                                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                        <ShoppingCart size={64} className="mb-4" />
                                        <p>Seu carrinho está vazio</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.product.id} className="flex gap-4">
                                            <div className="h-20 w-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                                {item.product.image_url && (
                                                    <img src={item.product.image_url} className="h-full w-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 mb-1">{item.product.name}</h4>
                                                <p className="text-sm font-bold text-gray-500 mb-2">
                                                    R$ {Number(item.product.promotional_price || item.product.price).toFixed(2).replace('.', ',')}
                                                </p>
                                                <div className="flex items-center gap-3 bg-gray-50 inline-flex rounded-lg p-1">
                                                    <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-white rounded shadow-sm">
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-white rounded shadow-sm">
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900">
                                                    R$ {(Number(item.product.promotional_price || item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-6 bg-gray-50 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-gray-500">Total do Pedido</span>
                                        <span className="text-2xl font-black text-gray-900">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <button
                                        className="w-full py-4 rounded-2xl font-black text-white shadow-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        Finalizar Compra <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}
