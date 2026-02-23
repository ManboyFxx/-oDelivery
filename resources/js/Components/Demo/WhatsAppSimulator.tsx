import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, ChevronLeft, MoreVertical, Phone, Video, CheckCheck, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function WhatsAppSimulator() {
    const { props } = usePage();
    const tenant = (props as any).tenant;
    const tenantSlug = tenant?.slug || 'demo-oo-delivery';

    const messages = [
        { id: 1, type: 'user', text: 'Oi! Quero fazer um pedido 🍕', time: '19:00' },
        { id: 2, type: 'bot', text: `Olá! Bem-vindo ao ${tenant?.name || 'Pizza & Burger Demo'}! 👋`, time: '19:00' },
        { id: 3, type: 'bot', text: `Aqui está nosso cardápio atualizado: https://oodelivery.online/${tenantSlug}`, time: '19:00' },
        { id: 4, type: 'user', text: 'Beleza, já escolhi. Quanto tempo demora?', time: '19:02' },
        { id: 5, type: 'bot', text: 'Seu pedido está sendo preparado! O tempo estimado de entrega é de 35-50 min. 🛵', time: '19:02' },
        { id: 6, type: 'bot', text: 'Deseja que eu te envie o link para rastrear o motoboy em tempo real?', time: '19:02' },
        { id: 7, type: 'user', text: 'Sim, por favor!', time: '19:03' },
        { id: 8, type: 'bot', text: 'Rastreio ativado! 📍 Clique para ver o mapa: https://rastreio.live/72A-8', time: '19:03' }
    ];

    const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        let timeoutId: any;
        
        const showNextMessage = (index: number) => {
            if (index >= messages.length) {
                // Restart after delay
                timeoutId = setTimeout(() => {
                    setVisibleMessages([]);
                    showNextMessage(0);
                }, 5000);
                return;
            }

            const msg = messages[index];
            if (msg.type === 'bot') {
                setIsTyping(true);
                timeoutId = setTimeout(() => {
                    setIsTyping(false);
                    setVisibleMessages(prev => [...prev, msg.id]);
                    showNextMessage(index + 1);
                }, 1500 + Math.random() * 1000);
            } else {
                timeoutId = setTimeout(() => {
                    setVisibleMessages(prev => [...prev, msg.id]);
                    showNextMessage(index + 1);
                }, 2000);
            }
        };

        showNextMessage(0);
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className="bg-[#E5DDD5] dark:bg-[#0b141a] rounded-[2.5rem] w-full h-[600px] flex flex-col shadow-2xl relative overflow-hidden border-[8px] border-white dark:border-[#202c33]">
            {/* Header */}
            <div className="bg-[#075E54] dark:bg-[#202c33] text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" />
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold truncate">OoDelivery Bot 🤖</h4>
                        <p className="text-[10px] text-white/70">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Video className="w-4 h-4 text-white/70" />
                    <Phone className="w-4 h-4 text-white/70" />
                    <MoreVertical className="w-4 h-4 text-white/70" />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence>
                    {messages.filter(m => visibleMessages.includes(m.id)).map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, scale: 0.9, x: msg.type === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-3 rounded-2xl text-xs relative shadow-sm ${
                                msg.type === 'user' 
                                ? 'bg-[#DCF8C6] dark:bg-[#005c4b] text-gray-800 dark:text-white rounded-tr-none' 
                                : 'bg-white dark:bg-[#202c33] text-gray-800 dark:text-gray-200 rounded-tl-none border border-black/5'
                            }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                                    <span className="text-[8px]">{msg.time}</span>
                                    {msg.type === 'user' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white dark:bg-[#202c33] p-3 rounded-2xl rounded-tl-none w-16 text-xs flex justify-center gap-1"
                        >
                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="bg-[#F0F2F5] dark:bg-[#202c33] p-3 flex items-center gap-3 shrink-0">
                <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-full px-4 py-2 text-xs text-gray-400">
                    Mensagem...
                </div>
                <div className="bg-[#00a884] p-2.5 rounded-full text-white">
                    <Send className="w-4 h-4 fill-current" />
                </div>
            </div>

            {/* Float Info */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10">
                <p className="text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#FF3D03]" />
                    Simulador de IA Ativo
                </p>
            </div>
        </div>
    );
}
