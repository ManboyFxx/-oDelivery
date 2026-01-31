import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MessageSquare, Save, Info } from 'lucide-react';
import { PageProps } from '@/types';
import { toast } from 'sonner';

interface Template {
    id: string;
    key: string;
    name: string;
    message: string;
    is_active: boolean;
}

interface Props extends PageProps {
    templates: Template[];
}

export default function TemplatesIndex({ auth, templates: initialTemplates }: Props) {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [loading, setLoading] = useState<string | null>(null);

    const handleUpdate = (template: Template) => {
        setLoading(template.id);
        router.put(route('admin.whatsapp.templates.update', template.id), {
            message: template.message,
            is_active: template.is_active
        }, {
            onSuccess: () => {
                toast.success('Template atualizado com sucesso!');
                setLoading(null);
            },
            onError: () => {
                toast.error('Erro ao atualizar template.');
                setLoading(null);
            }
        });
    };

    const handleChange = (id: string, field: keyof Template, value: any) => {
        setTemplates(prev => prev.map(t =>
            t.id === id ? { ...t, [field]: value } : t
        ));
    };

    const getVariables = (key: string) => {
        const common = ['{customer_name}', '{order_number}'];
        const specific: { [key: string]: string[] } = {
            'order_confirmed': ['{order_total}'],
            'order_ready': [],
            'order_out_for_delivery': ['{delivery_address}'],
            'order_delivered': []
        };
        return [...common, ...(specific[key] || [])];
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Configurar Mensagens Automáticas</h2>}
        >
            <Head title="Templates de WhatsApp" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            <h3 className="text-xl font-bold">Mensagens Automáticas</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">
                            Personalize as mensagens que são enviadas automaticamente para seus clientes via WhatsApp.
                        </p>

                        <div className="space-y-6">
                            {templates.map((template) => (
                                <div key={template.id} className="border-l-4 border-l-orange-500 bg-gray-50 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{template.name}</h4>
                                            <p className="text-xs font-mono text-gray-500 mt-1">
                                                KEY: {template.key}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-600">
                                                {template.is_active ? 'Ativo' : 'Inativo'}
                                            </label>
                                            <button
                                                onClick={() => handleChange(template.id, 'is_active', !template.is_active)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    template.is_active ? 'bg-green-600' : 'bg-gray-300'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        template.is_active ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mensagem
                                            </label>
                                            <textarea
                                                value={template.message}
                                                onChange={(e) => handleChange(template.id, 'message', e.target.value)}
                                                rows={4}
                                                className="w-full font-mono text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-600 flex flex-wrap gap-2 items-center">
                                                <Info className="w-4 h-4" />
                                                <span>Variáveis disponíveis:</span>
                                                {getVariables(template.key).map(v => (
                                                    <span key={v} className="bg-white px-2 py-1 rounded border border-gray-300 text-gray-700 font-mono text-xs">
                                                        {v}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => handleUpdate(template)}
                                                disabled={loading === template.id}
                                                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                                            >
                                                {loading === template.id ? (
                                                    <>
                                                        <span className="animate-spin">⟳</span>
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4" />
                                                        Salvar
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
