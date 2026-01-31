import { Head } from '@inertiajs/react';
import { ShoppingBag, Phone, Instagram, Globe, MapPin, Clock, User, LogOut, Gift, History, X, Plus, Minus, ShoppingCart, ChevronRight, Trash2, Home, Edit2, Check, Info, Navigation, MessageCircle, Twitter, Facebook, Sparkles, Trophy, Star } from 'lucide-react';
import Modal from '@/Components/Modal';
import CheckoutModal from './CheckoutModal';
import { useState, useEffect } from 'react';
import { useAudio } from '@/Hooks/useAudio';
import clsx from 'clsx';
import axios from 'axios';

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
    description: string;
    price: string;
    image_url?: string;
    complement_groups?: ComplementGroup[];
    track_stock: boolean;
    stock_quantity: number | null;
    loyalty_redeemable?: boolean;
    loyalty_points_cost?: number;
    loyalty_earns_points?: boolean;
    promotional_price?: string;
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
    category_type?: string;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    loyalty_points: number;
    loyalty_tier?: string;
}

interface Address {
    id: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    is_default: boolean;
}

interface CartItem {
    product: Product;
    quantity: number;
    notes: string;
    selectedComplements: {
        groupId: string;
        optionId: string;
        name: string;
        price: number;
        quantity: number;
    }[];
    subtotal: number;
}

const PriceTag = ({ price }: { price: string | number }) => (
    <span className="font-bold text-[#ff3d03]">
        R$ {Number(price).toFixed(2).replace('.', ',')}
    </span>
);

