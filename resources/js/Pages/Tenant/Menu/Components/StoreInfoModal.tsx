import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Clock, Star, MapPin, Share2, Phone, Instagram, MessageCircle, Navigation } from 'lucide-react';
import clsx from 'clsx';

interface StoreInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    store: any;
}

export default function StoreInfoModal({ isOpen, onClose, store }: StoreInfoModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:py-8 px-0 sm:px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-950/40 backdrop-blur-md hidden sm:block"
                    />
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="relative bg-white w-full max-w-xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-[48px] shadow-2xl overflow-y-auto text-gray-900 border-gray-100 flex flex-col"
                    >
                        {/* Cabeçalho de Navegação Mobile */}
                        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center gap-4 sm:hidden">
                            <button 
                                onClick={onClose}
                                className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-900 active:scale-90 transition-all"
                            >
                                <ChevronRight className="h-6 w-6 rotate-180" />
                            </button>
                            <span className="font-black text-sm uppercase tracking-widest">Sobre o Estabelecimento</span>
                        </div>

                        {/* Topo Criativo - Banner Curvo */}
                        <div className="relative h-44 sm:h-52 overflow-hidden sm:rounded-b-[48px] shrink-0">
                            {store?.banner_url ? (
                                <img 
                                    src={store.banner_url} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-900" />
                            )}
                            <div className="absolute inset-0 bg-black/10" />
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 h-11 w-11 bg-white/90 backdrop-blur-sm rounded-full hidden sm:flex items-center justify-center shadow-xl hover:bg-white transition-all text-gray-900"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-6 md:px-10 pb-12 -mt-12 relative z-10">
                            {/* Logo e Nome Dinâmico */}
                            <div className="flex items-start gap-6 mb-8">
                                <div className="h-28 w-28 rounded-[32px] border-[6px] border-white overflow-hidden bg-white shadow-2xl shrink-0 flex items-center justify-center" style={{ backgroundColor: store?.theme_color || '#ff3d03' }}>
                                    {store?.logo_url ? (
                                        <img src={store.logo_url} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-white">{store?.name?.charAt(0) || 'L'}</span>
                                    )}
                                </div>
                                <div className="pt-20 text-left">
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-2">
                                        {store?.name || 'Carregando...'}
                                    </h1>
                                    <div className={clsx(
                                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        store?.is_open 
                                            ? "bg-green-50 text-green-600 border-green-100" 
                                            : "bg-red-50 text-red-600 border-red-100"
                                    )}>
                                        <div className={clsx(
                                            "h-2 w-2 rounded-full animate-pulse",
                                            store?.is_open ? "bg-green-500" : "bg-red-500"
                                        )} /> 
                                        {store?.is_open ? "Aberto agora" : "Fechado"}
                                    </div>
                                </div>
                            </div>

                            {/* Layout Dinâmico */}
                            <div className="space-y-6 text-left">
                                
                                {/* Entrega & Tempo - Row Horizontal */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-orange-50/50 rounded-3xl border border-orange-100 flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-[#ff3d03]">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[#ff3d03]/60 uppercase tracking-widest">Tempo Médio</p>
                                            <p className="text-sm font-black text-gray-950">{store?.estimated_delivery_time || '35-50'} min</p>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-blue-500">
                                            <Star className="h-5 w-5 fill-current" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-blue-600/60 uppercase tracking-widest">Avaliação</p>
                                            <p className="text-sm font-black text-blue-950">4.9 (500+)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Localização Interativa */}
                                <div className="p-6 bg-gray-50 rounded-[40px] border border-gray-100">
                                    <h3 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" /> Endereço oficial
                                    </h3>
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-relaxed mb-4">
                                                {store?.address || 'Endereço não informado'}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store?.address || '')}`} target="_blank" className="h-11 px-5 bg-blue-600 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                                    Abrir no Maps
                                                </a>
                                                <a href={`https://waze.com/ul?q=${encodeURIComponent(store?.address || '')}`} target="_blank" className="h-11 w-11 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-sky-500 hover:bg-sky-50 transition-all shadow-sm">
                                                    <Share2 className="h-5 w-5" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contato & Redes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {store?.whatsapp && (
                                        <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} target="_blank" className="p-5 bg-[#25D366]/10 rounded-3xl border border-[#25D366]/20 flex items-center gap-4 group hover:bg-[#25D366]/20 transition-all cursor-pointer">
                                            <div className="h-12 w-12 flex items-center justify-center bg-[#25D366] text-white rounded-2xl shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                                                <MessageCircle className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-[#25D366] uppercase tracking-widest mb-1">WhatsApp</p>
                                                <p className="text-sm font-bold text-gray-900">Falar com atendente</p>
                                            </div>
                                        </a>
                                    )}
                                    
                                    {store?.instagram && (
                                        <a href={`https://instagram.com/${store.instagram.replace('@', '')}`} target="_blank" className="p-5 bg-pink-50 rounded-3xl border border-pink-100 flex items-center gap-4 group hover:bg-pink-100 transition-all cursor-pointer">
                                            <div className="h-12 w-12 flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white rounded-2xl shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                                                <Instagram className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-1">Instagram</p>
                                                <p className="text-sm font-bold text-gray-900">Ver fotos e stories</p>
                                            </div>
                                        </a>
                                    )}
                                </div>

                                {/* Horários Detalhados */}
                                <div className="p-6 rounded-[32px] border border-gray-100 bg-white shadow-sm">
                                    <h3 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" /> Horário de Funcionamento
                                    </h3>
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                            {store?.operating_hours_formatted || "Horário não informado."}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
