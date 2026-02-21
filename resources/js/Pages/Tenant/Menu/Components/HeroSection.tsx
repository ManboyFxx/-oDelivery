import { 
    MapPin, 
    Navigation, 
    MessageCircle, 
    Instagram, 
    User, 
    LogIn,
    Search,
    Sun,
    Moon
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
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isDark: boolean;
    toggleTheme: () => void;
}

export default function HeroSection({ 
    store, 
    customer, 
    onOpenAuth, 
    onOpenProfile, 
    onOpenCart, 
    onOpenInfo, 
    cartCount,
    searchQuery,
    setSearchQuery,
    isDark,
    toggleTheme
}: HeroSectionProps) {
    return (
        <div className="relative bg-white dark:bg-premium-dark transition-colors duration-300">
            {/* --- BANNER AREA --- */}
            <div className="relative h-40 md:h-52 w-full overflow-hidden">
                <div className="absolute inset-0 bg-neutral-900">
                    {store?.banner_url ? (
                        <div 
                            className="w-full h-full bg-cover bg-center opacity-85 transition-transform duration-700"
                            style={{ backgroundImage: `url('${store.banner_url}')` }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-900" />
                    )}
                </div>

                {/* Dark Gradient Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />

                {/* Floating Search Bar with Integrated Theme Toggle */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-30">
                    <div className="relative group flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar no cardápio..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-full py-2.5 pl-11 pr-12 focus:ring-4 focus:ring-black/20 focus:border-white/40 focus:bg-black/50 transition-all outline-none font-medium text-sm text-white placeholder:text-white/70 shadow-2xl"
                            />
                            {/* Theme Toggle Inside Input */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleTheme();
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/10"
                            >
                                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STORE INFO AREA --- */}
            <div className="relative max-w-7xl mx-auto px-4 pb-8">
                {/* Logo Centered (Breaking the banner edge) */}
                <div className="flex justify-center -mt-12 md:-mt-16 mb-4">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-24 w-24 md:h-32 md:w-32 rounded-full shadow-2xl flex items-center justify-center border-4 border-white dark:border-premium-dark bg-white dark:bg-premium-card overflow-hidden z-20"
                    >
                        {store?.logo_url ? (
                            <img src={store.logo_url} className="h-full w-full object-cover" alt={store.name} />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-white text-3xl font-black" style={{ backgroundColor: 'var(--primary-color)' }}>
                                {store?.name?.charAt(0) || 'V'}
                            </div>
                        )}
                    </motion.div>
                </div>

                <div className="text-center space-y-4">
                    {/* Store Name & Status */}
                    <div className="space-y-1">
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {store?.name}
                        </h1>
                        <div className="flex items-center justify-center gap-2">
                            <div className={clsx(
                                "w-2.5 h-2.5 rounded-full",
                                store.is_open ? "bg-green-500 animate-pulse" : "bg-red-500"
                            )} />
                            <span className={clsx(
                                "text-xs md:text-sm font-bold transition-colors",
                                store.is_open ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                                {store.is_open ? "Aberto agora" : "Fechado no momento"}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {store?.description && (
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto leading-relaxed">
                            {store.description}
                        </p>
                    )}

                    {/* Social Media & Location Row */}
                    <div className="flex items-center justify-center gap-4 pt-4">
                        {/* Google Rating Integrated Here */}
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-3 py-1.5 rounded-full shadow-sm">
                            <span className="text-yellow-500 text-sm">★</span>
                            <span className="text-xs font-black text-gray-700 dark:text-gray-300">5.0</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Google</span>
                        </div>

                        {store.instagram && (
                            <a 
                                href={`https://instagram.com/${store.instagram.replace('@', '')}`} 
                                target="_blank" 
                                className="h-10 w-10 flex items-center justify-center text-pink-500 hover:scale-110 active:scale-95 transition-transform"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                        )}
                        {store.whatsapp && (
                            <a 
                                href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} 
                                target="_blank" 
                                className="h-10 w-10 flex items-center justify-center text-green-500 hover:scale-110 active:scale-95 transition-transform"
                            >
                                <MessageCircle className="h-5 w-5" />
                            </a>
                        )}
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store?.address || '')}`} 
                            target="_blank" 
                            className="h-10 w-10 flex items-center justify-center text-blue-500 hover:scale-110 active:scale-95 transition-transform"
                        >
                            <MapPin className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
