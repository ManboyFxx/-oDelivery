import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Store,
    Clock,
    Truck,
    CreditCard,
    Palette,
    Save,
    Upload,
    X,
    Trash2,
    Plus,
    Edit,
    MapPin,
    Phone,
    Mail,
    Instagram,
    Facebook,
    Globe,
    AlertCircle,
    Check,
    DollarSign,
    Bell
} from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@headlessui/react';
import Modal from '@/Components/Modal';
import PageHeader from '@/Components/PageHeader';

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

interface DeliveryZone {
    id: string;
    neighborhood: string;
    delivery_fee: number;
    estimated_time_min: number;
    is_active: boolean;
}

interface BusinessHours {
    [key: string]: {
        is_open: boolean;
        open_time: string;
        close_time: string;
    };
}

export default function SettingsIndex({ auth, settings, success, paymentMethods = [], deliveryZones = [], motoboys = [] }: any) {
    const [activeTab, setActiveTab] = useState('general');
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.logo_path ? `/storage/${settings.logo_path}` : (settings.logo_url || null)
    );
    const [bannerPreview, setBannerPreview] = useState<string | null>(
        settings.banner_path ? `/storage/${settings.banner_path}` : (settings.banner_url || null)
    );

    // Modals
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
    const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

    // Parse business hours from settings
    const defaultHours: BusinessHours = {
        monday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        tuesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        wednesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        thursday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        friday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        saturday: { is_open: true, open_time: '09:00', close_time: '14:00' },
        sunday: { is_open: false, open_time: '09:00', close_time: '14:00' },
    };

    const [businessHours, setBusinessHours] = useState<BusinessHours>(
        settings.business_hours ? (typeof settings.business_hours === 'string' ? JSON.parse(settings.business_hours) : settings.business_hours) : defaultHours
    );

    const defaultNotificationSettings = {
        browser_notifications: true,
        sound_enabled: true,
        order_created: true,
        order_status_updated: true,
        stock_low_warning: true,
    };

    const [notificationSettings, setNotificationSettings] = useState(
        settings.notification_settings ? (typeof settings.notification_settings === 'string' ? JSON.parse(settings.notification_settings) : settings.notification_settings) : defaultNotificationSettings
    );

    // Main Settings Form
    const { data, setData, post, processing, errors } = useForm({
        // General
        store_name: settings.store_name || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        address: settings.address || '',
        description: settings.description || '',
        instagram: settings.instagram || '',
        facebook: settings.facebook || '',
        website: settings.website || '',

        // Delivery
        delivery_radius_km: settings.delivery_radius_km || 10,
        min_order_delivery: settings.min_order_delivery || 0,
        fixed_delivery_fee: settings.fixed_delivery_fee || 5,
        free_delivery_min: settings.free_delivery_min || '',
        estimated_delivery_time: settings.estimated_delivery_time || 30,
        default_motoboy_id: settings.default_motoboy_id || '',

        // System
        theme_color: settings.theme_color || '#ff3d03',
        printer_paper_width: settings.printer_paper_width || 80,
        auto_print_on_confirm: settings.auto_print_on_confirm || false,

        // Business Hours
        // Business Hours
        business_hours: JSON.stringify(businessHours),

        // Notifications
        notification_settings: JSON.stringify(notificationSettings), // Consistent with legacy pattern
    });

    // Payment Method Form
    const {
        data: paymentData,
        setData: setPaymentData,
        post: postPayment,
        put: putPayment,
        delete: destroyPayment,
        processing: paymentProcessing,
        errors: paymentErrors,
        reset: resetPayment,
    } = useForm({
        name: '',
        type: 'pix',
        fee_percentage: '0',
        fee_fixed: '0',
        is_active: true,
    });

    // Delivery Zone Form
    const {
        data: zoneData,
        setData: setZoneData,
        post: postZone,
        put: putZone,
        delete: destroyZone,
        processing: zoneProcessing,
        errors: zoneErrors,
        reset: resetZone,
    } = useForm({
        neighborhood: '',
        delivery_fee: '',
        estimated_time_min: 30,
        is_active: true,
    });

    const tabs: Tab[] = [
        { id: 'general', label: 'Geral', icon: Store },
        { id: 'hours', label: 'Horários', icon: Clock },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'payment', label: 'Formas de Pagamento', icon: CreditCard },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'system', label: 'Sistema', icon: Palette },
    ];

    const dayNames: { [key: string]: string } = {
        monday: 'Segunda-feira',
        tuesday: 'Terça-feira',
        wednesday: 'Quarta-feira',
        thursday: 'Quinta-feira',
        friday: 'Sexta-feira',
        saturday: 'Sábado',
        sunday: 'Domingo',
    };

    const FIXED_PAYMENT_METHODS = [
        { id: 'cash', type: 'cash', name: 'Dinheiro', icon: DollarSign },
        { id: 'debit_card', type: 'debit_card', name: 'Cartão de Débito', icon: CreditCard },
        { id: 'credit_card', type: 'credit_card', name: 'Cartão de Crédito', icon: CreditCard },
        {
            id: 'pix', type: 'pix', name: 'PIX', icon: (props: any) => (
                <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11.5L12 16.5L17 11.5" /><path d="M7 7.5L12 12.5L17 7.5" /><path d="M12 21V3" /></svg>
            )
        },
    ];

    // Merge backend methods with fixed methods
    // If backend has method of type X, use it. Otherwise use default.
    const [methods, setMethods] = useState(() => {
        return FIXED_PAYMENT_METHODS.map(fixed => {
            const existing = paymentMethods.find((pm: any) => pm.type === fixed.type);
            return existing ? { ...existing, ...fixed } : {
                ...fixed,
                // id: null, // Don't use ID if not created yet, logic should handle this. 
                // Actually to make it easier, we will assume backend returns all? 
                // No, we might need to create on first toggle.
                is_active: false,
                fee_percentage: 0,
                fee_fixed: 0,
                pix_key: '',
                pix_key_type: 'random'
            };
        });
    });

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
        setLogoPreview(null);
        router.delete(route('settings.remove-logo'), {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['settings', 'success'] }),
        });
    };

    const handleBannerRemove = () => {
        setBannerPreview(null);
        router.delete(route('settings.remove-banner'), {
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

    const updateBusinessHours = (day: string, field: string, value: any) => {
        const updated = {
            ...businessHours,
            [day]: {
                ...businessHours[day],
                [field]: value,
            },
        };
        setBusinessHours(updated);
        setData('business_hours', JSON.stringify(updated));
    };

    const updateNotificationSettings = (field: string, value: boolean) => {
        const updated = {
            ...notificationSettings,
            [field]: value,
        };
        setNotificationSettings(updated);
        setData('notification_settings' as any, JSON.stringify(updated));
    };

    // Simplified Payment Handlers
    const handlePaymentToggle = (method: any) => {
        const payload = {
            ...method,
            is_active: !method.is_active,
            // Ensure type is sent if it's a new record
            name: method.name,
            type: method.type
        };

        // We use a specific endpoint or just re-use store/update logic?
        // Let's use a new 'sync' endpoint or just 'store' if no ID, 'update' if ID.
        // But to keep it simple with existing controller, we might need to change controller logic to findByType.
        // Or we pass ID if it exists.

        const routeName = method.id && method.created_at ? 'payment-methods.update' : 'payment-methods.store';
        const routeParams = method.id && method.created_at ? method.id : {};

        // If it's a create, method.id from FIXED list is just the type string, NOT a UUID.
        // We need to check if it has a real database ID. 
        // We can check if `created_at` property exists (assuming standard model).

        // Check if this is a real database record (has created_at and numeric/UUID id)
        // FIXED_PAYMENT_METHODS have string IDs like 'cash', 'debit_card', etc.
        // Database records will have UUID or numeric IDs
        const isExistingRecord = method.created_at && method.id && method.id.length > 20; // UUIDs are longer than type strings

        if (isExistingRecord) {
            router.put(route('payment-methods.update', method.id), payload, {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['paymentMethods', 'success'] }),
            });
        } else {
            router.post(route('payment-methods.store'), payload, {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['paymentMethods', 'success'] }),
            });
        }
    };

    const handlePaymentUpdate = (method: any, field: string, value: any) => {
        // Just update local state for inputs, save on blur or dedicated save button?
        // User asked for toggles. Fees/Keys usually need a save action or auto-save.
        // Let's update local state 'methods'.
        setMethods((prev: any) => prev.map((m: any) => m.type === method.type ? { ...m, [field]: value } : m));
    };

    const savePaymentMethod = (method: any) => {
        const isExistingRecord = method.created_at && method.id && method.id.length > 20;
        const payload = { ...method };

        if (isExistingRecord) {
            router.put(route('payment-methods.update', method.id), payload, {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['paymentMethods', 'success'] }), // Reload will overwrite local state with DB state
            });
        } else {
            router.post(route('payment-methods.store'), payload, {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['paymentMethods', 'success'] }),
            });
        }
    };

    // Delivery Zones
    const openCreateZoneModal = () => {
        setEditingZone(null);
        resetZone();
        setShowZoneModal(true);
    };

    const openEditZoneModal = (zone: DeliveryZone) => {
        setEditingZone(zone);
        setZoneData({
            neighborhood: zone.neighborhood,
            delivery_fee: zone.delivery_fee.toString(),
            estimated_time_min: zone.estimated_time_min,
            is_active: zone.is_active,
        });
        setShowZoneModal(true);
    };

    const submitZone = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingZone) {
            putZone(route('delivery-zones.update', editingZone.id), {
                onSuccess: () => {
                    setShowZoneModal(false);
                    router.reload({ only: ['deliveryZones', 'success'] });
                },
            });
        } else {
            postZone(route('delivery-zones.store'), {
                onSuccess: () => {
                    setShowZoneModal(false);
                    router.reload({ only: ['deliveryZones', 'success'] });
                },
            });
        }
    };

    const handleDeleteZone = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta zona de entrega?')) {
            destroyZone(route('delivery-zones.destroy', id), {
                onSuccess: () => router.reload({ only: ['deliveryZones', 'success'] }),
            });
        }
    };

    const toggleZoneActive = (zone: DeliveryZone) => {
        router.put(route('delivery-zones.update', zone.id), {
            ...zone,
            is_active: !zone.is_active
        }, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['deliveryZones', 'success'] }),
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Configurações" />

            <div className="flex h-full flex-col space-y-8">
                <PageHeader
                    title="Configurações"
                    subtitle="Gerencie todas as configurações do seu estabelecimento"
                />

                {success && (
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-2xl p-4 flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            {success}
                        </p>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="bg-white dark:bg-premium-card rounded-[24px] border border-gray-100 dark:border-white/5 p-2 shadow-sm">
                    <div className="flex gap-2 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${isActive
                                        ? 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <form onSubmit={submit} className="space-y-6">
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            {/* Store Information */}
                            <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                                <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold">
                                    <Store className="h-5 w-5 text-[#ff3d03]" />
                                    Informações do Estabelecimento
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nome do Estabelecimento
                                        </label>
                                        <input
                                            type="text"
                                            value={data.store_name}
                                            onChange={(e) => setData('store_name', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="Minha Pizzaria"
                                        />
                                        {errors.store_name && <p className="mt-1 text-sm text-red-600">{errors.store_name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Phone className="h-4 w-4 inline mr-1" />
                                            Telefone
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.whatsapp}
                                            onChange={(e) => setData('whatsapp', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Mail className="h-4 w-4 inline mr-1" />
                                            E-mail
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="contato@estabelecimento.com"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <MapPin className="h-4 w-4 inline mr-1" />
                                            Endereço Completo
                                        </label>
                                        <input
                                            type="text"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Descrição do Estabelecimento
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="Conte um pouco sobre seu estabelecimento..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                                <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold">
                                    <Globe className="h-5 w-5 text-[#ff3d03]" />
                                    Redes Sociais
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Instagram className="h-4 w-4 inline mr-1" />
                                            Instagram
                                        </label>
                                        <input
                                            type="text"
                                            value={data.instagram}
                                            onChange={(e) => setData('instagram', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="@seuinstagram"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Facebook className="h-4 w-4 inline mr-1" />
                                            Facebook
                                        </label>
                                        <input
                                            type="text"
                                            value={data.facebook}
                                            onChange={(e) => setData('facebook', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="facebook.com/seuperfil"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Globe className="h-4 w-4 inline mr-1" />
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={data.website}
                                            onChange={(e) => setData('website', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="https://seusite.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Logo and Banner */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Logo */}
                                <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                                    <h3 className="text-gray-900 dark:text-gray-200 mb-6 font-bold">Logo</h3>

                                    {logoPreview ? (
                                        <div className="relative">
                                            <img
                                                src={logoPreview}
                                                alt="Logo"
                                                className="w-full h-48 object-contain bg-gray-50 bg-white dark:bg-premium-dark rounded-2xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleLogoRemove}
                                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl cursor-pointer hover:border-[#ff3d03] transition-colors">
                                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Clique para fazer upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Banner */}
                                <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                                    <h3 className="text-gray-900 dark:text-gray-200 mb-6 font-bold">Banner</h3>

                                    {bannerPreview ? (
                                        <div className="relative">
                                            <img
                                                src={bannerPreview}
                                                alt="Banner"
                                                className="w-full h-48 object-cover bg-gray-50 dark:bg-premium-dark bg-white rounded-2xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleBannerRemove}
                                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl cursor-pointer hover:border-[#ff3d03] transition-colors">
                                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Clique para fazer upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleBannerUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Business Hours Tab */}
                    {activeTab === 'hours' && (
                        <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                            <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold">
                                <Clock className="h-5 w-5 text-[#ff3d03]" />
                                Horários de Funcionamento
                            </h3>

                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-medium">Integração com Menu Público</p>
                                    <p className="mt-1">Os horários configurados aqui serão exibidos no menu público. Quando fora do horário, será mostrado um banner "Fechado".</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {Object.keys(businessHours).map((day) => (
                                    <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-premium-dark rounded-2xl">
                                        <div className="w-32">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{dayNames[day]}</span>
                                        </div>

                                        <Switch
                                            checked={businessHours[day].is_open}
                                            onChange={(checked) => updateBusinessHours(day, 'is_open', checked)}
                                            className={`${businessHours[day].is_open ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'
                                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                        >
                                            <span
                                                className={`${businessHours[day].is_open ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                        </Switch>

                                        {businessHours[day].is_open ? (
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="time"
                                                    value={businessHours[day].open_time}
                                                    onChange={(e) => updateBusinessHours(day, 'open_time', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                                />
                                                <span className="text-gray-500 font-medium">até</span>
                                                <input
                                                    type="time"
                                                    value={businessHours[day].close_time}
                                                    onChange={(e) => updateBusinessHours(day, 'close_time', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 dark:text-gray-400">Fechado</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                            <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold">
                                <Bell className="h-5 w-5 text-[#ff3d03]" />
                                Preferências de Notificação
                            </h3>

                            <div className="space-y-6">
                                {/* Global Settings */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Geral</h4>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Notificações no Navegador</p>
                                            <p className="text-sm text-gray-500">Exibir alertas flutuantes no canto da tela (Toasts).</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.browser_notifications}
                                            onChange={(checked) => updateNotificationSettings('browser_notifications', checked)}
                                            className={`${notificationSettings.browser_notifications ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                        >
                                            <span className={`${notificationSettings.browser_notifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </Switch>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Alertas Sonoros</p>
                                            <p className="text-sm text-gray-500">Reproduzir som ao receber novas notificações.</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.sound_enabled}
                                            onChange={(checked) => updateNotificationSettings('sound_enabled', checked)}
                                            className={`${notificationSettings.sound_enabled ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                        >
                                            <span className={`${notificationSettings.sound_enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </Switch>
                                    </div>
                                </div>

                                {/* Events */}
                                <div className="space-y-4 pt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Eventos</h4>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Novo Pedido</p>
                                            <p className="text-sm text-gray-500">Notificar quando um novo pedido for recebido.</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.order_created}
                                            onChange={(checked) => updateNotificationSettings('order_created', checked)}
                                            className={`${notificationSettings.order_created ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                        >
                                            <span className={`${notificationSettings.order_created ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </Switch>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Atualização de Status</p>
                                            <p className="text-sm text-gray-500">Notificar quando um pedido mudar de status.</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.order_status_updated}
                                            onChange={(checked) => updateNotificationSettings('order_status_updated', checked)}
                                            className={`${notificationSettings.order_status_updated ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                        >
                                            <span className={`${notificationSettings.order_status_updated ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </Switch>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Estoque Baixo</p>
                                            <p className="text-sm text-gray-500">Alertar quando produtos atingirem nível crítico de estoque.</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.stock_low_warning}
                                            onChange={(checked) => updateNotificationSettings('stock_low_warning', checked)}
                                            className={`${notificationSettings.stock_low_warning ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                        >
                                            <span className={`${notificationSettings.stock_low_warning ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </Switch>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delivery Tab */}
                    {activeTab === 'delivery' && (
                        <div className="space-y-6">
                            {/* Delivery Settings */}
                            <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                                <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold">
                                    <Truck className="h-5 w-5 text-[#ff3d03]" />
                                    Configurações de Delivery
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Taxa de Entrega Padrão (R$)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.fixed_delivery_fee}
                                            onChange={(e) => setData('fixed_delivery_fee', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Pedido Mínimo (R$)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.min_order_delivery}
                                            onChange={(e) => setData('min_order_delivery', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Entrega Grátis a partir de (R$)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.free_delivery_min}
                                            onChange={(e) => setData('free_delivery_min', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="Opcional"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tempo Estimado (minutos)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.estimated_delivery_time}
                                            onChange={(e) => setData('estimated_delivery_time', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Motoboy Padrão
                                        </label>
                                        <select
                                            value={data.default_motoboy_id}
                                            onChange={(e) => setData('default_motoboy_id', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                        >
                                            <option value="">Selecione um motoboy (Opcional)</option>
                                            {motoboys.map((motoboy: any) => (
                                                <option key={motoboy.id} value={motoboy.id}>
                                                    {motoboy.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Zones */}
                            <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-gray-900 dark:text-gray-200 flex items-center gap-2 font-bold">
                                        <MapPin className="h-5 w-5 text-[#ff3d03]" />
                                        Zonas de Entrega por Bairro
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={openCreateZoneModal}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#ff3d03] text-white rounded-xl font-bold text-sm hover:bg-[#e63700] transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Adicionar Zona
                                    </button>
                                </div>

                                {deliveryZones.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-premium-dark rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10">
                                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <h3 className="text-gray-900 dark:text-gray-200 font-bold">Nenhuma zona cadastrada</h3>
                                        <p className="text-gray-500 mt-1">Adicione bairros para personalizar suas entregas.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {deliveryZones.map((zone: DeliveryZone) => (
                                            <div key={zone.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-premium-dark rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                                        <MapPin className="h-5 w-5 text-[#ff3d03]" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white">{zone.neighborhood}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {formatCurrency(zone.delivery_fee)} • {zone.estimated_time_min} min
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={zone.is_active}
                                                        onChange={() => toggleZoneActive(zone)}
                                                        className={`${zone.is_active ? 'bg-[#ff3d03]' : 'bg-gray-300'
                                                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                                    >
                                                        <span
                                                            className={`${zone.is_active ? 'translate-x-6' : 'translate-x-1'
                                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                        />
                                                    </Switch>

                                                    <button
                                                        type="button"
                                                        onClick={() => openEditZoneModal(zone)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteZone(zone.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Methods Tab */}
                    {activeTab === 'payment' && (
                        <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-gray-900 dark:text-gray-200 flex items-center gap-2 font-bold">
                                    <CreditCard className="h-5 w-5 text-[#ff3d03]" />
                                    Formas de Pagamento
                                </h3>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-medium">Validação em Todo o Sistema</p>
                                    <p className="mt-1">Gerencie as formas de pagamento aceitas. Ative as opções e configure as taxas.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {methods.map((method: any) => {
                                    const Icon = method.icon;
                                    return (
                                        <div key={method.type} className="bg-gray-50 dark:bg-premium-dark rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm">
                                                        <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{method.name}</h4>
                                                </div>
                                                <Switch
                                                    checked={method.is_active}
                                                    onChange={() => handlePaymentToggle(method)}
                                                    className={`${method.is_active ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                                >
                                                    <span className={`${method.is_active ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                                </Switch>
                                            </div>

                                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ${!method.is_active ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                                {(method.type === 'credit_card' || method.type === 'debit_card' || method.type === 'pix') && (
                                                    <>
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Taxa (%)</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={method.fee_percentage}
                                                                onChange={(e) => handlePaymentUpdate(method, 'fee_percentage', e.target.value)}
                                                                onBlur={() => savePaymentMethod(method)}
                                                                disabled={!method.is_active}
                                                                className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Taxa Fixa (R$)</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={method.fee_fixed}
                                                                onChange={(e) => handlePaymentUpdate(method, 'fee_fixed', e.target.value)}
                                                                onBlur={() => savePaymentMethod(method)}
                                                                disabled={!method.is_active}
                                                                className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                {method.type === 'pix' && (
                                                    <div className="md:col-span-2 space-y-4 pt-2 border-t border-gray-200 dark:border-white/5 mt-2">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Tipo de Chave</label>
                                                                <select
                                                                    value={method.pix_key_type || 'random'}
                                                                    onChange={(e) => handlePaymentUpdate(method, 'pix_key_type', e.target.value)}
                                                                    onBlur={() => savePaymentMethod(method)}
                                                                    disabled={!method.is_active}
                                                                    className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                                                                >
                                                                    <option value="cpf">CPF</option>
                                                                    <option value="cnpj">CNPJ</option>
                                                                    <option value="email">E-mail</option>
                                                                    <option value="phone">Telefone</option>
                                                                    <option value="random">Chave Aleatória</option>
                                                                </select>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Chave PIX</label>
                                                                <input
                                                                    type="text"
                                                                    value={method.pix_key || ''}
                                                                    onChange={(e) => handlePaymentUpdate(method, 'pix_key', e.target.value)}
                                                                    onBlur={() => savePaymentMethod(method)}
                                                                    disabled={!method.is_active}
                                                                    placeholder="Digite sua chave PIX..."
                                                                    className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* System Tab */}
                    {activeTab === 'system' && (
                        <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Palette className="h-5 w-5 text-[#ff3d03]" />
                                Personalização do Menu Público
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cor do Tema
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={data.theme_color}
                                            onChange={(e) => setData('theme_color', e.target.value)}
                                            className="h-12 w-24 rounded-xl border border-gray-300 dark:border-white/10 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={data.theme_color}
                                            onChange={(e) => setData('theme_color', e.target.value)}
                                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                            placeholder="#ff3d03"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Esta cor será aplicada aos botões, destaques e elementos principais do menu público.
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-premium-dark p-6 rounded-2xl">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Pré-visualização</h4>
                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            style={{ backgroundColor: data.theme_color }}
                                            className="w-full py-3 rounded-xl text-white font-bold"
                                        >
                                            Botão Principal
                                        </button>
                                        <div className="flex gap-3">
                                            <div
                                                style={{ backgroundColor: data.theme_color, opacity: 0.1 }}
                                                className="flex-1 h-20 rounded-xl"
                                            ></div>
                                            <div
                                                style={{ backgroundColor: data.theme_color, opacity: 0.2 }}
                                                className="flex-1 h-20 rounded-xl"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-8 py-4 bg-[#ff3d03] text-white rounded-2xl font-bold text-lg hover:bg-[#e63700] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ff3d03]/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Save className="h-5 w-5" />
                            {processing ? 'Salvando...' : 'Salvar Configurações'}
                        </button>
                    </div>
                </form>
            </div>



            {/* Delivery Zone Modal */}
            <Modal show={showZoneModal} onClose={() => setShowZoneModal(false)} maxWidth="md">
                <form onSubmit={submitZone} className="p-6 bg-white dark:bg-[#1a1b1e]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-gray-900 dark:text-gray-200 font-bold text-lg">
                            {editingZone ? 'Editar Zona de Entrega' : 'Nova Zona de Entrega'}
                        </h2>
                        <button type="button" onClick={() => setShowZoneModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nome do Bairro
                            </label>
                            <input
                                type="text"
                                value={zoneData.neighborhood}
                                onChange={(e) => setZoneData('neighborhood', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                placeholder="Ex: Centro, Vila Nova..."
                                required
                            />
                            {zoneErrors.neighborhood && <p className="mt-1 text-sm text-red-600">{zoneErrors.neighborhood}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Taxa de Entrega (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={zoneData.delivery_fee}
                                    onChange={(e) => setZoneData('delivery_fee', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tempo Est. (min)
                                </label>
                                <input
                                    type="number"
                                    value={zoneData.estimated_time_min}
                                    onChange={(e) => setZoneData('estimated_time_min', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={zoneData.is_active}
                                onChange={(checked) => setZoneData('is_active', checked)}
                                className={`${zoneData.is_active ? 'bg-[#ff3d03]' : 'bg-gray-300'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            >
                                <span
                                    className={`${zoneData.is_active ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zona Ativa</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowZoneModal(false)}
                            className="px-4 py-2 bg-gray-100 dark:bg-premium-dark bg-white text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={zoneProcessing}
                            className="px-4 py-2 bg-[#ff3d03] text-white font-bold rounded-xl hover:bg-[#e63700] transition-colors disabled:opacity-50"
                        >
                            {editingZone ? 'Atualizar' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
