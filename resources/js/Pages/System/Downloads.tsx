import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Monitor,
    Smartphone,
    Download,
    Server,
    Shield,
    Terminal,
    ArrowRight
} from 'lucide-react';

export default function Downloads({ auth, tenant }: { auth: any, tenant: any }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            tenant={tenant}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Downloads do Sistema</h2>}
        >
            <Head title="Downloads do Sistema" />

            <div className="py-12 bg-gray-50 dark:bg-[#0B1228] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                            <Server className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Central de Downloads</h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Baixe os aplicativos oficiais do ÓoDelivery para gerenciar sua loja e conectar impressoras.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Windows App */}
                        <div className="group relative bg-white dark:bg-[#1a2333] rounded-3xl p-8 border border-gray-200 dark:border-blue-500/30 shadow-xl overflow-hidden hover:border-blue-500 transition-all duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Monitor className="w-32 h-32 text-blue-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                                    <Monitor className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Windows (PC)</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                                    Aplicativo para gestão de pedidos e conexão automática com impressoras térmicas via USB/Rede.
                                </p>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Terminal className="w-4 h-4 mr-2 text-blue-400" />
                                        Impressão Automática (ÓoPrint)
                                    </li>
                                    <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Shield className="w-4 h-4 mr-2 text-blue-400" />
                                        Gestão em Tempo Real
                                    </li>
                                </ul>

                                <button
                                    onClick={() => window.location.href = '/downloads/installer.exe'}
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    <Download className="w-4 h-4" />
                                    Baixar para Windows
                                </button>
                                <p className="mt-3 text-center text-xs text-gray-400">Versão 2.4.0 (64-bit)</p>
                            </div>
                        </div>

                        {/* Android App */}
                        <div className="group relative bg-white dark:bg-[#1a2333] rounded-3xl p-8 border border-gray-200 dark:border-green-500/30 shadow-xl overflow-hidden hover:border-green-500 transition-all duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Smartphone className="w-32 h-32 text-green-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                                    <Smartphone className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Android</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                                    Gerencie sua loja na palma da mão. Receba pedidos, aceite/recuse e controle entregadores.
                                </p>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Terminal className="w-4 h-4 mr-2 text-green-400" />
                                        Notificações Push
                                    </li>
                                    <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Shield className="w-4 h-4 mr-2 text-green-400" />
                                        Modo Gestor & Motoboy
                                    </li>
                                </ul>

                                <button
                                    onClick={() => alert('Disponível na Play Store em breve.')}
                                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20"
                                >
                                    <Download className="w-4 h-4" />
                                    Baixar APK
                                </button>
                                <p className="mt-3 text-center text-xs text-gray-400">Requer Android 8.0+</p>
                            </div>
                        </div>

                        {/* iOS App */}
                        <div className="group relative bg-white dark:bg-[#1a2333] rounded-3xl p-8 border border-gray-200 dark:border-gray-500/30 shadow-xl overflow-hidden hover:border-gray-500 transition-all duration-300 opacity-75">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Smartphone className="w-32 h-32 text-gray-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-gray-600 dark:text-gray-400">
                                    <Smartphone className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">iPhone (iOS)</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                                    Versão exclusiva para iPhone e iPad. Acompanhe métricas e gerencie pedidos com elegância.
                                </p>

                                <div className="flex items-center justify-center h-[88px] mb-8 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <span className="text-sm font-medium text-gray-500">Em Desenvolvimento</span>
                                </div>

                                <button
                                    disabled
                                    className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-800 text-gray-400 rounded-xl font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <Download className="w-4 h-4" />
                                    Em Breve
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
