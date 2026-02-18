import { useState, useEffect } from 'react';
import { X, Trophy, Gift, Sparkles, LogOut, MapPin, Home, Plus, Edit2, Trash2, Check, History, Share2, Copy, Bell } from 'lucide-react';
import { Customer, Address, Order } from './types';
import clsx from 'clsx';
import axios from 'axios';
import { toast } from 'sonner';

interface CustomerAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer;
    onLogout: () => void;
    store: any;
}

export default function CustomerAreaModal({ isOpen, onClose, customer, onLogout, store }: CustomerAreaModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'orders' | 'referral'>('info');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [ordersPage, setOrdersPage] = useState(1);
    const [hasMoreOrders, setHasMoreOrders] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load Notifications
    const loadNotifications = async () => {
        try {
            const response = await axios.get('/customer/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    const markAsRead = async (id: string) => {
        try {
            await axios.post(`/customer/notifications/${id}/read`);
            // Update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
         try {
            await axios.post(`/customer/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    // Address Form State
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
    const [loadingAddress, setLoadingAddress] = useState(false);

    // Load Addresses
    const loadAddresses = async () => {
        try {
            const response = await axios.get('/customer/addresses');
            setAddresses(response.data);
        } catch (error) {
            console.error('Error loading addresses:', error);
            toast.error('Erro ao carregar endereços.');
        }
    };

    // Load Orders
    const loadOrders = async (page: number = 1) => {
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
            toast.error('Erro ao carregar pedidos.');
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'addresses') loadAddresses();
        if (activeTab === 'orders') loadOrders(1);
    }, [activeTab]);

    // Address Handlers
    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAddress(true);
        try {
            if (editingAddress) {
                await axios.put(`/customer/addresses/${editingAddress.id}`, addressForm);
                toast.success('Endereço atualizado!');
            } else {
                await axios.post('/customer/addresses', addressForm);
                toast.success('Endereço cadastrado!');
            }
            await loadAddresses();
            setShowAddressForm(false);
            setEditingAddress(null);
            resetAddressForm();
        } catch (error: any) {
            console.error('Error saving address:', error);
            toast.error(error.response?.data?.message || 'Erro ao salvar endereço.');
        } finally {
            setLoadingAddress(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este endereço?')) return;
        try {
            await axios.delete(`/customer/addresses/${id}`);
            toast.success('Endereço removido.');
            loadAddresses();
        } catch (error) {
            toast.error('Erro ao remover endereço.');
        }
    };

    const handleSetDefaultAddress = async (id: string) => {
        try {
            await axios.post(`/customer/addresses/${id}/set-default`);
            toast.success('Endereço padrão atualizado.');
            loadAddresses();
        } catch (error) {
            toast.error('Erro ao definir endereço padrão.');
        }
    };

    const resetAddressForm = () => {
        setAddressForm({
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zip_code: ''
        });
    }

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

    // Referral Logic
    const referralLink = `${window.location.origin}/menu/${store.slug}?ref=${customer.referral_code}`;
    const shareMessage = `Olá! Use meu código *${customer.referral_code}* no ${store.name} e ganhe benefícios incríveis! Peça aqui: ${referralLink}`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado para a área de transferência!');
    };

    const shareOnWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="bg-white dark:bg-premium-dark rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative z-20 shadow-2xl animate-in fade-in zoom-in duration-300 transition-colors duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-premium-dark rounded-t-2xl z-10 relative transition-colors duration-300">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Minha Conta</h3>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-[#ff3d03] hover:bg-orange-50 dark:hover:bg-white/10 rounded-full transition-colors relative"
                        >
                            <Bell className="h-6 w-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-premium-dark"></span>
                            )}
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-16 right-6 w-80 bg-white dark:bg-premium-card rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 p-4 z-50 animate-in fade-in slide-in-from-top-2 max-h-[400px] overflow-y-auto transition-colors duration-300">
                             <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-gray-900 dark:text-white transition-colors duration-300">Notificações</h4>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-orange-500 font-bold hover:underline">Marcar todas como lidas</button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm italic">
                                        Nenhuma notificação por enquanto.
                                    </div>
                                ) : (
                                    notifications.map(notification => (
                                        <div 
                                            key={notification.id} 
                                            onClick={() => !notification.read_at && markAsRead(notification.id)}
                                            className={clsx(
                                                "p-3 rounded-lg flex gap-3 items-start cursor-pointer transition-colors duration-300",
                                                notification.read_at ? "bg-white dark:bg-white/5 opacity-60" : "bg-orange-50 dark:bg-[#ff3d03]/10 hover:bg-orange-100 dark:hover:bg-[#ff3d03]/20"
                                            )}
                                        >
                                            <div className={clsx(
                                                "p-1.5 rounded-full shrink-0 transition-colors duration-300",
                                                notification.read_at ? "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500" : "bg-orange-100 dark:bg-[#ff3d03]/20 text-[#ff3d03]"
                                            )}>
                                                {/* Dynamic Icon based on type if feasible, currently assuming Gift/System */}
                                                <Gift className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className={clsx("text-sm text-gray-800 dark:text-gray-200 transition-colors duration-300", !notification.read_at && "font-bold")}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug transition-colors duration-300">
                                                    {notification.message}
                                                </p>
                                                <span className="text-[10px] text-gray-400 mt-1 block">
                                                    {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            {!notification.read_at && (
                                                <div className="bg-red-500 h-2 w-2 rounded-full shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 overflow-x-auto transition-colors duration-300">
                    {['info', 'addresses', 'orders', 'referral'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={clsx(
                                "flex-1 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap px-4 duration-300",
                                activeTab === tab
                                    ? "text-[#ff3d03] border-[#ff3d03] bg-white dark:bg-premium-dark"
                                    : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
                            )}
                        >
                            {tab === 'info' ? 'Meus Dados' : tab === 'addresses' ? 'Endereços' : tab === 'orders' ? 'Pedidos' : 'Indique e Ganhe'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-black/20 transition-colors duration-300">
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-premium-card p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors duration-300">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">{customer.name}</h4>
                                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">{customer.phone}</p>
                            </div>

                            {/* Loyalty Banner */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.15] group-hover:scale-110 transition-transform duration-700">
                                    <Trophy size={140} />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                            <Gift className="h-6 w-6 text-[#ff3d03]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Programa de Fidelidade</p>
                                            <p className="font-bold text-lg">{customer.loyalty_tier ? `${customer.loyalty_tier} Member` : 'Membro Bronze'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff3d03] to-orange-400">
                                            {customer.loyalty_points || 0}
                                        </span>
                                        <span className="text-lg font-bold text-gray-400">pontos</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">Acumule pontos e troque por recompensas exclusivas!</p>
                                </div>
                            </div>

                            <button
                                onClick={onLogout}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                Sair da Conta
                            </button>
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div className="space-y-4">
                            {!showAddressForm ? (
                                <>
                                    {addresses.length < 3 && (
                                        <button
                                            onClick={() => setShowAddressForm(true)}
                                            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-premium-card border-2 border-dashed border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold py-4 rounded-xl hover:border-[#ff3d03] hover:text-[#ff3d03] hover:bg-orange-50 dark:hover:bg-white/5 transition-all"
                                        >
                                            <Plus className="h-5 w-5" />
                                            Adicionar Novo Endereço
                                        </button>
                                    )}

                                    {addresses.map(address => (
                                        <div key={address.id} className="bg-white dark:bg-premium-card border border-gray-200 dark:border-white/5 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg transition-colors duration-300">
                                                        <Home className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                                            {address.street}, {address.number}
                                                        </p>
                                                        {address.complement && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{address.complement}</p>
                                                        )}
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                                                            {address.neighborhood} • {address.city}/{address.state}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">CEP: {address.zip_code}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => openEditAddress(address)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteAddress(address.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {address.is_default ? (
                                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full transition-colors duration-300">
                                                    <Check className="h-3 w-3" /> Padrão
                                                </div>
                                            ) : (
                                                <button onClick={() => handleSetDefaultAddress(address.id)} className="text-xs font-bold text-gray-500 hover:text-[#ff3d03] transition-colors">
                                                    Definir como padrão
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <form onSubmit={handleAddressSubmit} className="bg-white dark:bg-premium-card p-6 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors duration-300">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{editingAddress ? 'Editar Endereço' : 'Novo Endereço'}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 transition-colors duration-300">CEP</label>
                                            <input
                                                type="text"
                                                value={addressForm.zip_code}
                                                onChange={e => setAddressForm({ ...addressForm, zip_code: e.target.value })}
                                                className="w-full p-3 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03] text-gray-900 dark:text-white transition-colors duration-300"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 transition-colors duration-300">Rua</label>
                                            <input
                                                type="text"
                                                value={addressForm.street}
                                                onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                                                className="w-full p-3 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03] text-gray-900 dark:text-white transition-colors duration-300"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 transition-colors duration-300">Número</label>
                                            <input
                                                type="text"
                                                value={addressForm.number}
                                                onChange={e => setAddressForm({ ...addressForm, number: e.target.value })}
                                                className="w-full p-3 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03] text-gray-900 dark:text-white transition-colors duration-300"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 transition-colors duration-300">Comp.</label>
                                            <input
                                                type="text"
                                                value={addressForm.complement}
                                                onChange={e => setAddressForm({ ...addressForm, complement: e.target.value })}
                                                className="w-full p-3 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03] text-gray-900 dark:text-white transition-colors duration-300"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 transition-colors duration-300">Bairro</label>
                                            <input
                                                type="text"
                                                value={addressForm.neighborhood}
                                                onChange={e => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                                                className="w-full p-3 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03] text-gray-900 dark:text-white transition-colors duration-300"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 transition-colors duration-300">Cidade</label>
                                            <input
                                                type="text"
                                                value={addressForm.city}
                                                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="w-full p-3 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03] text-gray-900 dark:text-white transition-colors duration-300"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 transition-colors duration-300">UF</label>
                                            <input
                                                type="text"
                                                maxLength={2}
                                                value={addressForm.state}
                                                onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                                                className="w-full p-3 bg-gray-50 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03] text-gray-900 dark:text-white transition-colors duration-300"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => { setShowAddressForm(false); resetAddressForm(); setEditingAddress(null); }}
                                            className="flex-1 py-3 font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loadingAddress}
                                            className="flex-1 py-3 bg-[#ff3d03] text-white font-bold rounded-xl hover:bg-[#e63700] transition-colors shadow-lg shadow-orange-500/30"
                                        >
                                            {loadingAddress ? 'Salvando...' : 'Salvar Endereço'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p>Nenhum pedido realizado ainda.</p>
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="bg-white dark:bg-premium-card border border-gray-100 dark:border-white/5 rounded-xl p-4 shadow-sm transition-colors duration-300">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-black text-gray-900 dark:text-white transition-colors duration-300">#{order.order_number}</span>
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 uppercase transition-colors duration-300">
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 transition-colors duration-300">
                                            {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                        <div className="flex justify-between items-end border-t border-gray-50 dark:border-white/5 pt-3 transition-colors duration-300">
                                            {order.loyalty_points_earned > 0 && (
                                                <div className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                                                    <Gift className="h-3 w-3" />
                                                    +{order.loyalty_points_earned} pts
                                                </div>
                                            )}
                                            <div className="font-black text-gray-900 dark:text-white ml-auto transition-colors duration-300">
                                                R$ {Number(order.total).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Simple Pagination */}
                            <div className="flex justify-center gap-2 pt-4">
                                {ordersPage > 1 && (
                                    <button onClick={() => loadOrders(ordersPage - 1)} className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-lg font-bold text-gray-600 dark:text-gray-300 transition-colors duration-300">Anterior</button>
                                )}
                                {hasMoreOrders && (
                                    <button onClick={() => loadOrders(ordersPage + 1)} className="px-4 py-2 bg-[#ff3d03] rounded-lg font-bold text-white">Próximos</button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'referral' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2 transition-colors duration-300">Indique e Ganhe! 🚀</h4>
                                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                    Convide amigos para o {store.name} e ganhem pontos juntos.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500 to-[#ff3d03] rounded-2xl p-6 text-white text-center shadow-lg shadow-orange-500/30">
                                <p className="font-bold text-orange-100 uppercase text-xs tracking-wider mb-2">Seu Código de Indicação</p>
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <span className="text-4xl font-black tracking-widest border-2 border-white/20 px-6 py-2 rounded-xl bg-white/10 backdrop-blur-sm dashed">
                                        {customer.referral_code || '---'}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(customer.referral_code || '')}
                                        className="p-3 bg-white dark:bg-white/10 text-[#ff3d03] rounded-xl hover:bg-orange-50 dark:hover:bg-white/20 transition-colors shadow-sm"
                                        title="Copiar código"
                                    >
                                        <Copy className="h-6 w-6" />
                                    </button>
                                </div>
                                <p className="text-sm text-white/90">
                                    Compartilhe este código com seus amigos.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-premium-card border border-gray-100 dark:border-white/5 rounded-xl p-5 shadow-sm transition-colors duration-300">
                                <h5 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 transition-colors duration-300">
                                    <Gift className="h-4 w-4 text-[#ff3d03]" />
                                    Como funciona:
                                </h5>
                                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                    <li className="flex gap-3">
                                        <div className="h-6 w-6 bg-orange-100 text-[#ff3d03] rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</div>
                                        <p>Envie seu código ou link para um amigo.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="h-6 w-6 bg-orange-100 text-[#ff3d03] rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</div>
                                        <p>Seu amigo faz a primeira compra usando seu código.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="h-6 w-6 bg-orange-100 text-[#ff3d03] rounded-full flex items-center justify-center font-bold text-xs shrink-0">3</div>
                                        <p>Você ganha <strong className="text-gray-900 dark:text-white transition-colors duration-300">{store.settings.referral_referrer_points || 0} pontos</strong> automaticamente!</p>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={shareOnWhatsApp}
                                className="w-full py-4 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                            >
                                <Share2 className="h-5 w-5" />
                                Compartilhar no WhatsApp
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
