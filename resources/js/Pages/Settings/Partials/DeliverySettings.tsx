import React from 'react';
import { Truck, Plus, Trash2, Edit, MapPin, Search, Loader2 } from 'lucide-react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { Switch } from '@headlessui/react';

interface DeliveryZone {
    id: string;
    neighborhood: string;
    delivery_fee: number;
    estimated_time_min: number;
    is_active: boolean;
}

interface DeliverySettingsProps {
    data: any;
    setData: (field: string, value: any) => void;
    errors: any;
    deliveryZones: DeliveryZone[];

    // Zone Form Helpers
    zoneData: any;
    setZoneData: (field: string, value: any) => void; // Or setData type
    zoneProcessing: boolean;
    zoneErrors: any;
    submitZone: () => void;

    // Zone Actions
    handleDeleteZone: (id: string) => void;
    toggleZoneActive: (zone: DeliveryZone) => void;
    openCreateZoneModal: () => void;
    openEditZoneModal: (zone: DeliveryZone) => void;

    // Modal State
    showZoneModal: boolean;
    setShowZoneModal: (show: boolean) => void;
    editingZone: DeliveryZone | null;
}

export default function DeliverySettings({
    data,
    setData,
    errors,
    deliveryZones,
    zoneData,
    setZoneData,
    zoneProcessing,
    zoneErrors,
    submitZone,
    handleDeleteZone,
    toggleZoneActive,
    openCreateZoneModal,
    openEditZoneModal,
    showZoneModal,
    setShowZoneModal,
    editingZone
}: DeliverySettingsProps) {

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const [cepLoading, setCepLoading] = React.useState(false);
    const [cepToCheck, setCepToCheck] = React.useState('');

    const handleCepSearch = async () => {
        const cleanCep = cepToCheck.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setCepLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();
            
            if (!data.erro && data.bairro) {
                setZoneData('neighborhood', data.bairro);
            }
        } catch (error) {
            console.error('Error fetching CEP:', error);
        } finally {
            setCepLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold">
                    <Truck className="h-5 w-5 text-[#ff3d03]" />
                    Configurações de Entrega
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Raio de Entrega (km)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.delivery_radius_km}
                                onChange={(e) => setData('delivery_radius_km', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">km</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tempo Estimado (min)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.estimated_delivery_time}
                                onChange={(e) => setData('estimated_delivery_time', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">min</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Taxa de Entrega Fixa
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">R$</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={data.fixed_delivery_fee}
                                onChange={(e) => setData('fixed_delivery_fee', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pedido Mínimo
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">R$</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={data.min_order_delivery}
                                onChange={(e) => setData('min_order_delivery', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Zones */}
            <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-900 dark:text-gray-200 flex items-center gap-2 font-bold">
                        <MapPin className="h-5 w-5 text-[#ff3d03]" />
                        Zonas de Entrega
                    </h3>
                    <button
                        type="button"
                        onClick={openCreateZoneModal}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ff3d03] text-white rounded-xl text-sm font-bold hover:bg-[#e63600] transition-colors shadow-lg shadow-[#ff3d03]/20"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Zona
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-100 dark:border-white/5">
                                <th className="pb-4 font-semibold text-sm text-gray-500 dark:text-gray-400">Bairro/Região</th>
                                <th className="pb-4 font-semibold text-sm text-gray-500 dark:text-gray-400">Taxa</th>
                                <th className="pb-4 font-semibold text-sm text-gray-500 dark:text-gray-400">Tempo (min)</th>
                                <th className="pb-4 font-semibold text-sm text-gray-500 dark:text-gray-400">Status</th>
                                <th className="pb-4 font-semibold text-sm text-gray-500 dark:text-gray-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {deliveryZones.map((zone) => (
                                <tr key={zone.id}>
                                    <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {zone.neighborhood}
                                    </td>
                                    <td className="py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {formatCurrency(zone.delivery_fee)}
                                    </td>
                                    <td className="py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {zone.estimated_time_min} min
                                    </td>
                                    <td className="py-4">
                                        <Switch
                                            checked={zone.is_active}
                                            onChange={() => toggleZoneActive(zone)}
                                            className={`${zone.is_active ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                                } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer`}
                                        >
                                            <span className={`${zone.is_active ? 'translate-x-4' : 'translate-x-1'} inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`} />
                                        </Switch>
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditZoneModal(zone)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteZone(zone.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {deliveryZones.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        Nenhuma zona de entrega cadastrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Zone Modal */}
            <Modal show={showZoneModal} onClose={() => setShowZoneModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                        {editingZone ? 'Editar Zona de Entrega' : 'Nova Zona de Entrega'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Pesquisar por CEP (Opcional)
                            </label>
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={cepToCheck}
                                        onChange={(e) => setCepToCheck(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                        placeholder="00000-000"
                                        maxLength={9}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                        <Search className="h-4 w-4" />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCepSearch}
                                    disabled={cepLoading || cepToCheck.length < 8}
                                    className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {cepLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Bairro ou Região
                            </label>
                            <input
                                type="text"
                                value={zoneData.neighborhood}
                                onChange={(e) => setZoneData('neighborhood', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                placeholder="Ex: Centro"
                                autoFocus
                            />
                            {zoneErrors.neighborhood && <p className="mt-1 text-sm text-red-600">{zoneErrors.neighborhood}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Taxa de Entrega
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">R$</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={zoneData.delivery_fee}
                                        onChange={(e) => setZoneData('delivery_fee', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                                {zoneErrors.delivery_fee && <p className="mt-1 text-sm text-red-600">{zoneErrors.delivery_fee}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tempo Estimado (min)
                                </label>
                                <input
                                    type="number"
                                    value={zoneData.estimated_time_min}
                                    onChange={(e) => setZoneData('estimated_time_min', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                    placeholder="30"
                                />
                                {zoneErrors.estimated_time_min && <p className="mt-1 text-sm text-red-600">{zoneErrors.estimated_time_min}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-8">
                            <SecondaryButton onClick={() => setShowZoneModal(false)}>
                                Cancelar
                            </SecondaryButton>
                            <button
                                type="button"
                                onClick={submitZone}
                                disabled={zoneProcessing}
                                className="px-6 py-2.5 bg-[#ff3d03] text-white rounded-xl font-bold hover:bg-[#e63600] transition-colors disabled:opacity-50"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
