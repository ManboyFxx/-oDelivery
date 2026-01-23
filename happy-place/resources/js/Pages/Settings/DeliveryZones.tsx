import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Truck, Plus, Trash2, Edit, MapPin, ArrowLeft, Save, X } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Switch } from '@headlessui/react';

interface DeliveryZone {
    id: string;
    neighborhood: string;
    delivery_fee: number;
    estimated_time_min: number;
    is_active: boolean;
    display_order: number;
}

export default function DeliveryZones({ auth, zones, success }: any) {
    const [showModal, setShowModal] = useState(false);
    const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        neighborhood: '',
        delivery_fee: '',
        estimated_time_min: 30,
        is_active: true,
    });

    useEffect(() => {
        if (!showModal) {
            reset();
            clearErrors();
        }
    }, [showModal]);

    const openCreateModal = () => {
        setEditingZone(null);
        setData({
            neighborhood: '',
            delivery_fee: '',
            estimated_time_min: 30,
            is_active: true,
        });
        setShowModal(true);
    };

    const openEditModal = (zone: DeliveryZone) => {
        setEditingZone(zone);
        setData({
            neighborhood: zone.neighborhood,
            delivery_fee: zone.delivery_fee.toString(),
            estimated_time_min: zone.estimated_time_min,
            is_active: zone.is_active,
        });
        setShowModal(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingZone) {
            put(route('delivery-zones.update', editingZone.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('delivery-zones.store'), {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta zona de entrega?')) {
            destroy(route('delivery-zones.destroy', id));
        }
    };

    const toggleActive = (zone: DeliveryZone) => {
        router.put(route('delivery-zones.update', zone.id), {
            ...zone,
            is_active: !zone.is_active
        }, {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <a href={route('settings.index')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-5 w-5" />
                    </a>
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Zonas de Entrega
                    </h2>
                </div>
            }
        >
            <Head title="Zonas de Entrega" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {success}
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Defina taxas e tempos de entrega específicos por bairro.
                                </p>
                                <PrimaryButton onClick={openCreateModal} className="gap-2 bg-[#ff3d03] hover:bg-[#e63700]">
                                    <Plus className="h-4 w-4" />
                                    Adicionar Zona
                                </PrimaryButton>
                            </div>

                            <div className="space-y-4">
                                {(zones as DeliveryZone[]).length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhuma zona cadastrada</h3>
                                        <p className="text-gray-500 mt-1">Adicione bairros para personalizar suas entregas.</p>
                                    </div>
                                ) : (
                                    (zones as DeliveryZone[]).map((zone) => (
                                        <div key={zone.id} className="group bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md hover:border-[#ff3d03]/30">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                                                    <MapPin className="h-5 w-5 text-[#ff3d03]" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{zone.neighborhood}</h3>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-semibold text-gray-900 dark:text-gray-200">Taxa:</span> R$ {parseFloat(zone.delivery_fee.toString()).toFixed(2)}
                                                        </span>
                                                        <span className="hidden sm:inline text-gray-300">•</span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-semibold text-gray-900 dark:text-gray-200">Tempo:</span> {zone.estimated_time_min} min
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                <Switch
                                                    checked={zone.is_active}
                                                    onChange={() => toggleActive(zone)}
                                                    className={`${zone.is_active ? 'bg-[#ff3d03]' : 'bg-gray-200 dark:bg-gray-600'
                                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3d03] focus:ring-offset-2`}
                                                >
                                                    <span
                                                        className={`${zone.is_active ? 'translate-x-6' : 'translate-x-1'
                                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                    />
                                                </Switch>

                                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-600 mx-1"></div>

                                                <button
                                                    onClick={() => openEditModal(zone)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(zone.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {editingZone ? 'Editar Zona de Entrega' : 'Nova Zona de Entrega'}
                        </h2>
                        <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="neighborhood" value="Nome do Bairro" />
                            <TextInput
                                id="neighborhood"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.neighborhood}
                                onChange={(e) => setData('neighborhood', e.target.value)}
                                placeholder="Ex: Centro, Vila Nova..."
                                required
                            />
                            <p className="mt-1 text-sm text-red-600">{errors.neighborhood}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="delivery_fee" value="Taxa de Entrega (R$)" />
                                <TextInput
                                    id="delivery_fee"
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={data.delivery_fee}
                                    onChange={(e) => setData('delivery_fee', e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                                <p className="mt-1 text-sm text-red-600">{errors.delivery_fee}</p>
                            </div>

                            <div>
                                <InputLabel htmlFor="estimated_time_min" value="Tempo Est. (min)" />
                                <TextInput
                                    id="estimated_time_min"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.estimated_time_min}
                                    onChange={(e) => setData('estimated_time_min', parseInt(e.target.value))}
                                    required
                                />
                                <p className="mt-1 text-sm text-red-600">{errors.estimated_time_min}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={data.is_active}
                                onChange={(checked) => setData('is_active', checked)}
                                className={`${data.is_active ? 'bg-[#ff3d03]' : 'bg-gray-200 dark:bg-gray-600'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3d03] focus:ring-offset-2`}
                            >
                                <span
                                    className={`${data.is_active ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zona Ativa</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowModal(false)}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#ff3d03] hover:bg-[#e63700]">
                            {editingZone ? 'Atualizar Zona' : 'Salvar Zona'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
