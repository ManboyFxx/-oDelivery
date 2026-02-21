import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/Hooks/useToast';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import clsx from 'clsx';

interface AddressFormProps {
    onCancel: () => void;
    onSuccess: (address: any) => void;
    tenantId: string;
    customerId: string;
    preloadedZones?: any[];
    initialData?: any; // For editing
    store?: any; // To get default city/state
}

export default function AddressForm({ onCancel, onSuccess, tenantId, customerId, preloadedZones = [], initialData, store }: AddressFormProps) {
    const [loading, setLoading] = useState(false);
    
    // Extract defaults from store address if available
    const storeCity = store?.address?.city || store?.settings?.address?.city || '';
    const storeState = store?.address?.state || store?.settings?.address?.state || '';

    const [form, setForm] = useState({
        zip_code: initialData?.zip_code || '00000-000',
        street: initialData?.street || '',
        number: initialData?.number || '',
        complement: initialData?.complement || '',
        neighborhood: initialData?.neighborhood || '',
        city: initialData?.city || storeCity, 
        state: initialData?.state || storeState,
    });
    const { success, error: showError } = useToast();

    const [availableZones, setAvailableZones] = useState<any[] | null>(preloadedZones.length > 0 ? preloadedZones : null);
    const [zonesLoading, setZonesLoading] = useState(true); // Always start true to avoid flicker
    const [isZoneValid, setIsZoneValid] = useState<boolean | null>(initialData ? true : null);

    // Use a stable reference check for preloadedZones
    const preloadedZonesLength = preloadedZones?.length || 0;

    useEffect(() => {
        let isMounted = true;
        
        const stopLoading = () => {
            if (isMounted) setZonesLoading(false);
        };

        if (preloadedZones && preloadedZones.length > 0) {
            console.log("AddressForm: Using preloaded zones", preloadedZones.length);
            setAvailableZones(preloadedZones);
            stopLoading();
            return;
        }

        if (!tenantId) {
            console.warn("AddressForm: Waiting for tenantId...");
            const timer = setTimeout(stopLoading, 3000);
            return () => {
                isMounted = false;
                clearTimeout(timer);
            };
        }

        const fetchZones = async () => {
            if (!isMounted) return;
            setZonesLoading(true);
            try {
                console.log("AddressForm: Fetching zones for tenant", tenantId);
                const response = await axios.get(`/api/delivery-zones?tenant_id=${tenantId}`);
                console.log("AddressForm: Zones fetched", response.data?.length);
                if (isMounted) setAvailableZones(response.data || []);
            } catch (err) {
                console.error('Error fetching delivery zones:', err);
                if (isMounted) setAvailableZones([]); 
            } finally {
                stopLoading();
            }
        };

        fetchZones();

        return () => {
            isMounted = false;
        };
    }, [tenantId, preloadedZonesLength]); // Use length instead of array reference

    const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedNeighborhood = e.target.value;
        const zone = availableZones?.find(z => z.neighborhood === selectedNeighborhood);
        
        setForm(prev => ({ ...prev, neighborhood: selectedNeighborhood }));
        
        if (zone) {
            setIsZoneValid(true);
        } else {
            setIsZoneValid(selectedNeighborhood ? false : null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.neighborhood) {
            showError('Bairro obrigatório', 'Selecione o bairro de entrega.');
            return;
        }

        setLoading(true);

        try {
            const data = {
                ...form,
                city: form.city || 'Cidade',
                state: form.state || 'UF',
                zip_code: form.zip_code || '00000-000',
                tenant_id: tenantId,
                customer_id: customerId,
            };

            let response;
            if (initialData?.id) {
                response = await axios.put(`/customer/addresses/${initialData.id}`, data);
                success('Endereço atualizado!', 'Suas alterações foram salvas.');
            } else {
                response = await axios.post('/customer/addresses', data);
                success('Endereço adicionado!', 'Seu novo endereço foi salvo.');
            }

            onSuccess(response.data.address || response.data);
        } catch (err: any) {
            showError('Erro ao salvar', err.response?.data?.message || 'Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white transition-colors">Cadastrar Endereço</h3>
                <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                    Cancelar
                </button>
            </div>

            {/* Neighborhood Dropdown - Strictly Selectable */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <InputLabel htmlFor="neighborhood" value="Bairro de Entrega" />
                </div>
                
                <div className="relative">
                    {zonesLoading ? (
                        <div className="w-full border-2 border-gray-100 dark:border-gray-800 rounded-xl p-3 flex items-center justify-center text-gray-400 gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Buscando bairros...</span>
                        </div>
                    ) : availableZones && availableZones.length > 0 ? (
                        <select
                            id="neighborhood"
                            value={form.neighborhood}
                            onChange={handleNeighborhoodChange}
                            className={clsx(
                                "w-full border-2 rounded-xl shadow-sm outline-none transition-all duration-300 p-3",
                                "focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent",
                                isZoneValid === true 
                                    ? "border-green-500 bg-green-50/30 text-green-900 dark:bg-green-900/10 dark:text-green-400" 
                                    : "border-gray-200 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 placeholder-gray-400"
                            )}
                            required
                        >
                            <option value="">Selecione o Bairro...</option>
                            {availableZones.map((zone) => (
                                <option key={zone.id || zone.neighborhood} value={zone.neighborhood}>
                                    {zone.neighborhood} {zone.delivery_fee > 0 ? `(+ R$ ${Number(zone.delivery_fee).toFixed(2)})` : '(Entrega Grátis)'}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="w-full border-2 border-amber-100 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30 rounded-xl p-3 text-amber-600 dark:text-amber-400 text-sm flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            <span>Nenhum bairro de entrega configurado pela loja.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Street and Number - Priority #2 */}
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                    <InputLabel htmlFor="street" value="Nome da Rua / Avenida" />
                    <TextInput
                        id="street"
                        value={form.street}
                        onChange={e => setForm({ ...form, street: e.target.value })}
                        className="w-full"
                        placeholder="Ex: Rua das Flores"
                        required
                    />
                </div>
                <div className="col-span-1">
                    <InputLabel htmlFor="number" value="Nº" />
                    <TextInput
                        id="number"
                        value={form.number}
                        onChange={e => setForm({ ...form, number: e.target.value })}
                        className="w-full"
                        placeholder="123"
                        required
                    />
                </div>
            </div>

            {/* Complement - Optional */}
            <div>
                <InputLabel htmlFor="complement" value="Complemento (Opcional)" />
                <TextInput
                    id="complement"
                    value={form.complement}
                    onChange={e => setForm({ ...form, complement: e.target.value })}
                    className="w-full"
                    placeholder="Ex: Apt 42, Bloco B, Casa no fundo..."
                />
            </div>

            <div className="pt-4 flex gap-3">
                <SecondaryButton type="button" onClick={onCancel} className="flex-1 justify-center py-3">
                    Cancelar
                </SecondaryButton>
                <PrimaryButton 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 justify-center bg-[#ff3d03] hover:bg-[#e63700] py-3 shadow-lg shadow-orange-500/20"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : 'Confirmar Endereço'}
                </PrimaryButton>
            </div>
        </form>
    );
}
