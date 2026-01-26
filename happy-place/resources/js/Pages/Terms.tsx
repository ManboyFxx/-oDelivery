import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#ff3d03] selection:text-white">
            <Head title="Termos de Uso - ÓoDelivery" />

            <div className="max-w-3xl mx-auto px-6 py-20">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-[#ff3d03] transition-colors mb-8">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para o início
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Termos de Uso</h1>
                    <p className="text-gray-500 font-medium">Última atualização: 25 de Janeiro de 2026</p>
                </div>

                <div className="prose prose-lg prose-gray max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-[#ff3d03] prose-strong:text-gray-900">
                    <p>
                        Bem-vindo ao ÓoDelivery. Ao acessar nosso site e utilizar nossos serviços, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.
                    </p>

                    <h3>1. Licença de Uso</h3>
                    <p>
                        É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site ÓoDelivery, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
                    </p>
                    <ul>
                        <li>modificar ou copiar os materiais;</li>
                        <li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
                        <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site ÓoDelivery;</li>
                        <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
                        <li>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</li>
                    </ul>

                    <h3>2. Isenção de responsabilidade</h3>
                    <p>
                        Os materiais no site da ÓoDelivery são fornecidos 'como estão'. ÓoDelivery não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
                    </p>

                    <h3>3. Limitações</h3>
                    <p>
                        Em nenhum caso o ÓoDelivery ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em ÓoDelivery.
                    </p>

                    <h3>4. Precisão dos materiais</h3>
                    <p>
                        Os materiais exibidos no site da ÓoDelivery podem incluir erros técnicos, tipográficos ou fotográficos. ÓoDelivery não garante que qualquer material em seu site seja preciso, completo ou atual. ÓoDelivery pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio.
                    </p>

                    <h3>5. Modificações</h3>
                    <p>
                        O ÓoDelivery pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
                    </p>
                </div>
            </div>

            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-gray-400 font-medium text-sm">
                        &copy; {new Date().getFullYear()} ÓoDelivery. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
