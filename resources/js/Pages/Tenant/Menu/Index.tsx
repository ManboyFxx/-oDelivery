import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAudio } from '@/Hooks/useAudio';
import { usePushNotifications } from '@/Hooks/usePushNotifications';
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
import ProductCard from './Components/ProductCard';
import FeaturedProductCard from './Components/FeaturedProductCard';

interface PageProps {
    store: any;
    categories: Category[];
    slug: string;
    authCustomer: Customer | null;
    activePromotion?: any;
    availableCoupons?: any[];
}

export default function PublicMenu({ store, categories, slug, authCustomer, activePromotion, availableCoupons }: PageProps) {
    // Initialize Push Notifications
    usePushNotifications(authCustomer);

    // --- State ---
    const [isInitialLoading, setIsInitialLoading] = useState(true);
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
        
        // Premium UI Loading Effect
        const timer = setTimeout(() => setIsInitialLoading(false), 800);
        return () => clearTimeout(timer);
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
        if (!store.is_open) {
            toast.error('Desculpe, a loja está fechada no momento.');
            return;
        }
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
        if (!store.is_open) {
            toast.error('Desculpe, a loja está fechada para novos pedidos.');
            return;
        }

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
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isDark={isDark}
                toggleTheme={toggleTheme}
            />

            {/* Featured Products Section */}
            {!searchQuery && activeCategory === 'all' && categories.some((c: Category) => c.products.some((p: Product) => p.is_featured)) && (
                <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                    <div className="mb-6 flex flex-col items-center">
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center rotate-3 shadow-lg">
                                <Flame className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight text-center">
                                    Melhores da casa
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-10">
                            {categories
                                .flatMap((c: Category) => c.products)
                                .filter((p: Product) => p.is_featured)
                                .map((product: Product) => (
                                    <FeaturedProductCard
                                        key={product.id}
                                        product={product}
                                        onAdd={handleProductAdd}
                                        isStoreOpen={store.is_open}
                                    />
                                ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Navigation */}
            <CategoryNav
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={handleCategorySelect}
            />

            {!store.is_open && (
                <div className="max-w-7xl mx-auto px-4 mt-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4 flex items-center justify-center gap-3 text-red-600 dark:text-red-400">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-bold text-sm md:text-base">
                            Loja Fechada. Pedidos temporariamente indisponíveis.
                        </span>
                    </div>
                </div>
            )}

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
                            isStoreOpen={store.is_open}
                            isLoading={isInitialLoading}
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


