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
    preloadedZones?: any[]; // Optional prop to avoid refetching
}

export default function AddressForm({ onCancel, onSuccess, tenantId, customerId, preloadedZones = [] }: AddressFormProps) {
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [form, setForm] = useState({
        zip_code: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
    });
    const { success, error: showError } = useToast();

    const [isZoneValid, setIsZoneValid] = useState<boolean | null>(null);
    const [zoneFee, setZoneFee] = useState<number>(0);
    const [availableZones, setAvailableZones] = useState<any[]>(preloadedZones);

    useEffect(() => {
        if (preloadedZones && preloadedZones.length > 0) {
            setAvailableZones(preloadedZones);
            return;
        }

        if (!tenantId) return;

        const fetchZones = async () => {
            try {
                const response = await axios.get(`/api/delivery-zones?tenant_id=${tenantId}`);
                console.log("AddressForm fetched zones:", response.data);
                setAvailableZones(response.data);
            } catch (err) {
                console.error('Error fetching delivery zones:', err);
            }
        };
        fetchZones();
    }, [tenantId, preloadedZones]);

    const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedNeighborhood = e.target.value;
        const zone = availableZones.find(z => z.neighborhood === selectedNeighborhood);
        
        setForm(prev => ({ ...prev, neighborhood: selectedNeighborhood }));
        
        if (zone) {
            setIsZoneValid(true);
            setZoneFee(Number(zone.delivery_fee));
        } else {
            setIsZoneValid(selectedNeighborhood ? false : null);
            setZoneFee(0);
        }
    };

    const handleCepBlur = async () => {
        const cep = form.zip_code.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setCepLoading(true);
        setIsZoneValid(null);
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (response.data.erro) {
                showError('CEP não encontrado', 'Verifique o CEP digitado.');
                return;
            }
            
            setForm(prev => ({
                ...prev,
                street: response.data.logradouro || prev.street,
                city: response.data.localidade || prev.city,
                state: response.data.uf || prev.state,
            }));

            // Try to auto-select the neighborhood from the available zones
            if (response.data.bairro && availableZones.length > 0) {
                const cepNeighborhood = response.data.bairro;
                const match = availableZones.find(z => 
                    z.neighborhood.toLowerCase() === cepNeighborhood.toLowerCase() ||
                    z.neighborhood.toLowerCase().includes(cepNeighborhood.toLowerCase()) ||
                    cepNeighborhood.toLowerCase().includes(z.neighborhood.toLowerCase())
                );

                if (match) {
                    setForm(prev => ({ ...prev, neighborhood: match.neighborhood }));
                    setIsZoneValid(true);
                    setZoneFee(Number(match.delivery_fee));
                } else {
                    // Force user to select from dropdown if zone is available but no match found
                    setForm(prev => ({ ...prev, neighborhood: '' })); 
                    setIsZoneValid(false);
                    setZoneFee(0);
                    showError('Bairro não atendido', 'Selecione um bairro da lista de entregas.');
                }
            }
        } catch (err) {
            showError('Erro ao buscar CEP', 'Tente preencher manualmente.');
        } finally {
            setCepLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If zones are configured, require a valid neighborhood selection
        if (availableZones.length > 0 && !form.neighborhood) {
            showError('Bairro obrigatório', 'Selecione o bairro de entrega.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/customer/addresses', {
                ...form,
                tenant_id: tenantId,
                customer_id: customerId,
            });

            success('Endereço adicionado!', 'Seu novo endereço foi salvo.');
            onSuccess(response.data);
        } catch (err: any) {
            showError('Erro ao salvar', err.response?.data?.message || 'Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white transition-colors">Novo Endereço</h3>
                <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                    Cancelar
                </button>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <InputLabel htmlFor="zip_code" value="CEP" />
                    <div className="h-4"></div>
                </div>
                <div className="relative">
                    <TextInput
                        id="zip_code"
                        value={form.zip_code}
                        onChange={e => setForm({ ...form, zip_code: e.target.value })}
                        onBlur={handleCepBlur}
                        className="w-full pl-10"
                        placeholder="00000-000"
                        required
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">
                        {cepLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <InputLabel htmlFor="street" value="Rua / Avenida" />
                    <TextInput
                        id="street"
                        value={form.street}
                        onChange={e => setForm({ ...form, street: e.target.value })}
                        className="w-full"
                        required
                    />
                </div>
                <div>
                    <InputLabel htmlFor="number" value="Número" />
                    <TextInput
                        id="number"
                        value={form.number}
                        onChange={e => setForm({ ...form, number: e.target.value })}
                        className="w-full"
                        required
                    />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="complement" value="Complemento (Opcional)" />
                <TextInput
                    id="complement"
                    value={form.complement}
                    onChange={e => setForm({ ...form, complement: e.target.value })}
                    className="w-full"
                    placeholder="Ap 102, Bloco C..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <InputLabel htmlFor="neighborhood" value="Bairro" />
                        {isZoneValid === true && (
                            <div className="text-[10px] font-black text-green-500 uppercase tracking-tighter">
                                Entregamos aqui!
                            </div>
                        )}
                        {isZoneValid === false && (
                            <div className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
                                Fora da área
                            </div>
                        )}
                    </div>
                    {availableZones.length > 0 ? (
                        <div className="relative">
                            <select
                                id="neighborhood"
                                value={form.neighborhood}
                                onChange={handleNeighborhoodChange}
                                className={clsx(
                                    "w-full border-2 rounded-xl shadow-sm outline-none transition-all duration-300",
                                    "focus:ring-0 focus:border-[#ff3d03]",
                                    isZoneValid === false 
                                        ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500" 
                                        : (isZoneValid === true 
                                            ? "border-green-500 bg-green-50 text-green-900" 
                                            : "border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 hover:border-gray-300")
                                )}
                                required
                            >
                                <option value="">Selecione o Bairro...</option>
                                {availableZones.map((zone) => (
                                    <option key={zone.id} value={zone.neighborhood}>
                                        {zone.neighborhood} (+ R$ {Number(zone.delivery_fee).toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <TextInput
                            id="neighborhood"
                            value={form.neighborhood}
                            onChange={e => setForm({ ...form, neighborhood: e.target.value })}
                            className={clsx(
                                "w-full",
                                isZoneValid === false && "border-red-500 focus:ring-red-500",
                                isZoneValid === true && "border-green-500 focus:ring-green-500"
                            )}
                            required
                        />
                    )}
                </div>
                <div>
                    <InputLabel htmlFor="city" value="Cidade - UF" />
                    <TextInput
                        id="city"
                        value={`${form.city} - ${form.state}`}
                        readOnly
                        className="w-full bg-gray-50 dark:bg-white/5 dark:text-gray-400"
                    />
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <SecondaryButton type="button" onClick={onCancel} className="flex-1 justify-center">
                    Voltar
                </SecondaryButton>
                <PrimaryButton 
                    type="submit" 
                    disabled={loading || isZoneValid === false} 
                    className={clsx(
                        "flex-1 justify-center transition-all",
                        isZoneValid === false ? "bg-gray-400 cursor-not-allowed" : "bg-[#ff3d03] hover:bg-[#e63700]"
                    )}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Endereço'}
                </PrimaryButton>
            </div>
        </form>
    );
}
