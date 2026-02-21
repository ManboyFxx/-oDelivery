import React, { useState } from 'react';
import { Store, Phone, Mail, MapPin, Globe, Instagram, Facebook, Trash2, Image as ImageIcon } from 'lucide-react';
import MediaPickerModal from '@/Components/MediaPickerModal';
import InputError from '@/Components/InputError';


interface GeneralSettingsProps {
    data: any;
    setData: (field: string, value: any) => void;
    errors: any;
    logoPreview: string | null;
    bannerPreview: string | null;
}


export default function GeneralSettings({
    data,
    setData,
    errors,
    logoPreview,
    bannerPreview,
}: GeneralSettingsProps) {
    const [logoModalOpen, setLogoModalOpen] = useState(false);
    const [bannerModalOpen, setBannerModalOpen] = useState(false);

    return (
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
                        <div className="relative group overflow-hidden rounded-2xl">
                            <img
                                src={logoPreview}
                                alt="Logo"
                                className="w-full h-48 object-contain bg-gray-50 dark:bg-premium-dark rounded-2xl"
                            />
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                <button
                                    type="button"
                                    onClick={() => setLogoModalOpen(true)}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/40 text-white rounded-xl text-sm font-bold backdrop-blur-md"
                                >
                                    Trocar Logo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setData('logo_url', ''); setData('logo_path', null); }}
                                    className="text-red-300 hover:text-red-100 text-xs"
                                >
                                    Remover
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => setLogoModalOpen(true)}
                            className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl cursor-pointer hover:border-[#ff3d03] transition-colors bg-gray-50 dark:bg-white/5"
                        >
                            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Banco de Imagens</span>
                            <span className="text-xs text-gray-400">Clique para selecionar</span>
                        </div>
                    )}
                    <InputError message={errors.logo_url} className="mt-2" />
                    <MediaPickerModal
                        open={logoModalOpen}
                        onClose={() => setLogoModalOpen(false)}
                        onSelect={(media) => { setData('logo_url', media.url); setData('logo_path', null); setLogoModalOpen(false); }}
                        currentUrl={data.logo_url}
                    />
                </div>

                {/* Banner */}
                <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                    <h3 className="text-gray-900 dark:text-gray-200 mb-6 font-bold">Banner</h3>

                    {bannerPreview ? (
                        <div className="relative group overflow-hidden rounded-2xl">
                            <img
                                src={bannerPreview}
                                alt="Banner"
                                className="w-full h-48 object-cover bg-gray-50 dark:bg-premium-dark rounded-2xl"
                            />
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                <button
                                    type="button"
                                    onClick={() => setBannerModalOpen(true)}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/40 text-white rounded-xl text-sm font-bold backdrop-blur-md"
                                >
                                    Trocar Banner
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setData('banner_url', ''); setData('banner_path', null); }}
                                    className="text-red-300 hover:text-red-100 text-xs"
                                >
                                    Remover
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => setBannerModalOpen(true)}
                            className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl cursor-pointer hover:border-[#ff3d03] transition-colors bg-gray-50 dark:bg-white/5"
                        >
                            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Banco de Imagens</span>
                            <span className="text-xs text-gray-400">Clique para selecionar</span>
                        </div>
                    )}
                    <InputError message={errors.banner_url} className="mt-2" />
                    <MediaPickerModal
                        open={bannerModalOpen}
                        onClose={() => setBannerModalOpen(false)}
                        onSelect={(media) => { setData('banner_url', media.url); setData('banner_path', null); setBannerModalOpen(false); }}
                        currentUrl={data.banner_url}
                    />

                </div>
            </div>
        </div>
    );
}
