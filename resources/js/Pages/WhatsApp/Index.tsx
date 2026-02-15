import { useState } from 'react';
import { usePage, router, Head, useForm } from '@inertiajs/react';
import { Switch } from '@headlessui/react';
import { MessageSquare, RefreshCw, CheckCircle, XCircle, Clock, Info, ShieldCheck, Send, Save, Phone } from 'lucide-react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Log {
    id: string;
    phone_number: string;
    template_key: string;
    message_sent: string;
    status: 'pending' | 'sent' | 'failed';
    error_message?: string;
    order_number?: string;
    created_at: string;
}

interface WhatsAppPageProps extends PageProps {
    autoMessagesEnabled: boolean;
    logs: Log[];
    plan: string;
    templates: Array<{
        key: string;
        name: string;
        message: string;
        is_active: boolean;
        is_custom: boolean;
    }>;
}

export default function Index({ auth }: PageProps) {
    const { autoMessagesEnabled, logs, plan, templates } = usePage<WhatsAppPageProps>().props;

    const [enabled, setEnabled] = useState(autoMessagesEnabled);
    const [isToggling, setIsToggling] = useState(false);

    // Test Message Form
    const { data: testData, setData: setTestData, post: postTest, processing: processingTest, reset: resetTest, errors: testErrors } = useForm({
        phone: '',
        message: 'Teste de conexão ÓoDelivery 🚀',
    });

    const handleTestSend = (e: React.FormEvent) => {
        e.preventDefault();
        postTest(route('whatsapp.test-send'), {
            onSuccess: () => resetTest(),
            preserveScroll: true,
        });
    };

    // Templates Form
    const { data: templateData, setData: setTemplateData, post: postTemplates, processing: processingTemplates } = useForm({
        templates: templates,
    });

    const handleTemplateChange = (index: number, field: string, value: any) => {
        const newTemplates = [...templateData.templates];
        // @ts-ignore
        newTemplates[index][field] = value;
        setTemplateData('templates', newTemplates);
    };

    const handleSaveTemplates = (e: React.FormEvent) => {
        e.preventDefault();
        postTemplates(route('whatsapp.templates.update'), {
            preserveScroll: true,
        });
    };

    const handleToggle = async (newValue: boolean) => {
        setIsToggling(true);
        setEnabled(newValue);

        router.post(route('whatsapp.toggle'), {
            enabled: newValue,
        }, {
            preserveScroll: true,
            onFinish: () => setIsToggling(false),
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Enviada
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800">
                        <XCircle className="w-3.5 h-3.5" />
                        Falhou
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        Pendente
                    </span>
                );
        }
    };

    const getTemplateLabel = (key: string) => {
        const labels: Record<string, string> = {
            order_confirmed: 'Pedido Confirmado',
            order_ready: 'Pedido Pronto',
            order_out_for_delivery: 'Saiu para Entrega',
            order_delivered: 'Pedido Entregue',
        };
        return labels[key] || key;
    };

    return (
        <AuthenticatedLayout>
            <Head title="WhatsApp Integration" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-2xl shadow-lg shadow-green-500/20 text-white">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                WhatsApp Integration
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                Automação de mensagens e notificações de pedidos
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Settings */}
                    <div className="space-y-6">
                        {/* Toggle Card */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                <MessageSquare className="w-24 h-24 text-[#ff3d03]" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Status do Bot
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Ativar envio automático
                                        </p>
                                    </div>
                                    <Switch
                                        checked={enabled}
                                        onChange={handleToggle}
                                        disabled={isToggling}
                                        className={`${enabled ? 'bg-[#ff3d03]' : 'bg-gray-200 dark:bg-gray-700'
                                            } relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3d03] focus:ring-offset-2 disabled:opacity-50 cursor-pointer`}
                                    >
                                        <span
                                            className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}
                                        />
                                    </Switch>
                                </div>

                                <div className={`p-4 rounded-2xl border transition-all duration-300 ${enabled
                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-xl mt-1 ${enabled ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${enabled ? 'text-green-800 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {enabled ? 'Serviço Ativo' : 'Serviço Pausado'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                {enabled
                                                    ? 'O disparador automático está processando novos pedidos.'
                                                    : 'Nenhuma mensagem será enviada automaticamente.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Plan Info Card */}
                        <div className="bg-gray-900 dark:bg-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff3d03] opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                                    <ShieldCheck className="w-5 h-5 text-[#ff3d03]" />
                                </div>
                                <div>
                                    <p className="text-xs text-white/80 font-bold uppercase tracking-wider">Seu Plano Atual</p>
                                    <p className="font-black text-xl uppercase tracking-tight">{plan === 'free' ? 'Gratuito' : plan}</p>
                                </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-start gap-3 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <Info className="w-5 h-5 text-[#ff3d03] shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium text-white leading-relaxed">
                                        Você utiliza nossa <strong>instância gerenciada premium</strong>. Não é necessário escanear QR Code ou manter um celular conectado.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Event Types */}
                        <div className="bg-gray-900 dark:bg-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-[#ff3d03]" />
                                Eventos Automáticos
                            </h3>
                            <div className="space-y-3">
                                {['Pedido Confirmado', 'Pedido Pronto', 'Saiu para Entrega', 'Pedido Entregue'].map((event, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300 p-2 hover:bg-white/10 rounded-xl transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></div>
                                        {event}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Test Send Card */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Send className="w-4 h-4 text-[#ff3d03]" />
                                Testar Envio
                            </h3>
                            <form onSubmit={handleTestSend} className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Telefone (com DDD)</label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                        <input
                                            type="text"
                                            value={testData.phone}
                                            onChange={e => setTestData('phone', e.target.value)}
                                            placeholder="5511999999999"
                                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-[#ff3d03] focus:border-[#ff3d03]"
                                        />
                                    </div>
                                    {testErrors.phone && <p className="text-xs text-red-500 mt-1">{testErrors.phone}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Mensagem</label>
                                    <textarea
                                        value={testData.message}
                                        onChange={e => setTestData('message', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-[#ff3d03] focus:border-[#ff3d03] h-20 resize-none"
                                    />
                                    {testErrors.message && <p className="text-xs text-red-500 mt-1">{testErrors.message}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processingTest}
                                    className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Enviar Teste
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Templates & Logs */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Template Editor */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Editor de Modelos
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Personalize as mensagens automáticas enviadas aos clientes
                                    </p>
                                </div>
                                <button
                                    onClick={handleSaveTemplates}
                                    disabled={processingTemplates}
                                    className="px-4 py-2 bg-[#ff3d03] text-white rounded-xl text-sm font-bold hover:bg-[#e63600] transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processingTemplates ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Salvar Alterações
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {templateData.templates.map((template, index) => (
                                    <div key={template.key} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                    {getTemplateLabel(template.key)}
                                                </span>
                                            </div>
                                            <Switch
                                                checked={template.is_active}
                                                onChange={(val) => handleTemplateChange(index, 'is_active', val)}
                                                className={`${template.is_active ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                                    } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer`}
                                            >
                                                <span className={`${template.is_active ? 'translate-x-4' : 'translate-x-1'} inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`} />
                                            </Switch>
                                        </div>
                                        <textarea
                                            value={template.message}
                                            onChange={(e) => handleTemplateChange(index, 'message', e.target.value)}
                                            rows={5}
                                            className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-xs md:text-sm focus:ring-green-500 focus:border-green-500 resize-none leading-relaxed"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2">
                                            Variáveis: {'{customer_name}, {order_number}, {order_total}, {store_name}'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logs */}
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Histórico de Envios
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Registro das últimas interações
                                    </p>
                                </div>
                                <div className="text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-600 dark:text-gray-300">
                                    {logs.length} registros
                                </div>
                            </div>

                            <div className="flex-1 overflow-x-auto">
                                {logs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <h4 className="text-gray-900 dark:text-white font-bold mb-1">Nenhuma mensagem ainda</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                            Assim que seus pedidos mudarem de status, as mensagens enviadas aparecerão aqui.
                                        </p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50 dark:bg-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedido</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destino</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Evento</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {logs.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-medium">
                                                        {log.created_at}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex font-bold text-xs bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg">
                                                            #{log.order_number}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                        {log.phone_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                        {getTemplateLabel(log.template_key)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(log.status)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
