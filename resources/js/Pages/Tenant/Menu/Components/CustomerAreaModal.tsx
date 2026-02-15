import { useState, useEffect } from 'react';
import { X, Trophy, Gift, Sparkles, LogOut, MapPin, Home, Plus, Edit2, Trash2, Check, History } from 'lucide-react';
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
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'orders'>('info');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [ordersPage, setOrdersPage] = useState(1);
    const [hasMoreOrders, setHasMoreOrders] = useState(false);

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative z-20 shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Minha Conta</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-gray-50/50">
                    {['info', 'addresses', 'orders'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={clsx(
                                "flex-1 py-4 text-sm font-bold transition-all border-b-2",
                                activeTab === tab
                                    ? "text-[#ff3d03] border-[#ff3d03] bg-white"
                                    : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            {tab === 'info' ? 'Meus Dados' : tab === 'addresses' ? 'Endereços' : 'Pedidos'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-1">{customer.name}</h4>
                                <p className="text-gray-500">{customer.phone}</p>
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
                                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 transition-colors"
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
                                            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 text-gray-600 font-bold py-4 rounded-xl hover:border-[#ff3d03] hover:text-[#ff3d03] hover:bg-orange-50 transition-all"
                                        >
                                            <Plus className="h-5 w-5" />
                                            Adicionar Novo Endereço
                                        </button>
                                    )}

                                    {addresses.map(address => (
                                        <div key={address.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-gray-50 rounded-lg">
                                                        <Home className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">
                                                            {address.street}, {address.number}
                                                        </p>
                                                        {address.complement && (
                                                            <p className="text-sm text-gray-600">{address.complement}</p>
                                                        )}
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {address.neighborhood} • {address.city}/{address.state}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">CEP: {address.zip_code}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => openEditAddress(address)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteAddress(address.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {address.is_default ? (
                                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
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
                                <form onSubmit={handleAddressSubmit} className="bg-white p-6 rounded-2xl border border-gray-200">
                                    <h4 className="font-bold text-gray-900 mb-4">{editingAddress ? 'Editar Endereço' : 'Novo Endereço'}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CEP</label>
                                            <input
                                                type="text"
                                                value={addressForm.zip_code}
                                                onChange={e => setAddressForm({ ...addressForm, zip_code: e.target.value })}
                                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03]"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rua</label>
                                            <input
                                                type="text"
                                                value={addressForm.street}
                                                onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número</label>
                                            <input
                                                type="text"
                                                value={addressForm.number}
                                                onChange={e => setAddressForm({ ...addressForm, number: e.target.value })}
                                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Comp.</label>
                                            <input
                                                type="text"
                                                value={addressForm.complement}
                                                onChange={e => setAddressForm({ ...addressForm, complement: e.target.value })}
                                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03]"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bairro</label>
                                            <input
                                                type="text"
                                                value={addressForm.neighborhood}
                                                onChange={e => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade</label>
                                            <input
                                                type="text"
                                                value={addressForm.city}
                                                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">UF</label>
                                            <input
                                                type="text"
                                                maxLength={2}
                                                value={addressForm.state}
                                                onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#ff3d03]"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => { setShowAddressForm(false); resetAddressForm(); setEditingAddress(null); }}
                                            className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
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
                                    <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-black text-gray-900">#{order.order_number}</span>
                                            <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 uppercase">
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-3">
                                            {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                        <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                                            {order.loyalty_points_earned > 0 && (
                                                <div className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                                                    <Gift className="h-3 w-3" />
                                                    +{order.loyalty_points_earned} pts
                                                </div>
                                            )}
                                            <div className="font-black text-gray-900 ml-auto">
                                                R$ {Number(order.total).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Simple Pagination */}
                            <div className="flex justify-center gap-2 pt-4">
                                {ordersPage > 1 && (
                                    <button onClick={() => loadOrders(ordersPage - 1)} className="px-4 py-2 bg-gray-100 rounded-lg font-bold text-gray-600">Anterior</button>
                                )}
                                {hasMoreOrders && (
                                    <button onClick={() => loadOrders(ordersPage + 1)} className="px-4 py-2 bg-[#ff3d03] rounded-lg font-bold text-white">Próximos</button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
