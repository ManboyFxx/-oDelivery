import React from 'react';
import { Store, Phone, Mail, MapPin, Globe, Instagram, Facebook, Upload, Trash2, Palette } from 'lucide-react';

interface GeneralSettingsProps {
    data: any;
    setData: (field: string, value: any) => void;
    errors: any;
    logoPreview: string | null;
    bannerPreview: string | null;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleLogoRemove: () => void;
    handleBannerRemove: () => void;
}

export default function GeneralSettings({
    data,
    setData,
    errors,
    logoPreview,
    bannerPreview,
    handleLogoUpload,
    handleBannerUpload,
    handleLogoRemove,
    handleBannerRemove
}: GeneralSettingsProps) {
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
    );
}
