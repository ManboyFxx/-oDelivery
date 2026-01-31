import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Store, Truck, CreditCard, Monitor, Printer, Save, MapPin, Phone, Clock, Globe, Shield, Image as ImageIcon, Upload, X, Trash2, Plus, Edit, DollarSign, Palette } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Switch } from '@headlessui/react';
import Modal from '@/Components/Modal';

interface Tab {
    id: string;
    label: string;
    icon: any;
}

interface PaymentMethod {
    id: string;
    name: string;
    type: 'cash' | 'credit_card' | 'debit_card' | 'pix';
    fee_percentage: number;
    fee_fixed: number;
    is_active: boolean;
}

export default function SettingsIndex({ auth, settings, success, paymentMethods = [] }: any) {
    const [activeTab, setActiveTab] = useState('general');
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo_path ? `/storage/${settings.logo_path}` : (settings.logo_url || null));
    const [bannerPreview, setBannerPreview] = useState<string | null>(settings.banner_path ? `/storage/${settings.banner_path}` : (settings.banner_url || null));

    // Main Settings Form
    const { data, setData, post, processing, errors } = useForm({
        // General
        store_name: settings.store_name || '',
        logo_url: settings.logo_url || '',
        banner_url: settings.banner_url || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        address: settings.address || '',

        // Delivery
        delivery_radius_km: settings.delivery_radius_km || 10,
        min_order_delivery: settings.min_order_delivery || 0,
        fixed_delivery_fee: settings.fixed_delivery_fee || 5,
        free_delivery_min: settings.free_delivery_min || '',

        // Financial & Tables
        service_fee_percentage: settings.service_fee_percentage || 10,
        suggested_tip_percentage: settings.suggested_tip_percentage || 10,

        // Integrations
        mercadopago_public_key: settings.mercadopago_public_key || '',
        mercadopago_access_token: settings.mercadopago_access_token || '',

        // System
        printer_paper_width: settings.printer_paper_width || 80,
        auto_print_on_confirm: settings.auto_print_on_confirm || false,
        pwa_theme_color: settings.pwa_theme_color || '#ff3d03',
        menu_theme: settings.menu_theme || 'modern-clean',
    });

    // Payment Method Form & State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

    const {
        data: paymentData,
        setData: setPaymentData,
        post: postPayment,
        put: putPayment,
        delete: destroyPayment,
        processing: paymentProcessing,
        errors: paymentErrors,
        reset: resetPayment,
        clearErrors: clearPaymentErrors
    } = useForm({
        name: '',
        type: 'credit_card',
        fee_percentage: '0',
        fee_fixed: '0',
        is_active: true,
    });

    const tabs: Tab[] = [
        { id: 'general', label: 'Geral', icon: Store },
        { id: 'hours', label: 'Horários', icon: Clock },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'payment', label: 'Formas de Pagamento', icon: CreditCard },
        { id: 'system', label: 'Sistema', icon: Palette },
    ];

    // Handlers
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
            const formData = new FormData();
            formData.append('logo', file);
            router.post(route('settings.upload-logo'), formData as any, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['settings', 'success'] }),
            });
        }
    };

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerPreview(URL.createObjectURL(file));
            const formData = new FormData();
            formData.append('banner', file);
            router.post(route('settings.upload-banner'), formData as any, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['settings', 'success'] }),
            });
        }
    };

    const handleLogoRemove = () => {
        if (!confirm('Tem certeza que deseja remover o logo?')) return;
        setLogoPreview(null);
        router.post(route('settings.remove-logo'), {}, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['settings', 'success'] }),
        });
    };

    const handleBannerRemove = () => {
        if (!confirm('Tem certeza que deseja remover o banner?')) return;
        setBannerPreview(null);
        router.post(route('settings.remove-banner'), {}, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['settings', 'success'] }),
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.update'), {
            preserveScroll: true
        });
    };

    // Payment Methods Logic
    useEffect(() => {
        if (!showPaymentModal) {
            resetPayment();
            clearPaymentErrors();
        }
    }, [showPaymentModal]);

    const openCreatePaymentModal = () => {
        setEditingPaymentMethod(null);
        setPaymentData({
            name: '',
            type: 'credit_card',
            fee_percentage: '0',
            fee_fixed: '0',
            is_active: true,
        });
        setShowPaymentModal(true);
    };

    const openEditPaymentModal = (method: PaymentMethod) => {
        setEditingPaymentMethod(method);
        setPaymentData({
            name: method.name,
            type: method.type as any,
            fee_percentage: method.fee_percentage.toString(),
            fee_fixed: method.fee_fixed.toString(),
            is_active: method.is_active,
        });
        setShowPaymentModal(true);
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPaymentMethod) {
            putPayment(route('payment-methods.update', editingPaymentMethod.id), {
                onSuccess: () => setShowPaymentModal(false),
                preserveScroll: true,
            });
        } else {
            postPayment(route('payment-methods.store'), {
                onSuccess: () => setShowPaymentModal(false),
                preserveScroll: true,
            });
        }
    };

    const handlePaymentDelete = (id: string) => {
        if (confirm('Tem certeza que deseja remover esta forma de pagamento?')) {
            destroyPayment(route('payment-methods.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const togglePaymentActive = (method: PaymentMethod) => {
        router.put(route('payment-methods.update', method.id), {
            ...method,
            is_active: !method.is_active
        }, {
            preserveScroll: true
        });
    };

    const typeLabels = {
        cash: 'Dinheiro',
        credit_card: 'Cartão de Crédito',
        debit_card: 'Cartão de Débito',
        pix: 'Pix',
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Configurações</h2>}
        >
            <Head title="Configurações da Loja" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {success}
                        </div>
                    )}

                    {/* Horizontal Tabs */}
                    <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <nav className="flex px-4" aria-label="Tabs">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={clsx(
                                                "flex items-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                                                isActive
                                                    ? "border-[#ff3d03] text-[#ff3d03]"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                                            )}
                                        >
                                            <Icon className={clsx("h-5 w-5", isActive ? "text-[#ff3d03]" : "text-gray-400")} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border border-t-0 border-gray-100 dark:border-gray-700 p-6">
                        <form onSubmit={submit} className="space-y-6">

                            {activeTab === 'general' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Store className="h-5 w-5 text-[#ff3d03]" />
                                        Informações da Loja
                                    </h3>

                                    {/* Images Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        {/* Logo Upload */}
                                        <div>
                                            <InputLabel value="Logo da Loja" className="mb-2" />
                                            <div className="flex items-center gap-4">
                                                {logoPreview ? (
                                                    <div className="relative group">
                                                        <img src={logoPreview} className="h-24 w-24 object-contain border rounded-lg bg-white" />
                                                        <button
                                                            type="button"
                                                            onClick={handleLogoRemove}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 bg-white">
                                                        <ImageIcon className="h-8 w-8" />
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors">
                                                        <Upload className="h-4 w-4" />
                                                        Escolher Logo
                                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                                    </label>
                                                    <p className="text-xs text-gray-500 mt-1">Recomendado: 500x500px</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Banner Upload */}
                                        <div>
                                            <InputLabel value="Banner (Capa)" className="mb-2" />
                                            <div className="flex flex-col gap-3">
                                                {bannerPreview ? (
                                                    <div className="relative group w-full h-24">
                                                        <img src={bannerPreview} className="h-full w-full object-cover border rounded-lg" />
                                                        <button
                                                            type="button"
                                                            onClick={handleBannerRemove}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 bg-white">
                                                        <ImageIcon className="h-8 w-8" />
                                                    </div>
                                                )}
                                                <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors">
                                                    <Upload className="h-4 w-4" />
                                                    Escolher Banner
                                                    <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Nome da Loja" />
                                            <TextInput
                                                value={data.store_name}
                                                onChange={(e) => setData('store_name', e.target.value)}
                                                className="w-full mt-1"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Telefone / Contato" />
                                            <TextInput
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="w-full mt-1"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="WhatsApp (Apenas números)" />
                                            <TextInput
                                                value={data.whatsapp}
                                                onChange={(e) => setData('whatsapp', e.target.value)}
                                                className="w-full mt-1"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <InputLabel value="Endereço Completo" />
                                            <TextInput
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className="w-full mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'delivery' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Truck className="h-5 w-5 text-[#ff3d03]" />
                                            Configurações de Delivery
                                        </h3>
                                        <a
                                            href={route('delivery-zones.index')}
                                            className="text-sm font-bold text-[#ff3d03] hover:underline flex items-center gap-1"
                                        >
                                            Gerenciar Zonas por Bairro <MapPin className="h-4 w-4" />
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Taxa de Entrega Padrão (R$)" />
                                            <TextInput
                                                type="number"
                                                step="0.01"
                                                value={data.fixed_delivery_fee}
                                                onChange={(e) => setData('fixed_delivery_fee', e.target.value)}
                                                className="w-full mt-1"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Raio de Entrega Padrão (km)" />
                                            <TextInput
                                                type="number"
                                                step="0.1"
                                                value={data.delivery_radius_km}
                                                onChange={(e) => setData('delivery_radius_km', e.target.value)}
                                                className="w-full mt-1"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Pedido Mínimo (R$)" />
                                            <TextInput
                                                type="number"
                                                step="0.01"
                                                value={data.min_order_delivery}
                                                onChange={(e) => setData('min_order_delivery', e.target.value)}
                                                className="w-full mt-1"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Entrega Grátis a partir de (R$)" />
                                            <TextInput
                                                type="number"
                                                step="0.01"
                                                value={data.free_delivery_min}
                                                onChange={(e) => setData('free_delivery_min', e.target.value)}
                                                className="w-full mt-1"
                                                placeholder="Opcional"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 text-sm text-blue-700 dark:text-blue-300">
                                        <Shield className="h-5 w-5 shrink-0" />
                                        <p>As configurações de Zonas de Entrega substituem a taxa padrão quando o endereço do cliente corresponde a um bairro cadastrado.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'financial' && (
                                <div className="space-y-8 animate-fadeIn">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-[#ff3d03]" />
                                            Financeiro e Taxas
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel value="Taxa de Serviço (%) - Mesas" />
                                                <TextInput
                                                    type="number"
                                                    step="1"
                                                    value={data.service_fee_percentage}
                                                    onChange={(e) => setData('service_fee_percentage', e.target.value)}
                                                    className="w-full mt-1"
                                                />
                                            </div>
                                            <div>
                                                <InputLabel value="Sugestão de Gorjeta (%)" />
                                                <TextInput
                                                    type="number"
                                                    step="1"
                                                    value={data.suggested_tip_percentage}
                                                    onChange={(e) => setData('suggested_tip_percentage', e.target.value)}
                                                    className="w-full mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Methods Section within Financial Tab */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Formas de Pagamento Aceitas</h4>
                                            <PrimaryButton onClick={(e) => { e.preventDefault(); openCreatePaymentModal(); }} className="gap-2 bg-gray-900 hover:bg-gray-800">
                                                <Plus className="h-4 w-4" />
                                                Adicionar Método
                                            </PrimaryButton>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(paymentMethods as PaymentMethod[]).length === 0 ? (
                                                <div className="col-span-1 md:col-span-2 text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                                                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                    <p className="text-gray-500">Nenhum método cadastrado</p>
                                                </div>
                                            ) : (
                                                (paymentMethods as PaymentMethod[]).map((method) => (
                                                    <div key={method.id} className="relative bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-md transition-all group">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-[#ff3d03]">
                                                                    {method.type === 'cash' ? <DollarSign className="h-5 w-5" /> :
                                                                        method.type === 'pix' ? <div className="font-bold text-xs">PIX</div> :
                                                                            <CreditCard className="h-5 w-5" />}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{method.name}</h3>
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">{typeLabels[method.type as keyof typeof typeLabels]}</p>
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                checked={method.is_active}
                                                                onChange={() => togglePaymentActive(method)}
                                                                className={`${method.is_active ? 'bg-[#ff3d03]' : 'bg-gray-200 dark:bg-gray-600'
                                                                    } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3d03] focus:ring-offset-2`}
                                                            >
                                                                <span
                                                                    className={`${method.is_active ? 'translate-x-4' : 'translate-x-1'
                                                                        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                                                />
                                                            </Switch>
                                                        </div>

                                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 flex justify-between items-center">
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                {method.fee_percentage > 0 && <span className="mr-2">+{method.fee_percentage}%</span>}
                                                                {method.fee_fixed > 0 && <span>+R$ {parseFloat(method.fee_fixed.toString()).toFixed(2)}</span>}
                                                                {method.fee_percentage == 0 && method.fee_fixed == 0 && <span className="text-green-600">Sem taxas</span>}
                                                            </div>

                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); openEditPaymentModal(method); }}
                                                                    className="text-gray-400 hover:text-blue-600 p-1"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); handlePaymentDelete(method.id); }}
                                                                    className="text-gray-400 hover:text-red-600 p-1"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'integrations' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-[#ff3d03]" />
                                        Integrações
                                    </h3>

                                    <div className="space-y-4 border-b border-gray-100 pb-6">
                                        <h4 className="font-bold text-gray-700 dark:text-gray-300">Mercado Pago</h4>
                                        <div>
                                            <InputLabel value="Public Key" />
                                            <TextInput
                                                value={data.mercadopago_public_key}
                                                onChange={(e) => setData('mercadopago_public_key', e.target.value)}
                                                className="w-full mt-1 font-mono text-sm"
                                                placeholder="APP_USR-..."
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Access Token" />
                                            <TextInput
                                                type="password"
                                                value={data.mercadopago_access_token}
                                                onChange={(e) => setData('mercadopago_access_token', e.target.value)}
                                                className="w-full mt-1 font-mono text-sm"
                                                placeholder="APP_USR-..."
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg flex gap-3 text-sm text-yellow-700 dark:text-yellow-300">
                                        <Clock className="h-5 w-5 shrink-0" />
                                        <p>As integrações com WhatsApp e Mapbox serão configuradas em breve via Evolution API.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'system' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Monitor className="h-5 w-5 text-[#ff3d03]" />
                                        Sistema e Aparência
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Cor Principal do Tema (Hex)" />
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="color"
                                                    value={data.pwa_theme_color}
                                                    onChange={(e) => setData('pwa_theme_color', e.target.value)}
                                                    className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                                                />
                                                <TextInput
                                                    value={data.pwa_theme_color}
                                                    onChange={(e) => setData('pwa_theme_color', e.target.value)}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel value="Tema do Menu Público" />
                                            <select
                                                value={data.menu_theme}
                                                onChange={(e) => setData('menu_theme', e.target.value)}
                                                className="w-full mt-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-[#ff3d03] focus:ring-[#ff3d03] rounded-md shadow-sm"
                                            >
                                                <option value="modern-clean">Sabor & Brasa (Recommended)</option>
                                                <option value="modern">Modern Light</option>
                                                <option value="classic">Classic Dark</option>
                                                <option value="minimal">Minimal List</option>
                                            </select>
                                        </div>

                                        <div>
                                            <InputLabel value="Largura do Papel de Impressão (mm)" />
                                            <select
                                                value={data.printer_paper_width}
                                                onChange={(e) => setData('printer_paper_width', parseInt(e.target.value))}
                                                className="w-full mt-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-[#ff3d03] focus:ring-[#ff3d03] rounded-md shadow-sm"
                                            >
                                                <option value={80}>80mm (Padrão Térmica)</option>
                                                <option value={58}>58mm (Mini Térmica)</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-4 mt-6">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="auto_print"
                                                    type="checkbox"
                                                    checked={data.auto_print_on_confirm}
                                                    onChange={(e) => setData('auto_print_on_confirm', e.target.checked)}
                                                    className="w-5 h-5 text-[#ff3d03] border-gray-300 rounded focus:ring-[#ff3d03] dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                            <label htmlFor="auto_print" className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                                Imprimir automaticamente ao confirmar pedido
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                <PrimaryButton disabled={processing} className="gap-2 bg-[#ff3d03] hover:bg-[#e63700]">
                                    <Save className="h-4 w-4" />
                                    Salvar Configurações
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Payment Method Modal */}
            <Modal show={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
                <form onSubmit={submitPayment} className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {editingPaymentMethod ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
                        </h2>
                        <button type="button" onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nome (Exibido no Checkout)" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={paymentData.name}
                                onChange={(e) => setPaymentData('name', e.target.value)}
                                placeholder="Ex: Cartão de Crédito Visa/Master"
                                required
                            />
                            <p className="mt-1 text-sm text-red-600">{paymentErrors.name}</p>
                        </div>

                        <div>
                            <InputLabel htmlFor="type" value="Tipo de Pagamento" />
                            <select
                                id="type"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-[#ff3d03] focus:ring-[#ff3d03] rounded-md shadow-sm"
                                value={paymentData.type}
                                onChange={(e) => setPaymentData('type', e.target.value as any)}
                            >
                                <option value="credit_card">Cartão de Crédito</option>
                                <option value="debit_card">Cartão de Débito</option>
                                <option value="pix">Pix</option>
                                <option value="cash">Dinheiro</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="fee_percentage" value="Taxa (% sobre o total)" />
                                <TextInput
                                    id="fee_percentage"
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={paymentData.fee_percentage}
                                    onChange={(e) => setPaymentData('fee_percentage', e.target.value)}
                                    placeholder="0"
                                />
                                <p className="mt-1 text-xs text-gray-500">Adiciona X% ao valor do pedido.</p>
                            </div>

                            <div>
                                <InputLabel htmlFor="fee_fixed" value="Taxa Fixa (R$)" />
                                <TextInput
                                    id="fee_fixed"
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={paymentData.fee_fixed}
                                    onChange={(e) => setPaymentData('fee_fixed', e.target.value)}
                                    placeholder="0.00"
                                />
                                <p className="mt-1 text-xs text-gray-500">Adiciona valor fixo ao pedido.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={paymentData.is_active}
                                onChange={(checked) => setPaymentData('is_active', checked)}
                                className={`${paymentData.is_active ? 'bg-[#ff3d03]' : 'bg-gray-200 dark:bg-gray-600'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3d03] focus:ring-offset-2`}
                            >
                                <span
                                    className={`${paymentData.is_active ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Método Ativo</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowPaymentModal(false)}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={paymentProcessing} className="bg-[#ff3d03] hover:bg-[#e63700]">
                            {editingPaymentMethod ? 'Atualizar' : 'Salvar'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
