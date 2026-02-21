import { 
    MapPin, 
    Navigation, 
    MessageCircle, 
    Instagram, 
    ChevronRight, 
    User, 
    LogIn,
    Search
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { Customer } from './types';
import { motion } from 'framer-motion';
import StoreInfoModal from './StoreInfoModal';

interface HeroSectionProps {
    store: any;
    customer: Customer | null;
    onOpenAuth: () => void;
    onOpenProfile: () => void;
    onOpenCart: () => void;
    onOpenInfo: () => void;
    cartCount: number;
}

export default function HeroSection({ store, customer, onOpenAuth, onOpenProfile, onOpenCart, onOpenInfo, cartCount }: HeroSectionProps) {
    return (
        <div className="relative bg-gray-50 dark:bg-premium-dark pb-4 transition-colors duration-300">
            {/* --- STORE BANNER --- */}
            <div className="relative h-32 md:h-48 w-full overflow-hidden group">
                <div className="absolute inset-0 bg-neutral-900">
                    {store?.banner_url ? (
                        <div 
                            className="w-full h-full bg-cover bg-center opacity-90 transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url('${store.banner_url}')` }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-80" />
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>

            {/* --- COMPACT STORE HEADER CARD --- */}
            <div className="relative max-w-7xl mx-auto px-4 md:px-8 -mt-12 md:-mt-16 z-20 mb-2">
                <div className="bg-white dark:bg-premium-card rounded-[24px] shadow-xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8 border border-gray-100 dark:border-white/5 relative transition-colors duration-300">
                    
                    {/* Store Logo/Badge */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-20 w-20 md:h-28 md:w-28 rounded-[20px] shadow-lg flex items-center justify-center text-white text-3xl md:text-4xl font-black border-4 border-white dark:border-premium-card shrink-0 relative z-10"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                        {store?.logo_url ? (
                            <img src={store.logo_url} className="h-full w-full object-cover rounded-[16px]" alt={store.name} />
                        ) : (
                            <div className="h-full w-full rounded-[16px] flex items-center justify-center">
                                {store?.name?.charAt(0) || 'V'}
                            </div>
                        )}
                        
                        {/* Compact Status Pin */}
                        <div className={clsx(
                            "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-20",
                            store.is_open ? "bg-green-500" : "bg-red-500"
                        )} />
                    </motion.div>

                    {/* Store Brand Info */}
                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                        <div className="text-center md:text-left">
                            <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
                                {store?.name}
                                <span className={clsx(
                                    "hidden md:flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-sm",
                                    store.is_open ? "bg-green-500" : "bg-red-500"
                                )}>
                                    {store.is_open ? "Aberto" : "Fechado"}
                                </span>
                            </h1>
                            {store?.description && (
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 line-clamp-1">
                                    {store.description}
                                </p>
                            )}
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-center md:justify-end gap-3 md:gap-4">
                            {store.instagram && (
                                <a 
                                    href={`https://instagram.com/${store.instagram.replace('@', '')}`} 
                                    target="_blank" 
                                    title="Instagram"
                                    className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#FFB700] via-[#FF0069] to-[#7638FF] flex items-center justify-center text-white shadow-lg shadow-pink-500/10 hover:scale-110 active:scale-95 transition-all"
                                >
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {store.whatsapp && (
                                <a 
                                    href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} 
                                    target="_blank" 
                                    title="WhatsApp"
                                    className="h-10 w-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-green-500/10 hover:scale-110 active:scale-95 transition-all"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </a>
                            )}
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store?.address || '')}`} 
                                target="_blank" 
                                title="Localização"
                                className="h-10 w-10 rounded-xl bg-[#4285F4] flex items-center justify-center text-white shadow-lg shadow-blue-500/10 hover:scale-110 active:scale-95 transition-all"
                            >
                                <MapPin className="h-5 w-5" />
                            </a>
                            <button 
                                onClick={onOpenInfo}
                                className="h-10 px-4 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 transition-all text-xs font-bold flex items-center gap-2"
                            >
                                <ChevronRight className="h-4 w-4" />
                                <span className="hidden sm:inline">Sobre</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
