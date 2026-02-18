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
    const themeColor = '#ff3d03';

    return (
        <div className="relative bg-gray-50 dark:bg-premium-dark pb-8 transition-colors duration-300">
            {/* --- STORE BANNER & BRANDING --- */}
            <div className="relative h-52 md:h-80 w-full overflow-hidden group">
                <div className="absolute inset-0 bg-neutral-900">
                    {store?.banner_url ? (
                        <div 
                            className="w-full h-full bg-cover bg-center opacity-60 transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url('${store.banner_url}')` }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-80" />
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
                {/* Mobile Status Badge (Top Right) */}
                 <div className="absolute top-4 right-4 md:hidden flex flex-col items-end gap-2 z-10">
                    <div className={clsx(
                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/10",
                        store.is_open ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
                    )}>
                        <div className={clsx("w-1.5 h-1.5 rounded-full bg-white", store.is_open && "animate-pulse")} />
                        {store.is_open ? "Aberto" : "Fechado"}
                    </div>
                </div>
            </div>

            {/* --- STORE HEADER CARD (CENTRALIZED) --- */}
            <div className="relative max-w-7xl mx-auto px-4 md:px-8 -mt-16 md:-mt-24 z-20 mb-4">
                <div className="bg-white dark:bg-premium-card rounded-[32px] shadow-2xl p-6 md:p-8 flex flex-col items-center justify-center border border-gray-100 dark:border-white/5 relative overflow-visible transition-colors duration-300">
                    
                    {/* Background Decor */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-50" />

                    <div className="flex flex-col items-center text-center w-full">
                        {/* Store Main Badge/Logo */}
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-28 w-28 md:h-36 md:w-36 rounded-[40px] shadow-2xl flex items-center justify-center text-white text-5xl md:text-6xl font-black mb-6 border-[6px] border-white relative z-10"
                            style={{ backgroundColor: '#ff3d03', marginTop: '-80px' }}
                        >
                            {store?.logo_url ? (
                                <img src={store.logo_url} className="h-full w-full object-cover rounded-[34px]" alt={store.name} />
                            ) : (
                                <div className="h-full w-full rounded-[34px] flex items-center justify-center">
                                    {store?.name?.charAt(0) || 'V'}
                                </div>
                            )}
                            
                            {/* Desktop Status Badge */}
                            <div className={clsx(
                                "absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-[3px] border-white shadow-xl z-20 whitespace-nowrap flex items-center gap-2",
                                store.is_open ? "bg-green-500 text-white" : "bg-red-500 text-white"
                            )}>
                                <div className={clsx("h-2 w-2 rounded-full bg-white", store.is_open && "animate-pulse")} />
                                {store.is_open ? "Aberto" : "Fechado"}
                            </div>
                        </motion.div>

                        <div className="w-full mt-4">
                            <div className="flex flex-col items-center justify-center gap-3 mb-8">
                                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight transition-colors duration-300">
                                    {store?.name}
                                </h1>
                                


                                <button 
                                    onClick={onOpenInfo}
                                    className="inline-flex items-center gap-2 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 hover:scale-105 active:scale-95 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-white/10 transition-all shadow-sm mt-2"
                                >
                                    Mais informações <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>

                            {/* Actions Row */}
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {/* Account Button */}
                                <button 
                                    onClick={customer ? onOpenProfile : onOpenAuth}
                                    className="h-12 px-6 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#ff3d03]/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
                                    style={{ background: 'linear-gradient(135deg, #ff3d03 0%, #ff6b35 100%)' }}
                                >
                                    {customer ? (
                                        <>
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                                <User className="w-3 h-3 text-white" />
                                            </div>
                                            <span>{customer.name.split(' ')[0]}</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /> 
                                            <span>Entrar</span>
                                        </>
                                    )}
                                </button>

                                <div className="h-8 w-[1px] bg-gray-100 mx-2 hidden sm:block" />

                                {/* Social Icons */}
                                <div className="flex items-center gap-2">
                                    {store.instagram && (
                                        <a href={`https://instagram.com/${store.instagram.replace('@', '')}`} target="_blank" className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#FFB700] via-[#FF0069] to-[#7638FF] flex items-center justify-center text-white shadow-lg shadow-pink-500/20 hover:scale-110 active:scale-95 transition-all">
                                            <Instagram className="h-6 w-6 stroke-[2.5]" />
                                        </a>
                                    )}
                                    {store.whatsapp && (
                                        <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} target="_blank" className="h-12 w-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-green-500/20 hover:scale-110 active:scale-95 transition-all">
                                            <MessageCircle className="h-6 w-6 stroke-[2.5]" />
                                        </a>
                                    )}
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store?.address || '')}`} target="_blank" className="h-12 w-12 rounded-2xl bg-[#4285F4] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all overflow-hidden relative group">
                                        <MapPin className="h-6 w-6 stroke-[2.5] relative z-10" />
                                        <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                                    </a>
                                    <a href={`https://waze.com/ul?q=${encodeURIComponent(store?.address || '')}`} target="_blank" className="h-12 w-12 rounded-2xl bg-[#33CCFF] flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 hover:scale-110 active:scale-95 transition-all">
                                        <Navigation className="h-6 w-6 stroke-[2.5]" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
