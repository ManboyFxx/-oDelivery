
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { MessageCircle, Mail, Clock, HelpCircle, ChevronDown, CheckCircle } from 'lucide-react';
import { Disclosure } from '@headlessui/react';
import PrimaryButton from '@/Components/PrimaryButton';

interface SupportProps {
    support_contact: {
        whatsapp: string;
        email: string;
        hours: string;
    };
}

export default function SupportIndex({ support_contact }: SupportProps) {
    const faqs = [
        {
            question: 'Como altero meu plano?',
            answer: 'Entre em contato com nosso suporte via WhatsApp. No momento, upgrades e downgrades são processados manualmente para garantir a segurança dos seus dados.'
        },
        {
            question: 'A impressora parou de funcionar, o que fazer?',
            answer: 'Verifique se o aplicativo "ÓoDelivery Print" está aberto no computador e se a impressora está conectada. Tente gerar um novo token em Configurações > Impressora.'
        },
        {
            question: 'Como adicionar um novo motoboy?',
            answer: 'Vá em Equipe > Gerenciar. Clique em "Novo Usuário" e selecione a função "Motoboy". Ele receberá acesso ao aplicativo de entregas.'
        },
        {
            question: 'Meu cardápio não aparece no site.',
            answer: 'Certifique-se de que a categoria e os produtos estejam marcados como "Ativo". Verifique também se a loja está "Aberta" no topo do painel.'
        }
    ];

    const openWhatsApp = () => {
        const text = encodeURIComponent('Olá, preciso de ajuda com minha loja no ÓoDelivery.');
        window.open(`https://wa.me/${support_contact.whatsapp}?text=${text}`, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Suporte e Ajuda" />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Central de Ajuda</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Estamos aqui para ajudar sua operação a não parar.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Contact Options */}
                    <div className="md:col-span-1 space-y-6">
                        {/* WhatsApp Card */}
                        <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <MessageCircle className="w-10 h-10 mb-4 text-white" />
                            <h3 className="text-2xl font-black mb-2">Fale no WhatsApp</h3>
                            <p className="text-white/90 text-sm mb-6 font-medium">Resposta mais rápida. Ideal para urgências e dúvidas operacionais.</p>

                            <button
                                onClick={openWhatsApp}
                                className="w-full py-3 bg-white text-[#128C7E] rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Iniciar Conversa
                            </button>
                        </div>

                        {/* Other Contacts */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">E-mail</h4>
                                    <p className="text-sm text-gray-500 mb-1">Para assuntos administrativos.</p>
                                    <a href={`mailto:${support_contact.email}`} className="text-sm font-bold text-blue-500 hover:underline">
                                        {support_contact.email}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-500">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Horário de Atendimento</h4>
                                    <p className="text-sm text-gray-500">
                                        {support_contact.hours}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: FAQ */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-[#ff3d03]" />
                                Perguntas Frequentes
                            </h3>

                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <Disclosure key={index} as="div" className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
                                        {({ open }) => (
                                            <>
                                                <Disclosure.Button className="flex w-full justify-between items-center px-6 py-4 text-left font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <span>{faq.question}</span>
                                                    <ChevronDown
                                                        className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-400`}
                                                    />
                                                </Disclosure.Button>
                                                <Disclosure.Panel className="px-6 pb-6 pt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-white/[0.02]">
                                                    {faq.answer}
                                                </Disclosure.Panel>
                                            </>
                                        )}
                                    </Disclosure>
                                ))}
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="bg-[#111827] dark:bg-[#000000] rounded-[32px] p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Todos os sistemas operacionais</h4>
                                    <p className="text-white/40 text-sm">Atualizado há 1 minuto</p>
                                </div>
                            </div>
                            <div className="hidden md:flex gap-2">
                                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold border border-white/5">API: Online</span>
                                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold border border-white/5">DB: Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
