import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Terms() {
    return (
        <div className="relative min-h-screen bg-[#f8f6f5] text-[#181210] selection:bg-[#FF3D03]/20 font-sans antialiased overflow-x-hidden">
            <Head title="Termos de Uso - OoDelivery" />
            
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
                </svg>
            </div>

            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#e7ddda]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <ShoppingBag className="text-[#FF3D03] transition-transform group-hover:scale-110" size={28} strokeWidth={2.5} />
                        <span className="text-2xl font-black tracking-tighter text-[#181210]">
                            Oo<span className="text-[#FF3D03]">Delivery</span>
                        </span>
                    </Link>
                    <Link href="/" className="text-sm font-bold flex items-center gap-2 hover:text-[#FF3D03] transition-colors">
                        <ArrowLeft size={16} /> Voltar
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-20 relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#181210] mb-6 tracking-tight">Termos de Uso</h1>
                    <p className="text-[#8d695e] font-bold uppercase tracking-widest text-xs">Última atualização: 25 de Janeiro de 2026</p>
                </div>

                <div className="prose prose-lg prose-gray max-w-none prose-headings:font-black prose-headings:text-[#181210] prose-headings:tracking-tight prose-a:text-[#FF3D03] prose-strong:text-[#181210] prose-p:text-[#5c4a45] prose-li:text-[#5c4a45]">
                    <p className="lead font-medium text-[#181210]">
                        Bem-vindo ao OoDelivery. Ao acessar nosso site e utilizar nossos serviços, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis.
                    </p>

                    <h3 className="text-2xl mt-10 mb-4">1. Licença de Uso</h3>
                    <p>
                        É concedida permissão para o uso da plataforma OoDelivery para gestão de pedidos e operações de delivery. Esta é a concessão de uma licença de software como serviço (SaaS), não uma transferência de título. Sob esta licença, você não pode:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li>modificar, copiar ou tentar engenharia reversa do software;</li>
                        <li>usar o serviço para fins ilegais ou não autorizados;</li>
                        <li>revender o acesso ao serviço sem autorização expressa;</li>
                        <li>remover quaisquer direitos autorais ou notações de propriedade.</li>
                    </ul>

                    <h3 className="text-2xl mt-10 mb-4">2. Isenção de Responsabilidade</h3>
                    <p>
                        Os serviços do OoDelivery são fornecidos "como estão". Não oferecemos garantias de que o serviço será ininterrupto, oportuno, seguro ou livre de erros, embora nos esforcemos para manter 99.9% de uptime.
                    </p>

                    <h3 className="text-2xl mt-10 mb-4">3. Limitações</h3>
                    <p>
                        Em nenhum caso o OoDelivery será responsável por danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis.
                    </p>

                    <h3 className="text-2xl mt-10 mb-4">4. Planos e Pagamentos</h3>
                    <p>
                        O serviço opera em modelo de assinatura (Plano Único ou Enterprise). O não pagamento pode resultar na suspensão temporária do serviço. O cancelamento pode ser feito a qualquer momento sem multa, cessando a cobrança no ciclo seguinte.
                    </p>

                    <h3 className="text-2xl mt-10 mb-4">5. Modificações</h3>
                    <p>
                        O OoDelivery pode revisar estes termos de serviço a qualquer momento. Ao continuar a usar o serviço após as alterações, você concorda em ficar vinculado à versão revisada.
                    </p>
                </div>
            </main>

            <footer className="bg-[#f8f6f5] py-12 px-6 border-t border-[#e7ddda]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap justify-center gap-8 text-[11px] font-bold text-[#8d695e] uppercase tracking-widest">
                        <Link href="/termos" className="hover:text-[#FF3D03] transition-colors">Termos de Uso</Link>
                        <Link href="#" className="hover:text-[#FF3D03] transition-colors">Privacidade</Link>
                        <Link href="/suporte" className="hover:text-[#FF3D03] transition-colors">Suporte</Link>
                    </div>

                    <p className="text-[10px] font-black text-gray-400/50 uppercase tracking-[0.2em]">
                        © 2026 OoDelivery Systems.
                    </p>
                </div>
            </footer>
        </div>
    );
}
