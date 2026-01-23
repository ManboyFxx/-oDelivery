import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Store, Truck, CreditCard, Monitor, Printer, Save, MapPin, Phone, Clock, Globe, Shield } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import clsx from 'clsx';

export default function SettingsIndex({ auth, settings, success }: any) {
    const [activeTab, setActiveTab] = useState('general');

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

        // PWA
        pwa_theme_color: settings.pwa_theme_color || '#ff3d03',
        menu_theme: settings.menu_theme || 'modern-clean', // Default updated
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.update'), {
            preserveScroll: true,
        });
    };

    const tabs = [
        { id: 'general', label: 'Geral', icon: Store },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'financial', label: 'Financeiro', icon: CreditCard },
        { id: 'system', label: 'Sistema', icon: Monitor }, // Includes PWA & Printing
        { id: 'integrations', label: 'Integrações', icon: Globe },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Configurações da Loja</h2>}
        >
            <Head title="Configurações" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{success}</span>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Sidebar Tabs */}
                        <div className="w-full md:w-64 shrink-0 space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={clsx(
                                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all",
                                            activeTab === tab.id
                                                ? "bg-white dark:bg-gray-800 text-[#ff3d03] shadow-sm border-l-4 border-[#ff3d03]"
                                                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <form onSubmit={submit} className="space-y-6">

                                {activeTab === 'general' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Store className="h-5 w-5 text-[#ff3d03]" />
                                            Informações da Loja
                                        </h3>

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
                                            <div className="md:col-span-2">
                                                <InputLabel value="URL do Logo" />
                                                <TextInput
                                                    value={data.logo_url}
                                                    onChange={(e) => setData('logo_url', e.target.value)}
                                                    className="w-full mt-1"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <InputLabel value="URL do Banner (Capa)" />
                                                <TextInput
                                                    value={data.banner_url}
                                                    onChange={(e) => setData('banner_url', e.target.value)}
                                                    className="w-full mt-1"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'delivery' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Truck className="h-5 w-5 text-[#ff3d03]" />
                                            Configurações de Delivery
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel value="Taxa de Entrega Fixa (R$)" />
                                                <TextInput
                                                    type="number"
                                                    step="0.01"
                                                    value={data.fixed_delivery_fee}
                                                    onChange={(e) => setData('fixed_delivery_fee', e.target.value)}
                                                    className="w-full mt-1"
                                                />
                                            </div>
                                            <div>
                                                <InputLabel value="Raio de Entrega (km)" />
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
                                            <p>As configurações de Zonas de Entrega e Taxas por Bairro podem ser gerenciadas em uma página separada para maior controle.</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'financial' && (
                                    <div className="space-y-6 animate-fadeIn">
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
            </div>
        </AuthenticatedLayout>
    );
}
