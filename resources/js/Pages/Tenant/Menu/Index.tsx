import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAudio } from '@/Hooks/useAudio';
import { toast } from 'sonner';
import axios from 'axios';
import { Loader2, Search } from 'lucide-react';
import clsx from 'clsx';

import { Category, Product, Customer } from './Components/types';
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

    // Modals
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
    const [initialProductValues, setInitialProductValues] = useState<any>(null);

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showStoreInfo, setShowStoreInfo] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    // Auth
    const [customer, setCustomer] = useState<Customer | null>(authCustomer);
    const [addresses, setAddresses] = useState<any[]>([]);

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
        const theme = store.theme_mode || 'auto'; // 'light', 'dark', 'auto'

        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            // System preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [store.theme_mode]);

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
        <div className="min-h-screen bg-gray-50 dark:bg-premium-dark text-gray-900 dark:text-gray-100 font-sans selection:bg-orange-100 selection:text-orange-900 pb-24 md:pb-0 transition-colors duration-300">
            <Head title={store.name} />

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
                        />
                    </div>
                </div>
            </main>

            {/* Cart Elements */}
            <CartFloatingButton
                itemCount={cartCount}
                total={cartTotal}
                onClick={() => setIsCartOpen(true)}
            />

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
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#ff3d03] font-bold text-xs uppercase">
                            {customer.name.substring(0, 2)}
                        </div>
                        <span className="font-bold text-gray-700 text-sm">{customer.name.split(' ')[0]}</span>
                    </button>
                </div>
            )}
            {/* Mobile Customer Button in Hero is handled, or distinct button? 
                 Hero has "Loyalty Card" which opens customer area.
             */}
        </div>
    );
}


