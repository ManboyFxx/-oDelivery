import PublicLayout from '@/Layouts/PublicLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    ShoppingBag, 
    MessageCircle, 
    CheckCircle2,
    Send
} from 'lucide-react';

export default function OoBot({ auth }: PageProps) {
    return (
        <PublicLayout>
            <Head title="OoBot | Atendente IA para WhatsApp Delivery" />
            
            <main>
                {/* Hero Section */}
                <section className="relative pt-20 lg:pt-32 pb-24 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="flex flex-col gap-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3D03]/10 text-[#FF3D03] text-[10px] md:text-xs font-bold uppercase tracking-wider w-fit">
                                <MessageCircle size={14} />
                                Automação WhatsApp Oficial
                            </div>
                            
                            <h1 className="text-4xl lg:text-6xl font-black leading-[0.95] tracking-tight text-[#181210]">
                                Seus clientes informados <br/>
                                <span className="text-[#FF3D03] italic relative inline-block">
                                    em tempo real.
                                </span>
                            </h1>
                            
                            <p className="text-lg lg:text-xl text-[#8d695e] max-w-2xl leading-snug">
                                Mantenha seu cliente informado a cada etapa. Pedido confirmado, em preparo e saiu para entrega. Tudo automático via WhatsApp.
                            </p>
                        </div>

                        {/* Phone Mockup with Chat Simulation */}
                        <div className="relative h-full min-h-[500px] flex items-center justify-center lg:justify-end">
                            <div className="relative w-[300px] h-[600px] bg-[#181210] rounded-[3rem] border-8 border-[#333] shadow-2xl overflow-hidden">
                                {/* Screen Header */}
                                <div className="bg-[#FF3D03] h-16 flex items-center px-4 gap-3 text-white">
                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border-2 border-white/20 overflow-hidden">
                                        <ShoppingBag size={20} className="text-[#FF3D03]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">OoDelivery</p>
                                        <p className="text-[10px] opacity-80">visto por último hoje às 19:42</p>
                                    </div>
                                </div>
                                {/* Chat Area */}
                                <div className="bg-[#ece5dd] h-full p-4 flex flex-col gap-4 font-sans text-sm relative">
                                    {/* Bot Message 1 */}
                                    <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm self-start max-w-[85%]">
                                        <p className="text-[#181210]">Olá Ricardo! Recebemos seu pedido <strong>#9281</strong>. 🍔</p>
                                        <p className="text-[#181210] mt-1">O tempo estimado é de 40-50 min.</p>
                                        <p className="text-[10px] text-gray-400 text-right mt-1">19:42</p>
                                    </div>
                                    
                                    {/* Bot Message 2 */}
                                    <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm self-start max-w-[85%]">
                                        <p className="text-[#181210]">Seu pedido saiu para entrega! 🛵</p>
                                        <p className="text-[#181210] mt-1">Acompanhe o entregador em tempo real:</p>
                                        <div className="mt-2 bg-[#f5f5f5] p-2 rounded border border-gray-200">
                                            <p className="text-[#FF3D03] font-bold text-xs truncate">oodelivery.app/track/9281</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 text-right mt-1">20:15</p>
                                    </div>

                                    {/* User Message */}
                                    <div className="bg-[#FF3D03]/20 p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-sm self-end max-w-[85%]">
                                        <p className="text-[#181210]">Show! Obrigado 🙌</p>
                                        <p className="text-[10px] text-[#FF3D03] text-right mt-1 flex items-center justify-end gap-1">20:16 <CheckCircle2 size={10} /></p>
                                    </div>
                                </div>
                                {/* Input Area */}
                                <div className="absolute bottom-0 w-full h-16 bg-[#f0f0f0] flex items-center px-4 gap-2">
                                    <div className="flex-1 h-10 bg-white rounded-full px-4 text-xs flex items-center text-gray-400">Digite uma mensagem...</div>
                                    <div className="w-10 h-10 bg-[#FF3D03] rounded-full flex items-center justify-center text-white">
                                        <Send size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
