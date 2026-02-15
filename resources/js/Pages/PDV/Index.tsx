import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Add router
import { Search, ShoppingCart, Trash2, CreditCard, Banknote, QrCode, User, Plus, Minus, X, LayoutGrid, Users, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import CustomerCombobox from '@/Components/CustomerCombobox'; // New Import

interface ComplementOption {
    id: string;
    name: string;
    price: number;
    is_available: boolean;
    max_quantity?: number;
}

interface ComplementGroup {
    id: string;
    name: string;
    min_selections: number;
    max_selections: number;
    is_required: boolean;
    options: ComplementOption[];
}

interface Product {
    id: string;
    name: string;
    description?: string;
    price: string;
    image_url?: string;
    category_id?: string;
    complement_groups?: ComplementGroup[];
}

interface Category {
    id: string;
    name: string;
    products?: Product[];
}

interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'free' | 'occupied' | 'reserved';
    current_order_id?: string;
    current_order?: {
        id: string;
        customer_name: string;
        total: number;
        items: any[];
        customer?: Customer;
    };
}

interface CartItem extends Product {
    quantity: number;
    notes?: string;
    selectedComplements?: { groupId: string; optionId: string; name: string; price: number; quantity: number }[];
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    loyalty_points?: number;
}

export default function PDV({ categories, allProducts, tables = [], customers = [] }: { categories: Category[], allProducts: Product[], tables: Table[], customers: Customer[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'sales' | 'tables'>('sales');
    const [targetTable, setTargetTable] = useState<Table | null>(null);

    // Product Modal State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productQuantity, setProductQuantity] = useState(1);
    const [productNotes, setProductNotes] = useState('');
    const [selectedComplements, setSelectedComplements] = useState<{ [groupId: string]: { [optionId: string]: number } }>({});

    // Modals
    const [tableToOpen, setTableToOpen] = useState<Table | null>(null);
    const [tableDetails, setTableDetails] = useState<Table | null>(null);
    const [paymentMethodForClose, setPaymentMethodForClose] = useState('cash');
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false); // New state for mobile cart drawer


    // Table Form
    const { data: tableData, setData: setTableData, post: postTable, processing: processingTable, reset: resetTable } = useForm({
        number: '',
        capacity: '4',
    });

    const submitTable = (e: React.FormEvent) => {
        e.preventDefault();
        postTable(route('tables.store'), {
            onSuccess: () => {
                setIsTableModalOpen(false);
                resetTable();
            }
        });
    };

    // Checkout Form State
    const { data, setData, post, processing, reset, errors } = useForm({
        items: [] as any[],
        customer_name: '',
        customer_id: '' as string | null, // New field
        payment_method: 'cash',
        order_mode: 'pickup', // Default
        total: 0,
    });

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const openProductModal = (product: Product) => {
        setSelectedProduct(product);
        setProductQuantity(1);
        setProductNotes('');
        setSelectedComplements({});
    };

    const closeProductModal = () => {
        setSelectedProduct(null);
        setProductQuantity(1);
        setProductNotes('');
        setSelectedComplements({});
    };

    const addToCart = (product: Product) => {
        // If product has complements, open modal
        if (product.complement_groups && product.complement_groups.length > 0) {
            openProductModal(product);
            return;
        }

        // Simple product - add directly
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && !item.selectedComplements);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id && !item.selectedComplements
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const addToCartFromModal = () => {
        if (!selectedProduct) return;

        // Convert selectedComplements to array format
        const complementsArray: { groupId: string; optionId: string; name: string; price: number; quantity: number }[] = [];
        Object.entries(selectedComplements).forEach(([groupId, options]) => {
            Object.entries(options).forEach(([optionId, qty]) => {
                const group = selectedProduct.complement_groups?.find(g => g.id === groupId);
                const option = group?.options.find(o => o.id === optionId);
                if (option && qty > 0) {
                    complementsArray.push({
                        groupId,
                        optionId,
                        name: option.name,
                        price: option.price,
                        quantity: qty
                    });
                }
            });
        });

        setCart(prev => [
            ...prev,
            {
                ...selectedProduct,
                quantity: productQuantity,
                notes: productNotes,
                selectedComplements: complementsArray.length > 0 ? complementsArray : undefined
            }
        ]);

        closeProductModal();
    };

    // Complement Selection Functions
    const updateComplementQuantity = (groupId: string, optionId: string, delta: number, maxQuantity: number, maxSelections: number) => {
        setSelectedComplements(prev => {
            const groupSelections = prev[groupId] || {};
            const currentQty = groupSelections[optionId] || 0;
            const newQty = Math.max(0, Math.min(currentQty + delta, maxQuantity));

            const totalItems = Object.values(groupSelections).reduce((sum: number, qty: number) => sum + qty, 0);
            const newTotal = totalItems - currentQty + newQty;

            if (newTotal > maxSelections) {
                return prev;
            }

            const newGroupSelections = { ...groupSelections };
            if (newQty === 0) {
                delete newGroupSelections[optionId];
            } else {
                newGroupSelections[optionId] = newQty;
            }

            return { ...prev, [groupId]: newGroupSelections };
        });
    };

    const getTotalSelected = (groupId: string): number => {
        const groupSelections = selectedComplements[groupId] || {};
        return Object.values(groupSelections).reduce((sum: number, qty: number) => sum + qty, 0);
    };

    const validateComplements = (): { valid: boolean; message: string } => {
        if (!selectedProduct?.complement_groups) return { valid: true, message: '' };

        for (const group of selectedProduct.complement_groups) {
            const totalSelected = getTotalSelected(group.id);

            if (group.is_required && totalSelected === 0) {
                return {
                    valid: false,
                    message: `"${group.name}" é obrigatório. Selecione pelo menos ${group.min_selections} opção(ões).`
                };
            }

            if (totalSelected > 0 && totalSelected < group.min_selections) {
                return {
                    valid: false,
                    message: `Selecione pelo menos ${group.min_selections} opção(ões) em "${group.name}".`
                };
            }

            if (totalSelected > group.max_selections) {
                return {
                    valid: false,
                    message: `Selecione no máximo ${group.max_selections} opção(ões) em "${group.name}".`
                };
            }
        }

        return { valid: true, message: '' };
    };

    const calculateProductTotal = () => {
        if (!selectedProduct) return 0;
        let total = Number(selectedProduct.price);

        selectedProduct.complement_groups?.forEach(group => {
            const groupSelections = selectedComplements[group.id] || {};
            Object.entries(groupSelections).forEach(([optionId, qty]) => {
                const option = group.options.find(o => o.id === optionId);
                if (option) total += option.price * qty;
            });
        });

        return total * productQuantity;
    };


    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => {
            let itemTotal = Number(item.price) * item.quantity;
            if (item.selectedComplements) {
                const complementsTotal = item.selectedComplements.reduce((sum, comp) =>
                    sum + (comp.price * comp.quantity), 0
                );
                itemTotal += complementsTotal * item.quantity;
            }
            return total + itemTotal;
        }, 0);
    }, [cart]);

    const filteredProducts = useMemo(() => {
        let products = selectedCategory === 'all' ? allProducts : (categories.find(c => c.id === selectedCategory)?.products || []);

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(lowerQuery));
        }
        return products;
    }, [allProducts, categories, selectedCategory, searchQuery]);

    const handleCheckout = () => {
        if (cart.length === 0) return;

        setData({
            ...data,
            items: cart.map(i => ({
                id: i.id,
                quantity: i.quantity,
                notes: i.notes,
                complements: i.selectedComplements
            })),
            total: cartTotal
        });
        setIsCheckoutModalOpen(true);
    };

    const submitOrder = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (targetTable) {
            // Adding items to table
            router.post(route('tables.addItems', targetTable.id), {
                items: cart.map(i => ({
                    id: i.id,
                    quantity: i.quantity,
                    notes: i.notes,
                    complements: i.selectedComplements
                })),
            }, {
                onSuccess: () => {
                    setCart([]);
                    setTargetTable(null); // Return to normal mode? Or stay? Let's return to tables view maybe
                    setViewMode('tables');
                }
            });
            return;
        }

        post(route('pdv.store'), {
            onSuccess: () => {
                setIsCheckoutModalOpen(false);
                setCart([]);
                reset();
                setSelectedCustomer(null);
            }
        });
    };

    const handleOpenTable = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tableToOpen) return;

        router.post(route('tables.open', tableToOpen.id), {
            customer_id: selectedCustomer?.id,
            customer_name: selectedCustomer?.name
        }, {
            onSuccess: () => {
                setTableToOpen(null);
                setSelectedCustomer(null);
            }
        });
    };

    const handleCloseTable = () => {
        if (!tableDetails) return;
        if (confirm(`Fechar conta da mesa ${tableDetails.number}?`)) {
            router.post(route('tables.close', tableDetails.id), {
                payment_method: paymentMethodForClose
            }, {
                onSuccess: () => setTableDetails(null)
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="PDV" />

            <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-gray-50 dark:bg-[#0f1012]">
                {/* Header & Tabs */}
                <div className="bg-white dark:bg-[#1a1b1e] border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-20">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight hidden md:block">PDV <span className="text-[#ff3d03]">.</span></h1>

                        {/* Segmented Control */}
                        <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('sales')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all",
                                    viewMode === 'sales'
                                        ? "bg-white dark:bg-[#ff3d03] text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                )}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Caixa
                            </button>
                            <button
                                onClick={() => setViewMode('tables')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all",
                                    viewMode === 'tables'
                                        ? "bg-white dark:bg-[#ff3d03] text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                )}
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Mesas
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Optional Right Side Stats or Clock could go here */}
                    </div>
                </div>

                {viewMode === 'sales' ? (
                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Side: Products */}
                        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0f1012]">
                            {/* Top Bar: Search & Categories */}
                            <div className="p-4 bg-white dark:bg-[#1a1b1e] border-b border-gray-100 dark:border-white/5 space-y-4 shadow-sm z-10">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar produto por nome ou código..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 rounded-2xl border-none bg-gray-100 dark:bg-black/20 py-3 pl-12 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#ff3d03]/20 dark:text-white transition-all shadow-inner"
                                    />
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={clsx(
                                            "whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition-all shadow-sm",
                                            selectedCategory === 'all'
                                                ? "bg-[#ff3d03] text-white shadow-[#ff3d03]/20"
                                                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                                        )}
                                    >
                                        Todos
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={clsx(
                                                "whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition-all shadow-sm",
                                                selectedCategory === cat.id
                                                    ? "bg-[#ff3d03] text-white shadow-[#ff3d03]/20"
                                                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                                            )}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredProducts.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="cursor-pointer group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#1a1b1e] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-white/5"
                                        >
                                            <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-gray-300 dark:text-white/10">
                                                        <ImageIcon className="h-8 w-8" />
                                                    </div>
                                                )}
                                                {/* Add Overlay */}
                                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                                                    <div className="bg-[#ff3d03] text-white p-1.5 rounded-full shadow-lg">
                                                        <Plus className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 flex flex-col flex-1">
                                                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 dark:text-white leading-tight mb-2 min-h-[2.5rem]">
                                                    {product.name}
                                                </h3>
                                                <div className="mt-auto pt-2 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">
                                                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                                    </span>
                                                    {product.complement_groups && product.complement_groups.length > 0 && (
                                                        <div className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                                            Opções
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Cart - Hidden on Mobile */}
                        <div className={clsx("hidden lg:flex w-[400px] flex-col bg-white border-l border-gray-200 dark:bg-[#1a1b1e] dark:border-white/5 z-30 shadow-2xl transition-all relative", targetTable && "border-2 border-blue-500/50")}>
                            {/* Cart Header */}
                            <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#1a1b1e]">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#ff3d03]/10 flex items-center justify-center text-[#ff3d03]">
                                        <ShoppingCart className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                                            {targetTable ? `Mesa ${targetTable.number}` : "Nova Venda"}
                                        </h2>
                                        <p className="text-xs text-gray-400 font-medium">{cart.length} itens no pedido</p>
                                    </div>
                                </div>
                                {targetTable && (
                                    <button onClick={() => { setTargetTable(null); setCart([]); }} className="text-xs text-red-500 hover:text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                                        Sair da Mesa
                                    </button>
                                )}
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#0f1012] custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 opacity-60">
                                        <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                        <p className="text-sm font-medium">Seu carrinho está vazio</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="relative group bg-white dark:bg-[#1a1b1e] p-3 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-[#ff3d03]/30 transition-colors shadow-sm">
                                            <div className="flex gap-3">
                                                {/* Image Tiny */}
                                                <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-white/5 flex-shrink-0 overflow-hidden">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-6">
                                                            {item.name}
                                                        </h4>
                                                        <button onClick={() => removeFromCart(item.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors">
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-between items-end mt-1">
                                                        <p className="text-xs font-medium text-[#ff3d03]">
                                                            R$ {Number(item.price).toFixed(2).replace('.', ',')}
                                                        </p>

                                                        {/* Qty Control */}
                                                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 rounded-lg p-1">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 shadow-sm transition-all"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="text-xs font-bold w-6 text-center tabular-nums dark:text-white">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 shadow-sm transition-all"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {item.notes && (
                                                <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 dark:bg-black/20 p-1.5 rounded border border-dashed border-gray-200 dark:border-white/10">
                                                    Note: {item.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer / Total */}
                            <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a1b1e] space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
                                        <span className="font-bold text-gray-900 dark:text-white">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black text-gray-900 dark:text-white">Total</span>
                                        <span className="text-2xl font-black text-[#ff3d03]">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={targetTable ? submitOrder : handleCheckout}
                                    disabled={cart.length === 0}
                                    className="w-full h-14 flex items-center justify-center gap-2 bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold text-base uppercase tracking-wide rounded-2xl shadow-lg shadow-[#ff3d03]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-[0.98]"
                                >
                                    <Check className="h-5 w-5" />
                                    {targetTable ? "Enviar p/ Mesa" : "Receber / Finalizar"}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Floating Cart Button */}
                        <button
                            onClick={() => setIsMobileCartOpen(true)}
                            className="lg:hidden fixed bottom-6 right-6 z-40 h-16 w-16 bg-[#ff3d03] hover:bg-[#e63700] text-white rounded-full shadow-2xl shadow-[#ff3d03]/40 flex items-center justify-center transition-all active:scale-95"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-6 w-6 bg-white text-[#ff3d03] rounded-full flex items-center justify-center text-xs font-black border-2 border-[#ff3d03]">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {/* Mobile Cart Drawer */}
                        {isMobileCartOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-fade-in"
                                    onClick={() => setIsMobileCartOpen(false)}
                                />

                                {/* Drawer */}
                                <div className="lg:hidden fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-[#1a1b1e] z-50 shadow-2xl flex flex-col animate-slide-left">
                                    {/* Cart Header */}
                                    <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#1a1b1e]">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-[#ff3d03]/10 flex items-center justify-center text-[#ff3d03]">
                                                <ShoppingCart className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                                                    {targetTable ? `Mesa ${targetTable.number}` : "Nova Venda"}
                                                </h2>
                                                <p className="text-xs text-gray-400 font-medium">{cart.length} itens no pedido</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsMobileCartOpen(false)}
                                            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Cart Items */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#0f1012]">
                                        {cart.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 opacity-60">
                                                <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                <p className="text-sm font-medium">Seu carrinho está vazio</p>
                                            </div>
                                        ) : (
                                            cart.map(item => (
                                                <div key={item.id} className="relative group bg-white dark:bg-[#1a1b1e] p-3 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-[#ff3d03]/30 transition-colors shadow-sm">
                                                    <div className="flex gap-3">
                                                        <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-white/5 flex-shrink-0 overflow-hidden">
                                                            {item.image_url ? (
                                                                <img src={item.image_url} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                                    <ImageIcon className="h-6 w-6" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-6">
                                                                    {item.name}
                                                                </h4>
                                                                <button onClick={() => removeFromCart(item.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors">
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>

                                                            <div className="flex justify-between items-end mt-1">
                                                                <p className="text-xs font-medium text-[#ff3d03]">
                                                                    R$ {Number(item.price).toFixed(2).replace('.', ',')}
                                                                </p>

                                                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 rounded-lg p-1">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, -1)}
                                                                        className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 shadow-sm transition-all"
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </button>
                                                                    <span className="text-xs font-bold w-6 text-center tabular-nums dark:text-white">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, 1)}
                                                                        className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 shadow-sm transition-all"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {item.notes && (
                                                        <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 dark:bg-black/20 p-1.5 rounded border border-dashed border-gray-200 dark:border-white/10">
                                                            Note: {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Footer / Total */}
                                    <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a1b1e] space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
                                                <span className="font-bold text-gray-900 dark:text-white">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-black text-gray-900 dark:text-white">Total</span>
                                                <span className="text-2xl font-black text-[#ff3d03]">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setIsMobileCartOpen(false);
                                                if (targetTable) {
                                                    submitOrder();
                                                } else {
                                                    handleCheckout();
                                                }
                                            }}
                                            disabled={cart.length === 0}
                                            className="w-full h-14 flex items-center justify-center gap-2 bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold text-base uppercase tracking-wide rounded-2xl shadow-lg shadow-[#ff3d03]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-[0.98]"
                                        >
                                            <Check className="h-5 w-5" />
                                            {targetTable ? "Enviar p/ Mesa" : "Receber / Finalizar"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0f1012]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Mapa de Mesas</h2>
                                <p className="text-sm text-gray-500 mt-1">Gerencie a ocupação e pedidos das mesas.</p>
                            </div>
                            <button
                                onClick={() => setIsTableModalOpen(true)}
                                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 shadow-lg"
                            >
                                <Plus className="h-4 w-4" /> Nova Mesa
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {tables.map((table) => (
                                <div
                                    key={table.id}
                                    className={`relative p-8 rounded-[24px] border flex flex-col items-center justify-center min-h-[180px] transition-all duration-300 group shadow-sm hover:shadow-2xl ${table.status === 'free'
                                        ? 'bg-light-card dark:bg-[#1a1b1e] border-gray-100 dark:border-white/5 hover:border-green-400/50'
                                        : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 hover:border-red-400/50'
                                        }`}
                                >
                                    <button
                                        onClick={() => {
                                            if (table.status === 'free') {
                                                setTableToOpen(table);
                                            } else {
                                                setTableDetails(table);
                                            }
                                        }}
                                        className={`absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full cursor-pointer hover:scale-105 transition-all shadow-sm ${table.status === 'free'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${table.status === 'free' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        {table.status === 'free' ? 'LIVRE' : 'OCUPADA'}
                                    </button>

                                    <span className="text-5xl font-black text-white dark:text-white mb-3">
                                        {table.number}
                                    </span>

                                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm font-medium bg-gray-50 dark:bg-black/20 px-3 py-1 rounded-lg">
                                        <Users className="h-4 w-4" />
                                        <span>{table.capacity} lugares</span>
                                    </div>

                                    {/* Action Buttons Overlay */}
                                    <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                if (confirm('Excluir mesa?')) router.delete(route('tables.destroy', table.id))
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                            title="Excluir Mesa"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {tables.length === 0 && (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                                    <LayoutGrid className="h-12 w-12 mb-4 opacity-20" />
                                    <p className="font-medium">Nenhuma mesa cadastrada.</p>
                                    <p className="text-sm mt-1">Adicione uma nova mesa para começar a gerenciar o salão.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Checkout Modal */}
            {isCheckoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#1a1b1e] h-full sm:h-auto sm:rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#1a1b1e]">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Finalizar Pedido</h3>
                                <p className="text-sm text-gray-500 font-medium">Confirme os detalhes do pagamento</p>
                            </div>
                            <button onClick={() => setIsCheckoutModalOpen(false)} className="h-10 w-10 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitOrder} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            {/* Order Mode */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tipo de Pedido</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'pickup', label: 'Retirada', icon: ShoppingCart },
                                        { id: 'table', label: 'Mesa', icon: LayoutGrid },
                                        { id: 'delivery', label: 'Entregas', icon: Users } // Using Users as placeholder icon for delivery if Bike not imported, wait I imported Bike earlier? No, Check imports. I'll use Users for now or generic.
                                    ].map(mode => (
                                        <button
                                            type="button"
                                            key={mode.id}
                                            onClick={() => setData('order_mode', mode.id)}
                                            className={clsx(
                                                "py-3 px-2 rounded-xl text-sm font-bold flex flex-col items-center gap-2 transition-all border-2",
                                                data.order_mode === mode.id
                                                    ? "border-[#ff3d03] bg-[#ff3d03]/5 text-[#ff3d03]"
                                                    : "border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-500 hover:border-gray-300 dark:hover:border-white/20"
                                            )}
                                        >
                                            {/* <mode.icon className="h-5 w-5" /> Icons would be nice here */}
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Customer Selection */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cliente / Fidelidade</label>
                                <CustomerCombobox
                                    customers={customers}
                                    value={selectedCustomer}
                                    onChange={(c) => {
                                        setSelectedCustomer(c);
                                        setData(data => ({
                                            ...data,
                                            customer_id: c?.id || null, // Keeping customer_id logic
                                            customer_name: c?.name || ''
                                        }));
                                    }}
                                />
                                {selectedCustomer && (
                                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex items-center justify-between">
                                        <span className="text-sm font-bold text-yellow-800 dark:text-yellow-500">Saldo Fidelidade</span>
                                        <span className="text-lg font-black text-yellow-600 dark:text-yellow-400">{selectedCustomer.loyalty_points || 0} pts</span>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Método de Pagamento</label>
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'cash')}
                                        className={clsx("w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                                            data.payment_method === 'cash' ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" : "border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5")}
                                    >
                                        <div className={clsx("h-10 w-10 rounded-full flex items-center justify-center", data.payment_method === 'cash' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
                                            <Banknote className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className={clsx("block font-bold", data.payment_method === 'cash' ? "text-green-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>Dinheiro</span>
                                            <span className="text-xs text-gray-500">Pagamento em espécie</span>
                                        </div>
                                        {data.payment_method === 'cash' && <div className="h-4 w-4 bg-green-500 rounded-full border-2 border-white ring-2 ring-green-200" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'credit_card')}
                                        className={clsx("w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                                            data.payment_method === 'credit_card' ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" : "border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5")}
                                    >
                                        <div className={clsx("h-10 w-10 rounded-full flex items-center justify-center", data.payment_method === 'credit_card' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400")}>
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className={clsx("block font-bold", data.payment_method === 'credit_card' ? "text-blue-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>Cartão</span>
                                            <span className="text-xs text-gray-500">Crédito ou Débito</span>
                                        </div>
                                        {data.payment_method === 'credit_card' && <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white ring-2 ring-blue-200" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'pix')}
                                        className={clsx("w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                                            data.payment_method === 'pix' ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/10" : "border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5")}
                                    >
                                        <div className={clsx("h-10 w-10 rounded-full flex items-center justify-center", data.payment_method === 'pix' ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-400")}>
                                            <QrCode className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className={clsx("block font-bold", data.payment_method === 'pix' ? "text-teal-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>Pix</span>
                                            <span className="text-xs text-gray-500">Pagamento instantâneo</span>
                                        </div>
                                        {data.payment_method === 'pix' && <div className="h-4 w-4 bg-teal-500 rounded-full border-2 border-white ring-2 ring-teal-200" />}
                                    </button>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resumo do Pedido</label>
                                <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4 space-y-2 max-h-40 overflow-y-auto">
                                    {cart.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                {item.quantity}x {allProducts.find(p => p.id === item.id)?.name}
                                            </span>
                                            <span className="text-gray-900 dark:text-white font-bold">
                                                R$ {(parseFloat(allProducts.find(p => p.id === item.id)?.price || '0') * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Address - Show only for delivery */}
                            {data.order_mode === 'delivery' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        Endereço de Entrega *
                                    </label>
                                    <textarea
                                        value={data.customer_name || ''}
                                        onChange={(e) => setData('customer_name', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white resize-none"
                                        rows={3}
                                        placeholder="Rua, número, bairro, complemento..."
                                        required={data.order_mode === 'delivery'}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        ⚠️ Endereço obrigatório para entregas
                                    </p>
                                </div>
                            )}

                            {/* Total Display */}
                            <div className="flex justify-between items-end pt-4 border-t border-gray-100 dark:border-white/5">
                                <span className="text-gray-500 font-medium">Total a pagar</span>
                                <span className="text-3xl font-black text-gray-900 dark:text-white">
                                    R$ {cartTotal.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        </form>

                        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 space-y-3">
                            {/* Warning for delivery without address */}
                            {data.order_mode === 'delivery' && !data.customer_name && (
                                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-xs font-medium text-yellow-800 dark:text-yellow-500">
                                        Preencha o endereço de entrega
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={(e) => submitOrder(e as any)}
                                disabled={processing || (data.order_mode === 'delivery' && !data.customer_name)}
                                className="w-full rounded-2xl bg-[#ff3d03] py-4 text-base font-bold uppercase tracking-wide text-white shadow-xl shadow-[#ff3d03]/20 hover:bg-[#e63700] hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processando...
                                    </span>
                                ) : (
                                    `✓ Confirmar ${data.order_mode === 'delivery' ? 'Entrega' : data.order_mode === 'pickup' ? 'Retirada' : 'Mesa'} - R$ ${cartTotal.toFixed(2)}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Creation Modal */}
            <Modal show={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} maxWidth="sm">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Nova Mesa</h2>
                        <button onClick={() => setIsTableModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={submitTable} className="space-y-6">
                        <div>
                            <InputLabel value="Número da Mesa" className="mb-2" />
                            <TextInput
                                type="number"
                                className="w-full text-lg font-bold text-center h-14 rounded-xl"
                                value={tableData.number}
                                onChange={e => setTableData('number', e.target.value)}
                                placeholder="Ex: 10"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Capacidade" className="mb-2" />
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                    <Users className="h-6 w-6" />
                                </div>
                                <TextInput
                                    type="number"
                                    className="flex-1 text-lg font-bold h-12 rounded-xl"
                                    value={tableData.capacity}
                                    onChange={e => setTableData('capacity', e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-white/5">
                            <button
                                type="button"
                                onClick={() => setIsTableModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <PrimaryButton disabled={processingTable} className="bg-[#ff3d03] border-transparent rounded-xl px-6 py-3 shadow-lg hover:bg-[#e63700]">
                                Salvar Mesa
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Open Table Modal - Simple version for now */}
            <Modal show={!!tableToOpen} onClose={() => setTableToOpen(null)} maxWidth="sm">
                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LayoutGrid className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Abrir Mesa {tableToOpen?.number}</h2>
                        <p className="text-sm text-gray-500">Inicie um novo atendimento para esta mesa.</p>
                    </div>

                    {/* Simplified - just confirm opens it */}
                    <form onSubmit={handleOpenTable} className="space-y-6">
                        <div>
                            <InputLabel value="Nome do Cliente (Opcional)" className="mb-2" />
                            <CustomerCombobox
                                customers={customers}
                                value={selectedCustomer}
                                onChange={setSelectedCustomer}
                            />
                        </div>

                        <button
                            className="w-full rounded-2xl bg-green-600 py-4 text-white font-bold text-base uppercase tracking-wide shadow-lg hover:bg-green-700 transition-all"
                        >
                            Iniciar Atendimento
                        </button>
                    </form>
                </div>
            </Modal>

            {/* Table Details Modal */}
            <Modal show={!!tableDetails} onClose={() => setTableDetails(null)}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">Mesa {tableDetails?.number}</h2>
                        <button onClick={() => setTableDetails(null)}><X className="h-5 w-5" /></button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 max-h-60 overflow-y-auto">
                        <h3 className="font-bold text-sm mb-2 text-gray-500">CONSUMO ATUAL</h3>
                        {tableDetails?.current_order?.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0 dark:border-gray-700 text-sm">
                                <span>{item.quantity}x {item.product_name}</span>
                                <span>R$ {Number(item.subtotal).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                            <span>Total Parcial</span>
                            <span>R$ {Number(tableDetails?.current_order?.total || 0).toFixed(2)}</span>
                        </div>
                        {tableDetails?.current_order?.customer && (
                            <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                <User className="h-3 w-3" /> {tableDetails.current_order.customer.name}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                setTargetTable(tableDetails);
                                setTableDetails(null);
                                setViewMode('sales');
                                setCart([]); // Clear cart to start adding new items
                            }}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" /> Adicionar Itens
                        </button>

                        <button
                            onClick={handleCloseTable}
                            className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700"
                        >
                            <Banknote className="h-4 w-4" /> Fechar Conta
                        </button>
                    </div>

                    {/* Simple Payment Method Selector for Close (can be improved) */}
                    <div className="mt-4">
                        <label className="text-xs uppercase font-bold text-gray-500">Forma de Pagamento (Fechar)</label>
                        <select
                            value={paymentMethodForClose}
                            onChange={e => setPaymentMethodForClose(e.target.value)}
                            className="w-full mt-1 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="cash">Dinheiro</option>
                            <option value="credit_card">Cartão de Crédito</option>
                            <option value="debit_card">Cartão de Débito</option>
                            <option value="pix">Pix</option>
                        </select>
                    </div>

                </div>
            </Modal>

            {/* Product Modal with Complements */}
            {
                selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="sticky top-0 bg-white dark:bg-[#1a1b1e] px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center z-10">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h3>
                                <button onClick={closeProductModal} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Product Info */}
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        R$ {Number(selectedProduct.price).toFixed(2).replace('.', ',')}
                                    </p>
                                    {selectedProduct.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{selectedProduct.description}</p>
                                    )}
                                </div>

                                {/* Complement Groups */}
                                {selectedProduct.complement_groups && selectedProduct.complement_groups.length > 0 && (
                                    <div className="space-y-4">
                                        {selectedProduct.complement_groups.map(group => {
                                            const totalSelected = getTotalSelected(group.id);
                                            const isGroupValid = !group.is_required || totalSelected >= group.min_selections;

                                            return (
                                                <div key={group.id} className="border-t pt-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-gray-900 dark:text-white">
                                                                {group.name}
                                                                {group.is_required && <span className="text-red-500 ml-1">*</span>}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-medium px-2 py-1 rounded ${isGroupValid ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                                                                {totalSelected}/{group.max_selections}
                                                            </span>
                                                            {group.min_selections > 0 && (
                                                                <span className="text-xs text-gray-500">Mín: {group.min_selections}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {group.options.map(option => {
                                                            const qty = selectedComplements[group.id]?.[option.id] || 0;
                                                            const maxQty = option.max_quantity || 999;
                                                            const canIncrease = qty < maxQty && totalSelected < group.max_selections;

                                                            return (
                                                                <div key={option.id} className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${qty > 0 ? 'bg-orange-50 border-[#ff3d03]' : 'bg-white hover:bg-gray-50'}`}>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium text-gray-700">{option.name}</span>
                                                                            {maxQty < 999 && <span className="text-xs text-gray-400">(máx: {maxQty})</span>}
                                                                        </div>
                                                                        {option.price > 0 && (
                                                                            <span className="text-sm text-gray-600">
                                                                                +R$ {option.price.toFixed(2).replace('.', ',')}
                                                                                {qty > 1 && ` × ${qty} = R$ ${(option.price * qty).toFixed(2).replace('.', ',')}`}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => updateComplementQuantity(group.id, option.id, -1, maxQty, group.max_selections)}
                                                                            disabled={qty === 0}
                                                                            className="h-8 w-8 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                                                                        >
                                                                            <Minus className="h-4 w-4" />
                                                                        </button>
                                                                        <span className="w-8 text-center font-bold text-gray-900">{qty}</span>
                                                                        <button
                                                                            onClick={() => updateComplementQuantity(group.id, option.id, +1, maxQty, group.max_selections)}
                                                                            disabled={!canIncrease}
                                                                            className="h-8 w-8 rounded-lg bg-[#ff3d03] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#e63700] transition-colors"
                                                                        >
                                                                            <Plus className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observações (opcional)</label>
                                    <textarea
                                        value={productNotes}
                                        onChange={(e) => setProductNotes(e.target.value)}
                                        placeholder="Ex: Sem cebola, bem passado..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                                        rows={2}
                                    />
                                </div>

                                {/* Quantity and Total */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                                            className="h-10 w-10 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors"
                                        >
                                            <Minus className="h-5 w-5" />
                                        </button>
                                        <span className="text-xl font-bold text-gray-900 dark:text-white w-12 text-center">{productQuantity}</span>
                                        <button
                                            onClick={() => setProductQuantity(productQuantity + 1)}
                                            className="h-10 w-10 rounded-lg bg-[#ff3d03] text-white flex items-center justify-center hover:bg-[#e63700] transition-colors"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            R$ {calculateProductTotal().toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={() => {
                                        const validation = validateComplements();
                                        if (!validation.valid) {
                                            alert(validation.message);
                                            return;
                                        }
                                        addToCartFromModal();
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    Adicionar ao Carrinho
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </AuthenticatedLayout >
    );
}
