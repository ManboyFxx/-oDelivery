import {
    MapPin,
    Navigation,
    MessageCircle,
    Phone,
    Instagram,
    Facebook,
    Globe,
    ShoppingBag,
    Clock,
    Info,
    ChevronDown,
    User,
    LogIn
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { Customer } from './types';

interface HeroSectionProps {
    store: any;
    customer: Customer | null;
    onOpenAuth: () => void;
    onOpenProfile: () => void;
    onOpenCart: () => void;
    cartCount: number;
}

export default function HeroSection({ store, customer, onOpenAuth, onOpenProfile, onOpenCart, cartCount }: HeroSectionProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="relative bg-white pb-4 md:pb-8">
            {/* Banner with Gradient Overlay */}
            <div className="h-48 md:h-72 w-full relative overflow-hidden group">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${store.banner_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop'}')` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
                </div>

                {/* Mobile: Top Right Buttons */}
                <div className="absolute top-4 right-4 md:hidden flex flex-col items-end gap-2">
                    {/* Status Badge */}
                    <div className={clsx(
                        "px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/20",
                        store.is_open ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
                    )}>
                        <div className={clsx("w-2 h-2 rounded-full bg-white", store.is_open && "animate-pulse")} />
                        {store.is_open ? "Aberto" : "Fechado"}
                    </div>

                    {/* Auth Button */}
                    <button
                        onClick={customer ? onOpenProfile : onOpenAuth}
                        className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/20 bg-white/90 text-gray-900"
                    >
                        {customer ? (
                            <>
                                <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center text-[#ff3d03]">
                                    <User className="w-3 h-3" />
                                </div>
                                {customer.name.split(' ')[0]}
                            </>
                        ) : (
                            <>
                                <LogIn className="w-3 h-3 text-[#ff3d03]" />
                                Entrar
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-24">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                        {/* Logo */}
                        <div className="shrink-0 mx-auto md:mx-0 -mt-16 md:-mt-20 relative">
                            <div className="h-28 w-28 md:h-36 md:w-36 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white ring-1 ring-gray-100">
                                {store.logo_url ? (
                                    <img src={store.logo_url} className="h-full w-full object-cover" alt={store.name} />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300">
                                        <ShoppingBag className="h-12 w-12" />
                                    </div>
                                )}
                            </div>
                            {/* Desktop: Status Badge */}
                            <div className="hidden md:flex absolute -bottom-3 left-1/2 -translate-x-1/2 w-full justify-center">
                                <div className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md border-2 border-white",
                                    store.is_open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    <div className={clsx("w-2 h-2 rounded-full", store.is_open ? "bg-green-600 animate-pulse" : "bg-red-600")} />
                                    {store.is_open ? "Aberto Agora" : "Fechado"}
                                </div>
                            </div>
                        </div>

                        {/* Store Info */}
                        <div className="flex-1 text-center md:text-left w-full">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-2">
                                        {store.name}
                                    </h1>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span className="line-clamp-1">{store.address}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span>{store.estimated_delivery_time || '30-45'} min • Entrega</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap justify-center md:justify-end gap-2">
                                    {store.whatsapp && (
                                        <a
                                            href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                                            title="WhatsApp"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                        </a>
                                    )}
                                    {store.instagram && (
                                        <a
                                            href={`https://instagram.com/${store.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors"
                                            title="Instagram"
                                        >
                                            <Instagram className="h-5 w-5" />
                                        </a>
                                    )}

                                    {/* Cart Button (Desktop) */}
                                    <button
                                        onClick={onOpenCart}
                                        className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-[#ff3d03] font-bold rounded-xl hover:bg-orange-100 transition-colors relative"
                                    >
                                        <ShoppingBag className="h-5 w-5" />
                                        <span>Carrinho</span>
                                        {cartCount > 0 && (
                                            <span className="bg-[#ff3d03] text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                                                {cartCount}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <Info className="h-5 w-5" />
                                        <span className="hidden sm:inline">Mais Informações</span>
                                        <ChevronDown className={clsx("h-4 w-4 transition-transform", showDetails && "rotate-180")} />
                                    </button>

                                    {/* Desktop Auth Button */}
                                    <button
                                        onClick={customer ? onOpenProfile : onOpenAuth}
                                        className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-[#ff3d03] text-white font-bold rounded-xl hover:bg-[#e63700] transition-colors shadow-lg shadow-orange-500/20"
                                    >
                                        {customer ? (
                                            <>
                                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <span>{customer.name.split(' ')[0]}</span>
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="h-5 w-5" />
                                                <span>Entrar</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Details */}
                            {showDetails && (
                                <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                Horário de Funcionamento
                                            </h3>
                                            <p className="text-sm text-gray-600 whitespace-pre-line">
                                                {store.operating_hours_formatted}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                Endereço Completo
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {store.address}
                                            </p>
                                            <div className="flex gap-2">
                                                <a
                                                    href={`https://waze.com/ul?q=${encodeURIComponent(store.address)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100"
                                                >
                                                    <Navigation className="h-3 w-3" /> Waze
                                                </a>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200"
                                                >
                                                    <MapPin className="h-3 w-3" /> Maps
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
