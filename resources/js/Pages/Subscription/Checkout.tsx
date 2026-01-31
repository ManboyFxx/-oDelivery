import { Head, usePage, router } from '@inertiajs/react';
import { ShieldCheck, CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Checkout({ plan, price }: { plan: string, price: number }) {
    const [loading, setLoading] = useState(false);
    const { auth } = usePage().props as any;

    const handleMockPayment = () => {
        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            router.get(route('subscription.upgrade'), { plan: 'pro' });
        }, 1500);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Checkout Seguro</h2>}
        >
            <Head title="Checkout" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">

                        <div className="text-center mb-8">
                            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <ShieldCheck className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Atualizar Plano</h3>
                            <p className="text-gray-500">Você está contratando o plano Profissional</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-gray-700">Plano Profissional</span>
                                <span className="font-bold text-xl text-gray-900">R$ {price.toFixed(2)}/mês</span>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Cobrança Mensal</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Cancela quando quiser</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Acesso Imediato</li>
                            </ul>
                        </div>

                        {/* Mock Payment Form */}
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Dados de Pagamento (Simulado)
                            </h4>

                            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm">
                                <strong>Modo de Teste:</strong> Nenhum valor será cobrado no seu cartão real.
                                Clique abaixo para simular um pagamento aprovado.
                            </div>

                            <button
                                onClick={handleMockPayment}
                                disabled={loading}
                                className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    'Simular Pagamento e Ativar'
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
