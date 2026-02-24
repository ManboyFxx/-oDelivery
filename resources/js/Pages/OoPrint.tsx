import PublicLayout from '@/Layouts/PublicLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    ShoppingBag, 
    Printer, 
    Zap
} from 'lucide-react';

export default function OoPrint({ auth }: PageProps) {
    return (
        <PublicLayout>
            <Head title="OoPrint | Impressão Térmica Automática para Delivery" />
            
            <main>
                <section className="relative pt-20 lg:pt-32 pb-24 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
                        <div className="flex flex-col gap-6 items-center text-center max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3D03]/10 text-[#FF3D03] text-[10px] md:text-xs font-bold uppercase tracking-wider w-fit">
                                <Printer size={14} />
                                Integração Windows
                            </div>
                            
                            <h1 className="text-4xl lg:text-6xl font-black leading-[0.95] tracking-tight text-[#181210]">
                                Impressão térmica <br/>
                                <span className="text-[#FF3D03] italic relative inline-block">
                                    instantânea.
                                </span>
                            </h1>
                            
                            <p className="text-lg lg:text-xl text-[#8d695e] max-w-2xl leading-snug">
                                Conecte qualquer impressora térmica USB/Rede e elimine erros de escrita manual. Pedido chegou, imprimiu.
                            </p>
                            
                            <div className="mt-2 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#181210] text-white shadow-xl shadow-black/10 transform hover:scale-105 transition-transform border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-[#00D9F5] animate-pulse"></div>
                                <span className="font-bold uppercase tracking-wider text-xs">Disponível para Windows 10/11</span>
                            </div>
                        </div>

                        {/* Dashboard Simulation */}
                        <div className="w-full max-w-5xl">
                            <div className="bg-[#0f0f0f] rounded-3xl border border-[#333] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px] transform scale-100 md:scale-95 origin-top">
                                {/* Sidebar */}
                                <div className="w-full md:w-64 bg-[#141414] border-r border-[#333] p-6 flex flex-col gap-8">
                                    <div className="flex items-center gap-2 text-white mb-4">
                                        <Printer className="text-[#FF3D03]" size={24} />
                                        <div>
                                            <h2 className="font-bold leading-none">ÓoPrint</h2>
                                            <p className="text-[10px] text-gray-500 tracking-widest">SISTEMA V2.4</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-gray-400 p-3 rounded-xl hover:bg-[#FF3D03]/10 hover:text-[#FF3D03] cursor-pointer transition-colors">
                                            <ShoppingBag size={18} /> <span className="text-sm font-medium">Pedidos</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-400 p-3 rounded-xl hover:bg-[#FF3D03]/10 hover:text-[#FF3D03] cursor-pointer transition-colors">
                                            <div className="w-[18px] h-[18px] rounded-full border-2 border-current flex items-center justify-center text-[10px]">H</div> <span className="text-sm font-medium">Histórico</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-white bg-[#FF3D03] p-3 rounded-xl shadow-lg shadow-[#FF3D03]/20 cursor-pointer">
                                            <Zap size={18} /> <span className="text-sm font-bold">Configurações</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-[#FF3D03] animate-pulse"></div>
                                            <span className="text-[#FF3D03] text-xs font-bold uppercase">Online</span>
                                        </div>
                                        <p className="text-xs text-gray-500">ÓoPrint Sistema v2.4</p>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 p-8 bg-[#0f0f0f] text-white overflow-y-auto custom-scrollbar">
                                    {/* Header Status */}
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>v2.4</span>
                                            <span className="bg-[#1a1a1a] px-2 py-1 rounded text-gray-400 border border-[#333]">OoDelivery</span>
                                            <span className="bg-[#1a1a1a] px-2 py-1 rounded text-blue-400 border border-blue-900/30">#A0F06452</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-[#052e16] text-[#25D366] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-[#25D366]/20">
                                                <div className="w-2 h-2 rounded-full bg-[#25D366]"></div> CONECTADO
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex gap-4 mb-8 border-b border-[#333] pb-6">
                                        <button className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white transition-colors bg-[#1a1a1a] border border-[#333] text-sm font-medium">Sistema</button>
                                        <button className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white transition-colors bg-[#1a1a1a] border border-[#333] text-sm font-medium">Hardware</button>
                                        <button className="px-6 py-2.5 rounded-lg text-white bg-[#FF3D03] shadow-lg shadow-[#FF3D03]/20 text-sm font-bold flex items-center gap-2">
                                            <Printer size={16} /> Cupom
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Settings Column */}
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-[#FF3D03] text-xs font-bold uppercase tracking-widest mb-4">Identidade Visual</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-gray-400 text-xs mb-2 block">Título Principal</label>
                                                        <input type="text" value="Pedido Impresso" disabled className="w-full bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF3D03]" />
                                                    </div>
                                                    <div>
                                                        <label className="text-gray-400 text-xs mb-2 block">Rodapé</label>
                                                        <input type="text" value="Obrigado pela compra!" disabled className="w-full bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF3D03]" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-[#FF3D03] text-xs font-bold uppercase tracking-widest mb-4">Ajustes de Impressão</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-gray-400 text-xs mb-2 block">Tamanho da Fonte</label>
                                                        <input type="text" value="Média" disabled className="w-full bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF3D03]" />
                                                    </div>
                                                    <div>
                                                        <label className="text-gray-400 text-xs mb-2 block">Margem Esquerda (mm)</label>
                                                        <input type="text" value="0" disabled className="w-full bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF3D03]" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-[#FF3D03] text-xs font-bold uppercase tracking-widest mb-4">Informações do Pedido</h3>
                                                <div className="space-y-3">
                                                    {['Destacar Número do Pedido', 'Exibir Telefone', 'Exibir Opcionais e Complementos'].map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between bg-[#141414] p-3 rounded-xl border border-[#333]">
                                                            <span className="text-sm text-gray-300">{item}</span>
                                                            <div className="w-10 h-5 bg-[#FF3D03] rounded-full relative cursor-pointer">
                                                                <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview Column */}
                                        <div className="flex flex-col items-center">
                                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 self-end">Prévia de Impressão</h3>
                                            <div className="relative w-full max-w-[340px] bg-[#fff] px-6 py-8 shadow-2xl skew-y-0 font-mono text-xs border border-gray-200 transform scale-[0.85] origin-top md:origin-top">
                                                <div className="relative z-10 text-[#181210]">
                                                    <div className="text-center mb-4">
                                                        <h3 className="font-bold text-base uppercase tracking-wider">Pedido Impresso</h3>
                                                        <p className="text-[9px] text-gray-500 uppercase">Sistema de Impressão Automático</p>
                                                        <div className="w-full border-b border-dashed border-gray-300 my-2"></div>
                                                    </div>

                                                    <div className="text-center mb-4">
                                                        <h2 className="text-3xl font-black tracking-tighter">PEDIDO #9281</h2>
                                                        <div className="w-full border-b-2 border-black mt-2"></div>
                                                    </div>

                                                    <div className="mb-4 text-[10px] space-y-1">
                                                        <p>DATA: 25/05/2024 20:15:33</p>
                                                    </div>

                                                    <div className="mb-4 text-[10px] space-y-1">
                                                        <p className="font-bold">CLIENTE: RICARDO OLIVEIRA</p>
                                                        <p>TEL: (11) 98765-4321</p>
                                                        <p>RUA DAS FLORES, 123 - AP 42</p>
                                                        <p>BAIRRO: CENTRO - SÃO PAULO/SP</p>
                                                        <div className="w-full border-b border-dashed border-gray-300 mt-2"></div>
                                                    </div>
                                                    
                                                    <div className="space-y-3 mb-4 text-[10px]">
                                                        <div>
                                                            <div className="flex justify-between font-bold text-xs">
                                                                <span>1X BURGER GOURMET MASTER</span>
                                                                <span>34.90</span>
                                                            </div>
                                                            <div className="pl-3 text-gray-600 mt-1 space-y-0.5">
                                                                <p>+ ADICIONAL BACON</p>
                                                                <p>+ QUEIJO CHEDDAR</p>
                                                                <p className="italic text-[#181210]">{'>>'} CARNE MAL PASSADA</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-full border-b border-dashed border-gray-300 mt-2"></div>
                                                    </div>

                                                    <div className="space-y-1 mb-4 text-[10px]">
                                                        <div className="flex justify-between">
                                                            <span className="font-bold">SUBTOTAL:</span>
                                                            <span className="font-bold">52.90</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-bold">TAXA ENTREGA:</span>
                                                            <span className="font-bold">6.00</span>
                                                        </div>
                                                        <div className="flex justify-between text-[#FF3D03]">
                                                            <span className="font-bold">ACRÉSC. MAQUINETA:</span>
                                                            <span className="font-bold">4.00</span>
                                                        </div>
                                                    </div>

                                                    <div className="border-t-2 border-black pt-2 mb-4">
                                                        <div className="flex justify-between items-end">
                                                            <span className="font-black text-lg">TOTAL GERAL:</span>
                                                            <span className="font-black text-xl">R$ 62.90</span>
                                                        </div>
                                                    </div>

                                                    <div className="border border-black p-2 text-center mb-6">
                                                        <p className="font-bold text-[10px] uppercase">Pagto: Cartão de Crédito</p>
                                                    </div>

                                                    <div className="text-center space-y-2">
                                                        <p className="font-bold text-[10px] italic">OBRIGADO PELA COMPRA!</p>
                                                        <div className="w-full border-b border-gray-200"></div>
                                                        <p className="text-[8px] text-gray-400 uppercase">OoPrint Sistema v2.4</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="absolute -bottom-3 left-0 w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAxMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHBhdGggZD0iTTAgMTBMMTAgMEwyMCAxMFoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')] bg-repeat-x bg-[length:20px_10px]"></div>
                                            </div>
                                        </div>
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
