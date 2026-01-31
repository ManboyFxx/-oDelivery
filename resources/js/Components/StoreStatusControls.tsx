import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Switch } from '@headlessui/react';
import { Menu, Transition } from '@headlessui/react';
import {
    Store,
    Truck,
    Clock,
    ChevronDown,
    PauseCircle,
    PlayCircle,
    AlertCircle
} from 'lucide-react';
import { Fragment } from 'react';
import Modal from '@/Components/Modal';

export default function StoreStatusControls() {
    const { tenant } = usePage<any>().props;

    if (!tenant) {
        return null;
    }

    const { store_status } = tenant;

    if (!store_status) {
        return null;
    }

    const [showPauseModal, setShowPauseModal] = useState(false);
    const [customPauseMinutes, setCustomPauseMinutes] = useState('');

    const isOpen = store_status.is_open;
    const isDeliveryPaused = store_status.is_delivery_paused;
    const isPaused = !!store_status.paused_until;
    const statusOverride = store_status.status_override;

    const handleStatusChange = (status: 'open' | 'closed' | null) => {
        router.post(route('settings.update'), {
            status_override: status,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDeliveryPause = (paused: boolean) => {
        router.post(route('settings.update'), {
            is_delivery_paused: paused,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handlePauseStore = (minutes: number | null) => {
        let pausedUntil = null;
        if (minutes) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + minutes);
            pausedUntil = now.toISOString();
        }

        router.post(route('settings.update'), {
            paused_until: pausedUntil,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setShowPauseModal(false),
        });
    };

    const formatPauseTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex items-center gap-2 md:gap-4">
            {/* Delivery Status */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isDeliveryPaused
                ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                : 'bg-white border-transparent dark:bg-white/5'
                }`}>
                <Truck className={`w-4 h-4 ${isDeliveryPaused ? 'text-amber-500' : 'text-gray-400'}`} />
                <span className={`text-xs font-medium ${isDeliveryPaused ? 'text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    Delivery
                </span>
                <Switch
                    checked={!isDeliveryPaused}
                    onChange={(checked) => handleDeliveryPause(!checked)}
                    className={`${!isDeliveryPaused ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
                >
                    <span className={`${!isDeliveryPaused ? 'translate-x-5' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                </Switch>
            </div>

            {/* Main Status & Pause */}
            <div className="flex items-center bg-white dark:bg-white/5 rounded-full p-1 border border-gray-100 dark:border-white/10 shadow-sm">

                {/* Status Dropdown */}
                <Menu as="div" className="relative">
                    <Menu.Button className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm transition-colors ${isOpen
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        {isOpen ? 'Aberta' : 'Fechada'}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </Menu.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden divide-y divide-gray-100 dark:divide-white/5 disabled:opacity-50">

                            <div className="px-4 py-3 bg-gray-50 dark:bg-white/5">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Modo de Operação</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${statusOverride === null ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {statusOverride === 'open' ? 'Forçar Aberto' : statusOverride === 'closed' ? 'Forçar Fechado' : 'Automático'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => handleStatusChange(null)}
                                            className={`${active ? 'bg-gray-100 dark:bg-white/5' : ''} flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200`}
                                        >
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            Automático (Horários)
                                            {statusOverride === null && <Store className="w-3 h-3 ml-auto text-blue-500" />}
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => handleStatusChange('open')}
                                            className={`${active ? 'bg-green-50 dark:bg-green-900/10' : ''} flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-700 dark:text-green-400`}
                                        >
                                            <PlayCircle className="w-4 h-4" />
                                            Abrir Loja (Forçar)
                                            {statusOverride === 'open' && <Store className="w-3 h-3 ml-auto text-green-500" />}
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => handleStatusChange('closed')}
                                            className={`${active ? 'bg-red-50 dark:bg-red-900/10' : ''} flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 dark:text-red-400`}
                                        >
                                            <PauseCircle className="w-4 h-4" />
                                            Fechar Loja (Forçar)
                                            {statusOverride === 'closed' && <Store className="w-3 h-3 ml-auto text-red-500" />}
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>

                <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />

                {/* Pause Button */}
                {isPaused ? (
                    <button
                        onClick={() => handlePauseStore(null)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors"
                        title="Clique para cancelar pausa"
                    >
                        <Clock className="w-4 h-4" />
                        Até {formatPauseTime(store_status.paused_until)}
                        <span className="hidden md:inline text-amber-600 dark:text-amber-500 ml-1">✖</span>
                    </button>
                ) : (
                    <button
                        onClick={() => setShowPauseModal(true)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        title="Pausar Loja"
                    >
                        <PauseCircle className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Pause Modal */}
            <Modal show={showPauseModal} onClose={() => setShowPauseModal(false)} maxWidth="sm">
                <div className="p-6 bg-white dark:bg-[#1a1b1e]">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        Pausar Loja
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Por quanto tempo deseja pausar os pedidos? A loja ficará fechada temporariamente.
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <button
                            onClick={() => handlePauseStore(15)}
                            className="bg-gray-100 dark:bg-white/5 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 border border-transparent hover:border-amber-200 rounded-xl py-3 text-sm font-bold transition-all"
                        >
                            15 min
                        </button>
                        <button
                            onClick={() => handlePauseStore(30)}
                            className="bg-gray-100 dark:bg-white/5 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 border border-transparent hover:border-amber-200 rounded-xl py-3 text-sm font-bold transition-all"
                        >
                            30 min
                        </button>
                        <button
                            onClick={() => handlePauseStore(60)}
                            className="bg-gray-100 dark:bg-white/5 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 border border-transparent hover:border-amber-200 rounded-xl py-3 text-sm font-bold transition-all"
                        >
                            1h
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Outro (min)"
                            value={customPauseMinutes}
                            onChange={(e) => setCustomPauseMinutes(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && customPauseMinutes && handlePauseStore(parseInt(customPauseMinutes))}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-transparent text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        <button
                            onClick={() => customPauseMinutes && handlePauseStore(parseInt(customPauseMinutes))}
                            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm"
                        >
                            Aplicar
                        </button>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setShowPauseModal(false)}
                            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
