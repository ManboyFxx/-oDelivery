import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
    return (
        <PublicLayout>
            <Head title="Política de Privacidade - OoDelivery" />
            
            <main className="max-w-4xl mx-auto px-6 py-20 relative z-10">
                <div className="mb-12">
                    <Link href="/" className="text-sm font-bold flex items-center gap-2 text-[#FF3D03] hover:opacity-80 transition-opacity mb-8">
                        <ArrowLeft size={16} /> Voltar para o início
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-[#181210] mb-6 tracking-tight">Política de Privacidade</h1>
                    <p className="text-[#8d695e] font-bold uppercase tracking-widest text-xs">Última atualização: 23 de Fevereiro de 2026</p>
                </div>

                <div className="prose prose-lg prose-gray max-w-none prose-headings:font-black prose-headings:text-[#181210] prose-headings:tracking-tight prose-a:text-[#FF3D03] prose-strong:text-[#181210] prose-p:text-[#5c4a45] prose-li:text-[#5c4a45]">
                    <p className="lead font-medium text-[#181210]">
                        A sua privacidade é importante para nós. É política do OoDelivery respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site OoDelivery, e outros sites que possuímos e operamos.
                    </p>

                    <h3 className="text-2xl mt-10 mb-4">1. Coleta de Informações</h3>
                    <p>
                        Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
                    </p>

                    <h3 className="text-2xl mt-10 mb-4">2. Uso das Informações</h3>
                    <p>
                        Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei. O OoDelivery atua como um processador de dados para os lojistas, que são os controladores dos dados de seus próprios clientes.
                    </p>

                    <h3 className="text-2xl mt-10 mb-4">3. Retenção de Dados</h3>
                    <p>
                        Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, os protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                    </p>

                    <h3 className="text-2xl mt-10 mb-4">4. Cookies</h3>
                    <p>
                        Utilizamos cookies para melhorar a sua experiência de navegação e fornecer serviços personalizados. Você pode optar por desativar os cookies nas configurações do seu navegador, embora isso possa afetar certas funcionalidades do site.
                    </p>

                    <h3 className="text-2xl mt-10 mb-4">5. Compromisso do Usuário</h3>
                    <p>
                        O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o OoDelivery oferece no site e com caráter enunciativo, mas não limitativo:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li>Não se envolver em atividades que sejam ilegais ou contrárias à boa fé e à ordem pública;</li>
                        <li>Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do OoDelivery, de seus fornecedores ou terceiros.</li>
                    </ul>

                    <h3 className="text-2xl mt-10 mb-4">6. Mais informações</h3>
                    <p>
                        Esperamos que esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.
                    </p>
                </div>
            </main>
        </PublicLayout>
    );
}
