import { useState, useEffect } from 'react';
import { usePage, useForm, router, Head } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Store, Clock, Truck, CreditCard, Bell, Palette, CheckCircle, Printer, Shield } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

// Partials
import GeneralSettings from './Partials/GeneralSettings';
import BusinessHoursSettings from './Partials/BusinessHoursSettings';
import DeliverySettings from './Partials/DeliverySettings';
import PaymentSettings from './Partials/PaymentSettings';
import NotificationSettings from './Partials/NotificationSettings';
import SystemSettings from './Partials/SystemSettings';
import PrinterSettings from './Partials/PrinterSettings';
import SecuritySettings from './Partials/SecuritySettings';

interface SettingsProps extends PageProps {
    settings: any;
    deliveryZones: any[];
    motoboys: any[];
    paymentMethods: any[];
    flash: {
        success: string | null;
        error: string | null;
    };
}

export default function Settings({ auth, settings, deliveryZones: initialZones, motoboys, paymentMethods, flash }: SettingsProps) {
    // Tab State
    const [activeTab, setActiveTab] = useState('general');

    // UI State
    const [showingSuccessMessage, setShowingSuccessMessage] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings?.logo_path ? `/storage/${settings.logo_path}` : (settings?.logo_url || null)
    );
    const [bannerPreview, setBannerPreview] = useState<string | null>(
        settings?.banner_path ? `/storage/${settings.banner_path}` : (settings?.banner_url || null)
    );

    // Business Hours State
    const [businessHours, setBusinessHours] = useState(() => {
        if (settings?.business_hours) { // settings.business_hours is already an object in DB casting? Or string?
            // Usually it's casted in model. If string, parse it.
            // Based on legacy code: JSON.stringify(updated) implies it's stored as JSON.
            // But if Model has casts, it might come as object.
            // Let's assume it might be string or object.
            if (typeof settings.business_hours === 'string') {
                return JSON.parse(settings.business_hours);
            }
            return settings.business_hours;
        }
        // Default structure
        return {
            monday: { is_open: true, open_time: '18:00', close_time: '23:00' },
            tuesday: { is_open: true, open_time: '18:00', close_time: '23:00' },
            wednesday: { is_open: true, open_time: '18:00', close_time: '23:00' },
            thursday: { is_open: true, open_time: '18:00', close_time: '23:00' },
            friday: { is_open: true, open_time: '18:00', close_time: '23:59' },
            saturday: { is_open: true, open_time: '18:00', close_time: '23:59' },
            sunday: { is_open: true, open_time: '18:00', close_time: '23:00' },
        };
    });

    // Notification State
    const [notificationSettings, setNotificationSettings] = useState(() => {
        const defaults = {
            browser_notifications: true,
            sound_enabled: true,
            order_created: true,
            order_status_updated: true,
            stock_low_warning: true,
        };
        if (settings?.notification_settings) {
            if (typeof settings.notification_settings === 'string') {
                return { ...defaults, ...JSON.parse(settings.notification_settings) };
            }
            return { ...defaults, ...settings.notification_settings };
        }
        return defaults;
    });

    // Delivery Zone State
    const [deliveryZones, setDeliveryZones] = useState(initialZones);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [editingZone, setEditingZone] = useState<any>(null);

    // Main Form
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        store_name: settings?.store_name || '',
        phone: settings?.phone || '',
        whatsapp: settings?.whatsapp || '', // New field
        email: settings?.email || '', // New field
        address: settings?.address || '',
        description: settings?.description || '', // New field
        instagram: settings?.instagram || '',
        facebook: settings?.facebook || '',
        website: settings?.website || '', // New field

        logo: null as File | null,
        banner: null as File | null,
        remove_logo: false,
        remove_banner: false,

        business_hours: JSON.stringify(businessHours),
        notification_settings: JSON.stringify(notificationSettings),

        // Delivery
        delivery_radius_km: settings?.delivery_radius_km || 5,
        fixed_delivery_fee: settings?.fixed_delivery_fee || 0,
        min_order_delivery: settings?.min_order_delivery || 0,
        free_delivery_min: settings?.free_delivery_min || '',
        estimated_delivery_time: settings?.estimated_delivery_time || 40,
        default_motoboy_id: settings?.default_motoboy_id || '',

        theme_color: settings?.theme_color || '#ff3d03',
        printer_paper_width: settings?.printer_paper_width || 80,
        auto_print_on_confirm: settings?.auto_print_on_confirm || false,
        print_copies: settings?.print_copies || 1,

        // Security
        enable_password_login: settings?.enable_password_login ?? true,
        enable_otp_verification: settings?.enable_otp_verification ?? false,
        enable_quick_login: settings?.enable_quick_login ?? true,
        enable_checkout_security: settings?.enable_checkout_security ?? true,
    });

    // Zone Form
    const {
        data: zoneData,
        setData: setZoneData,
        post: postZone,
        put: putZone,
        delete: deleteZone,
        processing: zoneProcessing,
        errors: zoneErrors,
        reset: resetZone,
        clearErrors: clearZoneErrors
    } = useForm({
        neighborhood: '',
        delivery_fee: '',
        estimated_time_min: '',
        is_active: true
    });

    // Effects
    useEffect(() => {
        if (recentlySuccessful) {
            setShowingSuccessMessage(true);
            const timer = setTimeout(() => setShowingSuccessMessage(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [recentlySuccessful]);

    // Handlers
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
        // Upload directly to dedicated route
        const formData = new FormData();
        formData.append('logo', file);
        router.post(route('settings.upload-logo'), formData, { preserveScroll: true });
    };

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setBannerPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
        const formData = new FormData();
        formData.append('banner', file);
        router.post(route('settings.upload-banner'), formData, { preserveScroll: true });
    };

    const handleLogoRemove = () => {
        setLogoPreview(null);
        router.delete(route('settings.remove-logo'), { preserveScroll: true });
    };

    const handleBannerRemove = () => {
        setBannerPreview(null);
        router.delete(route('settings.remove-banner'), { preserveScroll: true });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    // Zone Actions
    const openCreateZoneModal = () => {
        setEditingZone(null);
        resetZone();
        clearZoneErrors();
        setShowZoneModal(true);
    };

    const openEditZoneModal = (zone: any) => {
        setEditingZone(zone);
        setZoneData({
            neighborhood: zone.neighborhood,
            delivery_fee: zone.delivery_fee,
            estimated_time_min: zone.estimated_time_min,
            is_active: Boolean(zone.is_active)
        });
        clearZoneErrors();
        setShowZoneModal(true);
    };

    const submitZone = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingZone) {
            putZone(route('settings.zones.update', editingZone.id), {
                onSuccess: () => {
                    setShowZoneModal(false);
                    resetZone();
                    // Optimistic update or reload? Passively handled by Inertia reload
                    // But let's manually update local state if props don't refresh immediately
                    // Inertia should refresh props automatically
                }
            });
        } else {
            postZone(route('settings.zones.store'), {
                onSuccess: () => {
                    setShowZoneModal(false);
                    resetZone();
                }
            });
        }
    };

    const handleDeleteZone = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta zona de entrega?')) {
            router.delete(route('settings.zones.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const toggleZoneActive = (zone: any) => {
        router.put(route('settings.zones.update', zone.id), {
            ...zone,
            is_active: !zone.is_active
        }, {
            preserveScroll: true
        });
    };

    // Watch for props updates to sync local state
    useEffect(() => {
        setDeliveryZones(initialZones);
    }, [initialZones]);


    const tabs = [
        { id: 'general', label: 'Geral', icon: Store },
        { id: 'hours', label: 'Horários', icon: Clock },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'payment', label: 'Pagamento', icon: CreditCard },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'security', label: 'Segurança', icon: Shield },
        { id: 'system', label: 'Sistema', icon: Palette },
        { id: 'printer', label: 'Impressão', icon: Printer },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Configurações
                    </h2>
                    <Transition
                        show={showingSuccessMessage}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Configurações salvas!</span>
                        </div>
                    </Transition>
                </div>
            }
        >
            <Head title="Configurações" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <div className="w-full lg:w-64 flex-shrink-0">
                            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 bg-white dark:bg-premium-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap
                                                ${isActive
                                                    ? 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/30 font-bold'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 font-medium'
                                                }
                                            `}
                                        >
                                            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                            <form onSubmit={submit} encType="multipart/form-data">
                                {activeTab === 'general' && (
                                    <GeneralSettings
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        logoPreview={logoPreview}
                                        bannerPreview={bannerPreview}
                                        handleLogoUpload={handleLogoUpload}
                                        handleBannerUpload={handleBannerUpload}
                                        handleLogoRemove={handleLogoRemove}
                                        handleBannerRemove={handleBannerRemove}
                                    />
                                )}

                                {activeTab === 'hours' && (
                                    <BusinessHoursSettings
                                        businessHours={businessHours}
                                        setBusinessHours={setBusinessHours}
                                        setData={setData}
                                    />
                                )}

                                {activeTab === 'delivery' && (
                                    <DeliverySettings
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        deliveryZones={deliveryZones}
                                        zoneData={zoneData}
                                        setZoneData={setZoneData}
                                        zoneProcessing={zoneProcessing}
                                        zoneErrors={zoneErrors}
                                        submitZone={submitZone}
                                        handleDeleteZone={handleDeleteZone}
                                        toggleZoneActive={toggleZoneActive}
                                        openCreateZoneModal={openCreateZoneModal}
                                        openEditZoneModal={openEditZoneModal}
                                        showZoneModal={showZoneModal}
                                        setShowZoneModal={setShowZoneModal}
                                        editingZone={editingZone}
                                    />
                                )}

                                {activeTab === 'payment' && (
                                    <PaymentSettings
                                        paymentMethods={paymentMethods}
                                    />
                                )}

                                {activeTab === 'notifications' && (
                                    <NotificationSettings
                                        notificationSettings={notificationSettings}
                                        setNotificationSettings={setNotificationSettings}
                                        setData={setData}
                                    />
                                )}

                                {activeTab === 'security' && (
                                    <SecuritySettings
                                        data={data}
                                        setData={setData}
                                    />
                                )}

                                {activeTab === 'system' && (
                                    <SystemSettings
                                        data={data}
                                        setData={setData}
                                    />
                                )}

                                {activeTab === 'printer' && (
                                    <PrinterSettings
                                        data={data}
                                        setData={setData}
                                    />
                                )}

                                {/* Save Button Floating Bar (Only for tabs that use main form) */}
                                {activeTab !== 'payment' && (
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-8 py-3 bg-[#ff3d03] text-white rounded-xl font-bold shadow-lg shadow-[#ff3d03]/20 hover:bg-[#e63700] transition-all disabled:opacity-50"
                                        >
                                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
