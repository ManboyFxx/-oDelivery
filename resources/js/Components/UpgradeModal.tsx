import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { AlertTriangle, Zap, Check, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource: 'produtos' | 'usuários' | 'motoboys' | 'pedidos';
    currentLimit: number;
}

export default function UpgradeModal({ isOpen, onClose, resource, currentLimit }: UpgradeModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/10 shadow-2xl transition-all">
                                {/* Header */}
                                <div className="relative bg-gradient-to-br from-[#ff3d03] to-[#e63700] p-8 text-white">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                                            <AlertTriangle className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black">Limite Atingido!</h3>
                                            <p className="text-white/80 mt-1">
                                                Você atingiu o limite de {currentLimit} {resource}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <div className="mb-8">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Zap className="h-5 w-5 text-[#ff3d03]" />
                                            Faça upgrade para o Plano Pro e desbloqueie:
                                        </h4>

                                        <div className="grid gap-3">
                                            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">Pedidos Ilimitados</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Sem limite mensal de pedidos</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">Produtos Ilimitados</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Adicione quantos produtos quiser ao cardápio</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">13 Usuários + 10 Motoboys</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie sua equipe completa</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">WhatsApp Bot + Gestão de Motoboys</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Automação completa de entregas</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-white/10">
                                        <div className="flex items-baseline justify-center gap-2 mb-2">
                                            <span className="text-4xl font-black text-gray-900 dark:text-white">R$ 109,90</span>
                                            <span className="text-gray-500 dark:text-gray-400">/mês</span>
                                        </div>
                                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                            Cancele quando quiser • Sem fidelidade
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors"
                                        >
                                            Agora Não
                                        </button>
                                        <Link
                                            href="/subscription"
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#ff3d03] to-[#e63700] hover:from-[#e63700] hover:to-[#cc3200] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                        >
                                            <Zap className="h-5 w-5" />
                                            Fazer Upgrade
                                        </Link>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
