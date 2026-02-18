import { Head } from '@inertiajs/react';
import { Search, ShoppingCart, User, Plus, Minus, X, ChevronRight, Star, Flame, MapPin, Phone, Clock, TrendingUp, ShieldCheck, Instagram, Heart, MessageCircle, Share2, CalendarClock, Navigation, Map } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import clsx from 'clsx';

// --- Types ---
type DesignModel = 'modern' | 'minimal' | 'grid';

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
    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter text-white shadow-sm" style={{ backgroundColor: color }}>
        {children}
    </span>
);

export default function PublicMenuDemo({ store, categories, authCustomer }: any) {
    const themeColor = store?.theme_color || '#ff3d03';
    
    // State for Design Selection
    const [model, setModel] = useState<DesignModel>('modern');

    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [showStoreInfo, setShowStoreInfo] = useState(false);

    // Filter Logic (O(n) - Fast)
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
        toast.success(`${product.name} adicionado ao carrinho!`, {
            icon: '🛍️',
            style: { borderRadius: '16px' }
        });
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
        <div className={clsx(
            "min-h-screen font-sans transition-colors duration-500",
            model === 'modern' ? "bg-[#f8fafc]" : model === 'minimal' ? "bg-white" : "bg-gray-100"
        )}>
            <Head title={`Demo - Redesign do Cardápio`} />
            <Toaster position="top-center" richColors />

            {/* --- MODEL SELECTOR (STICKY TOP) --- */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-black/80 backdrop-blur-xl border border-white/20 p-1 rounded-full shadow-2xl flex items-center gap-1 scale-[0.85] md:scale-100">
                {(['modern', 'minimal', 'grid'] as DesignModel[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setModel(m)}
                        className={clsx(
                            "px-3 md:px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all",
                            model === m ? "bg-white text-black scale-105 shadow-xl" : "text-white/60 hover:text-white"
                        )}
                    >
                        {m === 'modern' ? 'Vibrante' : m === 'minimal' ? 'Luxo' : 'Grid'}
                    </button>
                ))}
            </div>

            {/* --- STORE BANNER & BRANDING --- */}
            <div className="relative h-48 md:h-72 w-full overflow-hidden">
                <div className="absolute inset-0 bg-neutral-900">
                    {store?.banner_url ? (
                        <img src={store.banner_url} className="w-full h-full object-cover opacity-60" alt="Banner" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-80" />
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* --- STORE HEADER CARD (MOBILE-FIRST) --- */}
            <div className="relative max-w-7xl mx-auto px-4 md:px-8 -mt-16 md:-mt-24 z-20 mb-8">
                <div className="bg-white rounded-[32px] shadow-2xl p-6 md:p-8 flex flex-col items-center justify-center border border-gray-100">
                     <div className="flex flex-col items-center text-center w-full">
                        {/* Store Main Badge/Logo */}
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-28 w-28 md:h-36 md:w-36 rounded-[40px] shadow-2xl flex items-center justify-center text-white text-5xl md:text-6xl font-black mb-8 border-[6px] border-white relative z-10"
                            style={{ backgroundColor: themeColor, marginTop: '-80px' }}
                        >
                            {store?.logo_url ? <img src={store?.logo_url} className="h-full w-full object-cover rounded-[34px]" /> : (store?.name?.charAt(0) || 'V')}
                        </motion.div>

                        <div className="w-full">
                            <div className="flex flex-col items-center justify-center gap-4 mb-6">
                                <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                    {store?.name || 'vertinholanches'}
                                </h1>
                                <button 
                                    onClick={() => setShowStoreInfo(true)}
                                    className="inline-flex items-center gap-2 bg-gray-50 text-gray-900 hover:scale-105 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200 transition-all shadow-sm"
                                >
                                    Mais informações <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>

                            {/* Ações, Redes Sociais e Navegação Unificadas e Compactas */}
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
                                {/* Minha Conta */}
                                <button 
                                    className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    <User className="h-3.5 w-3.5 sm:h-4 w-4" /> 
                                    <span className="hidden xs:inline">Minha Conta</span>
                                    <span className="xs:hidden">Conta</span>
                                </button>

                                <div className="h-6 w-[1px] bg-gray-100 mx-1 hidden sm:block" />

                                {/* Container de Ícones Sociais - Mais Compactos no Mobile */}
                                <div className="flex items-center gap-2">
                                    {/* Instagram */}
                                    <a href="#" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#FFB700] via-[#FF0069] to-[#7638FF] flex items-center justify-center text-white shadow-md hover:scale-110 active:scale-90 transition-all group">
                                        <Instagram className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
                                    </a>
                                    {/* WhatsApp */}
                                    <a href="#" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-md hover:scale-110 active:scale-90 transition-all group">
                                        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
                                    </a>
                                    {/* Google Maps */}
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store?.address || '')}`} target="_blank" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-[#4285F4] flex items-center justify-center text-white shadow-md hover:scale-110 active:scale-90 transition-all group overflow-hidden">
                                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
                                    </a>
                                    {/* Waze */}
                                    <a href={`https://waze.com/ul?q=${encodeURIComponent(store?.address || '')}`} target="_blank" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-[#33CCFF] flex items-center justify-center text-white shadow-md hover:scale-110 active:scale-90 transition-all group">
                                        <Navigation className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STICKY NAV --- */}
            <header className={clsx(
                "sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-gray-100/50 shadow-sm transition-all duration-300",
            )}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-center gap-6">
                    {/* Compact Search */}
                    <div className="flex-1 max-w-2xl">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input
                                type="text"
                                placeholder="O que vamos pedir agora?"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50/50 border border-transparent rounded-xl py-2.5 pl-11 pr-4 focus:ring-0 focus:border-gray-200 focus:bg-white transition-all outline-none font-medium text-sm text-gray-900 placeholder:text-gray-950"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* --- FLOATING CART BUTTON (Aparece apenas com itens) --- */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCart(true)}
                            style={{ backgroundColor: themeColor }}
                            className="pointer-events-auto h-16 pl-6 pr-8 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-4 border-4 border-white active:scale-95 transition-all text-gray-950"
                        >
                            <div className="relative">
                                <ShoppingCart className="h-6 w-6 stroke-[3]" />
                                <span className="absolute -top-2 -right-2 bg-gray-950 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-sm">
                                    {cartCount}
                                </span>
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Finalizar pedido</span>
                                <span className="text-sm font-black tracking-tight">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                                </span>
                            </div>
                            <div className="h-8 w-8 bg-gray-950/10 rounded-full flex items-center justify-center ml-2">
                                <ChevronRight className="h-5 w-5 text-gray-950" />
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-4 pb-32">

                {/* --- FEATURED SECTION (EXCLUSIVO DA CASA) --- */}
                {!searchQuery && !selectedCategory && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center rotate-3 shadow-xl">
                                    <Flame className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                        Exclusivo da Casa
                                    </h2>
                                    <p className="text-[10px] md:text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3" /> 
                                        Os queridinhos da galera
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all cursor-pointer">
                                    <ChevronRight className="h-5 w-5 rotate-180" />
                                </div>
                                <div className="h-10 w-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all cursor-pointer">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-8 pt-2 snap-x snap-mandatory">
                            {categories?.flatMap((c: any) => c.products).filter((p: any) => p.is_featured).map((product: Product) => (
                                <motion.div 
                                    key={product.id}
                                    whileHover={{ y: -10 }}
                                    onClick={() => addToCart(product)}
                                    className="min-w-[300px] md:min-w-[400px] bg-white rounded-[48px] p-5 shadow-2xl shadow-gray-200/50 border border-gray-50 flex flex-col snap-center group cursor-pointer relative overflow-hidden"
                                >
                                    {/* Background Decor */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-50 rounded-full blur-3xl group-hover:bg-orange-100 transition-colors" />
                                    
                                    <div className="relative h-56 md:h-64 rounded-[40px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden mb-6">
                                        {product.image_url ? (
                                            <img src={product.image_url} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-7xl">🍕</div>
                                        )}
                                        
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/50">
                                                ★ Destaque
                                            </div>
                                            {product.is_new && (
                                                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-500/50">
                                                    Novo
                                                </div>
                                            )}
                                        </div>
                                        
                                        <motion.div 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="absolute bottom-4 right-4 h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/50 transition-all"
                                            style={{ background: `linear-gradient(135deg, ${themeColor} 0%, #ff6b35 100%)` }}
                                        >
                                            <Plus className="h-6 w-6 stroke-[3]" />
                                        </motion.div>
                                    </div>
                                    
                                    <div className="px-2">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h4 className="font-black text-xl md:text-2xl text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">{product.name}</h4>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xl md:text-2xl font-black text-gray-900">
                                                    R$ {Number(product.promotional_price || product.price).toFixed(2).replace('.', ',')}
                                                </span>
                                                {product.promotional_price && (
                                                    <span className="text-xs text-gray-300 line-through font-bold">R$ {Number(product.price).toFixed(0)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs md:text-sm font-medium text-gray-400 line-clamp-2 leading-relaxed mb-4">{product.description}</p>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                {[1, 2, 3, 4, 5].map(star => <Star key={star} className="h-3 w-3 fill-current" />)}
                                            </div>
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Aprovação Máxima</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}


                {/* --- CATEGORIES NAVIGATION (Vibrante - Pílulas) --- */}
                <div className="mb-8 sticky top-[68px] z-30 py-4 -mx-4 px-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-center">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 max-w-full px-4">
                        {/* Botão "Todos" */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCategory(null)}
                            className={clsx(
                                'px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-md',
                                !selectedCategory 
                                    ? 'text-white shadow-lg shadow-orange-500/30' 
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            )}
                            style={!selectedCategory ? { background: `linear-gradient(135deg, ${themeColor} 0%, #ff6b35 100%)` } : {}}
                        >
                            Todos
                        </motion.button>

                        {/* Categorias Dinâmicas */}
                        {categories?.map((cat: Category) => (
                            <motion.button
                                key={cat.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={clsx(
                                    'px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-md',
                                    selectedCategory === cat.id 
                                        ? 'text-white shadow-lg shadow-orange-500/30' 
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                )}
                                style={selectedCategory === cat.id ? { background: `linear-gradient(135deg, ${themeColor} 0%, #ff6b35 100%)` } : {}}
                            >
                                {cat.name}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* --- PRODUCTS GRID (Vibrante) --- */}
                {model === 'modern' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {filteredProducts.map((product: Product) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -8 }}
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white rounded-[28px] overflow-hidden shadow-md hover:shadow-2xl hover:shadow-orange-500/10 transition-all border border-gray-100 flex flex-col group cursor-pointer"
                            >
                                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                    {product.image_url ? (
                                        <img src={product.image_url} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-4xl">🍕</div>
                                    )}
                                    {product.promotional_price && (
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-[8px] font-black text-white px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-purple-500/50">Oferta</div>
                                    )}
                                    {product.is_new && (
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-green-400 to-emerald-500 text-[8px] font-black text-white px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-green-500/50">Novo</div>
                                    )}
                                    <motion.div 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="absolute bottom-3 right-3 h-11 w-11 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/40 z-10 transition-all"
                                        style={{ background: `linear-gradient(135deg, ${themeColor} 0%, #ff6b35 100%)` }}
                                    >
                                        <Plus className="h-6 w-6 stroke-[3]" />
                                    </motion.div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h4 className="font-black text-gray-900 text-sm md:text-base mb-1 line-clamp-1 transition-colors uppercase tracking-tight">{product.name}</h4>
                                    <p className="text-[10px] md:text-xs font-medium text-gray-400 mb-3 line-clamp-2 leading-relaxed flex-1">{product.description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex flex-col leading-none">
                                            {product.promotional_price && (
                                                <span className="text-[10px] text-gray-300 line-through font-bold">R$ {Number(product.price).toFixed(0)}</span>
                                            )}
                                            <span className="text-sm md:text-lg font-black text-gray-900">
                                                R$ {Number(product.promotional_price || product.price).toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* --- HERO SECTION (Minimalista/Luxo) --- */}
                {model === 'minimal' && !searchQuery && !selectedCategory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-16 md:py-24 border-y border-gray-100 mb-16 text-center"
                    >
                        <motion.span 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 block"
                        >
                            Desde 2024 • Excelência em Sabor
                        </motion.span>
                        <h2 className="text-5xl md:text-8xl font-serif italic text-gray-900 mb-8 tracking-tighter">
                            A arte de bem servir.
                        </h2>
                        <p className="max-w-xl mx-auto text-gray-400 text-lg font-light leading-relaxed mb-12">
                            Uma experiência gastronômica pensada nos mínimos detalhes, <br className="hidden md:block" />
                            do campo para a sua mesa, com elegância e sofisticação.
                        </p>
                        <div className="h-px w-24 bg-gray-200 mx-auto" />
                    </motion.div>
                )}

                {/* --- HERO SECTION (Visual Grid) --- */}
                {model === 'grid' && !searchQuery && !selectedCategory && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-black rounded-3xl p-8 text-white flex flex-col justify-center">
                            <h3 className="text-3xl font-black mb-2">Ofertas Relâmpago</h3>
                            <p className="text-white/60 mb-6 font-bold">Aproveite descontos de até 30% em itens selecionados.</p>
                            <button className="bg-white text-black px-6 py-3 rounded-xl font-black text-sm self-start">Ver Promoções</button>
                        </div>
                        <div className="bg-orange-500 rounded-3xl p-8 text-white flex flex-col justify-center">
                            <h3 className="text-3xl font-black mb-2">Entrega Grátis</h3>
                            <p className="text-white/60 mb-6 font-bold">Hoje o frete é por nossa conta para pedidos acima de R$ 50.</p>
                            <button className="bg-black text-white px-6 py-3 rounded-xl font-black text-sm self-start">Aproveitar agora</button>
                        </div>
                    </div>
                )}

                {/* --- CATEGORIES NAVIGATION (Minimal & Grid Variants) --- */}
                {(model === 'minimal' || model === 'grid') && (
                    <div className={clsx(
                        "mb-12 sticky top-[80px] z-30 py-4 -mx-4 px-4 backdrop-blur-md md:static md:bg-transparent md:p-0 md:border-none",
                        model === 'minimal' ? "bg-white/90 border-b border-gray-100" : "bg-gray-100/90"
                    )}>
                        <div className="flex gap-8 justify-center overflow-x-auto scrollbar-hide pb-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={clsx(
                                    'pb-2 text-xs font-black uppercase tracking-widest transition-all border-b-2',
                                    !selectedCategory ? 'text-black border-black' : 'text-gray-400 border-transparent hover:text-gray-600'
                                )}
                            >
                                Início
                            </button>
                            {categories?.map((cat: Category) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={clsx(
                                        'pb-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap',
                                        selectedCategory === cat.id ? 'text-black border-black' : 'text-gray-400 border-transparent hover:text-gray-600'
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- PRODUCTS GRID (Minimal/Luxo) --- */}
                {model === 'minimal' && (
                    <div className="max-w-4xl mx-auto space-y-24">
                        {categories?.filter(c => !selectedCategory || c.id === selectedCategory).map((cat: Category) => (
                            <div key={cat.id}>
                                <h3 className="text-2xl font-serif italic text-center mb-12 text-gray-800">{cat.name}</h3>
                                <div className="space-y-12">
                                    {cat.products.map((product: Product) => (
                                        <div key={product.id} className="flex flex-col md:flex-row gap-8 items-center group cursor-pointer">
                                            <div className="w-full md:w-32 h-32 shrink-0 rounded-full overflow-hidden bg-gray-50 border border-gray-100">
                                                {product.image_url ? (
                                                    <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-2">
                                                    <h4 className="text-xl font-medium text-gray-900">{product.name}</h4>
                                                    <div className="hidden md:block flex-1 border-b border-dotted border-gray-200 mx-4" />
                                                    <span className="text-lg font-light text-gray-900">
                                                        R$ {Number(product.promotional_price || product.price).toFixed(2).replace('.', ',')}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-light text-gray-500 leading-relaxed max-w-2xl">{product.description}</p>
                                            </div>
                                            <button 
                                                onClick={() => addToCart(product)}
                                                className="px-6 py-2 border border-gray-900 text-[10px] font-black uppercase tracking-tighter hover:bg-gray-900 hover:text-white transition-all rounded-full"
                                            >
                                                Adicionar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- PRODUCTS GRID (Visual Grid) --- */}
                {model === 'grid' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {filteredProducts.map((product: Product) => (
                            <div 
                                key={product.id}
                                className="bg-white rounded-2xl p-3 shadow-sm flex flex-col group active:scale-95 transition-transform"
                                onClick={() => addToCart(product)}
                            >
                                <div className="aspect-square rounded-xl bg-gray-50 mb-3 overflow-hidden relative">
                                    {product.image_url ? (
                                        <img src={product.image_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">🍕</div>
                                    )}
                                    {product.promotional_price && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-[9px] font-black text-white px-2 py-0.5 rounded-full uppercase">Promo</div>
                                    )}
                                </div>
                                <h4 className="text-[13px] font-black text-gray-900 truncate mb-1">{product.name}</h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-gray-900">R$ {Math.floor(Number(product.promotional_price || product.price))}</span>
                                    <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                        <Plus className="h-4 w-4 stroke-[3]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredProducts.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32"
                    >
                        <div className="text-8xl mb-6 opacity-20">🥗</div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Nada por aqui hoje</h3>
                        <p className="text-gray-400 font-medium">Tente buscar por outro item ou categoria.</p>
                        <button 
                            onClick={() => {setSearchQuery(''); setSelectedCategory(null)}}
                            className="mt-8 px-8 py-4 bg-gray-100 rounded-2xl font-black text-sm hover:bg-gray-200 transition-colors"
                        >
                            Ver Cardápio Completo
                        </button>
                    </motion.div>
                )}

            </main>

            {/* --- CART DRAWER (PREMIUM) --- */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCart(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[120] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                    Minha Sacola <span className="text-sm font-bold text-gray-400">({cartCount})</span>
                                </h2>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <div className="text-7xl mb-6">🛒</div>
                                        <p className="text-lg font-black text-gray-900">Sua sacola está vazia</p>
                                        <p className="text-sm font-medium mt-2">Adicione delícias para continuar</p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.product.id} className="flex gap-4">
                                            <div className="h-20 w-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0">
                                                {item.product.image_url ? (
                                                    <img src={item.product.image_url} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-2xl">🍔</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-gray-900 leading-tight mb-1">{item.product.name}</h4>
                                                <p className="text-sm font-black" style={{ color: themeColor }}>
                                                    R$ {Number(item.product.promotional_price || item.product.price).toFixed(2).replace('.', ',')}
                                                </p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <button 
                                                        onClick={() => updateQuantity(item.product.id, -1)}
                                                        className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-200"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.product.id, 1)}
                                                        className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-200"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Total do Pedido</span>
                                        <span className="text-3xl font-black text-gray-900">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <button 
                                        className="w-full py-5 rounded-[24px] text-white font-black text-lg shadow-2xl transition-all"
                                        style={{ backgroundColor: themeColor, boxShadow: `0 20px 50px -15px ${themeColor}60` }}
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

            {/* --- MODAL DE INFORMAÇÕES DA LOJA (Full-screen Mobile) --- */}
            <AnimatePresence>
                {showStoreInfo && (
                    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:py-8 px-0 sm:px-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowStoreInfo(false)}
                            className="absolute inset-0 bg-gray-950/40 backdrop-blur-md hidden sm:block"
                        />
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative bg-white w-full max-w-xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-[48px] shadow-2xl overflow-y-auto text-gray-900 border-gray-100 flex flex-col"
                        >
                            {/* Cabeçalho de Navegação Mobile */}
                            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center gap-4 sm:hidden">
                                <button 
                                    onClick={() => setShowStoreInfo(false)}
                                    className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-900 active:scale-90 transition-all"
                                >
                                    <ChevronRight className="h-6 w-6 rotate-180" />
                                </button>
                                <span className="font-black text-sm uppercase tracking-widest">Sobre o Estabelecimento</span>
                            </div>

                            {/* Topo Criativo - Banner Curvo */}
                            <div className="relative h-44 sm:h-52 overflow-hidden sm:rounded-b-[48px] shrink-0">
                                <img 
                                    src={store?.banner_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop"} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/10" />
                                <button 
                                    onClick={() => setShowStoreInfo(false)}
                                    className="absolute top-6 right-6 h-11 w-11 bg-white/90 backdrop-blur-sm rounded-full hidden sm:flex items-center justify-center shadow-xl hover:bg-white transition-all text-gray-900"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="px-6 md:px-10 pb-12 -mt-12 relative z-10">
                                {/* Logo e Nome Dinâmico */}
                                <div className="flex items-start gap-6 mb-8">
                                    <div className="h-28 w-28 rounded-[32px] border-[6px] border-white overflow-hidden bg-white shadow-2xl shrink-0">
                                        <img src={store?.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${store?.name || 'S'}`} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="pt-20 text-left">
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-2">
                                            {store?.name || 'Carregando...'}
                                        </h1>
                                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Aberto agora
                                        </div>
                                    </div>
                                </div>

                                {/* Layout Dinâmico */}
                                <div className="space-y-6 text-left">
                                    
                                    {/* Entrega & Tempo - Row Horizontal */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-orange-50/50 rounded-3xl border border-orange-100 flex items-center gap-4">
                                            <div className="h-10 w-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-orange-500">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-orange-600/60 uppercase tracking-widest">Tempo Médio</p>
                                                <p className="text-sm font-black text-orange-950">{store?.estimated_delivery_time || '35-50'} min</p>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4">
                                            <div className="h-10 w-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-blue-500">
                                                <Star className="h-5 w-5 fill-current" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-blue-600/60 uppercase tracking-widest">Avaliação</p>
                                                <p className="text-sm font-black text-blue-950">4.9 (500+)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Localização Interativa (Google Maps Embed se possível ou imagem dinâmica) */}
                                    <div className="p-6 bg-gray-50 rounded-[40px] border border-gray-100">
                                        <h3 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400" /> Endereço oficial
                                        </h3>
                                        <div className="flex flex-col gap-6">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-relaxed mb-4">
                                                    {store?.address || 'Endereço não informado'}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store?.address || '')}`} target="_blank" className="h-11 px-5 bg-blue-600 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                                        Abrir no Google Maps
                                                    </a>
                                                    <a href={`https://waze.com/ul?q=${encodeURIComponent(store?.address || '')}`} target="_blank" className="h-11 w-11 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-sky-500 hover:bg-sky-50 transition-all shadow-sm">
                                                        <Share2 className="h-5 w-5" />
                                                    </a>
                                                </div>
                                            </div>
                                            
                                            {/* Mapa Dinâmico do Google (Iframe) */}
                                            {store?.address && (
                                                <div className="h-48 w-full rounded-[32px] overflow-hidden border border-gray-100 shadow-md">
                                                    <iframe 
                                                        width="100%" 
                                                        height="100%" 
                                                        style={{ border: 0 }} 
                                                        loading="lazy" 
                                                        allowFullScreen 
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyA...&q=${encodeURIComponent(store.address)}`}
                                                        className="grayscale opacity-90 contrast-125"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Horários Detalhados - Maior Visibilidade */}
                                    <div className="p-8 bg-gray-50 rounded-[48px] border border-gray-100 mt-4">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="font-black text-xs md:text-sm uppercase tracking-[0.2em] flex items-center gap-3 text-gray-900">
                                                <CalendarClock className="h-5 w-5 text-orange-500" /> 
                                                Horários da Semana
                                            </h3>
                                            <div className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-200">
                                                Aberto
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-y-2.5">
                                            {(store?.opening_hours || 'SEG À SEX: 18:00 - 23:30').split(',').map((item: string, i: number) => {
                                                const parts = item.split(':');
                                                const day = parts[0];
                                                const time = parts.slice(1).join(':');
                                                return (
                                                    <div key={i} className="flex items-center justify-between py-3.5 px-6 bg-white rounded-2xl text-[11px] font-bold shadow-sm border border-gray-100 hover:border-orange-200 transition-all">
                                                        <span className="text-gray-500 uppercase tracking-widest">{day}</span>
                                                        <span className="text-gray-950 font-black">{time}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Pagamentos Dinâmicos */}
                                    <div className="p-8 bg-black rounded-[48px] text-white shadow-2xl shadow-gray-200 border-2 border-white/5">
                                        <h3 className="font-black text-xs md:text-sm uppercase tracking-[0.2em] mb-8 text-white text-center flex items-center justify-center gap-3">
                                            <ShieldCheck className="h-5 w-5 text-orange-400" />
                                            Pagamentos na Entrega
                                        </h3>
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map(p => (
                                                <span key={p} className="px-6 py-3.5 bg-white/10 rounded-[22px] text-[10px] font-black border border-white/10 hover:bg-white hover:text-black transition-all cursor-default shadow-sm">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rodapé Interno com Dados Dinâmicos */}
                                    <div className="pt-8 text-center px-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-relaxed">
                                            {store?.name || 'ESTABELECIMENTO'}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                                            CNPJ: {store?.document || '00.000.000/0000-00'}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1">
                                            {store?.address}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- FOOTER SIMPLIFICADO CENTRALIZADO --- */}
            <footer className="bg-white border-t border-gray-100 pt-16 pb-12">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col items-center justify-center text-center gap-10">
                        {/* Logo e Marca */}
                        <div className="flex flex-col items-center gap-4">
                            <h4 className="font-black text-3xl text-gray-900 uppercase tracking-tighter">
                                {store?.name || 'Ouro Gastronomia'}
                            </h4>
                            <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">
                                © 2026 • <span className="text-gray-900">ÓoDelivery</span>
                            </p>
                        </div>

                        {/* Segurança e Redes Sociais */}
                        <div className="flex flex-col items-center gap-8">
                            <div className="flex items-center gap-3 bg-gray-50 px-8 py-5 rounded-[32px] border border-gray-100 shadow-sm">
                                <ShieldCheck className="h-8 w-8 text-green-600" />
                                <div className="flex flex-col text-left">
                                    <span className="font-black text-[11px] text-gray-900 uppercase tracking-widest leading-none">Pagamento Seguro</span>
                                    <span className="text-[10px] font-bold text-gray-900 mt-1 uppercase">SSL Encriptado de Ponta a Ponta</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 hover:bg-black hover:text-white transition-all shadow-sm">
                                    <Instagram className="h-6 w-6" />
                                </button>
                                <button className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 hover:bg-black hover:text-white transition-all shadow-sm">
                                    <Share2 className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Float Menu Icon for Mobile */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden">
                <button className="bg-black text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 whitespace-nowrap">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    Menu Demo Activo
                </button>
            </div>
        </div>
    );
}
