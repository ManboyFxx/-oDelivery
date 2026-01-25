import { Head } from '@inertiajs/react';
import { ShoppingBag, Phone, Instagram, Globe, MapPin, Clock, User, LogOut, Gift, History, X, Plus, Minus, ShoppingCart, ChevronRight, Trash2, Home, Edit2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
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
}

interface Category {
    id: string;
    name: string;
    products: Product[];
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    loyalty_points: number;
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
    selectedComplements: { groupId: string; optionId: string; name: string; price: number }[];
    subtotal: number;
}

const PriceTag = ({ price }: { price: string | number }) => (
    <span className="font-bold text-[#ff3d03]">
        R$ {Number(price).toFixed(2).replace('.', ',')}
    </span>
);

export default function PublicMenu({ store, categories, slug, authCustomer }: { store: any, categories: Category[], slug: string, authCustomer: Customer | null }) {
    const theme = store.theme_mode || 'modern-clean';
    const [activeCategory, setActiveCategory] = useState<string>('all');

    // Auth Modal
    const [showAuthModal, setShowAuthModal] = useState(false);
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

    // Cart
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);

    // Customer Area
    const [showCustomerArea, setShowCustomerArea] = useState(false);
    const [customerTab, setCustomerTab] = useState<'info' | 'addresses' | 'orders'>('info');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressForm, setAddressForm] = useState({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: ''
    });

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
            const response = await axios.post('/customer/check-phone', { phone });
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
            const response = await axios.post('/customer/complete-registration', { phone, name });
            setCustomer(response.data.customer);
            setShowAuthModal(false);
            setPhone('');
            setName('');
            setAuthStep('phone');
        } catch (error) {
            console.error('Error completing registration:', error);
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
    };

    const closeProductModal = () => {
        setSelectedProduct(null);
        setQuantity(1);
        setNotes('');
        setSelectedComplements({});
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

        setCart(prev => [...prev, newItem]);
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
                                    Adicionar • <PriceTag price={calculateProductTotal()} />
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
                                                <button
                                                    onClick={() => removeFromCart(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
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
                                    <button className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-4 rounded-xl transition-colors">
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

                                    {/* Loyalty Points */}
                                    {store.loyalty_enabled && (
                                        <div className="bg-gradient-to-r from-[#ff3d03] to-orange-600 rounded-xl p-6 text-white">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Gift className="h-5 w-5" />
                                                <span className="text-sm font-medium">Pontos de Fidelidade</span>
                                            </div>
                                            <p className="text-5xl font-black">{customer.loyalty_points}</p>
                                            <p className="text-xs text-white/80 mt-2">Acumule pontos e troque por prêmios!</p>
                                        </div>
                                    )}

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
                                <div className="text-center py-12 text-gray-400">
                                    <History className="h-16 w-16 mx-auto mb-4" />
                                    <p className="text-sm">Nenhum pedido ainda</p>
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
                        <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6 relative z-10">
                            {/* Logo */}
                            <div className="relative shrink-0">
                                <div className="h-32 w-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg relative">
                                    <div className="h-full w-full bg-[#1a1b1e] p-2 flex items-center justify-center">
                                        <img src={store.logo_url || "/images/logo.png"} className="h-full w-full object-contain" />
                                    </div>
                                </div>
                                {store.is_open ? (
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                        ABERTO
                                    </div>
                                ) : (
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        FECHADO
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-black text-gray-800 mb-2">{store.name}</h1>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 text-sm bg-gray-100 px-3 py-1.5 rounded-lg inline-flex">
                                    <Clock className="h-4 w-4" />
                                    <span>{store.operating_hours_formatted}</span>
                                </div>
                            </div>

                            {/* User Section */}
                            <div className="flex gap-3 items-center">
                                {customer ? (
                                    <button
                                        onClick={() => setShowCustomerArea(true)}
                                        className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-800">{customer.name}</p>
                                            {store.loyalty_enabled && (
                                                <p className="text-[10px] text-[#ff3d03] flex items-center gap-1">
                                                    <Gift className="h-3 w-3" />
                                                    {customer.loyalty_points} pontos
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="h-10 w-10 bg-[#ff3d03] text-white rounded-lg flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-orange-500/20"
                                    >
                                        <User className="h-5 w-5" />
                                    </button>
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
                            {categories.map((cat) => (
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
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="max-w-5xl mx-auto px-4 mt-8 space-y-12 pb-24">
                        {categories.map((cat) => (
                            <div key={cat.id} id={cat.id} className="scroll-mt-40">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide border-l-4 border-[#ff3d03] pl-3">
                                        {cat.name}
                                    </h2>
                                    <span className="text-sm font-medium text-gray-400">{cat.products.length} itens</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {cat.products.map((product) => {
                                        const isOutOfStock = product.track_stock && (product.stock_quantity || 0) <= 0;

                                        return (
                                            <div key={product.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group border border-gray-100 flex flex-col ${isOutOfStock ? 'opacity-70 grayscale' : 'hover:shadow-xl'}`}>
                                                <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                            <ShoppingBag className="h-12 w-12" />
                                                        </div>
                                                    )}

                                                    {isOutOfStock && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                                            <span className="bg-red-600 text-white font-black text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg -rotate-3 border-2 border-white shadow-lg">
                                                                Esgotado
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-5 flex-1 flex flex-col">
                                                    <h3 className="font-extrabold text-gray-900 text-lg mb-2">{product.name}</h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                                        {product.description || 'Uma explosão de sabor. Ingredientes selecionados para uma experiência única.'}
                                                    </p>

                                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-xs text-gray-400">A partir de</span>
                                                            <PriceTag price={product.price} />
                                                        </div>
                                                        <button
                                                            onClick={() => !isOutOfStock && openProductModal(product)}
                                                            disabled={isOutOfStock}
                                                            className={`w-full font-bold py-3 rounded-xl transition-colors shadow-lg active:scale-95 text-sm uppercase tracking-wide
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
                        ))}
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
        </div>
    );
}