export default function PublicMenu({ store, categories, slug, authCustomer, activePromotion }: { store: any, categories: Category[], slug: string, authCustomer: Customer | null, activePromotion?: any }) {
    const theme = store.theme_mode || 'modern-clean';
    const { play, initializeAudio } = useAudio();
    const [activeCategory, setActiveCategory] = useState<string>('all');

    // FORCE ENABLE LOYALTY REMOVED - respecting store settings
    // store.loyalty_enabled = true;

    // Auth Modal
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [authStep, setAuthStep] = useState<'phone' | 'name'>('phone');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [customer, setCustomer] = useState<Customer | null>(authCustomer);
    const [loading, setLoading] = useState(false);

    // Product Modal
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [selectedComplements, setSelectedComplements] = useState<{ [groupId: string]: { [optionId: string]: number } }>({});
    const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);

    // Cart
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);

    // Customer Area
    const [showCustomerArea, setShowCustomerArea] = useState(false);
    const [customerTab, setCustomerTab] = useState<'info' | 'addresses' | 'orders'>('info');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersPage, setOrdersPage] = useState(1);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [hasMoreOrders, setHasMoreOrders] = useState(false);
    // Checkout
    const [showCheckout, setShowCheckout] = useState(false);

    const [addressForm, setAddressForm] = useState({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: ''
    });

    // Initialize audio on first user interaction
    useEffect(() => {
        const handleFirstInteraction = () => {
            initializeAudio();
        };
        window.addEventListener('click', handleFirstInteraction, { once: true });
        window.addEventListener('touchstart', handleFirstInteraction, { once: true });
        return () => {
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, [initializeAudio]);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Load addresses when customer area opens
    useEffect(() => {
        if (showCustomerArea && customer) {
            loadAddresses();
        }
    }, [showCustomerArea, customer]);

    const loadAddresses = async () => {
        try {
            const response = await axios.get('/customer/addresses');
            setAddresses(response.data);
        } catch (error) {
            console.error('Error loading addresses:', error);
        }
    };

    const loadOrders = async (page: number = 1) => {
        if (!customer) return;
        setLoadingOrders(true);
        try {
            const response = await axios.get('/customer/orders', {
                params: {
                    page,
                    customer_id: customer.id,
                    tenant_id: store.settings.tenant_id
                }
            });
            setOrders(response.data.orders);
            setOrdersPage(page);
            setHasMoreOrders(response.data.pagination.has_more);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    // Load orders when switching to orders tab
    useEffect(() => {
        if (customerTab === 'orders' && customer && orders.length === 0) {
            loadOrders(1);
        }
    }, [customerTab, customer]);

    const scrollToCategory = (id: string) => {
        setActiveCategory(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/customer/check-phone', {
                phone,
                tenant_slug: slug
            });
            if (response.data.exists) {
                setCustomer(response.data.customer);
                setShowAuthModal(false);
                setPhone('');
            } else {
                setAuthStep('name');
            }
        } catch (error) {
            console.error('Error checking phone:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/customer/complete-registration', {
                phone,
                name,
                tenant_slug: slug
            });
            setCustomer(response.data.customer);
            setShowAuthModal(false);
            setPhone('');
            setName('');
            setAuthStep('phone');
        } catch (error: any) {
            console.error('Error completing registration:', error);
            alert(error.response?.data?.message || 'Erro ao completar cadastro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/customer/logout');
            setCustomer(null);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const openProductModal = (product: Product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setNotes('');
        setSelectedComplements({});
        setEditingCartIndex(null);
    };

    const editCartItem = (index: number) => {
        const item = cart[index];
        setSelectedProduct(item.product);
        setQuantity(item.quantity);
        setNotes(item.notes);

        // Reconstruct selectedComplements from cart item
        const complementsMap: { [groupId: string]: { [optionId: string]: number } } = {};
        item.selectedComplements.forEach(comp => {
            if (!complementsMap[comp.groupId]) {
                complementsMap[comp.groupId] = {};
            }
            complementsMap[comp.groupId][comp.optionId] = comp.quantity || 1;
        });
        setSelectedComplements(complementsMap);
        setEditingCartIndex(index);
        setShowCart(false);
    };

    const handleRedeem = async (product: Product) => {
        if (!customer) {
            setShowAuthModal(true);
            return;
        }

        if (customer.loyalty_points < (product.loyalty_points_cost || 0)) {
            alert(`Você não tem pontos suficientes. Necessário: ${product.loyalty_points_cost}, Disponível: ${customer.loyalty_points}`);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/customer/redeem-product', {
                tenant_id: store.settings.tenant_id,
                customer_id: customer.id,
                product_id: product.id,
                quantity: 1
            });

            if (response.data.success) {
                // Update customer points
                setCustomer({
                    ...customer,
                    loyalty_points: response.data.remaining_points
                });

                alert(`Parabéns! Você resgatou ${product.name}!\nPedido #${response.data.order_number} criado com sucesso.`);
            }
        } catch (error: any) {
            console.error('Redemption error:', error);
            const errorMessage = error.response?.data?.error || 'Erro ao processar resgate. Tente novamente.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const closeProductModal = () => {
        setSelectedProduct(null);
        setQuantity(1);
        setNotes('');
        setSelectedComplements({});
        setEditingCartIndex(null);
    };

    const updateComplementQuantity = (groupId: string, optionId: string, delta: number, maxQuantity: number, maxSelections: number) => {
        setSelectedComplements(prev => {
            const groupSelections = prev[groupId] || {};
            const currentQty = groupSelections[optionId] || 0;
            const newQty = Math.max(0, Math.min(currentQty + delta, maxQuantity));

            // Calculate total items in group
            const totalItems = Object.values(groupSelections).reduce((sum: number, qty: number) => sum + qty, 0);
            const newTotal = totalItems - currentQty + newQty;

            // Check if exceeds group max
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

        return total * quantity;
    };

    const validateComplements = (): { valid: boolean; message: string } => {
        if (!selectedProduct?.complement_groups) return { valid: true, message: '' };

        for (const group of selectedProduct.complement_groups) {
            const totalSelected = getTotalSelected(group.id);

            // Validate required group
            if (group.is_required && totalSelected === 0) {
                return {
                    valid: false,
                    message: `"${group.name}" é obrigatório. Selecione pelo menos ${group.min_selections} opção(ões).`
                };
            }

            // Validate minimum
            if (totalSelected > 0 && totalSelected < group.min_selections) {
                return {
                    valid: false,
                    message: `Selecione pelo menos ${group.min_selections} opção(ões) em "${group.name}".`
                };
            }

            // Validate maximum
            if (totalSelected > group.max_selections) {
                return {
                    valid: false,
                    message: `Selecione no máximo ${group.max_selections} opção(ões) em "${group.name}".`
                };
            }
        }

        return { valid: true, message: '' };
    };

    const addToCart = () => {
        if (!selectedProduct) return;

        // Validate complements
        const validation = validateComplements();
        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        const complementsList: { groupId: string; optionId: string; name: string; price: number; quantity: number }[] = [];
        selectedProduct.complement_groups?.forEach(group => {
            const groupSelections = selectedComplements[group.id] || {};
            Object.entries(groupSelections).forEach(([optionId, qty]) => {
                const option = group.options.find(o => o.id === optionId);
                if (option && qty > 0) {
                    // Add each quantity as a separate entry for clarity
                    for (let i = 0; i < qty; i++) {
                        complementsList.push({
                            groupId: group.id,
                            optionId: option.id,
                            name: option.name,
                            price: option.price,
                            quantity: 1
                        });
                    }
                }
            });
        });

        const newItem: CartItem = {
            product: selectedProduct,
            quantity,
            notes,
            selectedComplements: complementsList,
            subtotal: calculateProductTotal()
        };

        if (editingCartIndex !== null) {
            // Update existing item
            setCart(prev => prev.map((item, idx) => idx === editingCartIndex ? newItem : item));
        } else {
            // Add new item
            setCart(prev => [...prev, newItem]);
        }

        play('success');
        closeProductModal();
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const getCartTotal = () => {
        return cart.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const getCartCount = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingAddress) {
                await axios.put(`/customer/addresses/${editingAddress.id}`, addressForm);
            } else {
                await axios.post('/customer/addresses', addressForm);
            }
            await loadAddresses();
            setShowAddressForm(false);
            setEditingAddress(null);
            setAddressForm({
                street: '',
                number: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
                zip_code: ''
            });
        } catch (error: any) {
            if (error.response?.status === 422) {
                alert(error.response.data.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Deseja realmente remover este endereço?')) return;
        try {
            await axios.delete(`/customer/addresses/${id}`);
            await loadAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    const handleSetDefaultAddress = async (id: string) => {
        try {
            await axios.post(`/customer/addresses/${id}/set-default`);
            await loadAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
        }
    };

    const openEditAddress = (address: Address) => {
        setEditingAddress(address);
        setAddressForm({
            street: address.street,
            number: address.number,
            complement: address.complement || '',
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            zip_code: address.zip_code
        });
        setShowAddressForm(true);
    };

    return (
        <div className={clsx(
            "min-h-screen transition-colors duration-500",
            theme === 'classic' ? "bg-[#1a1b1e] text-gray-100" : "bg-gray-50 text-gray-900"
        )}>
            <Head title={store.name} />

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAuthModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {authStep === 'phone' ? 'Entrar ou Cadastrar' : 'Complete seu Cadastro'}
                            </h3>
                            <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {authStep === 'phone' ? (
                            <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Número de Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Verificando...' : 'Continuar'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleNameSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Seu Nome
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Digite seu nome"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Product Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={closeProductModal}>
                    <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Product Image */}
                        <div className="h-64 w-full bg-gray-100 relative">
                            {selectedProduct.image_url ? (
                                <img src={selectedProduct.image_url} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300">
                                    <ShoppingBag className="h-20 w-20" />
                                </div>
                            )}
                            <button onClick={closeProductModal} className="absolute top-4 right-4 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Product Info */}
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">{selectedProduct.name}</h2>
                                <p className="text-gray-600">{selectedProduct.description}</p>
                                <p className="text-2xl font-bold text-[#ff3d03] mt-4">
                                    <PriceTag price={selectedProduct.price} />
                                </p>
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
                                                        <h3 className="font-bold text-gray-900">
                                                            {group.name}
                                                            {group.is_required && <span className="text-red-500 ml-1">*</span>}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded ${isGroupValid ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                                                            }`}>
                                                            {totalSelected}/{group.max_selections}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {group.min_selections > 0 && `Mín: ${group.min_selections}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {group.options.map(option => {
                                                        const qty = selectedComplements[group.id]?.[option.id] || 0;
                                                        const maxQty = option.max_quantity || 1;
                                                        const canIncrease = qty < maxQty && totalSelected < group.max_selections;

                                                        return (
                                                            <div key={option.id} className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${qty > 0 ? 'bg-orange-50 border-[#ff3d03]' : 'bg-white hover:bg-gray-50'
                                                                }`}>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-gray-700">{option.name}</span>
                                                                        {maxQty > 1 && (
                                                                            <span className="text-xs text-gray-400">(máx: {maxQty})</span>
                                                                        )}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observações (opcional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ex: Sem cebola, bem passado..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="h-10 w-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50"
                                    >
                                        <Minus className="h-5 w-5" />
                                    </button>
                                    <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="h-10 w-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={addToCart}
                                    className="flex-1 bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {editingCartIndex !== null ? 'Atualizar' : 'Adicionar'} • <PriceTag price={calculateProductTotal()} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Drawer */}
            {showCart && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowCart(false)}>
                    <div className="bg-white w-full md:w-96 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b sticky top-0 bg-white z-10">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Carrinho</h3>
                                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <ShoppingCart className="h-16 w-16 mb-4" />
                                <p>Seu carrinho está vazio</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 space-y-4">
                                    {cart.map((item, index) => (
                                        <div key={index} className="border rounded-xl p-4 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900">{item.product.name}</h4>
                                                    <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                                                    {item.selectedComplements.length > 0 && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {item.selectedComplements.map((comp, i) => (
                                                                <div key={i}>+ {comp.name}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.notes && (
                                                        <p className="text-xs text-gray-500 mt-1 italic">Obs: {item.notes}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => editCartItem(index)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        <Edit2 className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right font-bold text-[#ff3d03]">
                                                <PriceTag price={item.subtotal} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="sticky bottom-0 bg-white border-t p-6 space-y-4">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total</span>
                                        <PriceTag price={getCartTotal()} />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!customer) {
                                                setShowAuthModal(true);
                                            } else {
                                                setShowCart(false);
                                                setShowCheckout(true);
                                            }
                                        }}
                                        className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-4 rounded-xl transition-colors"
                                    >
                                        Finalizar Pedido
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Customer Area Modal */}
            {showCustomerArea && customer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCustomerArea(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Minha Conta</h3>
                                <button onClick={() => setShowCustomerArea(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b">
                            <button
                                onClick={() => setCustomerTab('info')}
                                className={clsx(
                                    "flex-1 py-3 text-sm font-medium transition-colors",
                                    customerTab === 'info'
                                        ? "text-[#ff3d03] border-b-2 border-[#ff3d03]"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Meus Dados
                            </button>
                            <button
                                onClick={() => setCustomerTab('addresses')}
                                className={clsx(
                                    "flex-1 py-3 text-sm font-medium transition-colors",
                                    customerTab === 'addresses'
                                        ? "text-[#ff3d03] border-b-2 border-[#ff3d03]"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Endereços
                            </button>
                            <button
                                onClick={() => setCustomerTab('orders')}
                                className={clsx(
                                    "flex-1 py-3 text-sm font-medium transition-colors",
                                    customerTab === 'orders'
                                        ? "text-[#ff3d03] border-b-2 border-[#ff3d03]"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Pedidos
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {customerTab === 'info' && (
                                <div className="space-y-6">
                                    {/* Customer Info */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="font-bold text-gray-900">{customer.name}</p>
                                        <p className="text-sm text-gray-600">{customer.phone}</p>
                                    </div>

                                    {/* Loyalty Points Banner */}
                                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Trophy size={140} />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                                    <Gift className="h-5 w-5 text-[#ff3d03]" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">Fidelidade</span>

                                                <div className={clsx(
                                                    "ml-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border",
                                                    (customer.loyalty_tier || 'bronze') === 'diamond' ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/30" :
                                                        (customer.loyalty_tier || 'bronze') === 'gold' ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/30" :
                                                            (customer.loyalty_tier || 'bronze') === 'silver' ? "bg-gray-500/20 text-gray-200 border-gray-500/30" :
                                                                "bg-orange-500/20 text-orange-200 border-orange-500/30"
                                                )}>
                                                    <Trophy className="h-3 w-3" />
                                                    {customer.loyalty_tier === 'diamond' ? 'Diamante' :
                                                        customer.loyalty_tier === 'gold' ? 'Ouro' :
                                                            customer.loyalty_tier === 'silver' ? 'Prata' : 'Bronze'}
                                                </div>
                                            </div>

                                            <div className="flex items-baseline gap-2">
                                                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff3d03] to-orange-400">
                                                    {customer.loyalty_points || 0}
                                                </span>
                                                <span className="text-lg font-bold text-gray-400">pontos</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Use seus pontos para resgatar produtos grátis!</p>
                                        </div>
                                    </div>

                                    {/* Progress to Next Tier */}
                                    {(() => {
                                        const tiers = [
                                            { name: 'Bronze', min: 0, max: 99, icon: '🥉' },
                                            { name: 'Prata', min: 100, max: 499, icon: '🥈' },
                                            { name: 'Ouro', min: 500, max: 999, icon: '🥇' },
                                            { name: 'Diamante', min: 1000, max: Infinity, icon: '💎' },
                                        ];

                                        const current = customer.loyalty_points || 0;
                                        const currentTier = tiers.find(t => current >= t.min && current <= t.max) || tiers[0];
                                        const nextTier = tiers.find(t => t.min > current);

                                        if (!nextTier) {
                                            return (
                                                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
                                                    <p className="text-sm font-bold text-cyan-900 text-center flex items-center justify-center gap-2">
                                                        <Sparkles className="h-4 w-4" />
                                                        Você atingiu o nível máximo!
                                                    </p>
                                                </div>
                                            );
                                        }

                                        const pointsToNext = nextTier.min - current;
                                        const progress = ((current - currentTier.min) / (nextTier.min - currentTier.min)) * 100;

                                        return (
                                            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Próximo Nível</span>
                                                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                                                        Faltam {pointsToNext} pts para {nextTier.icon} {nextTier.name}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                                                    <div
                                                        className="bg-gradient-to-r from-[#ff3d03] to-orange-500 h-full rounded-full transition-all duration-1000 ease-out relative"
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Sair da Conta
                                    </button>
                                </div>
                            )}

                            {customerTab === 'addresses' && (
                                <div className="space-y-4">
                                    {!showAddressForm ? (
                                        <>
                                            {addresses.length < 2 && (
                                                <button
                                                    onClick={() => setShowAddressForm(true)}
                                                    className="w-full flex items-center justify-center gap-2 bg-[#ff3d03] text-white font-bold py-3 rounded-xl hover:bg-[#e63700] transition-colors"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    Adicionar Endereço ({addresses.length}/2)
                                                </button>
                                            )}

                                            {addresses.length === 0 ? (
                                                <div className="text-center py-12 text-gray-400">
                                                    <MapPin className="h-16 w-16 mx-auto mb-4" />
                                                    <p>Nenhum endereço cadastrado</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {addresses.map(address => (
                                                        <div key={address.id} className="border rounded-xl p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-start gap-2">
                                                                    <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">
                                                                            {address.street}, {address.number}
                                                                        </p>
                                                                        {address.complement && (
                                                                            <p className="text-sm text-gray-600">{address.complement}</p>
                                                                        )}
                                                                        <p className="text-sm text-gray-600">
                                                                            {address.neighborhood} - {address.city}/{address.state}
                                                                        </p>
                                                                        <p className="text-sm text-gray-600">CEP: {address.zip_code}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => openEditAddress(address)}
                                                                        className="text-blue-600 hover:text-blue-700"
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteAddress(address.id)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {address.is_default ? (
                                                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                                    <Check className="h-3 w-3" />
                                                                    Endereço Padrão
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleSetDefaultAddress(address.id)}
                                                                    className="text-xs text-gray-600 hover:text-[#ff3d03]"
                                                                >
                                                                    Tornar padrão
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.street}
                                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.number}
                                                        onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.complement}
                                                        onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.neighborhood}
                                                        onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.city}
                                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.state}
                                                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                        maxLength={2}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.zip_code}
                                                        onChange={(e) => setAddressForm({ ...addressForm, zip_code: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowAddressForm(false);
                                                        setEditingAddress(null);
                                                        setAddressForm({
                                                            street: '',
                                                            number: '',
                                                            complement: '',
                                                            neighborhood: '',
                                                            city: '',
                                                            state: '',
                                                            zip_code: ''
                                                        });
                                                    }}
                                                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-1 bg-[#ff3d03] text-white font-bold py-3 rounded-xl hover:bg-[#e63700] transition-colors disabled:opacity-50"
                                                >
                                                    {loading ? 'Salvando...' : (editingAddress ? 'Atualizar' : 'Salvar')}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}

                            {customerTab === 'orders' && (
                                <div className="space-y-4">
                                    {loadingOrders ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <div className="animate-spin">
                                                <History className="h-8 w-8 mx-auto" />
                                            </div>
                                            <p className="text-sm mt-2">Carregando pedidos...</p>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <History className="h-16 w-16 mx-auto mb-4" />
                                            <p className="text-sm">Nenhum pedido ainda</p>
                                        </div>
                                    ) : (
                                        <>
                                            {orders.map((order) => {
                                                const statusConfig: { [key: string]: { label: string; color: string } } = {
                                                    new: { label: 'Novo', color: 'blue' },
                                                    confirmed: { label: 'Confirmado', color: 'purple' },
                                                    preparing: { label: 'Preparando', color: 'orange' },
                                                    ready: { label: 'Pronto', color: 'green' },
                                                    delivered: { label: 'Entregue', color: 'green' },
                                                    completed: { label: 'Completo', color: 'green' },
                                                    cancelled: { label: 'Cancelado', color: 'red' },
                                                };
                                                const config = statusConfig[order.status] || statusConfig.new;

                                                return (
                                                    <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="font-bold text-lg">#{order.order_number}</span>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold bg-${config.color}-100 text-${config.color}-700`}>
                                                                        {config.label}
                                                                    </span>
                                                                </div>

                                                                <p className="text-sm text-gray-600">
                                                                    {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>

                                                                {order.loyalty_points_earned > 0 && (
                                                                    <div className="flex items-center gap-1 mt-2 text-orange-600">
                                                                        <Gift className="h-4 w-4" />
                                                                        <span className="text-sm font-bold">+{order.loyalty_points_earned} pts</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="font-bold text-lg text-gray-900">R$ {Number(order.total).toFixed(2).replace('.', ',')}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Pagination */}
                                            <div className="flex gap-2 mt-4 justify-center pt-4 border-t">
                                                {ordersPage > 1 && (
                                                    <button
                                                        onClick={() => loadOrders(ordersPage - 1)}
                                                        className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        Anterior
                                                    </button>
                                                )}
                                                {hasMoreOrders && (
                                                    <button
                                                        onClick={() => loadOrders(ordersPage + 1)}
                                                        className="px-4 py-2 text-sm font-bold bg-[#ff3d03] text-white rounded-lg hover:bg-[#e63700] transition-colors"
                                                    >
                                                        Próximos
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* THEME: MODERN CLEAN */}
            {theme === 'modern-clean' && (
                <div className="bg-[#f2f4f7] min-h-screen pb-20">
                    {/* Header Banner */}
                    <div className="h-64 w-full relative">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${store.banner_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop'}')` }}>
                            <div className="absolute inset-0 bg-black/40"></div>
                        </div>
                    </div>

                    {/* Floating Store Card */}
                    <div className="max-w-5xl mx-auto px-4 relative -mt-20">
                        {/* --- NEW RICHER HEADER --- */}
                        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 grid md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-start relative overflow-hidden">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                <ShoppingBag size={300} strokeWidth={1} />
                            </div>

                            {/* Store Info Column */}
                            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                                {/* Logo */}
                                <div className="shrink-0 flex flex-col items-center sm:items-start gap-2">
                                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-1 ring-gray-100 bg-white">
                                        {store.logo_url ? (
                                            <img src={store.logo_url} className="h-full w-full object-cover" alt={store.name} />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400">
                                                <ShoppingBag size={32} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Opening Status Badge */}
                                    <div className={clsx(
                                        "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm",
                                        store.is_open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    )}>
                                        <span className={clsx("w-2 h-2 rounded-full", store.is_open ? "bg-green-600 animate-pulse" : "bg-red-600")} />
                                        {store.is_open ? "Aberto Agora" : "Fechado"}
                                    </div>
                                </div>

                                {/* Text Info */}
                                <div className="flex-1 text-center sm:text-left space-y-2 md:space-y-3">
                                    <div>
                                        <h1 className="text-xl md:text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                                            {store.name}
                                        </h1>
                                        {store.description && (
                                            <p className="text-gray-500 text-sm mt-1 max-w-lg mx-auto sm:mx-0">
                                                {store.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Location & Navigation Buttons */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm">
                                            <MapPin className="h-4 w-4 shrink-0 text-[#ff3d03]" />
                                            <span className="line-clamp-1">{store.address}</span>
                                        </div>

                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                            {/* Waze */}
                                            <a
                                                href={`https://waze.com/ul?q=${encodeURIComponent(store.address)}`}
                                                target="_blank"
                                                className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                                            >
                                                <Navigation className="h-3.5 w-3.5 fill-current" />
                                                Waze
                                            </a>
                                            {/* Google Maps */}
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                                                target="_blank"
                                                className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-white text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors border border-gray-200"
                                            >
                                                <MapPin className="h-3.5 w-3.5" />
                                                Maps
                                            </a>
                                            {/* WhatsApp */}
                                            {store.whatsapp && (
                                                <a
                                                    href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors border border-green-100"
                                                >
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                    WhatsApp
                                                </a>
                                            )}
                                            {/* Phone */}
                                            {store.phone && (
                                                <a href={`tel:${store.phone.replace(/\D/g, '')}`} className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-200">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    Ligar
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Social Icons Row */}
                                    <div className="flex justify-center sm:justify-start gap-2 pt-1 border-t border-gray-50 mt-2">
                                        {store.instagram && (
                                            <a href={`https://instagram.com/${store.instagram.replace('@', '')}`} target="_blank" className="p-2 text-gray-400 hover:text-[#E1306C] hover:bg-pink-50 rounded-lg transition-colors">
                                                <Instagram className="h-5 w-5" />
                                            </a>
                                        )}
                                        {store.facebook && (
                                            <a href={store.facebook} target="_blank" className="p-2 text-gray-400 hover:text-[#1877F2] hover:bg-blue-50 rounded-lg transition-colors">
                                                <Facebook className="h-5 w-5" />
                                            </a>
                                        )}
                                        {store.website && (
                                            <a href={store.website} target="_blank" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Globe className="h-5 w-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Profile / Loyalty Card */}
                            <div className="w-full md:w-80 shrink-0 relative z-10">
                                {customer ? (
                                    <div
                                        onClick={() => setShowCustomerArea(true)}
                                        className="h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 md:p-5 text-white shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group"
                                    >
                                        {/* Glow Effect */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff3d03] opacity-20 blur-3xl group-hover:opacity-30 transition-opacity" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-gray-300 text-xs font-medium mb-0.5">Bem-vindo(a),</p>
                                                    <p className="font-bold text-lg truncate max-w-[150px]">{customer.name.split(' ')[0]}</p>
                                                </div>
                                                {/* Tier Badge with Fallback */}
                                                {(customer.loyalty_tier || 'bronze') && (
                                                    <div className={clsx(
                                                        "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border",
                                                        (customer.loyalty_tier || 'bronze') === 'diamond' ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/30" :
                                                            (customer.loyalty_tier || 'bronze') === 'gold' ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/30" :
                                                                (customer.loyalty_tier || 'bronze') === 'silver' ? "bg-gray-500/20 text-gray-200 border-gray-500/30" :
                                                                    "bg-orange-500/20 text-orange-200 border-orange-500/30"
                                                    )}>
                                                        <Trophy className="h-3 w-3" />
                                                        {customer.loyalty_tier === 'diamond' ? 'Diamante' :
                                                            customer.loyalty_tier === 'gold' ? 'Ouro' :
                                                                customer.loyalty_tier === 'silver' ? 'Prata' : 'Bronze'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Points Display Always Visible */}
                                            <div>
                                                <div className="flex items-end gap-2 mb-2">
                                                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff3d03] to-orange-400">
                                                        {customer.loyalty_points || 0}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-400 mb-1.5">pontos</span>
                                                </div>
                                                {/* Mini Progress Bar */}
                                                <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-gradient-to-r from-[#ff3d03] to-orange-500 h-full max-w-full block" style={{ width: '0%' }} />
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-[10px] text-gray-400">Ver recompensas</span>
                                                    <div className="p-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                                        <ChevronRight className="h-4 w-4 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100 flex flex-col justify-center items-center text-center gap-2 md:gap-3">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#ff3d03]">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Cliente Fidelidade?</p>
                                            <p className="text-xs text-gray-500">Entre para acumular pontos!</p>
                                        </div>
                                        <button
                                            onClick={() => setShowAuthModal(true)}
                                            className="w-full py-2 bg-[#ff3d03] hover:bg-[#e63700] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20"
                                        >
                                            Entrar / Cadastrar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Closed Banner */}
                    {!store.is_open && (
                        <div className="max-w-5xl mx-auto px-4 mt-6">
                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-md">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                    <p className="font-bold text-red-700">🔒 Fechado no momento</p>
                                    <p className="text-sm text-red-600">{store.operating_hours_formatted}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Promotion Banner */}
                    {activePromotion && (
                        <div className="max-w-5xl mx-auto px-4 mt-6">
                            <div
                                className="rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
                                style={{
                                    background: `linear-gradient(135deg, ${activePromotion.banner_gradient_start || '#ff3d03'}, ${activePromotion.banner_gradient_end || '#ff6b35'})`,
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    {activePromotion.banner_icon && (
                                        <span className="text-4xl flex-shrink-0">{activePromotion.banner_icon}</span>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-black text-2xl mb-1">{activePromotion.name}</h3>
                                        <p className="text-white/90 text-sm mb-2">{activePromotion.description}</p>
                                        <p className="text-sm font-bold text-white/95">
                                            🔥 Ganhe {activePromotion.multiplier}x mais pontos em todas as compras!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Pills */}
                    <div className="max-w-5xl mx-auto px-4 mt-8 sticky top-4 z-40">
                        <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide justify-center">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={clsx(
                                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                    activeCategory === 'all'
                                        ? "bg-[#ff3d03] text-white shadow-lg shadow-orange-500/30"
                                        : "text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                Todos
                            </button>
                            {categories.filter(cat => cat.category_type !== 'loyalty_rewards').map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => scrollToCategory(cat.id)}
                                    className={clsx(
                                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                        activeCategory === cat.id
                                            ? "bg-[#ff3d03] text-white shadow-lg shadow-orange-500/30"
                                            : "text-gray-500 hover:bg-gray-50"
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                            {categories.some(cat => cat.category_type === 'loyalty_rewards' && cat.products?.length > 0) && (
                                <button
                                    onClick={() => setActiveCategory('rewards')}
                                    className={clsx(
                                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2",
                                        activeCategory === 'rewards'
                                            ? "bg-[#ff3d03] text-white shadow-lg shadow-orange-500/30"
                                            : "text-gray-500 hover:bg-gray-50"
                                    )}
                                >
                                    <Gift className="h-4 w-4" />
                                    Recompensas
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="max-w-5xl mx-auto px-4 mt-8 space-y-12 pb-24">
                        {/* Featured Products Section */}
                        {activeCategory === 'all' && (
                            (() => {
                                const featuredProducts = categories
                                    .flatMap(cat => cat.products)
                                    .filter(p => p.is_featured && p.is_available !== false);

                                if (featuredProducts.length === 0) return null;

                                return (
                                    <div className="scroll-mt-40 mb-12">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide border-l-4 border-yellow-400 pl-3 flex items-center gap-2">
                                                ⭐ Destaques
                                            </h2>
                                            <span className="text-sm font-medium text-gray-400">{featuredProducts.length} itens</span>
                                        </div>

                                        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
                                            {featuredProducts.map((product) => {
                                                const isOutOfStock = product.track_stock && (product.stock_quantity || 0) <= 0;
                                                const hasPromo = product.promotional_price && Number(product.promotional_price) < Number(product.price);

                                                return (
                                                    <div key={`featured-${product.id}`} className={`snap-center shrink-0 min-w-[260px] w-[260px] bg-white rounded-xl overflow-hidden shadow-md border border-yellow-100 flex flex-col ${isOutOfStock ? 'opacity-70 grayscale' : 'hover:shadow-lg hover:border-yellow-300 transition-all duration-300'}`}>
                                                        <div className="h-32 w-full bg-gray-100 relative overflow-hidden">
                                                            {product.image_url ? (
                                                                <img src={product.image_url} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                                    <ShoppingBag className="h-12 w-12" />
                                                                </div>
                                                            )}
                                                            {/* Badges Container */}
                                                            <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-2 z-20">
                                                                {/* Loyalty Redemption Badge */}
                                                                {product.loyalty_redeemable && product.loyalty_points_cost > 0 && (
                                                                    <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-lg shadow-orange-500/50 flex items-center gap-1">
                                                                        <Gift className="h-3 w-3" />
                                                                        {product.loyalty_points_cost} PTS
                                                                    </div>
                                                                )}
                                                                {/* Other Badges */}
                                                                {product.is_promotional && (
                                                                    <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg shadow-red-500/50">
                                                                        🔥 PROMOÇÃO
                                                                    </div>
                                                                )}
                                                                {product.is_new && (
                                                                    <div className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg shadow-purple-500/50">
                                                                        ✨ NOVO
                                                                    </div>
                                                                )}
                                                                {product.is_exclusive && (
                                                                    <div className="bg-cyan-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg shadow-cyan-500/50">
                                                                        💎 EXCLUSIVO
                                                                    </div>
                                                                )}
                                                                {product.is_featured && (
                                                                    <div className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                                                                        ⭐ DESTAQUE
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {isOutOfStock && (
                                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                                                    <span className="bg-red-600 text-white font-black text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg -rotate-3 border-2 border-white shadow-lg">
                                                                        Esgotado
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="p-3 flex-1 flex flex-col">
                                                            <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{product.name}</h3>
                                                            <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
                                                                {product.description}
                                                            </p>

                                                            <div className="mt-auto pt-2 border-t border-gray-100">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex flex-col">
                                                                        {hasPromo && (
                                                                            <span className="text-xs text-gray-400 line-through">
                                                                                R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                                                            </span>
                                                                        )}
                                                                        <div className="text-[#ff3d03] font-bold text-base">
                                                                            R$ {Number(hasPromo ? product.promotional_price : product.price).toFixed(2).replace('.', ',')}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => !isOutOfStock && openProductModal(product)}
                                                                        disabled={isOutOfStock}
                                                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-md active:scale-95 transition-transform
                                                                            ${isOutOfStock
                                                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                                                                                : 'bg-[#ff3d03] text-white hover:bg-[#e63700] shadow-orange-500/20'
                                                                            }`}
                                                                    >
                                                                        {isOutOfStock ? 'Indisponível' : 'Adicionar'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()
                        )}
                        {activeCategory === 'rewards' ? (
                            // Rewards Products View
                            (() => {
                                const rewardsCategory = categories.find(cat => cat.category_type === 'loyalty_rewards');
                                const rewardProducts = rewardsCategory?.products || [];

                                if (rewardProducts.length === 0) {
                                    return (
                                        <div className="text-center py-12">
                                            <Gift className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                            <p className="text-gray-500 font-medium">Nenhuma recompensa disponível no momento</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div key="rewards" className="scroll-mt-40">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide border-l-4 border-[#ff3d03] pl-3">
                                                🎁 Recompensas
                                            </h2>
                                            <span className="text-sm font-medium text-gray-400">{rewardProducts.length} resgates</span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                            {rewardProducts.map((product) => {
                                                const canRedeem = customer && customer.loyalty_points >= (product.loyalty_points_cost || 0);
                                                const insufficientPoints = customer && customer.loyalty_points < (product.loyalty_points_cost || 0);

                                                return (
                                                    <div key={product.id} className="relative overflow-hidden rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col shadow-lg hover:shadow-xl transition-shadow">
                                                        {/* Badge */}
                                                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1">
                                                            <Gift className="h-3 w-3" />
                                                            RESGATE
                                                        </div>

                                                        {/* Image */}
                                                        <div className="h-32 md:h-48 w-full bg-gray-100 relative overflow-hidden">
                                                            {product.image_url ? (
                                                                <img src={product.image_url} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                                    <ShoppingBag className="h-12 w-12" />
                                                                </div>
                                                            )}
                                                            {/* Additional Badges */}
                                                            <div className="absolute top-2 left-2 flex flex-wrap gap-2 z-20">
                                                                {product.is_promotional && (
                                                                    <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg shadow-red-500/50">
                                                                        🔥 PROMOÇÃO
                                                                    </div>
                                                                )}
                                                                {product.is_new && (
                                                                    <div className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg shadow-purple-500/50">
                                                                        ✨ NOVO
                                                                    </div>
                                                                )}
                                                                {product.is_exclusive && (
                                                                    <div className="bg-cyan-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg shadow-cyan-500/50">
                                                                        💎 EXCLUSIVO
                                                                    </div>
                                                                )}
                                                                {product.is_featured && (
                                                                    <div className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                                                                        ⭐ DESTAQUE
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="p-3 md:p-4 flex-1 flex flex-col">
                                                            <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-1 md:mb-2">{product.name}</h3>
                                                            <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2 md:mb-4 flex-1">
                                                                {product.description || 'Recompensa exclusiva'}
                                                            </p>

                                                            {/* Points Cost */}
                                                            <div className="mt-auto pt-4 border-t border-orange-200">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Gift className="h-5 w-5 text-orange-500" />
                                                                        <span className="text-2xl font-black text-orange-600">
                                                                            {product.loyalty_points_cost}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">pts</span>
                                                                </div>

                                                                {/* Customer Points Display */}
                                                                {customer && (
                                                                    <p className="text-xs text-gray-500 mb-3">
                                                                        Seu saldo: <span className="font-bold text-orange-600">{customer.loyalty_points}</span> pontos
                                                                    </p>
                                                                )}

                                                                <button
                                                                    onClick={() => {
                                                                        if (!customer) setShowAuthModal(true);
                                                                        else handleRedeem(product);
                                                                    }}
                                                                    disabled={insufficientPoints}
                                                                    className={`w-full font-bold py-2 md:py-3 rounded-xl transition-colors text-xs md:text-sm uppercase tracking-wide
                                                                        ${insufficientPoints
                                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg active:scale-95'
                                                                        }`}
                                                                >
                                                                    {!customer
                                                                        ? 'Faça Login'
                                                                        : canRedeem
                                                                            ? 'Resgatar'
                                                                            : `Faltam ${(product.loyalty_points_cost || 0) - customer.loyalty_points} pontos`
                                                                    }
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            // Regular Products View
                            categories.filter(cat => cat.category_type !== 'loyalty_rewards').map((cat) => (
                                <div key={cat.id} id={cat.id} className="scroll-mt-40">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide border-l-4 border-[#ff3d03] pl-3">
                                            {cat.name}
                                        </h2>
                                        <span className="text-sm font-medium text-gray-400">{cat.products.length} itens</span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                        {cat.products.map((product) => {
                                            const isOutOfStock = product.track_stock && (product.stock_quantity || 0) <= 0;

                                            return (
                                                <div key={product.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group border border-gray-100 flex flex-col ${isOutOfStock ? 'opacity-70 grayscale' : 'hover:shadow-xl'}`}>
                                                    <div className="h-32 md:h-48 w-full bg-gray-100 relative overflow-hidden">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                                <ShoppingBag className="h-12 w-12" />
                                                            </div>
                                                        )}

                                                        {/* Badges Container */}
                                                        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2 z-20">
                                                            {product.is_promotional && (
                                                                <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg shadow-red-500/50">
                                                                    🔥 PROMOÇÃO
                                                                </div>
                                                            )}
                                                            {product.is_new && (
                                                                <div className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg shadow-purple-500/50">
                                                                    ✨ NOVO
                                                                </div>
                                                            )}
                                                            {product.is_exclusive && (
                                                                <div className="bg-cyan-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg shadow-cyan-500/50">
                                                                    💎 EXCLUSIVO
                                                                </div>
                                                            )}
                                                            {product.is_featured && (
                                                                <div className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                                                                    ⭐ DESTAQUE
                                                                </div>
                                                            )}
                                                        </div>

                                                        {isOutOfStock && (
                                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                                                <span className="bg-red-600 text-white font-black text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg -rotate-3 border-2 border-white shadow-lg">
                                                                    Esgotado
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-3 md:p-5 flex-1 flex flex-col">
                                                        <h3 className="font-extrabold text-gray-900 text-sm md:text-lg mb-1 md:mb-2">{product.name}</h3>
                                                        <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mb-2 md:mb-4 flex-1">
                                                            {product.description || 'Uma explosão de sabor. Ingredientes selecionados para uma experiência única.'}
                                                        </p>

                                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex flex-col">
                                                                    {product.promotional_price && Number(product.promotional_price) < Number(product.price) && (
                                                                        <span className="text-xs text-gray-400 line-through">
                                                                            R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                                                        </span>
                                                                    )}
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-xs text-gray-400">{product.promotional_price ? 'Por' : 'A partir de'}</span>
                                                                        <div className="text-[#ff3d03] font-bold">
                                                                            R$ {Number(product.promotional_price ?? product.price).toFixed(2).replace('.', ',')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => !isOutOfStock && openProductModal(product)}
                                                                disabled={isOutOfStock}
                                                                className={`w-full font-bold py-2 md:py-3 rounded-xl transition-colors shadow-lg active:scale-95 text-xs md:text-sm uppercase tracking-wide
                                                                    ${isOutOfStock
                                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                                                                        : 'bg-[#ff3d03] hover:bg-[#e63700] text-white shadow-orange-500/20'
                                                                    }`}
                                                            >
                                                                {isOutOfStock ? 'Indisponível' : 'Adicionar'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Floating Cart Button */}
                    {cart.length > 0 && (
                        <button
                            onClick={() => setShowCart(true)}
                            className="fixed bottom-6 right-6 bg-[#ff3d03] text-white rounded-full h-16 px-6 flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform z-40"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            <span className="font-bold">{getCartCount()}</span>
                            <span className="h-6 w-px bg-white/30"></span>
                            <PriceTag price={getCartTotal()} />
                        </button>
                    )}
                </div>
            )}


            {/* Store Info Modal */}
            <Modal show={showInfoModal} onClose={() => setShowInfoModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Informações da Loja</h2>
                        <button onClick={() => setShowInfoModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Address & Contact */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-orange-50 p-2.5 rounded-xl text-[#ff3d03] shrink-0">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Endereço</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{store.address}</p>
                                    <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-sm font-bold text-[#ff3d03] hover:underline"
                                    >
                                        Ver no mapa
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-green-50 p-2.5 rounded-xl text-green-600 shrink-0">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Contato</h3>
                                    {store.phone && <p className="text-gray-600 text-sm">Tel: {store.phone}</p>}
                                    {store.whatsapp && <p className="text-gray-600 text-sm">WhatsApp: {store.whatsapp}</p>}
                                    {store.email && <p className="text-gray-600 text-sm">Email: {store.email}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        {(store.settings?.instagram || store.settings?.facebook || store.settings?.website) && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Redes Sociais</h3>
                                <div className="flex gap-4">
                                    {store.settings?.instagram && (
                                        <a href={`https://instagram.com/${store.settings.instagram.replace('@', '')}`} target="_blank" className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-700 font-medium text-sm">
                                            <Instagram className="h-5 w-5 text-pink-600" />
                                            Instagram
                                        </a>
                                    )}
                                    {store.settings?.facebook && (
                                        <a href={store.settings.facebook} target="_blank" className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-700 font-medium text-sm">
                                            <Globe className="h-5 w-5 text-blue-600" />
                                            Facebook
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Business Hours */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-400" />
                                Horários de Funcionamento
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                                    const dayNames: Record<string, string> = {
                                        monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta',
                                        thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo'
                                    };

                                    const hours = store.settings?.business_hours?.[day] || {};
                                    const isOpen = hours.isOpen || hours.is_open;
                                    const open = hours.open || hours.open_time;
                                    const close = hours.close || hours.close_time;

                                    return (
                                        <div key={day} className="flex justify-between text-sm">
                                            <span className="text-gray-600 font-medium w-24">{dayNames[day]}</span>
                                            {isOpen && open && close ? (
                                                <span className="text-gray-900 font-bold">{open} às {close}</span>
                                            ) : (
                                                <span className="text-gray-400">Fechado</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        {store.payment_methods && store.payment_methods.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Formas de Pagamento</h3>
                                <div className="flex flex-wrap gap-2">
                                    {store.payment_methods.map((method: any) => (
                                        <span key={method.id} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                                            {method.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal >

            {/* Checkout Modal */}
            {
                customer && (
                    <CheckoutModal
                        show={showCheckout}
                        onClose={() => setShowCheckout(false)}
                        cart={cart}
                        store={store}
                        customer={customer}
                        total={getCartTotal()}
                        addresses={addresses}
                        onSuccess={(orderId) => {
                            setCart([]); // Clear cart
                            setShowCheckout(false);
                            alert(`Pedido #${orderId} realizado com sucesso! enviamos a confirmação no seu WhatsApp.`);
                            setCustomerTab('orders'); // Go to orders tab
                            setShowCustomerArea(true);
                        }}
                    />
                )
            }

        </div >
    );
}
