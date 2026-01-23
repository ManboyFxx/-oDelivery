import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Add router
import { Search, ShoppingCart, Trash2, CreditCard, Banknote, QrCode, User, Plus, Minus, X, LayoutGrid, Users } from 'lucide-react';
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
            items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
            total: cartTotal
        });
        setIsCheckoutModalOpen(true);
    };

    const submitOrder = (e: React.FormEvent) => {
        e.preventDefault();

        if (targetTable) {
            // Adding items to table
            router.post(route('tables.addItems', targetTable.id), {
                items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
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

            <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden -m-4 sm:-m-8">
                {/* Tab Navigation */}
                <div className="bg-white dark:bg-[#1a1b1e] border-b border-gray-200 dark:border-gray-800 px-6 pt-4">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setViewMode('sales')}
                            className={clsx(
                                "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                                viewMode === 'sales'
                                    ? "border-[#ff3d03] text-[#ff3d03]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            )}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Caixa / Venda
                        </button>
                        <button
                            onClick={() => setViewMode('tables')}
                            className={clsx(
                                "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                                viewMode === 'tables'
                                    ? "border-[#ff3d03] text-[#ff3d03]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Gestão de Mesas
                        </button>
                    </div>
                </div>

                {viewMode === 'sales' ? (
                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Side: Products */}
                        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f1012]">
                            {/* Top Bar: Search & Categories */}
                            <div className="p-4 bg-white dark:bg-[#1a1b1e] border-b border-gray-200 dark:border-gray-800 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar produto..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-xl border-none bg-gray-100 py-3 pl-10 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500 dark:bg-[#2c2d30] dark:text-white"
                                    />
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={clsx(
                                            "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                                            selectedCategory === 'all'
                                                ? "bg-yellow-500 text-black"
                                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-[#2c2d30] dark:border-transparent dark:text-gray-300"
                                        )}
                                    >
                                        Todos
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={clsx(
                                                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                                                selectedCategory === cat.id
                                                    ? "bg-yellow-500 text-black"
                                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-[#2c2d30] dark:border-transparent dark:text-gray-300"
                                            )}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredProducts.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="cursor-pointer group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-yellow-500 dark:bg-[#1a1b1e]"
                                        >
                                            <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-gray-800">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-gray-400">
                                                        <span className="text-xs">Sem foto</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 dark:text-white leading-tight mb-1">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm font-bold text-yellow-600 dark:text-yellow-500">
                                                    R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Cart */}
                        <div className={clsx("w-96 flex flex-col bg-white border-l border-gray-200 dark:bg-[#1a1b1e] dark:border-gray-800 z-10 shadow-xl transition-colors", targetTable && "border-yellow-500 border-2")}>
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-gray-500" />
                                    <h2 className="font-bold text-lg dark:text-white">
                                        {targetTable ? `Mesa ${targetTable.number}` : "Carrinho atual"}
                                    </h2>
                                </div>
                                {targetTable && (
                                    <button onClick={() => { setTargetTable(null); setCart([]); }} className="text-xs text-red-500 hover:underline">
                                        Cancelar/Sair
                                    </button>
                                )}
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full dark:bg-gray-800 dark:text-gray-300">
                                    {cart.length} itens
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                                        <ShoppingCart className="h-12 w-12 opacity-20" />
                                        <p className="text-sm">Seu carrinho está vazio</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg dark:bg-[#2c2d30]">
                                            {/* Image Tiny */}
                                            <div className="h-12 w-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                                                {item.image_url && <img src={item.image_url} className="h-full w-full object-cover" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">
                                                        {item.name}
                                                    </h4>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        R$ {Number(item.price).toFixed(2).replace('.', ',')}
                                                    </p>

                                                    {/* Qty Control */}
                                                    <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 dark:bg-[#1a1b1e] dark:border-gray-700 px-1 py-0.5">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-300"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="text-xs font-bold w-4 text-center dark:text-white">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-300"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-200 bg-gray-50 dark:bg-[#1a1b1e] dark:border-gray-800 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                    <span className="font-bold text-gray-900 dark:text-white">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                {/* Could add tax/discount here */}
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span className="text-gray-900 dark:text-white">Total</span>
                                    <span className="text-green-600">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                </div>

                                <button
                                    onClick={targetTable ? submitOrder : handleCheckout}
                                    disabled={cart.length === 0}
                                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                >
                                    {targetTable ? "Adicionar Parcial" : "Finalizar Compra"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#0f1012]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white">Mapa de Mesas</h2>
                            <button
                                onClick={() => setIsTableModalOpen(true)}
                                className="bg-[#ff3d03] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#e63700]"
                            >
                                <Plus className="h-4 w-4" /> Nova Mesa
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {tables.map((table) => (
                                <div
                                    key={table.id}
                                    className={`relative p-6 rounded-xl border-2 flex flex-col items-center justify-center min-h-[160px] transition-all bg-white dark:bg-gray-800 ${table.status === 'free'
                                        ? 'border-green-500/50 hover:border-green-500'
                                        : 'border-red-500/50 hover:border-red-500'
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
                                        className={`absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${table.status === 'free' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {table.status === 'free' ? 'ABRIR' : 'VER DETALHES'}
                                    </button>

                                    <span className="text-4xl font-black text-gray-800 dark:text-white mb-2">
                                        {table.number}
                                    </span>

                                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                                        <Users className="h-4 w-4" />
                                        <span>{table.capacity} lugares</span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (confirm('Excluir mesa?')) router.delete(route('tables.destroy', table.id))
                                        }}
                                        className="absolute bottom-2 right-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {tables.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                    Nenhuma mesa cadastrada. Adicione uma nova mesa para começar.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Checkout Modal */}
            {isCheckoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a1b1e] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Finalizar Pedido</h3>
                            <button onClick={() => setIsCheckoutModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitOrder} className="p-6 space-y-6">
                            {/* Order Mode */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo de Pedido</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'pickup', label: 'Retirada' },
                                        { id: 'table', label: 'Mesa' },
                                        { id: 'delivery', label: 'Entrega' }
                                    ].map(mode => (
                                        <button
                                            type="button"
                                            key={mode.id}
                                            onClick={() => setData('order_mode', mode.id)}
                                            className={clsx(
                                                "py-2 px-3 rounded-lg text-sm font-medium border text-center transition-all",
                                                data.order_mode === mode.id
                                                    ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-500"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Customer Selection - NEW */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Cliente / Fidelidade (Opcional)</label>
                                <CustomerCombobox
                                    customers={customers}
                                    value={selectedCustomer}
                                    onChange={(c) => {
                                        setSelectedCustomer(c);
                                        setData(data => ({
                                            ...data,
                                            customer_id: c?.id || null,
                                            customer_name: c?.name || ''
                                        }));
                                    }}
                                />
                                {selectedCustomer && (
                                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-500">
                                        <div className="font-bold">Pontos Atuais: {selectedCustomer.loyalty_points || 0}</div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pagamento</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'cash')}
                                        className={clsx("flex items-center gap-3 p-3 rounded-xl border text-left", data.payment_method === 'cash' ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700")}
                                    >
                                        <div className={clsx("p-2 rounded-full", data.payment_method === 'cash' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500")}>
                                            <Banknote className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium text-sm dark:text-gray-200">Dinheiro</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'credit_card')}
                                        className={clsx("flex items-center gap-3 p-3 rounded-xl border text-left", data.payment_method === 'credit_card' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700")}
                                    >
                                        <div className={clsx("p-2 rounded-full", data.payment_method === 'credit_card' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500")}>
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium text-sm dark:text-gray-200">Cartão</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'pix')}
                                        className={clsx("flex items-center gap-3 p-3 rounded-xl border text-left", data.payment_method === 'pix' ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20" : "border-gray-200 dark:border-gray-700")}
                                    >
                                        <div className={clsx("p-2 rounded-full", data.payment_method === 'pix' ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-500")}>
                                            <QrCode className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium text-sm dark:text-gray-200">Pix</span>
                                    </button>
                                </div>
                            </div>

                            {/* Total Display */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">Total a pagar:</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    R$ {cartTotal.toFixed(2).replace('.', ',')}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {processing ? 'Processando...' : 'Confirmar Pagamento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Creation Modal */}
            <Modal show={isTableModalOpen} onClose={() => setIsTableModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cadastrar Nova Mesa</h2>
                    <form onSubmit={submitTable} className="space-y-4">
                        <div>
                            <InputLabel value="Número da Mesa" />
                            <TextInput
                                type="number"
                                className="w-full mt-1"
                                value={tableData.number}
                                onChange={e => setTableData('number', e.target.value)}
                                placeholder="Ex: 10"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Capacidade (Pessoas)" />
                            <TextInput
                                type="number"
                                className="w-full mt-1"
                                value={tableData.capacity}
                                onChange={e => setTableData('capacity', e.target.value)}
                                min="1"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsTableModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Cancelar
                            </button>
                            <PrimaryButton disabled={processingTable}>Salvar</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
            {/* Open Table Modal */}
            <Modal show={!!tableToOpen} onClose={() => setTableToOpen(null)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4">Abrir Mesa {tableToOpen?.number}</h2>
                    <form onSubmit={handleOpenTable} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Cliente (Vincula Fidelidade)</label>
                            <CustomerCombobox
                                customers={customers}
                                value={selectedCustomer}
                                onChange={setSelectedCustomer}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setTableToOpen(null)} className="btn-secondary">Cancelar</button>
                            <PrimaryButton>Abrir Mesa</PrimaryButton>
                        </div>
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
            {selectedProduct && (
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
            )}
        </AuthenticatedLayout>
    );
}
