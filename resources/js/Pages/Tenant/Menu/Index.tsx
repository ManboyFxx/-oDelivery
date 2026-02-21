import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAudio } from '@/Hooks/useAudio';
import { toast } from 'sonner';
import axios from 'axios';
import { Loader2, Search, Sun, Moon, LayoutGrid, List, Star, Flame, Plus } from 'lucide-react';
import clsx from 'clsx';

import { Category, Product, Customer } from './Components/types';
import { adjustColor } from '@/Utils/colors';
import HeroSection from './Components/HeroSection';
import CategoryNav from './Components/CategoryNav';
import ProductGrid from './Components/ProductGrid';
import CartFloatingButton from './Components/CartFloatingButton';
import CartSidebar from './Components/CartSidebar';
import StoreInfoModal from './Components/StoreInfoModal';
import ProductModal from './Components/ProductModal';
import AuthModal from './Components/AuthModal';
import CustomerAreaModal from './Components/CustomerAreaModal';
import CheckoutModal from './CheckoutModal';
import MenuNavbar from './Components/MenuNavbar';

interface PageProps {
    store: any;
    categories: Category[];
    slug: string;
    authCustomer: Customer | null;
    activePromotion?: any;
    availableCoupons?: any[];
}

export default function PublicMenu({ store, categories, slug, authCustomer, activePromotion, availableCoupons }: PageProps) {
    // --- State ---
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    // const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Replaced by store setting

    // Modals
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
    const [initialProductValues, setInitialProductValues] = useState<any>(null);

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showStoreInfo, setShowStoreInfo] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    // 🎁 Capture Referral Code
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const refCode = params.get('ref');
            if (refCode) {
                localStorage.setItem('referral_code', refCode);
                // Optional: clear from URL for cleaner look
                // const newUrl = window.location.pathname;
                // window.history.replaceState({}, '', newUrl);
            }
        }
    }, []);

    // Auth
    const [customer, setCustomer] = useState<Customer | null>(authCustomer);
    const [addresses, setAddresses] = useState<any[]>([]);

    // Dark mode toggle
    const [isDark, setIsDark] = useState<boolean>(() => {
        const saved = localStorage.getItem('menu_theme');
        if (saved) return saved === 'dark';
        if (store.theme_mode === 'dark') return true;
        if (store.theme_mode === 'light') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const toggleTheme = () => {
        setIsDark(prev => {
            const next = !prev;
            localStorage.setItem('menu_theme', next ? 'dark' : 'light');
            return next;
        });
    };

    const loadAddresses = async () => {
        if (!customer) return;
        try {
            const response = await axios.get('/customer/addresses');
            setAddresses(response.data);
        } catch (error) {
            console.error('Error loading addresses:', error);
        }
    };

    useEffect(() => {
        if (customer) {
            loadAddresses();
        } else {
            setAddresses([]);
        }
    }, [customer]);

    // Audio
    const { play, initializeAudio } = useAudio();

    // --- Effects ---

    // Initialize audio
    useEffect(() => {
        const handleInteraction = () => initializeAudio();
        window.addEventListener('click', handleInteraction, { once: true });
        window.addEventListener('touchstart', handleInteraction, { once: true });
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, [initializeAudio]);

    // Load Cart
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error parsing cart", e);
            }
        }
    }, []);

    // Save Cart
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Theme Logic
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]);

    // Scroll Spy for Category Nav
    useEffect(() => {
        const handleScroll = () => {
            // Find which category is in view
            // This is a simple implementation, can be optimized
            // We want to find the first category that is near the top
            /* 
               Optional: Implement intersection observer or scroll position check 
               to update activeCategory automatically while scrolling.
               For now, we rely on manual click in CategoryNav or sticky behavior.
               If user wants automatic highlight, we can add it later.
            */
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [categories]);

    // --- Handlers ---

    const handleCategorySelect = (id: string) => {
        setActiveCategory(id);
        if (id !== 'all') {
            const el = document.getElementById(id);
            if (el) {
                const navHeight = 120; // Approx nav height
                const y = el.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleProductAdd = (product: Product) => {
        setSelectedProduct(product);
        setInitialProductValues(null);
        setEditingCartIndex(null);
        setIsProductModalOpen(true);
    };

    const handleAddToCartConfirm = (item: any) => {
        if (editingCartIndex !== null) {
            setCart(prev => prev.map((cItem, i) => i === editingCartIndex ? item : cItem));
            toast.success('Item atualizado com sucesso!');
        } else {
            setCart(prev => [...prev, item]);
            toast.success('Adicionado ao carrinho!');
            play('success');
        }
        setIsProductModalOpen(false);
    };

    const handleEditCartItem = (index: number) => {
        const item = cart[index];
        setSelectedProduct(item.product);
        setInitialProductValues(item);
        setEditingCartIndex(index);
        setIsProductModalOpen(true);
        setIsCartOpen(false); // Close cart sidebar to focus on modal
    };

    const handleRemoveCartItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
        toast.info('Item removido do carrinho.');
    };

    const handleCheckout = () => {
        if (!customer) {
            toast.info('Para finalizar, indentifique-se primeiro.');
            setIsAuthModalOpen(true);
            setIsCartOpen(false);
            return;
        }

        setIsCheckoutModalOpen(true);
        setIsCartOpen(false);
    };

    // We need state for checkout modal
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const handleLogin = (cust: Customer) => {
        setCustomer(cust);
    };

    const handleLogout = async () => {
        try {
            await axios.post('/customer/logout');
            setCustomer(null);
            toast.info('Você saiu da conta.');
            setIsCustomerModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleUpdateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCart(prev => prev.map((item, i) => {
            if (i === index) {
                const unitPrice = item.subtotal / item.quantity;
                return { ...item, quantity: newQuantity, subtotal: unitPrice * newQuantity };
            }
            return item;
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-premium-dark text-gray-900 dark:text-gray-100 font-sans selection:bg-orange-100 selection:text-orange-900 pb-40 md:pb-40 transition-colors duration-300">
            <Head title={store.name}>
                <style>{`
                    :root {
                        --primary-color: ${store.theme_color || '#ff3d03'};
                        --primary-hover: ${adjustColor(store.theme_color || '#ff3d03', -10)};
                        --primary-active: ${adjustColor(store.theme_color || '#ff3d03', -20)};
                    }
                `}</style>
            </Head>

            {/* Hero Section */}
            <HeroSection
                store={store}
                customer={customer}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onOpenProfile={() => setIsCustomerModalOpen(true)}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenInfo={() => setShowStoreInfo(true)}
                cartCount={cartCount}
            />

            {/* Featured Products Section */}
            {!searchQuery && activeCategory === 'all' && categories.some((c: Category) => c.products.some((p: Product) => p.is_featured)) && (
                <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                    <div className="mb-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center rotate-3 shadow-xl">
                                <Flame className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    Destaques da Casa
                                </h2>
                                <p className="text-[10px] md:text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mt-1">
                                    Os favoritos dos clientes
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6 mt-6">
                            {categories
                                .flatMap((c: Category) => c.products)
                                .filter((p: Product) => p.is_featured)
                                .map((product: Product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => handleProductAdd(product)}
                                        className="group bg-gray-100 dark:bg-white/5 rounded-[24px] border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col h-full p-3 md:p-4 gap-4"
                                    >
                                        {/* Badge de Destaque */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/50 flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-current" /> Destaque
                                            </div>
                                        </div>

                                        {/* Image */}
                                        <div className="shrink-0 relative w-full aspect-square rounded-[20px] overflow-hidden bg-gray-50 dark:bg-white/5">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-4xl">🍕</div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col flex-1 justify-between h-full">
                                            <div>
                                                <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white leading-tight mb-1 transition-colors duration-300 line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300 leading-relaxed line-clamp-2">
                                                    {product.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex flex-col">
                                                    {product.promotional_price && product.promotional_price < product.price ? (
                                                        <>
                                                            <span className="text-xs text-gray-400 line-through">
                                                                R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                                            </span>
                                                            <span className="text-base md:text-lg font-black text-green-500">
                                                                R$ {Number(product.promotional_price).toFixed(2).replace('.', ',')}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-base md:text-lg font-black text-gray-900 dark:text-white">
                                                            R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg shadow-primary/40"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleProductAdd(product);
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Sticky Search Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-premium-dark/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-center gap-6">
                    <div className="flex-1 max-w-2xl">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input
                                type="text"
                                placeholder="O que vamos pedir agora?"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50/50 dark:bg-white/5 border border-transparent rounded-xl py-2.5 pl-11 pr-4 focus:ring-0 focus:border-gray-200 dark:focus:border-white/10 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium text-sm text-gray-900 dark:text-white placeholder:text-gray-950 dark:placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                    
                    {/* View Mode Toggle Removed - Controlled by Admin */ }
                    {/*
                    <div className="hidden md:flex bg-gray-100 dark:bg-white/10 rounded-xl p-1 gap-1">
                       ...
                    </div>
                    */}

                    <button
                        onClick={toggleTheme}
                        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                        className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 active:scale-90 transition-all shrink-0"
                    >
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                </div>
            </header>

            {/* Navigation */}
            <CategoryNav
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={handleCategorySelect}
            />

            {/* Main Content */}
            <main>
                <div className="flex flex-col md:flex-row max-w-7xl mx-auto items-start gap-6">
                    {/* Products Column */}
                    <div className="flex-1 w-full">
                        <ProductGrid
                            categories={categories.map(cat => ({
                                ...cat,
                                products: cat.products.filter(p => 
                                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                                    (activeCategory === 'all' || cat.id === activeCategory)
                                )
                            })).filter(cat => cat.products.length > 0)}
                            onAdd={handleProductAdd}
                            viewMode={store.menu_view_mode || 'grid'}
                        />
                    </div>
                </div>
            </main>

            {/* Cart Elements */}
            {/* CartFloatingButton agora integrado no MenuNavbar */}
            {/* <CartFloatingButton
                itemCount={cartCount}
                total={cartTotal}
                onClick={() => setIsCartOpen(true)}
            /> */}

            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onEdit={handleEditCartItem}
                onRemove={handleRemoveCartItem}
                onCheckout={handleCheckout}
            />

            {/* Store Information Modal */}
            <StoreInfoModal 
                isOpen={showStoreInfo} 
                onClose={() => setShowStoreInfo(false)} 
                store={store} 
            />

            {/* Modals */}
            {isProductModalOpen && (
                <ProductModal
                    product={selectedProduct}
                    isOpen={isProductModalOpen}
                    onClose={() => setIsProductModalOpen(false)}
                    onAddToCart={handleAddToCartConfirm}
                    initialValues={initialProductValues}
                />
            )}

            {isAuthModalOpen && (
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                    onLogin={handleLogin}
                    slug={slug}
                />
            )}

            {isCustomerModalOpen && (
                <CustomerAreaModal
                    isOpen={isCustomerModalOpen}
                    onClose={() => setIsCustomerModalOpen(false)}
                    customer={customer!}
                    onLogout={handleLogout}
                    store={store}
                />
            )}

            {isCheckoutModalOpen && (
                <CheckoutModal
                    show={isCheckoutModalOpen}
                    onClose={() => setIsCheckoutModalOpen(false)}
                    cart={cart}
                    customer={customer}
                    store={store}
                    total={cartTotal}
                    addresses={addresses}
                    onSuccess={() => {
                        setCart([]);
                        setIsCheckoutModalOpen(false);
                    }}
                />
            )}

             {/* Customer Floating Button (if logged in and not in cart) */}
             {customer && !isCartOpen && !isCustomerModalOpen && (
                 <div className="fixed top-4 right-4 z-40 hidden md:block">
                     <button
                         onClick={() => setIsCustomerModalOpen(true)}
                         className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                     >
                         <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                             {customer.name.substring(0, 2)}
                         </div>
                         <span className="font-bold text-gray-700 text-sm">{customer.name.split(' ')[0]}</span>
                     </button>
                 </div>
             )}

             {/* Bottom Navigation Navbar */}
             <MenuNavbar 
                 customer={customer}
                 cartCount={cartCount}
                 onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                 onAccount={() => {
                     if (customer) setIsCustomerModalOpen(true);
                     else setIsAuthModalOpen(true);
                 }}
                 onStore={() => setShowStoreInfo(true)}
                 onCart={() => setIsCartOpen(true)}
                 activeTab={isCartOpen ? 'cart' : isCustomerModalOpen || isAuthModalOpen ? 'account' : showStoreInfo ? 'store' : 'home'}
             />
         </div>
     );
 }


